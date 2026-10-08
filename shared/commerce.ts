export type DiscountType = 'percent' | 'fixed';

export interface CouponRule {
  discountType: DiscountType;
  discountValue: number;
  minOrderPaise: number;
  maxDiscountPaise: number | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  redeemedCount: number;
  perCustomerLimit: number | null;
  customerRedemptions: number;
}

export type CouponResult =
  | { ok: true; discountPaise: number }
  | { ok: false; error: 'invalid_coupon' | 'coupon_limit' | 'coupon_minimum' | 'coupon_not_applicable' };

export function couponDiscount(
  subtotalPaise: number,
  eligiblePaise: number,
  coupon: CouponRule,
  now = new Date(),
): CouponResult {
  if (!coupon.active) return { ok: false, error: 'invalid_coupon' };
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return { ok: false, error: 'invalid_coupon' };
  if (coupon.endsAt && new Date(coupon.endsAt) < now) return { ok: false, error: 'invalid_coupon' };
  if (coupon.usageLimit != null && coupon.redeemedCount >= coupon.usageLimit) {
    return { ok: false, error: 'coupon_limit' };
  }
  if (coupon.perCustomerLimit != null && coupon.customerRedemptions >= coupon.perCustomerLimit) {
    return { ok: false, error: 'coupon_limit' };
  }
  if (subtotalPaise < coupon.minOrderPaise) return { ok: false, error: 'coupon_minimum' };
  if (eligiblePaise <= 0) return { ok: false, error: 'coupon_not_applicable' };

  let discount =
    coupon.discountType === 'percent'
      ? Math.floor((eligiblePaise * coupon.discountValue) / 100)
      : coupon.discountValue;
  if (coupon.maxDiscountPaise != null) discount = Math.min(discount, coupon.maxDiscountPaise);
  discount = Math.min(discount, eligiblePaise);
  return { ok: true, discountPaise: Math.max(discount, 0) };
}

export function shippingPaise(subtotalAfterDiscount: number, thresholdPaise: number, flatPaise: number) {
  return subtotalAfterDiscount >= thresholdPaise ? 0 : flatPaise;
}

export function orderTotal(subtotalPaise: number, discountPaise: number, shipping: number) {
  return Math.max(subtotalPaise - discountPaise + shipping, 0);
}

export function formatInr(paise: number) {
  return (paise / 100).toFixed(2);
}
