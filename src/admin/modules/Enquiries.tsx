import React, { useEffect, useState, useMemo } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  DataTable,
  FilterTabs,
  GhostButton,
  inputClass,
  Modal,
  Notice,
  PageHeader,
  SearchInput,
  StatCard,
  StatusBadge,
} from '../ui';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewing, setViewing] = useState<EnquiryRow | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    api<EnquiryRow[]>('/admin/enquiries')
      .then(setRows)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load customer enquiries.')
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, status: EnquiryRow['status']) => {
    try {
      await api(`/admin/enquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to update enquiry status.');
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const fullName = `${r.first_name} ${r.last_name}`.toLowerCase();
      const matchSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rows, searchQuery, statusFilter]);

  const openCount = rows.filter((r) => r.status === 'open').length;
  const inProgressCount = rows.filter((r) => r.status === 'in_progress').length;
  const resolvedCount = rows.filter((r) => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Inquiries & Concierge"
        subtitle="Manage customer consultations, order inquiries, and concierge messages."
      />

      {error && <Notice variant="error">{error}</Notice>}

      {/* Metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Open Inquiries"
          value={String(openCount)}
          trendLabel="requires concierge response"
          icon={Clock}
        />
        <StatCard
          label="In Progress"
          value={String(inProgressCount)}
          trendLabel="under investigation"
          icon={MessageSquare}
        />
        <StatCard
          label="Resolved Tickets"
          value={String(resolvedCount)}
          trend={{ value: `${Math.round((resolvedCount / (rows.length || 1)) * 100)}%`, isPositive: true }}
          trendLabel="successfully closed"
          icon={CheckCircle2}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client name, email, or message keyword..."
          className="w-full sm:w-80"
        />

        <FilterTabs
          tabs={[
            { id: 'all', label: 'All Inquiries', count: rows.length },
            { id: 'open', label: 'Open', count: openCount },
            { id: 'in_progress', label: 'In Progress', count: inProgressCount },
            { id: 'resolved', label: 'Resolved', count: resolvedCount },
          ]}
          activeTab={statusFilter}
          onChange={(id) => setStatusFilter(id)}
        />
      </div>

      {/* Inquiries Table */}
      <DataTable
        columns={['Date Received', 'Client Name', 'Contact Details', 'Inquiry Message', 'Current Status', 'Action']}
        rows={filteredRows.map((row) => [
          <span key="date" className="text-xs text-[#666666] font-mono">
            {new Date(row.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>,
          <span key="name" className="font-bold text-xs text-[#333333]">
            {row.first_name} {row.last_name}
          </span>,
          <div key="contact" className="min-w-0">
            <a
              href={`mailto:${row.email}`}
              className="text-xs font-semibold text-[#A06A98] hover:underline block truncate"
            >
              {row.email}
            </a>
            {row.phone && (
              <span className="text-[11px] text-[#888888] font-mono block">
                {row.phone}
              </span>
            )}
          </div>,
          <p key="msg" className="text-xs text-[#555555] line-clamp-2 max-w-sm">
            {row.message}
          </p>,
          <select
            key="status"
            className="h-8 px-2.5 border border-[#E2E8F0] rounded-[0.3rem] bg-[#FAF5F8] text-xs font-bold text-[#76416F] focus:outline-none focus:border-[#A06A98] cursor-pointer"
            value={row.status}
            onChange={(event) => void update(row.id, event.target.value as EnquiryRow['status'])}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>,
          <button
            key="view"
            type="button"
            onClick={() => setViewing(row)}
            className="p-1.5 text-[#666666] hover:text-[#A06A98] hover:bg-[#FDF2F8] rounded-[0.3rem] transition-colors cursor-pointer"
            title="View Full Message"
          >
            <Eye className="w-4 h-4" />
          </button>,
        ])}
        emptyMessage={
          isLoading
            ? 'Loading customer inquiries...'
            : searchQuery || statusFilter !== 'all'
              ? 'No inquiries found matching your filter criteria.'
              : 'No customer inquiries submitted yet.'
        }
      />

      {/* Message Modal Viewer */}
      {viewing && (
        <Modal
          title={`Inquiry from ${viewing.first_name} ${viewing.last_name}`}
          subtitle={`Received on ${new Date(viewing.created_at).toLocaleString('en-IN')}`}
          onClose={() => setViewing(null)}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#FAF5F8] rounded-[0.3rem] border border-[#E2E8F0] space-y-1">
              <p className="font-semibold text-[#333333]">Contact Information:</p>
              <p className="text-[#666666]">Email: <a href={`mailto:${viewing.email}`} className="text-[#A06A98] font-bold underline">{viewing.email}</a></p>
              {viewing.phone && <p className="text-[#666666]">Phone: <span className="font-mono text-[#333333]">{viewing.phone}</span></p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-[#76416F] text-[11px]">
                Customer Message
              </label>
              <div className="p-4 bg-white border border-[#E2E8F0] rounded-[0.3rem] text-[#333333] leading-relaxed whitespace-pre-wrap">
                {viewing.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#666666]">Status:</span>
                <StatusBadge value={viewing.status} />
              </div>
              <a
                href={`mailto:${viewing.email}?subject=Veloraa%20Rougee%20Concierge%20Support`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[0.3rem] bg-[#A06A98] hover:bg-[#774170] text-white font-bold transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply by Email</span>
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
