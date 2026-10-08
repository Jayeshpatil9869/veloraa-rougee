import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DataTable, Notice, rupees, StatCard, StatusBadge } from '../ui';

interface RecentOrder {
  id: string;
  order_number: string;
  email: string;
  customer_name: string;
  status: string;
  payment_status: string | null;
  total_paise: number;
  created_at: string;
  items: { product_name: string; quantity: number }[];
}

interface Analytics {
  paymentTotalPaise: number;
  orderCount: number;
  customers: number;
  recentOrders: RecentOrder[];
}

export const Dashboard: React.FC<{ onOpenOrder: (id: string) => void }> = ({ onOpenOrder }) => {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Analytics>('/admin/analytics').then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  }, []);

  if (error) return <Notice>{error}</Notice>;
  if (!data) return <p className="text-sm text-[#666666]">Loading the studio…</p>;

  return (
    <div className="grid gap-8">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Total payments" value={rupees(data.paymentTotalPaise)} />
        <StatCard label="Total orders" value={String(data.orderCount)} />
        <StatCard label="Customers" value={String(data.customers)} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#333333] mb-4">Recent orders</h2>
        <DataTable
          columns={['Order', 'Customer', 'Items', 'Total', 'Status', 'Payment']}
          rows={data.recentOrders.map((order) => [
            <button key={order.id} className="font-bold text-[#A06A98]" onClick={() => onOpenOrder(order.id)}>{order.order_number}</button>,
            <span key="who">{order.customer_name || order.email}<br /><span className="text-xs text-[#666666]">{order.email}</span></span>,
            order.items.map((item) => `${item.product_name} × ${item.quantity}`).join(', ') || '—',
            rupees(order.total_paise),
            <StatusBadge key="status" value={order.status} />,
            <StatusBadge key="pay" value={order.payment_status} />,
          ])}
        />
      </div>
    </div>
  );
};
