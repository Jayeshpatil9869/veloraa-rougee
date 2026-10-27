import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Package, Search, Star } from 'lucide-react';
import { api, hasApi } from '../lib/api';
import { BrandImage } from '../components/ui/BrandImage';

interface OrderListItem {
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price_paise: number;
  image_url: string | null;
}

interface OrderRow {
  order_number: string;
  status: string;
  total_paise: number;
  payment_status: string | null;
  created_at: string;
  items: OrderListItem[];
}

type StatusFilter = 'all' | 'on_the_way' | 'delivered' | 'cancelled' | 'returned';
type TimeFilter = 'all' | '30' | '2026' | '2025' | 'older';

function money(paise: number) {
  return `₹${(Number(paise) / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

function statusTone(status: string, paymentStatus: string | null) {
  const key = status.toLowerCase();
  if (key === 'delivered') return { dot: 'bg-emerald-500', label: 'Delivered' };
  if (key === 'cancelled' || key === 'refunded') return { dot: 'bg-rose-500', label: key === 'refunded' ? 'Refunded' : 'Cancelled' };
  if (paymentStatus === 'pending' || key === 'pending') return { dot: 'bg-amber-500', label: 'Payment pending' };
  if (['shipped', 'packed', 'processing', 'confirmed'].includes(key)) return { dot: 'bg-sky-500', label: 'On the way' };
  return { dot: 'bg-[var(--accent-primary)]', label: status.replace(/_/g, ' ') };
}

function statusHeadline(order: OrderRow) {
  const tone = statusTone(order.status, order.payment_status);
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  if (order.status.toLowerCase() === 'delivered') return `Delivered on ${date}`;
  if (order.status.toLowerCase() === 'cancelled') return `Cancelled on ${date}`;
  if (order.status.toLowerCase() === 'refunded') return `Refund completed`;
  if (order.payment_status === 'pending' || order.status.toLowerCase() === 'pending') {
    return 'Payment pending';
  }
  return `${tone.label} · Ordered ${date}`;
}

function statusSubcopy(order: OrderRow) {
  const key = order.status.toLowerCase();
  if (key === 'delivered') return 'Your item has been delivered.';
  if (key === 'cancelled') return 'This order was cancelled.';
  if (key === 'refunded') return 'Refund has been processed for this order.';
  if (order.payment_status === 'pending' || key === 'pending') return 'Complete payment to confirm this order.';
  if (key === 'shipped' || key === 'packed') return 'Your parcel is on the way.';
  return 'We are preparing your order.';
}

function matchesStatusFilter(order: OrderRow, filter: StatusFilter) {
  const key = order.status.toLowerCase();
  switch (filter) {
    case 'all':
      return true;
    case 'delivered':
      return key === 'delivered';
    case 'cancelled':
      return key === 'cancelled';
    case 'returned':
      return key === 'refunded';
    case 'on_the_way':
      return ['confirmed', 'processing', 'packed', 'shipped', 'pending'].includes(key);
    default: {
      const _exhaustive: never = filter;
      return _exhaustive;
    }
  }
}

function matchesTimeFilter(order: OrderRow, filter: TimeFilter) {
  const created = new Date(order.created_at);
  const now = new Date();
  switch (filter) {
    case 'all':
      return true;
    case '30': {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
      return created >= cutoff;
    }
    case '2026':
      return created.getFullYear() === 2026;
    case '2025':
      return created.getFullYear() === 2025;
    case 'older':
      return created.getFullYear() < 2025;
    default: {
      const _exhaustive: never = filter;
      return _exhaustive;
    }
  }
}

export const OrdersPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

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
        const rows = await api<OrderRow[]>('/account/orders');
        if (!cancelled) setOrders(rows.map((row) => ({ ...row, items: row.items ?? [] })));
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Could not load orders.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onNavigate]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (!matchesStatusFilter(order, statusFilter)) return false;
      if (!matchesTimeFilter(order, timeFilter)) return false;
      if (!term) return true;
      const haystack = [
        order.order_number,
        order.status,
        ...order.items.flatMap((item) => [item.product_name, item.variant_name]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [orders, search, statusFilter, timeFilter]);

  return (
    <div className="min-h-[70vh] bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <button
          type="button"
          onClick={() => onNavigate('/en/account')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-primary)] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          My Account
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">My Orders</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Track deliveries, reopen receipts, and review past purchases.
          </p>
        </div>

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-5 items-start">
          <aside className="border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-4 space-y-5 sticky top-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Order status
              </p>
              <div className="space-y-2">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'on_the_way', label: 'On the way' },
                    { id: 'delivered', label: 'Delivered' },
                    { id: 'cancelled', label: 'Cancelled' },
                    { id: 'returned', label: 'Returned' },
                  ] as const
                ).map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="radio"
                      name="order-status"
                      checked={statusFilter === option.id}
                      onChange={() => setStatusFilter(option.id)}
                      className="accent-[var(--accent-primary)]"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Order time
              </p>
              <div className="space-y-2">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: '30', label: 'Last 30 days' },
                    { id: '2026', label: '2026' },
                    { id: '2025', label: '2025' },
                    { id: 'older', label: 'Older' },
                  ] as const
                ).map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="radio"
                      name="order-time"
                      checked={timeFilter === option.id}
                      onChange={() => setTimeFilter(option.id)}
                      className="accent-[var(--accent-primary)]"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-4 min-w-0">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your orders here"
                  className="w-full h-11 pl-10 pr-4 rounded-[0.3rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-4 rounded-[0.3rem] btn-theme-primary text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
              >
                Search Orders
              </button>
            </form>

            {error && (
              <div className="border border-rose-500/30 bg-rose-500/10 text-rose-500 rounded-[0.3rem] px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-10 text-center text-sm text-[var(--text-muted)]">
                Loading your orders…
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-10 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                  <Package className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">No orders found</h2>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  {orders.length === 0
                    ? 'When you complete a purchase, your order history will appear here.'
                    : 'Try a different filter or search term.'}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/en/collection')}
                  className="btn-theme-primary px-5 py-2 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((order) => {
                  const tone = statusTone(order.status, order.payment_status);
                  const primary = order.items[0];
                  const extraCount = Math.max(0, order.items.length - 1);
                  return (
                    <button
                      key={order.order_number}
                      type="button"
                      onClick={() => onNavigate(`/en/orders/${encodeURIComponent(order.order_number)}`)}
                      className="w-full text-left border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-4 sm:p-5 hover:border-[var(--accent-primary)]/60 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[0.3rem] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0">
                          <BrandImage
                            src={primary?.image_url || undefined}
                            alt={primary?.product_name || order.order_number}
                            fallbackLabel={primary?.product_name || 'Order'}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(10rem,auto)] gap-3 sm:gap-4 items-start">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                              {primary?.product_name || `Order ${order.order_number}`}
                            </p>
                            {primary && (
                              <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                                {primary.variant_name}
                                {primary.quantity > 1 ? ` · Qty ${primary.quantity}` : ''}
                                {extraCount > 0 ? ` · +${extraCount} more` : ''}
                              </p>
                            )}
                            <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1.5">
                              {order.order_number}
                            </p>
                          </div>

                          <div className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                            {money(order.total_paise)}
                          </div>

                          <div className="sm:text-right">
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                              <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
                              {statusHeadline(order)}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-1">{statusSubcopy(order)}</p>
                            {order.status.toLowerCase() === 'delivered' && (
                              <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[var(--accent-primary)]">
                                <Star className="w-3.5 h-3.5" />
                                Rate &amp; Review Product
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
