import { env } from '../env';
import { db, one, ok } from '../db';
import { ShiprocketError, classifyHttpStatus } from './errors';
import type {
  NormalizedCourierRate,
  NormalizedTrackingEvent,
  ShiprocketAssignAwbResponse,
  ShiprocketAuthResponse,
  ShiprocketCreateOrderInput,
  ShiprocketCreateOrderResponse,
  ShiprocketServiceabilityResponse,
  ShiprocketTrackResponse,
  ShipmentStatus,
} from './types';

const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // refresh before 10-day expiry
const REQUEST_TIMEOUT_MS = 20_000;

type MemoryToken = { token: string; expiresAt: number };
let memoryToken: MemoryToken | null = null;
let loginInFlight: Promise<string> | null = null;

function baseUrl() {
  return (env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in').replace(/\/$/, '');
}

function assertConfigured() {
  if (!env.SHIPROCKET_EMAIL || !env.SHIPROCKET_PASSWORD) {
    throw new ShiprocketError('not_configured', 'shiprocket_not_configured');
  }
}

function rupeesToPaise(value: number) {
  return Math.round(Number(value) * 100);
}

function parseEtdDays(value: string | number | undefined): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const match = String(value).match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

async function readStoredToken(): Promise<MemoryToken | null> {
  try {
    const row = await one<{ access_token: string; expires_at: string }>(
      db().from('provider_tokens').select('access_token, expires_at').eq('provider', 'shiprocket').maybeSingle(),
    );
    if (!row?.access_token || !row.expires_at) return null;
    const expiresAt = new Date(row.expires_at).getTime();
    if (Number.isNaN(expiresAt) || expiresAt <= Date.now() + 60_000) return null;
    return { token: row.access_token, expiresAt };
  } catch {
    return null;
  }
}

async function writeStoredToken(token: string, expiresAt: number) {
  try {
    await ok(
      db().from('provider_tokens').upsert({
        provider: 'shiprocket',
        access_token: token,
        expires_at: new Date(expiresAt).toISOString(),
        updated_at: new Date().toISOString(),
      }),
    );
  } catch {
    // Token persistence is best-effort; in-memory cache still works.
  }
}

async function login(): Promise<string> {
  assertConfigured();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl()}/v1/external/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: env.SHIPROCKET_EMAIL, password: env.SHIPROCKET_PASSWORD }),
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => ({}))) as ShiprocketAuthResponse & { message?: string };
    if (!response.ok || !body.token) {
      const classified = classifyHttpStatus(response.status);
      throw new ShiprocketError(classified.category, 'shiprocket_auth_failed', {
        status: response.status,
        retryable: classified.retryable,
        details: { message: body.message },
      });
    }
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    memoryToken = { token: body.token, expiresAt };
    await writeStoredToken(body.token, expiresAt);
    return body.token;
  } catch (error) {
    if (error instanceof ShiprocketError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ShiprocketError('timeout', 'shiprocket_auth_timeout', { retryable: true, cause: error });
    }
    throw new ShiprocketError('network', 'shiprocket_auth_network', { retryable: true, cause: error });
  } finally {
    clearTimeout(timer);
  }
}

async function getToken(force = false): Promise<string> {
  assertConfigured();
  if (!force && memoryToken && memoryToken.expiresAt > Date.now() + 60_000) {
    return memoryToken.token;
  }
  if (!force) {
    const stored = await readStoredToken();
    if (stored) {
      memoryToken = stored;
      return stored.token;
    }
  }
  if (!loginInFlight) {
    loginInFlight = login().finally(() => {
      loginInFlight = null;
    });
  }
  return loginInFlight;
}

async function request<T>(
  method: string,
  path: string,
  options?: { body?: unknown; query?: Record<string, string | number | boolean | undefined>; idempotent?: boolean },
): Promise<T> {
  assertConfigured();
  const idempotent = options?.idempotent ?? method === 'GET';
  let token = await getToken(false);
  const url = new URL(`${baseUrl()}${path}`);
  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const attempt = async (authToken: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: options?.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
      const text = await response.text();
      let json: unknown = {};
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          throw new ShiprocketError('invalid_response', 'shiprocket_invalid_json', {
            status: response.status,
            details: { snippet: text.slice(0, 200) },
          });
        }
      }
      return { response, json };
    } catch (error) {
      if (error instanceof ShiprocketError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ShiprocketError(
          idempotent ? 'timeout' : 'unknown_outcome',
          idempotent ? 'shiprocket_timeout' : 'shiprocket_timeout_uncertain',
          { retryable: idempotent, cause: error },
        );
      }
      throw new ShiprocketError(
        idempotent ? 'network' : 'unknown_outcome',
        idempotent ? 'shiprocket_network' : 'shiprocket_network_uncertain',
        { retryable: idempotent, cause: error },
      );
    } finally {
      clearTimeout(timer);
    }
  };

  let result = await attempt(token);
  if (result.response.status === 401) {
    token = await getToken(true);
    result = await attempt(token);
  }

  if (!result.response.ok) {
    const classified = classifyHttpStatus(result.response.status);
    throw new ShiprocketError(classified.category, `shiprocket_http_${result.response.status}`, {
      status: result.response.status,
      retryable: classified.retryable && idempotent,
      details: result.json,
    });
  }

  return result.json as T;
}

export function normalizeCourierRates(payload: ShiprocketServiceabilityResponse): NormalizedCourierRate[] {
  const companies = payload.data?.available_courier_companies ?? [];
  return companies
    .filter((row) => row && row.courier_company_id != null && row.courier_name)
    .map((row) => ({
      courierId: Number(row.courier_company_id),
      courierName: String(row.courier_name),
      ratePaise: rupeesToPaise(Number(row.rate ?? row.freight_charge ?? 0)),
      etdDays: parseEtdDays(row.etd ?? row.estimated_delivery_days),
      raw: row,
    }))
    .sort((a, b) => a.ratePaise - b.ratePaise);
}

