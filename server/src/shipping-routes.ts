import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, one, rows } from './db';
import { audit, clientIp, notify, requireAdmin, requireCustomer } from './http';
import { ShiprocketError } from './shiprocket/errors';
import {
  assignAwb,
  compareCourierRates,
  createReturnForShipment,
  createShipmentForOrder,
  getShipmentForOrder,
  getShipmentTracking,
  normalizeTrackingPayload,
  processLogisticsWebhook,
  processShippingJobs,
  retrieveLabel,
  schedulePickup,
  shippingAnalytics,
  syncShipmentTracking,
  verifyWebhookToken,
  type ShipmentRow,
} from './shipping-service';
import { shiprocketClient } from './shiprocket/client';
import { env } from './env';
import { createHash, timingSafeEqual } from 'node:crypto';

function shippingHttpError(error: unknown) {
  if (error instanceof ShiprocketError) {
    if (error.category === 'not_configured') return { status: 503, error: 'shiprocket_not_configured' };
    if (error.category === 'authentication' || error.category === 'authorization') {
      return { status: 502, error: 'shiprocket_auth_failed' };
    }
    if (error.category === 'invalid_request') return { status: 400, error: error.message };
    if (error.category === 'unknown_outcome') return { status: 409, error: 'shiprocket_uncertain_outcome' };
    return { status: 502, error: 'shiprocket_provider_error' };
  }
  const message = error instanceof Error ? error.message : 'request_failed';
  if (
    [
      'not_found',
      'payment_not_paid',
      'order_not_shippable',
      'address_required',
      'pickup_postcode_missing',
      'pickup_location_missing',
      'shipment_missing_provider_id',
      'tracking_unavailable',
      'webhook_not_configured',
      'unauthorized',
      'forbidden',
    ].includes(message)
  ) {
    const status = message === 'unauthorized' ? 401 : message === 'forbidden' ? 403 : message === 'not_found' ? 404 : 400;
    return { status, error: message };
  }
  return { status: 500, error: 'request_failed' };
}

async function handle(reply: { status: (code: number) => { send: (body: unknown) => unknown } }, fn: () => Promise<unknown>) {
  try {
    return await fn();
  } catch (error) {
    const mapped = shippingHttpError(error);
    return reply.status(mapped.status).send({ error: mapped.error });
  }
}

