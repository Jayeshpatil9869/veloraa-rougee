import React, { useEffect, useState, useMemo } from 'react';
import { Users, UserCheck, Shield, Mail, Phone, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import {
  DataTable,
  Notice,
  PageHeader,
  SearchInput,
  StatCard,
  StatusBadge,
} from '../ui';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api<CustomerRow[]>('/admin/customers')
      .then(setRows)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load customers.')
      )
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((c) => {
      const matchName = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const matchEmail = c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const matchPhone = c.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      return searchQuery === '' || matchName || matchEmail || matchPhone;
    });
  }, [rows, searchQuery]);

  const verifiedCount = rows.filter((r) => r.email_verified).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientele & Accounts"
        subtitle="Manage customer profiles, authentication providers, and loyalty accounts."
      />

      {error && <Notice variant="error">{error}</Notice>}

      {/* Metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Registered"
          value={String(rows.length)}
          trendLabel="active customer profiles"
          icon={Users}
        />
        <StatCard
          label="Verified Accounts"
          value={String(verifiedCount)}
          trend={{ value: `${Math.round((verifiedCount / (rows.length || 1)) * 100)}%`, isPositive: true }}
          trendLabel="email verified"
          icon={UserCheck}
        />
        <StatCard
          label="Google OAuth Sign-ins"
          value={String(rows.filter((r) => r.auth_provider === 'google').length)}
          trendLabel="1-click social logins"
          icon={Shield}
        />
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between p-3 bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, email, or telephone..."
          className="w-full sm:w-96"
        />
        <span className="text-xs font-bold text-[#666666] hidden sm:inline">
          Showing {filteredRows.length} of {rows.length} accounts
        </span>
      </div>

      {/* Customers Table */}
      <DataTable
        columns={['Client Name', 'Email Address', 'Phone Number', 'Sign-in Provider', 'Verification', 'Member Since']}
        rows={filteredRows.map((row) => {
          const initials =
            row.full_name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || row.email.slice(0, 2).toUpperCase();

          return [
            <div key="who" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A06A98] to-[#76416F] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                {initials}
              </div>
              <span className="font-bold text-xs text-[#333333]">
                {row.full_name || 'Boutique Member'}
              </span>
            </div>,
            <span key="mail" className="text-xs text-[#555555]">
              {row.email}
            </span>,
            <span key="phone" className="text-xs text-[#666666] font-mono">
              {row.phone || '—'}
            </span>,
            <StatusBadge
              key="auth"
              value={row.auth_provider === 'google' ? 'google' : 'email'}
            />,
            <StatusBadge
              key="ver"
              value={row.email_verified ? 'approved' : 'pending'}
            />,
            <span key="since" className="text-xs text-[#666666] font-mono">
              {new Date(row.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>,
          ];
        })}
        emptyMessage={
          isLoading
            ? 'Loading customer profiles...'
            : searchQuery
              ? 'No customers match your search criteria.'
              : 'No registered customer profiles found.'
        }
      />
    </div>
  );
};
