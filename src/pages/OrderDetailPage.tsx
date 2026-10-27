import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Download, MapPin, Package, Star } from 'lucide-react';
import { api, hasApi } from '../lib/api';
import { BrandImage } from '../components/ui/BrandImage';
import { TrackingTimeline, TrackingView } from '../components/shipping/TrackingTimeline';

interface OrderDetail {
  order: {
    order_number: string;
    status: string;
    subtotal_paise: number;
    discount_paise: number;
    shipping_paise: number;
    tax_paise?: number;
    total_paise: number;
    created_at?: string;
  };
  items: {
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price_paise: number;
    image_url?: string | null;
  }[];
  address: {
    full_name: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postal_code: string;
  } | null;
  payments: {
    status: string;
    amount_paise: number;
    gateway: string;
    created_at: string;
  }[];
  tracking?: TrackingView | null;
}

const FLOW = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'] as const;

function money(paise: number) {
  return `₹${(Number(paise) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function stepLabel(status: (typeof FLOW)[number]) {
  switch (status) {
    case 'pending':
      return 'Order Placed';
    case 'confirmed':
      return 'Order Confirmed';
    case 'processing':
      return 'Processing';
    case 'packed':
      return 'Packed';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function flowIndex(status: string) {
  const key = status.toLowerCase();
  if (key === 'cancelled' || key === 'refunded') return -1;
  const idx = FLOW.indexOf(key as (typeof FLOW)[number]);
  return idx >= 0 ? idx : 0;
}

export const OrderDetailPage: React.FC<{
  orderNumber: string;
  onNavigate: (path: string) => void;
}> = ({ orderNumber, onNavigate }) => {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasApi()) {
      onNavigate('/en/login');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await api<{ customer: { id: string } | null }>('/auth/me');
        if (!me.customer) {
          onNavigate('/en/login');
          return;
        }
        const payload = await api<OrderDetail>(`/account/orders/${encodeURIComponent(orderNumber)}`);
        if (!cancelled) setDetail(payload);
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Order not found.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, onNavigate]);

  const activeStep = useMemo(() => (detail ? flowIndex(detail.order.status) : 0), [detail]);
  const paidPayment = detail?.payments.find((payment) => payment.status === 'paid') ?? detail?.payments[0];
  const createdLabel = detail?.order.created_at
    ? new Date(detail.order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-[var(--text-muted)]">
        Loading order details…
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-rose-500">{error || 'Order not found.'}</p>
        <button
          type="button"
          onClick={() => onNavigate('/en/orders')}
          className="btn-theme-primary px-5 py-2 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const statusKey = detail.order.status.toLowerCase();
  const terminalNegative = statusKey === 'cancelled' || statusKey === 'refunded';

  return (
    <div className="min-h-[70vh] bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
          <button type="button" onClick={() => onNavigate('/en')} className="hover:text-[var(--accent-primary)] cursor-pointer">
            Home
          </button>
          <span>/</span>
          <button type="button" onClick={() => onNavigate('/en/account')} className="hover:text-[var(--accent-primary)] cursor-pointer">
            My Account
          </button>
          <span>/</span>
          <button type="button" onClick={() => onNavigate('/en/orders')} className="hover:text-[var(--accent-primary)] cursor-pointer">
            My Orders
          </button>
          <span>/</span>
          <span className="font-mono text-[var(--text-primary)]">{detail.order.order_number}</span>
        </nav>

        <button
          type="button"
          onClick={() => onNavigate('/en/orders')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-primary)] mb-5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Orders
        </button>

        <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)] gap-5 items-start">
          <div className="space-y-4">
            <section className="border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-5 space-y-4">
              {detail.items.map((item, index) => (
                <div key={`${item.product_name}-${index}`} className="flex gap-4">
                  <div className="w-20 h-20 rounded-[0.3rem] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
                    <BrandImage
                      src={item.image_url || undefined}
                      alt={item.product_name}
                      fallbackLabel={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {item.product_name}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Shade: {item.variant_name} · Qty {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-[var(--text-primary)] mt-2 tabular-nums">
                      {money(item.unit_price_paise * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            <section className="border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                Order Status
              </h3>

              {terminalNegative ? (
                <div className="flex items-center gap-2 text-sm font-bold text-rose-500">
                  <Circle className="w-4 h-4 fill-current" />
                  {statusKey === 'refunded' ? 'Refunded' : 'Cancelled'}
                  {createdLabel ? ` · ${createdLabel}` : ''}
                </div>
              ) : (
                <ol className="space-y-0">
                  {FLOW.map((step, index) => {
                    const done = index <= activeStep;
                    const current = index === activeStep;
                    return (
                      <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < FLOW.length - 1 && (
                          <span
                            className={`absolute left-[7px] top-4 bottom-0 w-px ${
                              index < activeStep ? 'bg-emerald-500' : 'bg-[var(--border-subtle)]'
                            }`}
                          />
                        )}
                        <span className="relative z-10 mt-0.5">
                          {done ? (
                            <CheckCircle2 className={`w-4 h-4 ${current ? 'text-emerald-500' : 'text-emerald-500/80'}`} />
                          ) : (
                            <Circle className="w-4 h-4 text-[var(--border-subtle)]" />
                          )}
                        </span>
                        <div>
                          <p className={`text-sm font-bold ${done ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                            {stepLabel(step)}
                          </p>
                          {current && createdLabel && index === 0 && (
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{createdLabel}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                <TrackingTimeline tracking={detail.tracking} />
              </div>
            </section>

            {statusKey === 'delivered' && (
              <section className="border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Rate your experience
                </h3>
                <div className="flex items-center gap-1 text-[var(--accent-primary)]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="w-5 h-5" />
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Share how this formula felt — ratings help other clients choose with confidence.
                </p>
              </section>
            )}

            <p className="text-xs text-[var(--text-muted)] font-mono px-1">
              Order ID: {detail.order.order_number}
            </p>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            {detail.address && (
              <section className="border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Delivery Details
                  </h3>
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)]">{detail.address.full_name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  {detail.address.line1}
                  {detail.address.line2 ? `, ${detail.address.line2}` : ''}
                  <br />
                  {detail.address.city}
                  {detail.address.state ? `, ${detail.address.state}` : ''} {detail.address.postal_code}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-2">{detail.address.phone}</p>
              </section>
            )}

            <section className="border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Price Details
                </h3>
              </div>

              <div className="flex justify-between text-sm text-[var(--text-muted)]">
                <span>Listing price</span>
                <span className="tabular-nums">{money(detail.order.subtotal_paise)}</span>
              </div>
              {detail.order.discount_paise > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span className="tabular-nums">−{money(detail.order.discount_paise)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-[var(--text-muted)]">
                <span>Shipping</span>
                <span className="tabular-nums">
                  {detail.order.shipping_paise > 0 ? money(detail.order.shipping_paise) : 'Free'}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border-subtle)]">
                <span>Total amount</span>
                <span className="tabular-nums text-[var(--accent-primary)]">{money(detail.order.total_paise)}</span>
              </div>

              {paidPayment && (
                <p className="text-xs text-[var(--text-muted)] pt-1">
                  {paidPayment.status === 'paid' ? 'Paid via' : 'Payment'}{' '}
                  <span className="font-bold text-[var(--text-primary)] uppercase">{paidPayment.gateway}</span>
                </p>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-[0.3rem] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] hover:border-[var(--accent-primary)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
