import { describe, expect, it } from 'vitest';
import { hasPermission, ROLE_PERMISSIONS } from '../shared/permissions';
import { mapProviderStatusToShipment, shipmentStatusRank } from '../server/src/shiprocket/client';

describe('shipping permissions', () => {
  it('grants shipping write to order managers', () => {
    expect(ROLE_PERMISSIONS.order_manager).toContain('shipping.write');
    expect(ROLE_PERMISSIONS.order_manager).toContain('shipping.returns');
    expect(hasPermission('order_manager', ROLE_PERMISSIONS.order_manager, 'shipping.read')).toBe(true);
  });

  it('allows support to read but not write shipping', () => {
    expect(ROLE_PERMISSIONS.support_manager).toContain('shipping.read');
    expect(ROLE_PERMISSIONS.support_manager).not.toContain('shipping.write');
  });
});

describe('shipment status progression', () => {
  it('does not treat delivered as regressable to in_transit via rank', () => {
    expect(shipmentStatusRank('delivered')).toBeGreaterThan(shipmentStatusRank('in_transit'));
  });

  it('maps webhook-like labels used in live tracking', () => {
    expect(mapProviderStatusToShipment('OUT FOR DELIVERY')).toBe('out_for_delivery');
    expect(mapProviderStatusToShipment('RTO Delivered')).toBe('rto_delivered');
  });
});
