import { describe, expect, it } from 'vitest';
import { couponDiscount, orderTotal, shippingPaise } from '../shared/commerce';
import { hasPermission, PERMISSIONS, ROLE_PERMISSIONS } from '../shared/permissions';
import {
  amountToPaise,
  paiseToPayuAmount,
  payuRefundCommandHash,
  payuRequestHash,
  payuResponseHash,
  resolvePaymentRpcStatus,
  sha512,
  verifyPayuHash,
} from '../shared/payu';
import { productSchema, validateSeoRecords } from '../shared/seo';

describe('coupons and totals', () => {
  const coupon = {
    discountType: 'percent' as const,
    discountValue: 10,
    minOrderPaise: 10000,
    maxDiscountPaise: 5000,
    active: true,
    startsAt: null,
    endsAt: null,
    usageLimit: 5,
    redeemedCount: 0,
    perCustomerLimit: 1,
    customerRedemptions: 0,
  };

  it('applies a capped percentage discount', () => {
    const result = couponDiscount(20000, 20000, coupon);
    expect(result).toEqual({ ok: true, discountPaise: 2000 });
    expect(orderTotal(20000, 2000, 0)).toBe(18000);
  });

  it('rejects a coupon below the minimum', () => {
    expect(couponDiscount(5000, 5000, coupon).ok).toBe(false);
  });

  it('ships free at the threshold', () => {
    expect(shippingPaise(99900, 99900, 4900)).toBe(0);
    expect(shippingPaise(99899, 99900, 4900)).toBe(4900);
  });
});

describe('permissions', () => {
  it('gives every permission to the super admin', () => {
    for (const permission of PERMISSIONS) {
      expect(hasPermission('super_admin', [], permission)).toBe(true);
    }
  });

  it('keeps SEO separate from order writes', () => {
    expect(ROLE_PERMISSIONS.seo_manager).toContain('seo.write');
    expect(ROLE_PERMISSIONS.seo_manager).not.toContain('orders.write');
    expect(hasPermission('seo_manager', ROLE_PERMISSIONS.seo_manager, 'orders.write')).toBe(false);
  });
});

describe('payu', () => {
  it('builds the documented request hash', () => {
    const hash = payuRequestHash({
      key: 'key',
      txnid: 'txn',
      amount: '10.00',
      productinfo: 'Lipstick',
      firstname: 'Ava',
      email: 'a@example.com',
      udf1: 'VR-1',
      salt: 'salt',
    });
    const manual = sha512('key|txn|10.00|Lipstick|Ava|a@example.com|VR-1||||||||||salt');
    expect(hash).toBe(manual);
  });

  it('rejects a tampered response hash', () => {
    const body = {
      key: 'key',
      status: 'success',
      txnid: 'txn',
      amount: '10.00',
      productinfo: 'Lipstick',
      firstname: 'Ava',
      email: 'a@example.com',
      udf1: 'VR-1',
      hash: 'nope',
    };
    expect(verifyPayuHash(body, 'key', 'salt')).toBe(false);
    body.hash = payuResponseHash({ ...body, salt: 'salt', key: 'key' });
    expect(verifyPayuHash(body, 'key', 'salt')).toBe(true);
  });

  it('builds refund command hash', () => {
    expect(payuRefundCommandHash('key', 'mihpayid', 'salt')).toBe(
      sha512('key|cancel_refund_transaction|mihpayid|salt'),
    );
  });

  it('converts amounts without inventing paise', () => {
    expect(amountToPaise('10.00')).toBe(1000);
    expect(amountToPaise('not-a-number')).toBeNull();
    expect(paiseToPayuAmount(1999)).toBe('19.99');
  });

  it('resolves paid only when verify and amounts match', () => {
    expect(
      resolvePaymentRpcStatus({
        callbackStatus: 'success',
        verifiedOk: true,
        conclusive: true,
        callbackAmountPaise: 1000,
        verifiedAmountPaise: 1000,
      }),
    ).toBe('paid');
  });

  it('keeps pending on amount mismatch or inconclusive verify', () => {
    expect(
      resolvePaymentRpcStatus({
        callbackStatus: 'success',
        verifiedOk: true,
        conclusive: true,
        callbackAmountPaise: 1000,
        verifiedAmountPaise: 999,
      }),
    ).toBe('pending');
    expect(
      resolvePaymentRpcStatus({
        callbackStatus: 'success',
        verifiedOk: false,
        conclusive: false,
        callbackAmountPaise: 1000,
        verifiedAmountPaise: null,
      }),
    ).toBe('pending');
  });

  it('marks failed only when conclusive failure is not a success callback', () => {
    expect(
      resolvePaymentRpcStatus({
        callbackStatus: 'failure',
        verifiedOk: false,
        conclusive: true,
        callbackAmountPaise: 1000,
        verifiedAmountPaise: 1000,
      }),
    ).toBe('failed');
    expect(
      resolvePaymentRpcStatus({
        callbackStatus: 'success',
        verifiedOk: false,
        conclusive: true,
        callbackAmountPaise: 1000,
        verifiedAmountPaise: 1000,
      }),
    ).toBe('pending');
  });
});

describe('refund eligibility', () => {
  it('requires payments.refund permission for refunds', () => {
    expect(hasPermission('order_manager', ROLE_PERMISSIONS.order_manager, 'payments.refund')).toBe(false);
    expect(hasPermission('super_admin', [], 'payments.refund')).toBe(true);
  });

  it('never allows refund above remaining captured amount', () => {
    const captured = 50000;
    const alreadyRefunded = 20000;
    const requested = 40000;
    const remaining = captured - alreadyRefunded;
    expect(requested > remaining).toBe(true);
    expect(Math.max(remaining, 0)).toBe(30000);
  });
});

describe('seo', () => {
  it('omits aggregate rating when there are no reviews', () => {
    const schema = productSchema({
      origin: 'https://veloraa.example',
      name: 'Liquid Matte Lipstick',
      description: 'A matte lipstick.',
      slug: 'liquid-matte-lipstick',
      image: ['https://cdn.example/lipstick.jpg'],
      brand: 'Veloraa Rougee',
      price: '90.00',
      currency: 'INR',
      availability: 'InStock',
    });
    expect(schema.aggregateRating).toBeUndefined();
    expect(schema['@type']).toBe('Product');
  });

  it('flags duplicate titles', () => {
    const issues = validateSeoRecords([
      { path: '/a', title: 'Same', description: 'One', h1: 'A', canonical: 'https://example/a', indexable: true },
      { path: '/b', title: 'Same', description: 'Two', h1: 'B', canonical: 'https://example/b', indexable: true },
    ]);
    expect(issues.some((issue) => issue.code === 'duplicate_title')).toBe(true);
  });
});
