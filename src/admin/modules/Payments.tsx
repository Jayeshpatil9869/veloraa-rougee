import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, DollarSign, ShieldCheck, RefreshCw, RotateCcw, X } from 'lucide-react';
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
  gateway_txn_id?: string | null;
  txn_id?: string;
  created_at: string;
  order_number: string | null;
  email: string | null;
  failure_reason?: string | null;
  needs_verification?: boolean;
}

interface PaymentDetail {
  payment: PaymentRow & {
    order_id: string;
    method?: string | null;
    verified_at?: string | null;
    paid_at?: string | null;
  };
  order: { id: string; order_number: string; email: string; status: string; total_paise: number } | null;
  events: Array<{ id: string; event_status: string; gateway_txn_id: string; created_at: string; payload?: unknown }>;
  refunds: Array<{ id: string; amount_paise: number; status: string; reason?: string; created_at: string; failure_reason?: string }>;
  attempts: Array<{ id: string; txn_id: string; status: string; amount_paise: number; gateway_txn_id: string | null; created_at: string }>;
  refundable_paise: number;
  flags: { needs_verification: boolean; duplicate_capture_risk: boolean };
}

const DAY_FILTERS = [
  { id: '', label: 'All' },
  { id: '7', label: '7 Days' },
  { id: '15', label: '15 Days' },
  { id: '30', label: '30 Days' },
] as const;

