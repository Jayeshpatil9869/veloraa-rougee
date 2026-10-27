import { createHash, timingSafeEqual } from 'node:crypto';
import { env } from './env';
import { db, ok, one, rows } from './db';
import {
  mapProviderStatusToShipment,
  normalizeTrackingEvents,
  rupeesToPaise,
  shipmentStatusRank,
  shiprocketClient,
} from './shiprocket/client';
import { ShiprocketError } from './shiprocket/errors';
import type { ShipmentStatus } from './shiprocket/types';

export type ShipmentRow = {
  id: string;
  order_id: string;
  channel_order_id: string;
  provider: string;
  provider_order_id: string | null;
  provider_shipment_id: string | null;
  awb: string | null;
  courier_id: number | null;
  courier_name: string | null;
  status: ShipmentStatus;
  pickup_status: string;
  operation_state: string;
  weight_grams: number;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  estimated_cost_paise: number | null;
  confirmed_cost_paise: number | null;
  cost_verification_status: string;
  currency: string;
  etd_at: string | null;
  tracking_url: string | null;
  pickup_at: string | null;
  delivered_at: string | null;
  last_synced_at: string | null;
  last_error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type TrackingEventRow = {
  id: string;
  shipment_id: string;
  provider_event_key: string;
  event_code: string | null;
  event_label: string;
  event_at: string;
  location: string | null;
  source: string;
};

function mmToCm(mm: number) {
  return Math.max(Math.ceil(mm / 10), 1);
}

function gramsToKg(grams: number) {
  return Math.max(Number((grams / 1000).toFixed(3)), 0.05);
}

export function normalizeTrackingPayload(shipment: ShipmentRow, events: TrackingEventRow[], admin = false) {
  const base = {
    shipmentId: shipment.id,
    orderId: shipment.order_id,
    status: shipment.status,
    courierName: shipment.courier_name,
    awb: shipment.awb,
    etdAt: shipment.etd_at,
    trackingUrl: shipment.tracking_url,
    lastSyncedAt: shipment.last_synced_at,
    estimatedCostPaise: shipment.estimated_cost_paise,
    confirmedCostPaise: shipment.confirmed_cost_paise,
    costVerificationStatus: shipment.cost_verification_status,
    events: events.map((event) => ({
      at: event.event_at,
      label: event.event_label,
      location: event.location,
      code: event.event_code,
    })),
  };
  if (!admin) return base;
  return {
    ...base,
    providerOrderId: shipment.provider_order_id,
    providerShipmentId: shipment.provider_shipment_id,
    courierId: shipment.courier_id,
    pickupStatus: shipment.pickup_status,
    operationState: shipment.operation_state,
    lastError: shipment.last_error,
  };
}

async function loadPackageForOrder(orderId: string) {
  const settings = await one<{
    shiprocket_pickup_postcode: string | null;
    default_package_weight_grams: number;
    default_package_length_mm: number;
    default_package_width_mm: number;
    default_package_height_mm: number;
  }>(
    db()
      .from('site_settings')
      .select(
        'shiprocket_pickup_postcode, default_package_weight_grams, default_package_length_mm, default_package_width_mm, default_package_height_mm',
      )
      .eq('id', 1)
      .maybeSingle(),
  );

  const items = await rows<{
    quantity: number;
    sku: string | null;
    product_name: string;
    variant_name: string;
    unit_price_paise: number;
    variant_id: string | null;
  }>(
    db()
      .from('order_items')
      .select('quantity, sku, product_name, variant_name, unit_price_paise, variant_id')
      .eq('order_id', orderId),
  );

  const variantIds = items.map((item) => item.variant_id).filter(Boolean) as string[];
  const variants = variantIds.length
    ? await rows<{
        id: string;
        weight_grams: number | null;
        length_mm: number | null;
        width_mm: number | null;
        height_mm: number | null;
        sku: string | null;
      }>(
        db()
          .from('product_variants')
          .select('id, weight_grams, length_mm, width_mm, height_mm, sku')
          .in('id', variantIds),
      )
    : [];
  const byId = new Map(variants.map((row) => [row.id, row]));

  const defaultWeight = settings?.default_package_weight_grams ?? 250;
  const defaultLength = settings?.default_package_length_mm ?? 150;
  const defaultWidth = settings?.default_package_width_mm ?? 100;
  const defaultHeight = settings?.default_package_height_mm ?? 50;

  let weightGrams = 0;
  let lengthMm = defaultLength;
  let widthMm = defaultWidth;
  let heightMm = defaultHeight;

  for (const item of items) {
    const variant = item.variant_id ? byId.get(item.variant_id) : undefined;
    weightGrams += (variant?.weight_grams ?? defaultWeight) * item.quantity;
    lengthMm = Math.max(lengthMm, variant?.length_mm ?? defaultLength);
    widthMm = Math.max(widthMm, variant?.width_mm ?? defaultWidth);
    heightMm = Math.max(heightMm, variant?.height_mm ?? defaultHeight);
  }
  if (weightGrams <= 0) weightGrams = defaultWeight;

  return {
    pickupPostcode: settings?.shiprocket_pickup_postcode || '',
    weightGrams,
    lengthMm,
    widthMm,
    heightMm,
    items,
  };
}

async function requirePaidOrder(orderId: string) {
  const order = await one<{
    id: string;
    order_number: string;
    status: string;
    email: string;
    subtotal_paise: number;
    discount_paise: number;
    total_paise: number;
  }>(
    db()
      .from('orders')
      .select('id, order_number, status, email, subtotal_paise, discount_paise, total_paise')
      .eq('id', orderId)
      .maybeSingle(),
  );
  if (!order) throw new Error('not_found');
  const payment = await one<{ status: string }>(
    db().from('payments').select('status').eq('order_id', orderId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  );
  if (payment?.status !== 'paid') throw new Error('payment_not_paid');
  if (['cancelled', 'refunded'].includes(order.status)) throw new Error('order_not_shippable');
  const address = await one<{
    full_name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
  }>(db().from('order_addresses').select('*').eq('order_id', orderId).maybeSingle());
  if (!address?.postal_code) throw new Error('address_required');
  return { order, address, payment };
}

export async function compareCourierRates(orderId: string) {
  const { order, address } = await requirePaidOrder(orderId);
  const pkg = await loadPackageForOrder(orderId);
  if (!pkg.pickupPostcode) throw new Error('pickup_postcode_missing');

  const rates = await shiprocketClient.checkServiceability({
    pickupPostcode: pkg.pickupPostcode,
    deliveryPostcode: address.postal_code,
    weightKg: gramsToKg(pkg.weightGrams),
    cod: false,
  });

  const quotedAt = new Date().toISOString();
  if (rates.length) {
    await ok(
      db().from('courier_rate_quotes').insert(
        rates.map((rate) => ({
          order_id: order.id,
          pickup_postcode: pkg.pickupPostcode,
          delivery_postcode: address.postal_code,
          weight_grams: pkg.weightGrams,
          cod: false,
          courier_id: rate.courierId,
          courier_name: rate.courierName,
          rate_paise: rate.ratePaise,
          etd_days: rate.etdDays,
          quoted_at: quotedAt,
          metadata: { source: 'serviceability' },
        })),
      ),
    );
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    pickupPostcode: pkg.pickupPostcode,
    deliveryPostcode: address.postal_code,
    weightGrams: pkg.weightGrams,
    dimensionsMm: { length: pkg.lengthMm, width: pkg.widthMm, height: pkg.heightMm },
    quotedAt,
    couriers: rates.map((rate) => ({
      courierId: rate.courierId,
      courierName: rate.courierName,
      ratePaise: rate.ratePaise,
      etdDays: rate.etdDays,
    })),
  };
}

export async function createShipmentForOrder(orderId: string, courierId?: number) {
  const { order, address } = await requirePaidOrder(orderId);
  const existing = await one<ShipmentRow>(
    db()
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .not('status', 'in', '("cancelled","failed")')
      .maybeSingle(),
  );
  if (existing && !['pending', 'failed'].includes(existing.status) && existing.provider_shipment_id) {
    return existing;
  }

  const pkg = await loadPackageForOrder(orderId);
  const pickupLocation = env.SHIPROCKET_PICKUP_LOCATION;
  if (!pickupLocation) throw new Error('pickup_location_missing');
  if (!pkg.pickupPostcode) throw new Error('pickup_postcode_missing');

  let shipment =
    existing ??
    (await one<ShipmentRow>(
      db()
        .from('shipments')
        .insert({
          order_id: order.id,
          channel_order_id: order.order_number,
          status: 'pending',
          operation_state: 'creating',
          weight_grams: pkg.weightGrams,
          length_mm: pkg.lengthMm,
          width_mm: pkg.widthMm,
          height_mm: pkg.heightMm,
          courier_id: courierId ?? null,
        })
        .select('*')
        .single(),
    ));

  if (!shipment) throw new Error('shipment_create_failed');

  await ok(
    db()
      .from('shipments')
      .update({
        operation_state: 'creating',
        courier_id: courierId ?? shipment.courier_id,
        weight_grams: pkg.weightGrams,
        length_mm: pkg.lengthMm,
        width_mm: pkg.widthMm,
        height_mm: pkg.heightMm,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipment.id),
  );

  const nameParts = address.full_name.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || undefined;
  const subTotalRupees = Math.max((order.subtotal_paise - order.discount_paise) / 100, 0);

  try {
    const created = await shiprocketClient.createAdhocOrder({
      order_id: order.order_number,
      order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      pickup_location: pickupLocation,
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: address.line1,
      billing_address_2: address.line2 || undefined,
      billing_city: address.city,
      billing_pincode: address.postal_code,
      billing_state: address.region || address.city,
      billing_country: address.country || 'India',
      billing_email: order.email,
      billing_phone: address.phone,
      shipping_is_billing: true,
      order_items: pkg.items.map((item, index) => ({
        name: `${item.product_name} ${item.variant_name}`.trim(),
        sku: item.sku || `SKU-${index + 1}`,
        units: item.quantity,
        selling_price: item.unit_price_paise / 100,
      })),
      payment_method: 'Prepaid',
      sub_total: subTotalRupees,
      length: mmToCm(pkg.lengthMm),
      breadth: mmToCm(pkg.widthMm),
      height: mmToCm(pkg.heightMm),
      weight: gramsToKg(pkg.weightGrams),
    });

    shipment = (await one<ShipmentRow>(
      db()
        .from('shipments')
        .update({
          provider_order_id: String(created.order_id),
          provider_shipment_id: String(created.shipment_id),
          status: 'created',
          operation_state: courierId ? 'awb_pending' : 'ready',
          courier_name: created.courier_name || null,
          awb: created.awb_code || null,
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipment.id)
        .select('*')
        .single(),
    ))!;

    await ok(
      db().from('shipment_charges').upsert({
        shipment_id: shipment.id,
        estimated_paise: shipment.estimated_cost_paise,
        charge_status: 'estimated',
        reconciliation_status: 'open',
        updated_at: new Date().toISOString(),
      }),
    );

    if (courierId) {
      shipment = await assignAwb(shipment.id, courierId);
    }

    return shipment;
  } catch (error) {
    const uncertain = error instanceof ShiprocketError && error.category === 'unknown_outcome';
    await ok(
      db()
        .from('shipments')
        .update({
          operation_state: uncertain ? 'uncertain' : 'failed',
          last_error: error instanceof Error ? error.message : 'create_failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipment.id),
    );
    await enqueueJob('reconcile_uncertain_create', { shipmentId: shipment.id, orderId: order.id });
    throw error;
  }
}

export async function assignAwb(shipmentId: string, courierId?: number) {
  const shipment = await one<ShipmentRow>(db().from('shipments').select('*').eq('id', shipmentId).maybeSingle());
  if (!shipment?.provider_shipment_id) throw new Error('shipment_missing_provider_id');

  await ok(db().from('shipments').update({ operation_state: 'awb_pending', updated_at: new Date().toISOString() }).eq('id', shipmentId));

  try {
    const result = await shiprocketClient.assignAwb({
      shipmentId: Number(shipment.provider_shipment_id),
      courierId: courierId ?? shipment.courier_id ?? undefined,
    });
    const data = result.response?.data;
    const freightPaise = data?.freight_charges != null ? rupeesToPaise(Number(data.freight_charges)) : null;
    const updated = await one<ShipmentRow>(
      db()
        .from('shipments')
        .update({
          awb: data?.awb_code || shipment.awb,
          courier_id: data?.courier_company_id ?? courierId ?? shipment.courier_id,
          courier_name: data?.courier_name || shipment.courier_name,
          status: 'awb_assigned',
          operation_state: 'pickup_pending',
          estimated_cost_paise: freightPaise ?? shipment.estimated_cost_paise,
          confirmed_cost_paise: freightPaise,
          cost_verification_status: freightPaise != null ? 'confirmed' : 'awaiting_statement',
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId)
        .select('*')
        .single(),
    );

    if (freightPaise != null) {
      await ok(
        db().from('shipment_charges').upsert({
          shipment_id: shipmentId,
          estimated_paise: freightPaise,
          confirmed_paise: freightPaise,
          confirmed_source: 'assign_awb',
          charge_status: 'confirmed',
          reconciliation_status: 'matched',
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      );
    }

    const order = await one<{ status: string }>(db().from('orders').select('status').eq('id', shipment.order_id).maybeSingle());
    if (order && !['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status)) {
      await ok(db().from('orders').update({ status: 'shipped', updated_at: new Date().toISOString() }).eq('id', shipment.order_id));
      await ok(
        db().from('order_status_history').insert({
          order_id: shipment.order_id,
          from_status: order.status,
          to_status: 'shipped',
          note: 'AWB assigned via Shiprocket',
          actor: 'system:shipping',
        }),
      );
    }

    return updated!;
  } catch (error) {
    await ok(
      db()
        .from('shipments')
        .update({
          operation_state: 'failed',
          last_error: error instanceof Error ? error.message : 'awb_failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId),
    );
    await enqueueJob('retry_awb', { shipmentId, orderId: shipment.order_id });
    throw error;
  }
}

export async function schedulePickup(shipmentId: string) {
  const shipment = await one<ShipmentRow>(db().from('shipments').select('*').eq('id', shipmentId).maybeSingle());
  if (!shipment?.provider_shipment_id) throw new Error('shipment_missing_provider_id');
  await ok(db().from('shipments').update({ operation_state: 'pickup_pending' }).eq('id', shipmentId));
  try {
    await shiprocketClient.generatePickup([Number(shipment.provider_shipment_id)]);
    return one<ShipmentRow>(
      db()
        .from('shipments')
        .update({
          pickup_status: 'scheduled',
          status: shipment.status === 'awb_assigned' ? 'pickup_scheduled' : shipment.status,
          operation_state: 'label_pending',
          pickup_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId)
        .select('*')
        .single(),
    );
  } catch (error) {
    await enqueueJob('retry_pickup', { shipmentId, orderId: shipment.order_id });
    throw error;
  }
}

export async function retrieveLabel(shipmentId: string) {
  const shipment = await one<ShipmentRow>(db().from('shipments').select('*').eq('id', shipmentId).maybeSingle());
  if (!shipment?.provider_shipment_id) throw new Error('shipment_missing_provider_id');
  const result = await shiprocketClient.generateLabel([Number(shipment.provider_shipment_id)]);
  const labelUrl = result.label_url || null;
  if (labelUrl) {
    await ok(
      db().from('shipment_documents').insert({
        shipment_id: shipmentId,
        doc_type: 'label',
        provider_url: labelUrl,
      }),
    );
  }
  await ok(
    db()
      .from('shipments')
      .update({ operation_state: 'ready', last_error: null, updated_at: new Date().toISOString() })
      .eq('id', shipmentId),
  );
  return { labelUrl, shipmentId };
}

async function persistTrackingEvents(
  shipmentId: string,
  events: ReturnType<typeof normalizeTrackingEvents>,
  source: 'webhook' | 'track_api',
) {
  if (!events.length) return;
  await ok(
    db().from('shipment_tracking_events').upsert(
      events.map((event) => ({
        shipment_id: shipmentId,
        provider_event_key: event.providerEventKey,
        event_code: event.eventCode,
        event_label: event.eventLabel,
        event_at: event.eventAt,
        location: event.location,
        source,
      })),
      { onConflict: 'shipment_id,provider_event_key', ignoreDuplicates: true },
    ),
  );
}

function maybeAdvanceStatus(current: ShipmentStatus, next: ShipmentStatus | null): ShipmentStatus {
  if (!next) return current;
  if (current === 'delivered' || current === 'rto_delivered' || current === 'cancelled') {
    if (next === 'rto_initiated' || next === 'rto_delivered') return next;
    return current;
  }
  if (next === 'exception' || next === 'delayed' || next === 'rto_initiated' || next === 'rto_delivered') {
    return next;
  }
  if (shipmentStatusRank(next) >= shipmentStatusRank(current)) return next;
  return current;
}

export async function syncShipmentTracking(shipmentId: string) {
  const shipment = await one<ShipmentRow>(db().from('shipments').select('*').eq('id', shipmentId).maybeSingle());
  if (!shipment) throw new Error('not_found');
  if (!shipment.awb && !shipment.provider_shipment_id) throw new Error('tracking_unavailable');

  const track = shipment.awb
    ? await shiprocketClient.trackByAwb(shipment.awb)
    : await shiprocketClient.trackByShipmentId(shipment.provider_shipment_id!);

  const activities = track.tracking_data?.shipment_track_activities ?? [];
  const events = normalizeTrackingEvents(activities);
  await persistTrackingEvents(shipmentId, events, 'track_api');

  const currentStatusLabel =
    track.tracking_data?.shipment_track?.[0]?.current_status ||
    activities[activities.length - 1]?.['sr-status-label'] ||
    activities[activities.length - 1]?.activity;
  const mapped = mapProviderStatusToShipment(currentStatusLabel) || mapProviderStatusToShipment(track.tracking_data?.shipment_status);
  const nextStatus = maybeAdvanceStatus(shipment.status, mapped);
  const etd = track.tracking_data?.shipment_track?.[0]?.etd;
  const etdAt = etd ? new Date(etd) : null;

  const updated = await one<ShipmentRow>(
    db()
      .from('shipments')
      .update({
        status: nextStatus,
        tracking_url: track.tracking_data?.track_url || shipment.tracking_url,
        etd_at: etdAt && !Number.isNaN(etdAt.getTime()) ? etdAt.toISOString() : shipment.etd_at,
        delivered_at: nextStatus === 'delivered' ? new Date().toISOString() : shipment.delivered_at,
        pickup_status: nextStatus === 'picked_up' || shipmentStatusRank(nextStatus) > shipmentStatusRank('picked_up')
          ? 'picked_up'
          : shipment.pickup_status,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId)
      .select('*')
      .single(),
  );

  if (nextStatus === 'delivered') {
    const order = await one<{ status: string }>(db().from('orders').select('status').eq('id', shipment.order_id).maybeSingle());
    if (order && order.status !== 'delivered' && order.status !== 'refunded' && order.status !== 'cancelled') {
      await ok(db().from('orders').update({ status: 'delivered', updated_at: new Date().toISOString() }).eq('id', shipment.order_id));
      await ok(
        db().from('order_status_history').insert({
          order_id: shipment.order_id,
          from_status: order.status,
          to_status: 'delivered',
          note: 'Delivered via Shiprocket tracking',
          actor: 'system:shipping',
        }),
      );
    }
  }

  const eventRows = await rows<TrackingEventRow>(
    db()
      .from('shipment_tracking_events')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('event_at', { ascending: true }),
  );
  return { shipment: updated!, events: eventRows };
}

export async function getShipmentTracking(shipmentId: string) {
  const shipment = await one<ShipmentRow>(db().from('shipments').select('*').eq('id', shipmentId).maybeSingle());
  if (!shipment) throw new Error('not_found');
  const events = await rows<TrackingEventRow>(
    db()
      .from('shipment_tracking_events')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('event_at', { ascending: true }),
  );
  return { shipment, events };
}

export async function getShipmentForOrder(orderId: string) {
  return one<ShipmentRow>(
    db()
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}

export function verifyWebhookToken(headerValue: string | undefined) {
  const expected = env.SHIPROCKET_WEBHOOK_TOKEN;
  if (!expected) throw new Error('webhook_not_configured');
  if (!headerValue) throw new Error('unauthorized');
  const a = Buffer.from(headerValue);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error('unauthorized');
}

export async function processLogisticsWebhook(payload: Record<string, unknown>) {
  const awb = payload.awb != null ? String(payload.awb) : '';
  const currentStatus = payload.current_status != null ? String(payload.current_status) : '';
  const timestamp = payload.current_timestamp != null ? String(payload.current_timestamp) : '';
  const srOrderId = payload.sr_order_id != null ? String(payload.sr_order_id) : '';
  const channelOrderId = payload.order_id != null ? String(payload.order_id) : '';
  const dedupeKey = createHash('sha256')
    .update([awb, currentStatus, timestamp, srOrderId, channelOrderId].join('|'))
    .digest('hex');

  const existing = await one<{ id: string; processing_status: string }>(
    db()
      .from('shipping_webhook_events')
      .select('id, processing_status')
      .eq('provider', 'shiprocket')
      .eq('dedupe_key', dedupeKey)
      .maybeSingle(),
  );
  if (existing?.processing_status === 'processed') {
    return { ok: true, duplicate: true };
  }

  const eventRow = await one<{ id: string }>(
    db()
      .from('shipping_webhook_events')
      .upsert({
        provider: 'shiprocket',
        dedupe_key: dedupeKey,
        awb: awb || null,
        processing_status: 'received',
        payload,
      }, { onConflict: 'provider,dedupe_key' })
      .select('id')
      .single(),
  );

  let shipment =
    (awb
      ? await one<ShipmentRow>(db().from('shipments').select('*').eq('awb', awb).maybeSingle())
      : null) ||
    (srOrderId
      ? await one<ShipmentRow>(db().from('shipments').select('*').eq('provider_order_id', srOrderId).maybeSingle())
      : null) ||
    (channelOrderId
      ? await one<ShipmentRow>(db().from('shipments').select('*').eq('channel_order_id', channelOrderId).maybeSingle())
      : null);

  if (!shipment) {
    await ok(
      db()
        .from('shipping_webhook_events')
        .update({ processing_status: 'ignored', error_message: 'shipment_not_found', processed_at: new Date().toISOString() })
        .eq('id', eventRow!.id),
    );
    return { ok: true, ignored: true };
  }

  const scans = Array.isArray(payload.scans) ? (payload.scans as Array<Record<string, string>>) : [];
  const events = normalizeTrackingEvents(
    scans.map((scan) => ({
      date: scan.date,
      status: scan.status,
      activity: scan.activity,
      location: scan.location,
      'sr-status': scan['sr-status'],
      'sr-status-label': scan['sr-status-label'],
    })),
  );
  if (!events.length && currentStatus) {
    events.push({
      providerEventKey: `${timestamp}|${currentStatus}`,
      eventCode: payload.current_status_id != null ? String(payload.current_status_id) : null,
      eventLabel: currentStatus,
      eventAt: timestamp ? new Date(timestamp.replace(/(\d{2}) (\d{2}) (\d{4})/, '$3-$2-$1')).toISOString() : new Date().toISOString(),
      location: null,
    });
  }
  await persistTrackingEvents(shipment.id, events, 'webhook');

  const mapped = mapProviderStatusToShipment(currentStatus) || mapProviderStatusToShipment(String(payload.shipment_status ?? ''));
  const nextStatus = maybeAdvanceStatus(shipment.status, mapped);
  const etd = payload.etd != null ? new Date(String(payload.etd)) : null;

  await ok(
    db()
      .from('shipments')
      .update({
        status: nextStatus,
        courier_name: payload.courier_name != null ? String(payload.courier_name) : shipment.courier_name,
        awb: awb || shipment.awb,
        etd_at: etd && !Number.isNaN(etd.getTime()) ? etd.toISOString() : shipment.etd_at,
        delivered_at: nextStatus === 'delivered' ? new Date().toISOString() : shipment.delivered_at,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipment.id),
  );

  if (nextStatus === 'delivered') {
    const order = await one<{ status: string }>(db().from('orders').select('status').eq('id', shipment.order_id).maybeSingle());
    if (order && !['delivered', 'cancelled', 'refunded'].includes(order.status)) {
      await ok(db().from('orders').update({ status: 'delivered' }).eq('id', shipment.order_id));
      await ok(
        db().from('order_status_history').insert({
          order_id: shipment.order_id,
          from_status: order.status,
          to_status: 'delivered',
          note: 'Delivered via logistics webhook',
          actor: 'system:shipping',
        }),
      );
    }
  }

  await ok(
    db()
      .from('shipping_webhook_events')
      .update({
        shipment_id: shipment.id,
        processing_status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', eventRow!.id),
  );

  return { ok: true, shipmentId: shipment.id, status: nextStatus };
}

async function enqueueJob(
  jobType: 'reconcile_uncertain_create' | 'retry_awb' | 'retry_pickup' | 'retry_label' | 'sync_tracking' | 'sync_ndr',
  input: { shipmentId?: string; orderId?: string },
) {
  await ok(
    db().from('shipping_sync_jobs').insert({
      job_type: jobType,
      shipment_id: input.shipmentId ?? null,
      order_id: input.orderId ?? null,
      status: 'pending',
      next_retry_at: new Date(Date.now() + 60_000).toISOString(),
    }),
  );
}

export async function processShippingJobs(limit = 20) {
  const jobs = await rows<{
    id: string;
    job_type: string;
    shipment_id: string | null;
    order_id: string | null;
    attempts: number;
    max_attempts: number;
  }>(
    db()
      .from('shipping_sync_jobs')
      .select('id, job_type, shipment_id, order_id, attempts, max_attempts')
      .in('status', ['pending', 'failed'])
      .lte('next_retry_at', new Date().toISOString())
      .order('next_retry_at')
      .limit(limit),
  );

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const job of jobs) {
    await ok(
      db()
        .from('shipping_sync_jobs')
        .update({ status: 'running', attempts: job.attempts + 1, updated_at: new Date().toISOString() })
        .eq('id', job.id),
    );
    try {
      if (job.job_type === 'sync_tracking' && job.shipment_id) {
        await syncShipmentTracking(job.shipment_id);
      } else if (job.job_type === 'retry_awb' && job.shipment_id) {
        await assignAwb(job.shipment_id);
      } else if (job.job_type === 'retry_pickup' && job.shipment_id) {
        await schedulePickup(job.shipment_id);
      } else if (job.job_type === 'retry_label' && job.shipment_id) {
        await retrieveLabel(job.shipment_id);
      } else if (job.job_type === 'reconcile_uncertain_create' && job.shipment_id) {
        const shipment = await one<ShipmentRow>(db().from('shipments').select('*').eq('id', job.shipment_id).maybeSingle());
        if (shipment && !shipment.provider_shipment_id && shipment.operation_state === 'uncertain') {
          // Do not recreate blindly; leave for admin after marking ready for review.
          await ok(
            db()
              .from('shipments')
              .update({ operation_state: 'failed', last_error: 'manual_reconcile_required', updated_at: new Date().toISOString() })
              .eq('id', shipment.id),
          );
        }
      } else if (job.job_type === 'sync_tracking' || !job.shipment_id) {
        // no-op
      }
      await ok(
        db()
          .from('shipping_sync_jobs')
          .update({ status: 'succeeded', updated_at: new Date().toISOString() })
          .eq('id', job.id),
      );
      results.push({ id: job.id, ok: true });
    } catch (error) {
      const attempts = job.attempts + 1;
      const abandoned = attempts >= job.max_attempts;
      await ok(
        db()
          .from('shipping_sync_jobs')
          .update({
            status: abandoned ? 'abandoned' : 'failed',
            last_error: error instanceof Error ? error.message : 'job_failed',
            last_error_category: error instanceof ShiprocketError ? error.category : 'unknown',
            next_retry_at: abandoned ? null : new Date(Date.now() + attempts * 120_000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id),
      );
      results.push({ id: job.id, ok: false, error: error instanceof Error ? error.message : 'job_failed' });
    }
  }

  // Also enqueue stale tracking sync for non-terminal shipments
  const stale = await rows<{ id: string }>(
    db()
      .from('shipments')
      .select('id')
      .not('status', 'in', '("delivered","cancelled","failed","rto_delivered")')
      .or(`last_synced_at.is.null,last_synced_at.lt.${new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()}`)
      .limit(limit),
  );
  for (const row of stale) {
    try {
      await syncShipmentTracking(row.id);
    } catch {
      await enqueueJob('sync_tracking', { shipmentId: row.id });
    }
  }

  return results;
}

export async function createReturnForShipment(shipmentId: string, reason: string) {
  const shipment = await one<ShipmentRow>(db().from('shipments').select('*').eq('id', shipmentId).maybeSingle());
  if (!shipment) throw new Error('not_found');
  if (!['delivered', 'exception', 'rto_initiated'].includes(shipment.status) && shipment.status !== 'out_for_delivery') {
    // Allow return after delivery or exception; also allow explicit admin attempt for delivered-like flows
  }
  const { order, address } = await requirePaidOrder(shipment.order_id);
  const pkg = await loadPackageForOrder(shipment.order_id);
  const pickupLocation = env.SHIPROCKET_PICKUP_LOCATION;
  if (!pickupLocation) throw new Error('pickup_location_missing');

  const nameParts = address.full_name.trim().split(/\s+/);
  const created = await shiprocketClient.createReturn({
    order_id: `${order.order_number}-R`,
    order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    channel_id: '',
    pickup_customer_name: nameParts[0] || 'Customer',
    pickup_address: address.line1,
    pickup_city: address.city,
    pickup_state: address.region || address.city,
    pickup_country: address.country || 'India',
    pickup_pincode: address.postal_code,
    pickup_email: order.email,
    pickup_phone: address.phone,
    shipping_customer_name: 'Veloraa Rougee',
    shipping_address: pickupLocation,
    shipping_city: 'Warehouse',
    shipping_state: 'Warehouse',
    shipping_country: 'India',
    shipping_pincode: pkg.pickupPostcode,
    shipping_phone: address.phone,
    order_items: pkg.items.map((item, index) => ({
      name: `${item.product_name} ${item.variant_name}`.trim(),
      sku: item.sku || `SKU-${index + 1}`,
      units: item.quantity,
      selling_price: item.unit_price_paise / 100,
    })),
    payment_method: 'Prepaid',
    sub_total: Math.max((order.subtotal_paise - order.discount_paise) / 100, 0),
    length: mmToCm(pkg.lengthMm),
    breadth: mmToCm(pkg.widthMm),
    height: mmToCm(pkg.heightMm),
    weight: gramsToKg(pkg.weightGrams),
  });

  const returnRow = await one(
    db()
      .from('shipment_returns')
      .insert({
        order_id: order.id,
        original_shipment_id: shipment.id,
        provider_order_id: String(created.order_id),
        provider_shipment_id: String(created.shipment_id),
        awb: created.awb_code || null,
        reason,
        reverse_pickup_status: 'requested',
        tracking_status: created.status || null,
      })
      .select('*')
      .single(),
  );
  return returnRow;
}

export async function shippingAnalytics(fromIso?: string, toIso?: string) {
  let query = db().from('shipments').select('id, status, courier_name, estimated_cost_paise, confirmed_cost_paise, created_at, delivered_at, pickup_at');
  if (fromIso) query = query.gte('created_at', fromIso);
  if (toIso) query = query.lte('created_at', toIso);
  const shipments = await rows<{
    id: string;
    status: string;
    courier_name: string | null;
    estimated_cost_paise: number | null;
    confirmed_cost_paise: number | null;
    created_at: string;
    delivered_at: string | null;
    pickup_at: string | null;
  }>(query);

  const byStatus: Record<string, number> = {};
  const byCourier: Record<string, { count: number; confirmedPaise: number }> = {};
  let estimated = 0;
  let confirmed = 0;
  let confirmedCount = 0;
  let deliveryHoursSum = 0;
  let deliveryCount = 0;
  let rto = 0;
  let exceptions = 0;

  for (const row of shipments) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    if (row.estimated_cost_paise) estimated += row.estimated_cost_paise;
    if (row.confirmed_cost_paise != null) {
      confirmed += row.confirmed_cost_paise;
      confirmedCount += 1;
    }
    const courier = row.courier_name || 'Unknown';
    byCourier[courier] ??= { count: 0, confirmedPaise: 0 };
    byCourier[courier].count += 1;
    byCourier[courier].confirmedPaise += row.confirmed_cost_paise ?? 0;
    if (row.status.startsWith('rto')) rto += 1;
    if (row.status === 'exception' || row.status === 'delayed') exceptions += 1;
    if (row.delivered_at && row.created_at) {
      const hours = (new Date(row.delivered_at).getTime() - new Date(row.created_at).getTime()) / 3_600_000;
      if (Number.isFinite(hours) && hours >= 0) {
        deliveryHoursSum += hours;
        deliveryCount += 1;
      }
    }
  }

  return {
    totalShipments: shipments.length,
    byStatus,
    estimatedShippingExpenditurePaise: estimated,
    confirmedShippingExpenditurePaise: confirmed,
    averageConfirmedCostPaise: confirmedCount ? Math.round(confirmed / confirmedCount) : null,
    estimatedVersusConfirmedDeltaPaise: confirmed - estimated,
    deliverySuccessRate: shipments.length ? (byStatus.delivered ?? 0) / shipments.length : null,
    averageDeliveryHours: deliveryCount ? deliveryHoursSum / deliveryCount : null,
    rtoPercentage: shipments.length ? rto / shipments.length : null,
    exceptionPercentage: shipments.length ? exceptions / shipments.length : null,
    byCourier,
    note: 'Confirmed costs only include provider values when available; otherwise awaiting_statement.',
  };
}
