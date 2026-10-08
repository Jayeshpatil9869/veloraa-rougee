import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DataTable, Notice, rupees, StatusBadge } from '../ui';

interface OrderRow {
  id: string;
  order_number: string;
  email: string;
  customer_name: string;
  status: string;
  payment_status: string | null;
  total_paise: number;
  created_at: string;
  items: { product_name: string; variant_name: string; quantity: number; line_total_paise: number }[];
  address: { full_name: string; phone: string; line1: string; city: string; postal_code: string } | null;
}

interface OrderDetail {
  order: Record<string, unknown> & { order_number: string; email: string; status: string; subtotal_paise: number; discount_paise: number; shipping_paise: number; total_paise: number };
  items: { product_name: string; variant_name: string; quantity: number; line_total_paise: number }[];
  address: { full_name: string; phone: string; line1: string; line2: string; city: string; region: string; postal_code: string; country: string } | null;
  payments: { status: string; amount_paise: number; gateway: string; created_at: string }[];
}

export const OrdersModule: React.FC<{ path: string; onOpen: (id: string) => void }> = ({ path, onOpen }) => {
  const orderId = path.split('/')[3];
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<OrderRow[]>('/admin/orders').then(setRows).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  }, []);

  useEffect(() => {
    if (!orderId) {
      setDetail(null);
      return;
    }
    api<OrderDetail>(`/admin/orders/${orderId}`).then(setDetail).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  }, [orderId]);

  if (error) return <Notice>{error}</Notice>;

  return (
    <div className="grid gap-6">
      <DataTable
        columns={['Order', 'Customer', 'Items', 'Total', 'Status', 'Payment']}
        rows={rows.map((order) => [
          <button key={order.id} className="font-bold text-[#A06A98]" onClick={() => onOpen(order.id)}>{order.order_number}</button>,
          <span key="who">{order.customer_name || 'Guest'}<br /><span className="text-xs text-[#666666]">{order.email}</span></span>,
          order.items.map((item) => `${item.product_name} (${item.variant_name}) × ${item.quantity}`).join(', '),
          rupees(order.total_paise),
          <StatusBadge key="status" value={order.status} />,
          <StatusBadge key="pay" value={order.payment_status} />,
        ])}
      />
      {detail && (
        <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 grid gap-3">
          <h2 className="text-xl font-bold">{detail.order.order_number}</h2>
          <p className="text-sm text-[#666666]">{detail.address?.full_name} · {detail.order.email} · {detail.address?.phone}</p>
          <p className="text-sm">{[detail.address?.line1, detail.address?.line2, detail.address?.city, detail.address?.region, detail.address?.postal_code, detail.address?.country].filter(Boolean).join(', ')}</p>
          <ul className="text-sm grid gap-1">
            {detail.items.map((item, index) => <li key={index}>{item.product_name} · {item.variant_name} × {item.quantity} · {rupees(item.line_total_paise)}</li>)}
          </ul>
          <p className="text-sm">Subtotal {rupees(Number(detail.order.subtotal_paise))} · Discount {rupees(Number(detail.order.discount_paise))} · Shipping {rupees(Number(detail.order.shipping_paise))}</p>
          <p className="font-bold text-[#A06A98]">Total {rupees(Number(detail.order.total_paise))}</p>
          <div className="flex gap-2 items-center text-sm">
            <StatusBadge value={String(detail.order.status)} />
            {detail.payments.map((payment, index) => <StatusBadge key={index} value={payment.status} />)}
          </div>
        </section>
      )}
    </div>
  );
};
