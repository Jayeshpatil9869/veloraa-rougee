import React, { useEffect, useState, useMemo } from 'react';
import { CreditCard, DollarSign, Calendar, ShieldCheck, Search } from 'lucide-react';
import { api } from '../../lib/api';
import {
  DataTable,
  FilterTabs,
  Notice,
  PageHeader,
  rupees,
  SearchInput,
  StatCard,
  StatusBadge,
} from '../ui';

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
  { id: '', label: 'All Transactions' },
  { id: '7', label: 'Past 7 Days' },
  { id: '15', label: 'Past 15 Days' },
  { id: '30', label: 'Past 30 Days' },
] as const;

export const PaymentsModule: React.FC = () => {
  const [days, setDays] = useState<'' | '7' | '15' | '30'>('');
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const query = days ? `?days=${days}` : '';
    api<PaymentRow[]>(`/admin/payments${query}`)
      .then(setRows)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load payments.')
      )
      .finally(() => setIsLoading(false));
  }, [days]);

  const filteredRows = useMemo(() => {
    return rows.filter((p) => {
      const matchEmail = p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const matchOrder = p.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const matchGateway = p.gateway.toLowerCase().includes(searchQuery.toLowerCase());
      return searchQuery === '' || matchEmail || matchOrder || matchGateway;
    });
  }, [rows, searchQuery]);

  const totalPaise = useMemo(() => {
    return rows
      .filter((p) => p.status === 'success' || p.status === 'captured' || p.status === 'paid')
      .reduce((sum, p) => sum + p.amount_paise, 0);
  }, [rows]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Transactions"
        subtitle="Gateway settlements, customer transactions, and payment verification audit."
      />

      {error && <Notice variant="error">{error}</Notice>}

      {/* Metrics Bar */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Settled Volume"
          value={rupees(totalPaise)}
          trend={{ value: 'Processed', isPositive: true }}
          icon={CreditCard}
        />
        <StatCard
          label="Total Transactions"
          value={String(rows.length)}
          trendLabel="all gateways"
          icon={DollarSign}
        />
        <StatCard
          label="Payment Gateway"
          value="Razorpay & Cards"
          trendLabel="Secure PCI-DSS"
          icon={ShieldCheck}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by customer, order #, or gateway..."
          className="w-full sm:w-80"
        />

        <FilterTabs
          tabs={FILTERS.map((f) => ({ id: f.id, label: f.label }))}
          activeTab={days}
          onChange={(id) => setDays(id as '' | '7' | '15' | '30')}
        />
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={['Transaction Date', 'Order #', 'Customer Email', 'Gateway', 'Gross Amount', 'Payment Status']}
        rows={filteredRows.map((payment) => [
          <span key="date" className="text-xs text-[#666666] font-mono">
            {new Date(payment.created_at).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>,
          <span key="ord" className="font-bold text-xs text-[#A06A98] font-mono">
            {payment.order_number || '—'}
          </span>,
          <span key="mail" className="text-xs text-[#333333] font-medium">
            {payment.email || 'Boutique Guest'}
          </span>,
          <span
            key="gate"
            className="text-xs font-bold uppercase text-[#76416F] bg-[#FDF2F8] px-2 py-0.5 rounded-[0.3rem] border border-[#DFBEDB]/50"
          >
            {payment.gateway}
          </span>,
          <span key="amt" className="font-bold text-xs text-[#333333]">
            {rupees(payment.amount_paise)}
          </span>,
          <StatusBadge key="stat" value={payment.status} />,
        ])}
        emptyMessage={
          isLoading
            ? 'Loading payment records...'
            : searchQuery
              ? 'No transactions found matching your search.'
              : 'No payment transactions recorded for this period.'
        }
      />
    </div>
  );
};
