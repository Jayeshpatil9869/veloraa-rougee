import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ArrowLeft, Package } from 'lucide-react';
import { api } from '../../lib/api';
import { TrackingTimeline, type TrackingView } from '../../components/shipping/TrackingTimeline';
import {
  DataTable,
  FilterTabs,
  Notice,
  PageHeader,
  PrimaryButton,
  SoftButton,
  StatCard,
  StatusBadge,
  SearchInput,
  rupees,
} from '../ui';

interface ShipmentRow {
  id: string;
  order_id: string;
  channel_order_id: string;
  awb: string | null;
  courier_name: string | null;
  status: string;
  pickup_status: string;
  estimated_cost_paise: number | null;
  confirmed_cost_paise: number | null;
  etd_at: string | null;
  last_synced_at: string | null;
  created_at: string;
  customer_email?: string | null;
  operation_state?: string;
}

interface Analytics {
  totalShipments: number;
  byStatus: Record<string, number>;
  estimatedShippingExpenditurePaise: number;
  confirmedShippingExpenditurePaise: number;
  averageConfirmedCostPaise: number | null;
  deliverySuccessRate: number | null;
  averageDeliveryHours: number | null;
  note?: string;
}

interface ShipmentDetail {
  tracking: TrackingView;
  shipment: ShipmentRow & { provider_order_id?: string; provider_shipment_id?: string };
  documents: Array<{ id: string; doc_type: string; provider_url: string | null }>;
  returns: Array<{ id: string; reverse_pickup_status: string; reason: string | null }>;
  order?: { id: string; order_number: string; status: string; total_paise: number };
}

