import React, { useEffect, useState, useMemo } from 'react';
import { Star, Check, X, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '../../lib/api';
import {
  DataTable,
  FilterTabs,
  GhostButton,
  Notice,
  PageHeader,
  SearchInput,
  StatCard,
  StatusBadge,
} from '../ui';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    api<ReviewRow[]>('/admin/reviews')
      .then(setRows)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load reviews.')
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const moderate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api(`/admin/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to update review status.');
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchSearch =
        r.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.body.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all' || r.status.toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rows, searchQuery, statusFilter]);

  const approvedCount = rows.filter((r) => r.status === 'approved').length;
  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Reviews & Testimonials"
        subtitle="Moderate product ratings, editorial beauty feedback, and customer testimonials."
      />

      {error && <Notice variant="error">{error}</Notice>}

      {/* Metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Reviews"
          value={String(rows.length)}
          trendLabel="all submissions"
          icon={MessageSquare}
        />
        <StatCard
          label="Published Testimonials"
          value={String(approvedCount)}
          trend={{ value: `${Math.round((approvedCount / (rows.length || 1)) * 100)}%`, isPositive: true }}
          trendLabel="live in boutique"
          icon={ThumbsUp}
        />
        <StatCard
          label="Pending Moderation"
          value={String(pendingCount)}
          trendLabel="awaiting editorial review"
          icon={Star}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by product name, reviewer email, or comment..."
          className="w-full sm:w-80"
        />

        <FilterTabs
          tabs={[
            { id: 'all', label: 'All Reviews', count: rows.length },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'approved', label: 'Approved', count: approvedCount },
            { id: 'rejected', label: 'Rejected' },
          ]}
          activeTab={statusFilter}
          onChange={(id) => setStatusFilter(id)}
        />
      </div>

      {/* Reviews Table */}
      <DataTable
        columns={['Formula / Product', 'Customer Email', 'Star Rating', 'Client Review', 'Status', 'Moderation']}
        rows={filteredRows.map((row) => [
          <span key="prod" className="font-bold text-xs text-[#333333]">
            {row.product_name}
          </span>,
          <span key="mail" className="text-xs text-[#666666]">
            {row.customer_email}
          </span>,
          <div key="stars" className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < row.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#333333] ml-1">{row.rating}.0</span>
          </div>,
          <p key="body" className="text-xs text-[#555555] italic line-clamp-2 max-w-sm">
            "{row.body}"
          </p>,
          <StatusBadge key="stat" value={row.status} />,
          <div key="actions" className="flex items-center justify-end gap-1.5">
            {row.status !== 'approved' && (
              <button
                type="button"
                onClick={() => void moderate(row.id, 'approved')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[0.3rem] bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
                title="Approve Review"
              >
                <Check className="w-3 h-3" />
                <span>Approve</span>
              </button>
            )}
            {row.status !== 'rejected' && (
              <button
                type="button"
                onClick={() => void moderate(row.id, 'rejected')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[0.3rem] bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                title="Reject Review"
              >
                <X className="w-3 h-3" />
                <span>Reject</span>
              </button>
            )}
          </div>,
        ])}
        emptyMessage={
          isLoading
            ? 'Loading customer reviews...'
            : searchQuery || statusFilter !== 'all'
              ? 'No reviews found matching your search filter.'
              : 'No customer reviews submitted yet.'
        }
      />
    </div>
  );
};
