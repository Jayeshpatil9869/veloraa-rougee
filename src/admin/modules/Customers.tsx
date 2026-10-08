import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DataTable, Notice, StatusBadge } from '../ui';

interface CustomerRow {
  email: string;
  full_name: string;
  phone: string | null;
  email_verified: boolean;
  auth_provider: string | null;
  created_at: string;
}

export const CustomersModule: React.FC = () => {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<CustomerRow[]>('/admin/customers').then(setRows).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  }, []);

  return (
    <div className="grid gap-4">
      {error && <Notice>{error}</Notice>}
      <DataTable
        columns={['Name', 'Email', 'Phone', 'Signed up with', 'Verified', 'Joined']}
        rows={rows.map((row) => [
          row.full_name || '—',
          row.email,
          row.phone || '—',
          row.auth_provider === 'google' ? 'Google' : 'Email',
          <StatusBadge key={row.email} value={row.email_verified ? 'approved' : 'pending'} />,
          new Date(row.created_at).toLocaleDateString('en-IN'),
        ])}
      />
    </div>
  );
};
