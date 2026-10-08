import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DataTable, GhostButton, Notice, StatusBadge } from '../ui';

interface ReviewRow {
  id: string;
  product_name: string;
  customer_email: string;
  rating: number;
  body: string;
  status: string;
}

export const ReviewsModule: React.FC = () => {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [error, setError] = useState('');

  const load = () => {
    api<ReviewRow[]>('/admin/reviews').then(setRows).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  };

  useEffect(() => { load(); }, []);

  const moderate = async (id: string, status: 'approved' | 'rejected') => {
    await api(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  };

  return (
    <div className="grid gap-4">
      {error && <Notice>{error}</Notice>}
      <DataTable
        columns={['Product', 'Customer', 'Stars', 'Review', 'Status', 'Actions']}
        rows={rows.map((row) => [
          row.product_name,
          row.customer_email,
          `${row.rating} / 5`,
          row.body,
          <StatusBadge key="status" value={row.status} />,
          <span key="actions" className="flex gap-2">
            <GhostButton type="button" onClick={() => void moderate(row.id, 'approved')}>Approve</GhostButton>
            <GhostButton type="button" onClick={() => void moderate(row.id, 'rejected')}>Reject</GhostButton>
          </span>,
        ])}
      />
    </div>
  );
};
