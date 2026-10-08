import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DataTable, Notice } from '../ui';

interface EnquiryRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

export const EnquiriesModule: React.FC = () => {
  const [rows, setRows] = useState<EnquiryRow[]>([]);
  const [error, setError] = useState('');

  const load = () => {
    api<EnquiryRow[]>('/admin/enquiries').then(setRows).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, status: EnquiryRow['status']) => {
    await api(`/admin/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  };

  return (
    <div className="grid gap-4">
      {error && <Notice>{error}</Notice>}
      <DataTable
        columns={['Date', 'Name', 'Contact', 'Message', 'Status']}
        rows={rows.map((row) => [
          new Date(row.created_at).toLocaleString('en-IN'),
          `${row.first_name} ${row.last_name}`.trim(),
          <span key="contact">{row.email}<br /><span className="text-xs text-[#666666]">{row.phone}</span></span>,
          row.message,
          <select key="status" className="h-9 px-2 border border-[#E2E8F0] rounded-[0.3rem] bg-white text-sm" value={row.status} onChange={(event) => void update(row.id, event.target.value as EnquiryRow['status'])}>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>,
        ])}
      />
    </div>
  );
};
