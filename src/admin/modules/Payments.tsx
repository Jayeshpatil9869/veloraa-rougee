import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DataTable, Notice, rupees, SoftButton, StatusBadge } from '../ui';

interface PaymentRow {
  id: string;
  status: string;
  amount_paise: number;
  gateway: string;
  created_at: string;
  order_number: string | null;
  email: string | null;
}

const FILTERS = [
  ['all', 'All'],
  ['7', '7 days'],
  ['15', '15 days'],
  ['30', '30 days'],
] as const;

export const PaymentsModule: React.FC = () => {
  const [days, setDays] = useState<'' | '7' | '15' | '30'>('');
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = days ? `?days=${days}` : '';
    api<PaymentRow[]>(`/admin/payments${query}`).then(setRows).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  }, [days]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([id, label]) => (
          <SoftButton key={id} type="button" onClick={() => setDays(id === 'all' ? '' : id)} className={days === (id === 'all' ? '' : id) ? 'ring-1 ring-[#A06A98]' : ''}>{label}</SoftButton>
        ))}
      </div>
      {error && <Notice>{error}</Notice>}
      <DataTable
        columns={['Date', 'Order', 'Customer', 'Gateway', 'Amount', 'Status']}
        rows={rows.map((payment) => [
          new Date(payment.created_at).toLocaleString('en-IN'),
          payment.order_number || '—',
          payment.email || '—',
          payment.gateway,
          rupees(payment.amount_paise),
          <StatusBadge key={payment.id} value={payment.status} />,
        ])}
      />
    </div>
  );
};
