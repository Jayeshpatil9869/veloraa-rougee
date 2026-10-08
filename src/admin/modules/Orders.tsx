import React, { useEffect, useState, useMemo } from 'react';
import {
  ShoppingBag,
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Package,
  Calendar,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  DataTable,
  FilterTabs,
  Notice,
  PageHeader,
  rupees,
  SearchInput,
  SoftButton,
  StatusBadge,
} from '../ui';

interface OrderRow {
  id: string;
  order_number: string;
  email: string;
  customer_name: string;
  status: string;
  payment_status: string | null;
  total_paise: number;
  created_at: string;
  items: {
    product_name: string;
    variant_name: string;
    quantity: number;
    line_total_paise: number;
  }[];
  address: {
    full_name: string;
    phone: string;
    line1: string;
    city: string;
    postal_code: string;
  } | null;
}

interface OrderDetail {
  order: Record<string, unknown> & {
    id: string;
    order_number: string;
    email: string;
    status: string;
    subtotal_paise: number;
    discount_paise: number;
    shipping_paise: number;
    total_paise: number;
    created_at: string;
  };
  items: {
    product_name: string;
    variant_name: string;
    quantity: number;
    line_total_paise: number;
  }[];
  address: {
    full_name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
  } | null;
  payments: {
    status: string;
    amount_paise: number;
    gateway: string;
    created_at: string;
  }[];
}

