import { describe, expect, it } from 'vitest';
import {
  mapProviderStatusToShipment,
  normalizeCourierRates,
  normalizeTrackingEvents,
  shipmentStatusRank,
  rupeesToPaise,
} from '../server/src/shiprocket/client';
import { classifyHttpStatus, ShiprocketError } from '../server/src/shiprocket/errors';

describe('shiprocket money helpers', () => {
  it('converts rupees to paise', () => {
    expect(rupeesToPaise(49.5)).toBe(4950);
    expect(rupeesToPaise(0)).toBe(0);
  });
});

describe('courier rate normalization', () => {
  it('maps provider courier companies into sorted paise rates', () => {
    const rates = normalizeCourierRates({
      data: {
        available_courier_companies: [
          { courier_company_id: 2, courier_name: 'Blitz', rate: 80, etd: '3' },
          { courier_company_id: 1, courier_name: 'Alpha', rate: 55.25, estimated_delivery_days: 2 },
        ],
      },
    });
    expect(rates).toHaveLength(2);
    expect(rates[0]).toMatchObject({ courierId: 1, courierName: 'Alpha', ratePaise: 5525, etdDays: 2 });
    expect(rates[1].ratePaise).toBe(8000);
  });

  it('returns empty when no couriers', () => {
    expect(normalizeCourierRates({ data: { available_courier_companies: [] } })).toEqual([]);
  });
});

describe('tracking event normalization', () => {
  it('builds stable dedupe keys and sorts by time', () => {
    const events = normalizeTrackingEvents([
      { date: '2026-05-20 12:00:00', activity: 'In Transit', location: 'Delhi', 'sr-status': '18' },
      { date: '2026-05-19 11:00:00', activity: 'Picked Up', location: 'Jaipur', 'sr-status': '42' },
    ]);
    expect(events).toHaveLength(2);
    expect(events[0].eventLabel).toBe('Picked Up');
    expect(events[1].eventLabel).toBe('In Transit');
    expect(events[0].providerEventKey).toContain('42');
  });
});

describe('status mapping', () => {
  it('maps known provider labels', () => {
    expect(mapProviderStatusToShipment('IN TRANSIT')).toBe('in_transit');
    expect(mapProviderStatusToShipment('Delivered')).toBe('delivered');
    expect(mapProviderStatusToShipment('42')).toBe('picked_up');
  });

  it('ranks statuses for regression prevention', () => {
    expect(shipmentStatusRank('delivered')).toBeGreaterThan(shipmentStatusRank('in_transit'));
    expect(shipmentStatusRank('created')).toBeLessThan(shipmentStatusRank('awb_assigned'));
  });
});

describe('error classification', () => {
  it('classifies auth and rate limits', () => {
    expect(classifyHttpStatus(401)).toEqual({ category: 'authentication', retryable: false });
    expect(classifyHttpStatus(429)).toEqual({ category: 'rate_limit', retryable: true });
    expect(classifyHttpStatus(503)).toEqual({ category: 'provider_server', retryable: true });
  });

  it('constructs ShiprocketError', () => {
    const error = new ShiprocketError('timeout', 'shiprocket_timeout', { retryable: true, status: 0 });
    expect(error.category).toBe('timeout');
    expect(error.retryable).toBe(true);
  });
});