export function normalizeTrackingEvents(
  scans: Array<{
    date?: string;
    status?: string;
    activity?: string;
    location?: string;
    'sr-status'?: string;
    'sr-status-label'?: string;
  }> = [],
): NormalizedTrackingEvent[] {
  return scans
    .map((scan, index) => {
      const eventAt = scan.date ? new Date(scan.date) : null;
      const atIso = eventAt && !Number.isNaN(eventAt.getTime()) ? eventAt.toISOString() : new Date().toISOString();
      const label = scan.activity || scan['sr-status-label'] || scan.status || 'Update';
      const code = scan['sr-status'] || scan.status || null;
      const key = [atIso, code ?? '', label, scan.location ?? '', index].join('|');
      return {
        providerEventKey: key,
        eventCode: code,
        eventLabel: label,
        eventAt: atIso,
        location: scan.location ?? null,
      };
    })
    .sort((a, b) => a.eventAt.localeCompare(b.eventAt));
}

export function mapProviderStatusToShipment(status: string | number | undefined | null): ShipmentStatus | null {
  if (status == null || status === '') return null;
  const raw = String(status).trim().toLowerCase();
  const map: Record<string, ShipmentStatus> = {
    new: 'created',
    created: 'created',
    'awb assigned': 'awb_assigned',
    pickup: 'pickup_scheduled',
    'pickup scheduled': 'pickup_scheduled',
    'picked up': 'picked_up',
    shipped: 'in_transit',
    'in transit': 'in_transit',
    'out for delivery': 'out_for_delivery',
    delivered: 'delivered',
    delayed: 'delayed',
    exception: 'exception',
    undelivered: 'exception',
    rto: 'rto_initiated',
    'rto initiated': 'rto_initiated',
    'rto delivered': 'rto_delivered',
    canceled: 'cancelled',
    cancelled: 'cancelled',
    '6': 'in_transit',
    '7': 'delivered',
    '17': 'out_for_delivery',
    '18': 'in_transit',
    '19': 'out_for_delivery',
    '20': 'in_transit',
    '21': 'delivered',
    '42': 'picked_up',
    '46': 'rto_initiated',
  };
  return map[raw] ?? null;
}

export function shipmentStatusRank(status: ShipmentStatus): number {
  const order: ShipmentStatus[] = [
    'pending',
    'created',
    'awb_assigned',
    'pickup_scheduled',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delayed',
    'exception',
    'delivered',
    'rto_initiated',
    'rto_delivered',
    'cancelled',
    'failed',
  ];
  return order.indexOf(status);
}

export const shiprocketClient = {
  async checkServiceability(input: {
    pickupPostcode: string;
    deliveryPostcode: string;
    weightKg: number;
    cod?: boolean;
  }) {
    const payload = await request<ShiprocketServiceabilityResponse>('GET', '/v1/external/courier/serviceability/', {
      query: {
        pickup_postcode: input.pickupPostcode,
        delivery_postcode: input.deliveryPostcode,
        weight: input.weightKg,
        cod: input.cod ? 1 : 0,
      },
      idempotent: true,
    });
    return normalizeCourierRates(payload);
  },

  async createAdhocOrder(body: ShiprocketCreateOrderInput) {
    return request<ShiprocketCreateOrderResponse>('POST', '/v1/external/orders/create/adhoc', {
      body,
      idempotent: false,
    });
  },

  async assignAwb(input: { shipmentId: number; courierId?: number }) {
    return request<ShiprocketAssignAwbResponse>('POST', '/v1/external/courier/assign/awb', {
      body: {
        shipment_id: input.shipmentId,
        courier_id: input.courierId,
      },
      idempotent: false,
    });
  },

  async generatePickup(shipmentIds: number[]) {
    return request<{ pickup_status?: number; response?: unknown }>('POST', '/v1/external/courier/generate/pickup', {
      body: { shipment_id: shipmentIds },
      idempotent: false,
    });
  },

  async generateLabel(shipmentIds: number[]) {
    return request<{ label_url?: string; label_created?: number }>('POST', '/v1/external/courier/generate/label', {
      body: { shipment_id: shipmentIds },
      idempotent: true,
    });
  },

  async trackByAwb(awb: string) {
    return request<ShiprocketTrackResponse>('GET', `/v1/external/courier/track/awb/${encodeURIComponent(awb)}`, {
      idempotent: true,
    });
  },

  async trackByShipmentId(shipmentId: string | number) {
    return request<ShiprocketTrackResponse>(
      'GET',
      `/v1/external/courier/track/shipment/${encodeURIComponent(String(shipmentId))}`,
      { idempotent: true },
    );
  },

  async createReturn(body: Record<string, unknown>) {
    return request<ShiprocketCreateOrderResponse>('POST', '/v1/external/orders/create/return', {
      body,
      idempotent: false,
    });
  },

  async listNdr() {
    return request<{ data?: unknown[] }>('GET', '/v1/external/ndr/all', { idempotent: true });
  },

  async getNdr(awb: string) {
    return request<unknown>('GET', `/v1/external/ndr/${encodeURIComponent(awb)}`, { idempotent: true });
  },

  async actNdr(awb: string, body: Record<string, unknown>) {
    return request<unknown>('POST', `/v1/external/ndr/${encodeURIComponent(awb)}/action`, {
      body,
      idempotent: false,
    });
  },

  /** Test helper: clear in-memory token cache */
  _resetTokenCache() {
    memoryToken = null;
    loginInFlight = null;
  },
};

export { rupeesToPaise };