export const OrdersModule: React.FC<{
  path: string;
  onOpen: (id: string) => void;
}> = ({ path, onOpen }) => {
  const orderId = path.split('/')[3];
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api<OrderRow[]>('/admin/orders')
      .then(setRows)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load order history.')
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!orderId) {
      setDetail(null);
      return;
    }
    api<OrderDetail>(`/admin/orders/${orderId}`)
      .then(setDetail)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load order breakdown.')
      );
  }, [orderId]);

  const filteredRows = useMemo(() => {
    return rows.filter((order) => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus =
        statusFilter === 'all' || order.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchQuery, statusFilter]);

  if (error) return <Notice variant="error">{error}</Notice>;

  // ---------------------------------------------------------------------------
  // 1. Detailed Order Receipt / Invoice View
  // ---------------------------------------------------------------------------
  if (detail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onOpen('')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A06A98] hover:text-[#774170] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </button>
          <div className="flex items-center gap-2">
            <StatusBadge value={detail.order.status} />
            {detail.payments[0] && (
              <StatusBadge value={detail.payments[0].status} />
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Main Line Items and Details */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs overflow-hidden">
              <header className="px-6 py-4 border-b border-[#E2E8F0] bg-[#FDF2F8]/40 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#333333] font-mono">
                    Order #{detail.order.order_number}
                  </h2>
                  <p className="text-xs text-[#666666] flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3 h-3 text-[#A06A98]" />
                    Placed on {new Date(detail.order.created_at || Date.now()).toLocaleString('en-IN')}
                  </p>
                </div>
              </header>

              {/* Line Items List */}
              <div className="p-6 divide-y divide-[#F1F5F9]">
                {detail.items.map((item, index) => (
                  <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[0.3rem] bg-[#FAF5F8] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-[#A06A98]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#333333] truncate">
                          {item.product_name}
                        </p>
                        <p className="text-[11px] text-[#666666]">
                          Shade: <span className="font-semibold text-[#76416F]">{item.variant_name}</span> × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-[#333333] shrink-0">
                      {rupees(item.line_total_paise)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="px-6 py-4 bg-[#FAF5F8]/50 border-t border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal</span>
                  <span>{rupees(Number(detail.order.subtotal_paise))}</span>
                </div>
                {Number(detail.order.discount_paise) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{rupees(Number(detail.order.discount_paise))}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#666666]">
                  <span>Shipping & Delivery</span>
                  <span>{rupees(Number(detail.order.shipping_paise))}</span>
                </div>
                <div className="pt-2 border-t border-[#E2E8F0] flex justify-between font-bold text-sm text-[#333333]">
                  <span>Total Paid</span>
                  <span className="text-[#A06A98]">{rupees(Number(detail.order.total_paise))}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Customer & Delivery Address */}
          <div className="lg:col-span-4 space-y-6">
            {/* Customer Details */}
            <div className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#76416F] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#A06A98]" />
                Customer Contact
              </h3>
              <p className="text-xs font-bold text-[#333333]">
                {detail.address?.full_name || 'Boutique Client'}
              </p>
              <p className="text-xs text-[#666666]">{detail.order.email}</p>
              {detail.address?.phone && (
                <p className="text-xs text-[#666666] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#999999]" />
                  {detail.address.phone}
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#76416F] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#A06A98]" />
                Delivery Address
              </h3>
              {detail.address ? (
                <div className="text-xs text-[#555555] space-y-0.5 leading-relaxed">
                  <p className="font-semibold text-[#333333]">{detail.address.full_name}</p>
                  <p>{detail.address.line1}</p>
                  {detail.address.line2 && <p>{detail.address.line2}</p>}
                  <p>
                    {[detail.address.city, detail.address.region, detail.address.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <p className="font-semibold text-[#76416F]">{detail.address.country}</p>
                </div>
              ) : (
                <p className="text-xs text-[#999999]">No shipping address recorded.</p>
              )}
            </div>

            {/* Payment Transactions */}
            <div className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#76416F] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#A06A98]" />
                Payment Gateway
              </h3>
              {detail.payments.length > 0 ? (
                detail.payments.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs pt-1 border-t border-[#F1F5F9] first:border-0 first:pt-0">
                    <div>
                      <p className="font-bold text-[#333333] capitalize">{p.gateway}</p>
                      <p className="text-[10px] text-[#999999]">
                        {new Date(p.created_at).toLocaleTimeString('en-IN')}
                      </p>
                    </div>
                    <StatusBadge value={p.status} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#999999]">Pending gateway settlement.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Orders List View
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Orders"
        subtitle="Track purchases, fulfillment milestones, and delivery invoices."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order #, email, or customer name..."
          className="w-full sm:w-80"
        />

        <FilterTabs
          tabs={[
            { id: 'all', label: 'All Orders', count: rows.length },
            { id: 'pending', label: 'Pending' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ]}
          activeTab={statusFilter}
          onChange={(id) => setStatusFilter(id)}
        />
      </div>

      {/* Orders Table */}
      <DataTable
        columns={['Order #', 'Customer & Contact', 'Ordered Items', 'Total', 'Order Status', 'Payment', 'Action']}
        rows={filteredRows.map((order) => [
          <span key="num" className="font-bold text-xs text-[#A06A98] font-mono">
            {order.order_number}
          </span>,
          <div key="who" className="min-w-0">
            <p className="font-bold text-xs text-[#333333] truncate">
              {order.customer_name || 'Boutique Guest'}
            </p>
            <p className="text-[11px] text-[#888888] truncate">{order.email}</p>
          </div>,
          <span key="items" className="text-xs text-[#666666] line-clamp-1 max-w-xs">
            {order.items.map((item) => `${item.product_name} (${item.variant_name}) × ${item.quantity}`).join(', ') || '—'}
          </span>,
          <span key="tot" className="font-bold text-xs text-[#333333]">
            {rupees(order.total_paise)}
          </span>,
          <StatusBadge key="status" value={order.status} />,
          <StatusBadge key="pay" value={order.payment_status} />,
          <button
            key="btn"
            onClick={() => onOpen(order.id)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#A06A98] hover:text-[#774170] hover:underline transition-all cursor-pointer"
          >
            <span>Invoice</span>
            <ChevronRight className="w-3 h-3" />
          </button>,
        ])}
        emptyMessage={
          isLoading
            ? 'Loading order history...'
            : searchQuery || statusFilter !== 'all'
              ? 'No orders match your filter criteria.'
              : 'No orders placed yet on the storefront.'
        }
      />
    </div>
  );
};