export async function registerShipping(app: FastifyInstance) {
  app.post('/webhooks/logistics', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (request, reply) => {
    try {
      verifyWebhookToken(String(request.headers['x-api-key'] || ''));
      const payload = (request.body ?? {}) as Record<string, unknown>;
      const result = await processLogisticsWebhook(payload);
      return result;
    } catch (error) {
      const mapped = shippingHttpError(error);
      return reply.status(mapped.status).send({ error: mapped.error });
    }
  });

  app.post('/internal/shipping/reconcile', async (request, reply) => {
    const secret = env.CRON_SECRET;
    if (!secret) return reply.status(503).send({ error: 'cron_not_configured' });
    const header = String(request.headers['x-cron-secret'] || '');
    const a = Buffer.from(header);
    const b = Buffer.from(secret);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return reply.status(401).send({ error: 'unauthorized' });
    }
    const query = z.object({ limit: z.coerce.number().int().min(1).max(50).optional().default(20) }).parse(request.query);
    const results = await processShippingJobs(query.limit);
    return { ok: true, results };
  });

  app.post('/admin/orders/:id/shipping/rates', async (request, reply) => {
    return handle(reply, async () => {
      await requireAdmin(request, 'shipping.read');
      const params = z.object({ id: z.string().uuid() }).parse(request.params);
      return compareCourierRates(params.id);
    });
  });

  app.post('/admin/orders/:id/shipping/create', async (request, reply) => {
    return handle(reply, async () => {
      const admin = await requireAdmin(request, 'shipping.write');
      const params = z.object({ id: z.string().uuid() }).parse(request.params);
      const body = z.object({ courierId: z.number().int().optional() }).parse(request.body ?? {});
      const shipment = await createShipmentForOrder(params.id, body.courierId);
      await audit({
        actorType: 'admin',
        actorId: admin.id,
        actorLabel: admin.email,
        action: 'shipping.create',
        entityType: 'shipment',
        entityId: shipment.id,
        summary: `Created shipment for order ${shipment.channel_order_id}`,
        ip: clientIp(request),
      });
      await notify({
        type: 'shipping.created',
        title: `Shipment created ${shipment.channel_order_id}`,
        href: `/admin/shipping/${shipment.id}`,
      });
      return { shipment };
    });
  });

  app.get('/admin/shipments', async (request, reply) => {
    return handle(reply, async () => {
      await requireAdmin(request, 'shipping.read');
      const query = z
        .object({
          status: z.string().optional(),
          q: z.string().optional(),
          page: z.coerce.number().int().min(1).optional().default(1),
        })
        .parse(request.query);
      const pageSize = 30;
      let listQuery = db()
        .from('shipments')
        .select(
          'id, order_id, channel_order_id, awb, courier_name, status, pickup_status, estimated_cost_paise, confirmed_cost_paise, etd_at, last_synced_at, created_at, operation_state',
        )
        .order('created_at', { ascending: false })
        .range((query.page - 1) * pageSize, query.page * pageSize - 1);
      if (query.status) listQuery = listQuery.eq('status', query.status);
      if (query.q) {
        listQuery = listQuery.or(
          `channel_order_id.ilike.%${query.q}%,awb.ilike.%${query.q}%,courier_name.ilike.%${query.q}%`,
        );
      }
      const shipments = await rows(listQuery);
      const orderIds = [...new Set(shipments.map((row) => (row as { order_id: string }).order_id))];
      const orders = orderIds.length
        ? await rows<{ id: string; email: string; status: string; total_paise: number }>(
            db().from('orders').select('id, email, status, total_paise').in('id', orderIds),
          )
        : [];
      const byOrder = new Map(orders.map((order) => [order.id, order]));
      return shipments.map((shipment) => {
        const row = shipment as ShipmentRow & { order_id: string };
        const order = byOrder.get(row.order_id);
        return {
          ...row,
          customer_email: order?.email ?? null,
          order_status: order?.status ?? null,
          order_total_paise: order?.total_paise ?? null,
        };
      });
    });
  });

  app.get('/admin/shipments/:id', async (request, reply) => {
    return handle(reply, async () => {
      await requireAdmin(request, 'shipping.read');
      const params = z.object({ id: z.string().uuid() }).parse(request.params);
      const { shipment, events } = await getShipmentTracking(params.id);
      const quotes = await rows(
        db()
          .from('courier_rate_quotes')
          .select('*')
          .eq('order_id', shipment.order_id)
          .order('quoted_at', { ascending: false })
          .limit(20),
      );
      const charges = await one(db().from('shipment_charges').select('*').eq('shipment_id', shipment.id).maybeSingle());
      const documents = await rows(db().from('shipment_documents').select('*').eq('shipment_id', shipment.id).order('created_at', { ascending: false }));
      const returns = await rows(db().from('shipment_returns').select('*').eq('original_shipment_id', shipment.id));
      const order = await one(db().from('orders').select('*').eq('id', shipment.order_id).maybeSingle());
      const payments = await rows(
        db().from('payments').select('id, status, amount_paise, gateway, created_at').eq('order_id', shipment.order_id).order('created_at', { ascending: false }),
      );
      return {
        tracking: normalizeTrackingPayload(shipment, events, true),
        shipment,
        events,
        quotes,
        charges,
        documents,
        returns,
        order,
        payments,
      };
    });
  });

  app.post('/admin/shipments/:id/assign-awb', async (request, reply) => {
    return handle(reply, async () => {
      const admin = await requireAdmin(request, 'shipping.write');
      const params = z.object({ id: z.string().uuid() }).parse(request.params);
      const body = z.object({ courierId: z.number().int().optional() }).parse(request.body ?? {});
      const shipment = await assignAwb(params.id, body.courierId);
      await audit({
        actorType: 'admin',
        actorId: admin.id,
        actorLabel: admin.email,
        action: 'shipping.assign_awb',
        entityType: 'shipment',
        entityId: shipment.id,
        summary: `AWB ${shipment.awb || ''} assigned`,
        ip: clientIp(request),
      });
      return { shipment };
    });
  });

  app.post('/admin/shipments/:id/pickup', async (request, reply) => {
    return handle(reply, async () => {
      const admin = await requireAdmin(request, 'shipping.write');
      const params = z.object({ id: z.string().uuid() }).parse(request.params);
      const shipment = await schedulePickup(params.id);
      await audit({
        actorType: 'admin',
        actorId: admin.id,
        actorLabel: admin.email,
        action: 'shipping.pickup',
        entityType: 'shipment',
        entityId: params.id,
        summary: 'Pickup scheduled',
        ip: clientIp(request),
      });
      return { shipment };
    });
  });

  app.post('/admin/shipments/:id/label', async (request, reply) => {
    return handle(reply, async () => {
      await requireAdmin(request, 'shipping.write');
      const params = z.object({ id: z.string().uuid() }).parse(request.params);
      return retrieveLabel(params.id);
    });
  });

  app.post('/admin/shipments/:id/sync', async (request, reply) => {
    return handle(reply, async () => {
      await requireAdmin(request, 'shipping.read');
      const params = z.object({ id: z.string().uuid() }).parse(request.params);
      const { shipment, events } = await syncShipmentTracking(params.id);
      return { tracking: normalizeTrackingPayload(shipment, events, true) };
    });
  });

  app.post('/admin/shipments/:id/return', async (request, reply) => {
    return handle(reply, async () => {
      const admin = await requireAdmin(request, 'shipping.returns');
      const params = z.object({ id: z.string().uuid() }).parse(request.params);
      const body = z.object({ reason: z.string().min(2).max(500) }).parse(request.body);
      const returnRow = await createReturnForShipment(params.id, body.reason);
      await audit({
        actorType: 'admin',
        actorId: admin.id,
        actorLabel: admin.email,
        action: 'shipping.return',
        entityType: 'shipment',
        entityId: params.id,
        summary: `Return requested: ${body.reason}`,
        ip: clientIp(request),
      });
      return { return: returnRow };
    });
  });

  app.get('/admin/shipping/ndr', async (request, reply) => {
    return handle(reply, async () => {
      await requireAdmin(request, 'shipping.returns');
      return shiprocketClient.listNdr();
    });
  });

  app.post('/admin/shipping/ndr/:awb/action', async (request, reply) => {
    return handle(reply, async () => {
      const admin = await requireAdmin(request, 'shipping.returns');
      const params = z.object({ awb: z.string().min(3) }).parse(request.params);
      const body = z.record(z.unknown()).parse(request.body ?? {});
      const result = await shiprocketClient.actNdr(params.awb, body);
      await audit({
        actorType: 'admin',
        actorId: admin.id,
        actorLabel: admin.email,
        action: 'shipping.ndr_action',
        entityType: 'awb',
        entityId: params.awb,
        summary: `NDR action on ${params.awb}`,
        ip: clientIp(request),
      });
      return result;
    });
  });

  app.get('/admin/shipping/analytics', async (request, reply) => {
    return handle(reply, async () => {
      await requireAdmin(request, 'analytics.read');
      const query = z
        .object({
          from: z.string().optional(),
          to: z.string().optional(),
        })
        .parse(request.query);
      return shippingAnalytics(query.from, query.to);
    });
  });

  app.post('/admin/shipping/reconcile', async (request, reply) => {
    return handle(reply, async () => {
      const admin = await requireAdmin(request, 'shipping.write');
      const body = z.object({ limit: z.number().int().min(1).max(50).optional().default(20) }).parse(request.body ?? {});
      const results = await processShippingJobs(body.limit);
      await audit({
        actorType: 'admin',
        actorId: admin.id,
        actorLabel: admin.email,
        action: 'shipping.reconcile',
        entityType: 'shipping_sync_jobs',
        entityId: 'batch',
        summary: `Reconciled ${results.length} shipping jobs`,
        ip: clientIp(request),
      });
      return { ok: true, results };
    });
  });

  app.get('/account/orders/:orderNumber/tracking', async (request, reply) => {
    return handle(reply, async () => {
      const customer = await requireCustomer(request);
      const params = z.object({ orderNumber: z.string().min(1) }).parse(request.params);
      const order = await one<{ id: string; order_number: string }>(
        db()
          .from('orders')
          .select('id, order_number')
          .eq('order_number', params.orderNumber)
          .eq('customer_id', customer.id)
          .maybeSingle(),
      );
      if (!order) throw new Error('not_found');
      const shipment = await getShipmentForOrder(order.id);
      if (!shipment) {
        return { orderNumber: order.order_number, shipment: null, tracking: null };
      }
      const { events } = await getShipmentTracking(shipment.id);
      return {
        orderNumber: order.order_number,
        tracking: normalizeTrackingPayload(shipment, events, false),
      };
    });
  });
}

/** Hash helper exported for tests if needed */
export function sha256Hex(value: string) {
  return createHash('sha256').update(value).digest('hex');
}
