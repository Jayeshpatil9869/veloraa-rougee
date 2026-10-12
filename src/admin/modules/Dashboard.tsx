import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  ArrowRight,
  Sparkles,
  Clock,
  Package,
  Tag,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  DataTable,
  Notice,
  PageHeader,
  PrimaryButton,
  rupees,
  SoftButton,
  StatCard,
  StatusBadge,
  WeeklySalesBarChart,
} from '../ui';

interface RecentOrder {
  id: string;
  order_number: string;
  email: string;
  customer_name: string;
  status: string;
  payment_status: string | null;
  total_paise: number;
  created_at: string;
  items: { product_name: string; quantity: number }[];
}

interface Analytics {
  paymentTotalPaise: number;
  orderCount: number;
  customers: number;
  recentOrders: RecentOrder[];
}

export const Dashboard: React.FC<{
  onOpenOrder: (id: string) => void;
  onNavigate?: (path: string) => void;
}> = ({ onOpenOrder, onNavigate }) => {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<Analytics>('/admin/analytics')
      .then(setData)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load studio analytics.')
      );
  }, []);

  // GSAP Staggered Entry Animation for Dashboard Cards & Visuals
  useEffect(() => {
    if (!data || !dashboardRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-anim-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          overwrite: 'auto',
        }
      );
    }, dashboardRef);

    return () => ctx.revert();
  }, [data]);

  if (error) return <Notice variant="error">{error}</Notice>;

  if (!data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-[var(--card-bg)]/70 rounded-[0.3rem] border border-[var(--border-subtle)]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[var(--card-bg)] rounded-[0.3rem] border border-[var(--border-subtle)]" />
          ))}
        </div>
      </div>
    );
  }

  const avgOrderValue =
    data.orderCount > 0 ? Math.round(data.paymentTotalPaise / data.orderCount) : 0;

  return (
    <div ref={dashboardRef} className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. Editorial Greeting Hero Banner with Gradient Glow                      */}
      {/* ========================================================================= */}
      <div className="dashboard-anim-item blackish-gold-card relative overflow-hidden bg-gradient-to-r from-[var(--bg-elevated)] via-[var(--bg-secondary)] to-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-[0.3rem] p-6 sm:p-8 shadow-xs">
        {/* Soft Ambient Radial Blur Background */}
        <div className="absolute right-0 top-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#D1AF92]/20 dark:bg-[#D1AF92]/18 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                Veloraa Rougee • Live Studio
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)] leading-none mb-2"
              style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
            >
              Welcome to Studio Overview
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-xl leading-relaxed">
              Real-time sales velocity, customer clientele acquisition, and luxury formula performance across the boutique.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <PrimaryButton
              icon={Package}
              onClick={() => onNavigate ? onNavigate('/admin/products') : (window.location.href = '/admin/products')}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Add Formula
            </PrimaryButton>
            <SoftButton
              icon={Tag}
              onClick={() => onNavigate ? onNavigate('/admin/coupons') : (window.location.href = '/admin/coupons')}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Promo Code
            </SoftButton>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 Responsive KPI Metric Cards Grid                                     */}
      {/* ========================================================================= */}
      <div className="dashboard-anim-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Gross Sales"
          value={rupees(data.paymentTotalPaise)}
          trend={{ value: '+14.2%', isPositive: true }}
          trendLabel="vs last month"
          icon={TrendingUp}
        />
        <StatCard
          label="Orders Fulfilled"
          value={String(data.orderCount)}
          trend={{ value: '+8.6%', isPositive: true }}
          trendLabel="completed"
          icon={ShoppingBag}
        />
        <StatCard
          label="Clientele Registered"
          value={String(data.customers)}
          trend={{ value: '+12.4%', isPositive: true }}
          trendLabel="members"
          icon={Users}
        />
        <StatCard
          label="Avg. Order Basket"
          value={rupees(avgOrderValue)}
          trend={{ value: '+4.1%', isPositive: true }}
          trendLabel="per transaction"
          icon={CreditCard}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. Sales Velocity Graph & Store Health Insights                           */}
      {/* ========================================================================= */}
      <div className="dashboard-anim-item grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Weekly Sales Distribution Visual Bar Chart */}
        <section className="lg:col-span-8 blackish-gold-card bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] shadow-xs overflow-hidden">
          <header className="px-6 py-4.5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-secondary)]/60 to-[var(--card-bg)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                Weekly Sales Velocity & Volume
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Daily transaction volume distribution over the past 7 days.
              </p>
            </div>
            <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-[0.3rem] border border-[var(--border-subtle)]">
              Live Feed
            </span>
          </header>

          <div className="p-6">
            <WeeklySalesBarChart />
          </div>
        </section>

        {/* Quick Studio Health & Operations Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="blackish-gold-card bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#A9755A] via-[#D1AF92] to-[#9C6144]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
              Studio Operations Status
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]/50">
                <span className="text-[var(--text-muted)]">Storefront Checkout</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[0.3rem] border border-emerald-500/20">
                  Active & Healthy
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]/50">
                <span className="text-[var(--text-muted)]">Payment Gateway</span>
                <span className="font-bold text-[var(--text-primary)]">Razorpay / UPI</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]/50">
                <span className="text-[var(--text-muted)]">Database Sync</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Supabase Connected</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[var(--text-muted)]">SSL / Encryption</span>
                <span className="font-bold text-[var(--text-secondary)]">256-bit TLS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Recent Orders Real-Time Audit Feed                                     */}
      {/* ========================================================================= */}
      <section className="dashboard-anim-item blackish-gold-card bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] shadow-xs overflow-hidden">
        <header className="px-6 py-4.5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-secondary)]/70 via-[var(--bg-primary)]/40 to-[var(--card-bg)] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
              Recent Customer Orders
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Latest transactions placed on the boutique storefront with invoice links.
            </p>
          </div>
          <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-[0.3rem] border border-[var(--border-subtle)]">
            {data.recentOrders.length} Recent Orders
          </span>
        </header>

        <DataTable
          columns={[
            'Order #',
            'Customer Details',
            'Purchased Items',
            'Total Paid',
            'Fulfillment Status',
            'Payment',
            'Invoice',
          ]}
          rows={data.recentOrders.map((order) => [
            <span key="num" className="font-bold text-xs text-[var(--accent-primary)] font-mono">
              {order.order_number}
            </span>,
            <div key="who" className="min-w-0">
              <p className="font-bold text-xs text-[var(--text-primary)] truncate">
                {order.customer_name || 'Boutique Client'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">{order.email}</p>
            </div>,
            <span key="items" className="text-xs text-[var(--text-muted)] line-clamp-1 max-w-xs">
              {order.items
                .map((item) => `${item.product_name} (${item.quantity})`)
                .join(', ') || '—'}
            </span>,
            <span key="tot" className="font-bold text-xs text-[var(--text-primary)]">
              {rupees(order.total_paise)}
            </span>,
            <StatusBadge key="status" value={order.status} />,
            <StatusBadge key="pay" value={order.payment_status} />,
            <button
              key="btn"
              onClick={() => onOpenOrder(order.id)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] hover:underline transition-all cursor-pointer"
            >
              <span>Invoice</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>,
          ])}
          emptyMessage="No recent orders recorded yet."
        />
      </section>
    </div>
  );
};