const STATUS_FILTERS = [
  { id: '', label: 'Any Status' },
  { id: 'pending', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'failed', label: 'Failed' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

export const PaymentsModule: React.FC = () => {
  const [days, setDays] = useState<'' | '7' | '15' | '30'>('');
  const [status, setStatus] = useState<'' | 'pending' | 'paid' | 'failed' | 'cancelled'>('');
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PaymentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadRows = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (days) params.set('days', days);
    if (status) params.set('status', status);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    const query = params.toString() ? `?${params.toString()}` : '';
    api<PaymentRow[]>(`/admin/payments${query}`)
      .then(setRows)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Failed to load payments.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadRows();
  }, [days, status]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    api<PaymentDetail>(`/admin/payments/${selectedId}`)
      .then(setDetail)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Failed to load payment detail.'))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const term = searchQuery.toLowerCase();
    return rows.filter((p) =>
      [p.email, p.order_number, p.gateway, p.txn_id, p.gateway_txn_id]
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [rows, searchQuery]);

  const totalPaise = useMemo(
    () => rows.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount_paise, 0),
    [rows],
  );
  const pendingCount = useMemo(() => rows.filter((p) => p.status === 'pending').length, [rows]);

  const verifyPayment = async (id: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await api<{ status: string }>(`/admin/payments/${id}/verify`, { method: 'POST', body: '{}' });
      setNotice(`Verification finished: ${result.status}`);
      loadRows();
      if (selectedId === id) {
        setDetail(await api<PaymentDetail>(`/admin/payments/${id}`));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'verify_failed');
    } finally {
      setBusy(false);
    }
  };

  const refundPayment = async (id: string, refundablePaise: number) => {
    const amountLabel = rupees(refundablePaise);
    if (!window.confirm(`Refund ${amountLabel} via PayU for this captured payment?`)) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await api<{ ok: boolean; error?: string | null }>(`/admin/payments/${id}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Admin initiated refund' }),
      });
      setNotice(result.ok ? 'Refund submitted successfully.' : `Refund failed: ${result.error || 'unknown'}`);
      loadRows();
      setDetail(await api<PaymentDetail>(`/admin/payments/${id}`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'refund_failed');
    } finally {
      setBusy(false);
    }
  };

  const reconcile = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await api<{ results: Array<{ txnId: string; status: string }> }>('/admin/payments/reconcile', {
        method: 'POST',
        body: JSON.stringify({ limit: 20 }),
      });
      setNotice(`Reconciled ${result.results.length} pending payment(s).`);
      loadRows();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'reconcile_failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="PayU Payments"
        subtitle="Hosted Checkout attempts, verification, and refunds for Veloraa Rougee."
        action={
          <button
            type="button"
            onClick={() => void reconcile()}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-[0.3rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reconcile Pending
          </button>
        }
      />

      {error && <Notice variant="error">{error}</Notice>}
      {notice && <Notice variant="success">{notice}</Notice>}

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Captured Volume"
          value={rupees(totalPaise)}
          trend={{ value: 'Paid only', isPositive: true }}
          icon={CreditCard}
        />
        <StatCard
          label="Listed Attempts"
          value={String(rows.length)}
          trendLabel={`${pendingCount} pending`}
          icon={DollarSign}
        />
        <StatCard
          label="Payment Gateway"
          value="PayU Hosted"
          trendLabel="SHA-512 + verify_payment"
          icon={ShieldCheck}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search order #, email, txn, mihpayid..."
          className="w-full sm:w-80"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <FilterTabs
            tabs={STATUS_FILTERS.map((f) => ({ id: f.id, label: f.label }))}
            activeTab={status}
            onChange={(id) => setStatus(id as typeof status)}
          />
          <FilterTabs
            tabs={DAY_FILTERS.map((f) => ({ id: f.id, label: f.label }))}
            activeTab={days}
            onChange={(id) => setDays(id as typeof days)}
          />
        </div>
      </div>

      <DataTable
        columns={['Date', 'Order #', 'Customer', 'Txn / PayU', 'Amount', 'Status', '']}
        rows={filteredRows.map((payment) => [
          <span key="date" className="text-xs text-[var(--text-muted)] font-mono">
            {new Date(payment.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>,
          <span key="ord" className="font-bold text-xs text-[var(--accent-primary)] font-mono">
            {payment.order_number || '—'}
          </span>,
          <span key="mail" className="text-xs text-[var(--text-primary)] font-medium">
            {payment.email || 'Guest'}
          </span>,
          <span key="txn" className="text-[11px] font-mono text-[var(--text-secondary)] block max-w-[220px] truncate">
            {payment.txn_id || '—'}
            {payment.gateway_txn_id ? ` / ${payment.gateway_txn_id}` : ''}
          </span>,
          <span key="amt" className="font-bold text-xs text-[var(--text-primary)]">
            {rupees(payment.amount_paise)}
          </span>,
          <StatusBadge key="stat" value={payment.status} />,
          <button
            key="open"
            type="button"
            onClick={() => setSelectedId(payment.id)}
            className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary)]"
          >
            Open
          </button>,
        ])}
        emptyMessage={
          isLoading
            ? 'Loading PayU payment records...'
            : searchQuery
              ? 'No transactions match your search.'
              : 'No payment transactions for this filter.'
        }
      />

      {selectedId && (
        <div className="border border-[var(--border-subtle)] rounded-[0.3rem] bg-[var(--card-bg)] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
              Payment Detail
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
              Close
            </button>
          </div>

          {detailLoading || !detail ? (
            <p className="text-sm text-[var(--text-muted)]">Loading payment detail…</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-mono text-xs">{detail.payment.txn_id}</div>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <StatusBadge value={detail.payment.status} />
                  <span className="font-bold">{rupees(detail.payment.amount_paise)}</span>
                </div>
                {detail.flags.needs_verification && (
                  <p className="mt-2 text-xs text-amber-700">Verification required — still pending on PayU.</p>
                )}
                {detail.flags.duplicate_capture_risk && (
                  <p className="mt-2 text-xs text-rose-600">Multiple paid attempts detected for this order.</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[var(--text-muted)]">Order</div>
                  <div className="font-mono font-bold">{detail.order?.order_number || '—'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)]">mihpayid</div>
                  <div className="font-mono break-all">{detail.payment.gateway_txn_id || '—'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)]">Customer</div>
                  <div>{detail.order?.email || detail.payment.email || '—'}</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)]">Refundable</div>
                  <div className="font-bold">{rupees(detail.refundable_paise)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void verifyPayment(detail.payment.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-[0.3rem] border border-[var(--border-subtle)] disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-verify
                </button>
                <button
                  type="button"
                  disabled={busy || detail.payment.status !== 'paid' || detail.refundable_paise <= 0}
                  onClick={() => void refundPayment(detail.payment.id, detail.refundable_paise)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-[0.3rem] bg-[var(--accent-primary)] text-white disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Refund
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">Attempts</div>
                  <ul className="space-y-1 max-h-36 overflow-auto text-xs font-mono">
                    {detail.attempts.map((attempt) => (
                      <li key={attempt.id} className="flex justify-between gap-2 border-b border-[var(--border-subtle)] py-1">
                        <span className="truncate">{attempt.txn_id}</span>
                        <span>{attempt.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">Events</div>
                  <ul className="space-y-1 max-h-36 overflow-auto text-xs">
                    {detail.events.length === 0 && <li className="text-[var(--text-muted)]">No events yet.</li>}
                    {detail.events.map((event) => (
                      <li key={event.id} className="flex justify-between gap-2 border-b border-[var(--border-subtle)] py-1">
                        <span className="font-mono">{event.event_status}</span>
                        <span className="text-[var(--text-muted)]">{new Date(event.created_at).toLocaleString('en-IN')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">Refunds</div>
                  <ul className="space-y-1 max-h-36 overflow-auto text-xs">
                    {detail.refunds.length === 0 && <li className="text-[var(--text-muted)]">No refunds.</li>}
                    {detail.refunds.map((refund) => (
                      <li key={refund.id} className="flex justify-between gap-2 border-b border-[var(--border-subtle)] py-1">
                        <span>{rupees(refund.amount_paise)} · {refund.status}</span>
                        <span className="text-[var(--text-muted)]">{new Date(refund.created_at).toLocaleDateString('en-IN')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