export const ShippingModule: React.FC<{
  path: string;
  onOpen: (id: string) => void;
}> = ({ path, onOpen }) => {
  const shipmentId = path.split('/').filter(Boolean).pop();
  const isDetail = Boolean(shipmentId && shipmentId !== 'shipping' && shipmentId.length > 20);

  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [detail, setDetail] = useState<ShipmentDetail | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [ndr, setNdr] = useState<unknown>(null);

  const loadList = () => {
    api<ShipmentRow[]>('/admin/shipments')
      .then(setRows)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Failed to load shipments'));
    api<Analytics>('/admin/shipping/analytics')
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  };

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (!isDetail || !shipmentId) {
      setDetail(null);
      return;
    }
    api<ShipmentDetail>(`/admin/shipments/${shipmentId}`)
      .then(setDetail)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Failed to load shipment'));
  }, [isDetail, shipmentId]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        row.channel_order_id.toLowerCase().includes(q) ||
        (row.awb || '').toLowerCase().includes(q) ||
        (row.courier_name || '').toLowerCase().includes(q) ||
        (row.customer_email || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [rows, searchQuery, statusFilter]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError('');
    setNotice('');
    try {
      await fn();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Action failed');
    } finally {
      setBusy('');
    }
  };

  if (error && !rows.length && !detail) return <Notice variant="error">{error}</Notice>;

  if (detail) {
    const shipment = detail.shipment;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => onOpen('')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-primary)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to shipments
          </button>
          <div className="flex items-center gap-2">
            <StatusBadge value={shipment.status} />
            <StatusBadge value={shipment.pickup_status} />
          </div>
        </div>

        {error && <Notice variant="error">{error}</Notice>}
        {notice && <Notice variant="success">{notice}</Notice>}

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <TrackingTimeline tracking={detail.tracking} />
            <div className="rounded-[0.3rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] p-5 space-y-2 text-xs">
              <p className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">Identifiers</p>
              <p>Order: {shipment.channel_order_id}</p>
              <p>Provider order: {shipment.provider_order_id || '—'}</p>
              <p>Provider shipment: {shipment.provider_shipment_id || '—'}</p>
              <p>AWB: {shipment.awb || '—'}</p>
              <p>Courier: {shipment.courier_name || '—'}</p>
              <p>
                Estimated / confirmed:{' '}
                {shipment.estimated_cost_paise != null ? rupees(shipment.estimated_cost_paise) : '—'} /{' '}
                {shipment.confirmed_cost_paise != null ? rupees(shipment.confirmed_cost_paise) : 'awaiting'}
              </p>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-3">
            <SoftButton
              disabled={Boolean(busy)}
              onClick={() =>
                run('sync', async () => {
                  const result = await api<{ tracking: TrackingView }>(`/admin/shipments/${shipment.id}/sync`, { method: 'POST' });
                  setDetail((prev) => (prev ? { ...prev, tracking: result.tracking } : prev));
                  setNotice('Tracking refreshed from courier.');
                })
              }
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {busy === 'sync' ? 'Refreshing…' : 'Refresh tracking'}
            </SoftButton>
            <SoftButton
              disabled={Boolean(busy)}
              onClick={() =>
                run('awb', async () => {
                  await api(`/admin/shipments/${shipment.id}/assign-awb`, { method: 'POST', body: '{}' });
                  const fresh = await api<ShipmentDetail>(`/admin/shipments/${shipment.id}`);
                  setDetail(fresh);
                  setNotice('AWB assignment requested.');
                })
              }
            >
              Assign AWB
            </SoftButton>
            <SoftButton
              disabled={Boolean(busy)}
              onClick={() =>
                run('pickup', async () => {
                  await api(`/admin/shipments/${shipment.id}/pickup`, { method: 'POST', body: '{}' });
                  const fresh = await api<ShipmentDetail>(`/admin/shipments/${shipment.id}`);
                  setDetail(fresh);
                  setNotice('Pickup scheduled.');
                })
              }
            >
              Schedule pickup
            </SoftButton>
            <SoftButton
              disabled={Boolean(busy)}
              onClick={() =>
                run('label', async () => {
                  const result = await api<{ labelUrl: string | null }>(`/admin/shipments/${shipment.id}/label`, {
                    method: 'POST',
                    body: '{}',
                  });
                  setNotice(result.labelUrl ? 'Label retrieved.' : 'Label request sent.');
                  const fresh = await api<ShipmentDetail>(`/admin/shipments/${shipment.id}`);
                  setDetail(fresh);
                })
              }
            >
              Retrieve label
            </SoftButton>
            <SoftButton
              disabled={Boolean(busy)}
              onClick={() =>
                run('return', async () => {
                  const reason = window.prompt('Return reason');
                  if (!reason) return;
                  await api(`/admin/shipments/${shipment.id}/return`, {
                    method: 'POST',
                    body: JSON.stringify({ reason }),
                  });
                  const fresh = await api<ShipmentDetail>(`/admin/shipments/${shipment.id}`);
                  setDetail(fresh);
                  setNotice('Return requested.');
                })
              }
            >
              Initiate return
            </SoftButton>
            {detail.documents[0]?.provider_url && (
              <a
                href={detail.documents[0].provider_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]"
              >
                Open latest label
              </a>
            )}
            {detail.returns.length > 0 && (
              <div className="text-xs text-[var(--text-muted)]">
                Returns: {detail.returns.map((row) => row.reverse_pickup_status).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping & Logistics"
        subtitle="Live courier shipments, tracking, pickups, and shipping spend."
        action={
          <PrimaryButton
            icon={RefreshCw}
            onClick={() =>
              run('reconcile', async () => {
                await api('/admin/shipping/reconcile', { method: 'POST', body: JSON.stringify({ limit: 20 }) });
                loadList();
                setNotice('Shipping reconciliation ran.');
              })
            }
          >
            Reconcile
          </PrimaryButton>
        }
      />

      {error && <Notice variant="error">{error}</Notice>}
      {notice && <Notice variant="success">{notice}</Notice>}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total shipments" value={String(analytics?.totalShipments ?? rows.length)} />
        <StatCard label="In transit" value={String(analytics?.byStatus?.in_transit ?? 0)} />
        <StatCard
          label="Confirmed spend"
          value={analytics ? rupees(analytics.confirmedShippingExpenditurePaise) : '—'}
        />
        <StatCard
          label="Delivery success"
          value={
            analytics?.deliverySuccessRate != null
              ? `${Math.round(analytics.deliverySuccessRate * 100)}%`
              : '—'
          }
        />
      </div>
      {analytics?.note && <p className="text-[11px] text-[var(--text-muted)]">{analytics.note}</p>}

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <FilterTabs
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'created', label: 'Created' },
            { id: 'in_transit', label: 'In transit' },
            { id: 'out_for_delivery', label: 'OFD' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'exception', label: 'Exceptions' },
          ]}
          activeTab={statusFilter}
          onChange={setStatusFilter}
        />
        <SearchInput
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search AWB, order, courier"
        />
      </div>

      <DataTable
        columns={['Order', 'Courier / AWB', 'Status', 'Cost', 'Updated', '']}
        rows={filtered.map((row) => [
          <div key="order">
            <p className="font-mono text-xs font-bold">{row.channel_order_id}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{row.customer_email}</p>
          </div>,
          <div key="courier">
            <p className="text-xs font-semibold">{row.courier_name || '—'}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{row.awb || 'No AWB'}</p>
          </div>,
          <StatusBadge key="status" value={row.status} />,
          <span key="cost" className="text-xs">
            {row.confirmed_cost_paise != null
              ? rupees(row.confirmed_cost_paise)
              : row.estimated_cost_paise != null
                ? `~${rupees(row.estimated_cost_paise)}`
                : '—'}
          </span>,
          <span key="updated" className="text-[11px] text-[var(--text-muted)]">
            {row.last_synced_at
              ? new Date(row.last_synced_at).toLocaleString('en-IN')
              : new Date(row.created_at).toLocaleString('en-IN')}
          </span>,
          <SoftButton key="open" icon={Package} onClick={() => onOpen(row.id)}>
            Open
          </SoftButton>,
        ])}
        emptyMessage="No shipments yet. Create one from a paid order."
      />

      <div className="pt-2">
        <SoftButton
          onClick={() =>
            run('ndr', async () => {
              const result = await api('/admin/shipping/ndr');
              setNdr(result);
              setNotice('Loaded NDR list from provider.');
            })
          }
        >
          Load NDR list
        </SoftButton>
        {ndr != null && (
          <pre className="mt-3 max-h-64 overflow-auto rounded-[0.3rem] border border-[var(--border-subtle)] p-3 text-[11px] bg-[var(--bg-secondary)]">
            {JSON.stringify(ndr, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
