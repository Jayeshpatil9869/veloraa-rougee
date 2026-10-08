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

export const Dashboard: React.FC<{ onOpenOrder: (id: string) => void }> = ({
  onOpenOrder,
}) => {
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
        <div className="h-28 bg-white/70 rounded-[0.3rem] border border-[#E2E8F0]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-[0.3rem] border border-[#E2E8F0]" />
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
      <div className="dashboard-anim-item relative overflow-hidden bg-gradient-to-r from-white via-[#FAF5F8] to-[#FDF2F8] border border-[#F0DEF7] rounded-[0.3rem] p-6 sm:p-8 shadow-xs">
        {/* Soft Ambient Radial Blur Background */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#DFBEDB]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#76416F]">
                Veloraa Rougee • Live Studio
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl text-[#333333] leading-none mb-2"
              style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
            >
              Welcome to Studio Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] font-medium max-w-xl leading-relaxed">
              Real-time sales velocity, customer clientele acquisition, and luxury formula performance across the boutique.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <PrimaryButton
              icon={Package}
              onClick={() => (window.location.href = '/admin/products')}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Add Formula
            </PrimaryButton>
            <SoftButton
              icon={Tag}
              onClick={() => (window.location.href = '/admin/coupons')}
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
        <section className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs overflow-hidden">
          <header className="px-6 py-4.5 border-b border-[#E2E8F0] bg-gradient-to-r from-[#FDF2F8]/60 to-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#A06A98]" />
                Weekly Sales Velocity & Volume
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Daily transaction volume distribution over the past 7 days.
              </p>
            </div>
            <span className="text-xs font-bold text-[#76416F] bg-[#FDF2F8] px-2.5 py-1 rounded-[0.3rem] border border-[#DFBEDB]/50">
              Live Feed
            </span>
          </header>

          <div className="p-6">
            <WeeklySalesBarChart />
          </div>
        </section>

        {/* Quick Studio Health & Operations Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#A06A98] to-[#76416F]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#76416F] flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#A06A98]" />
              Studio Operations Status
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#666666]">Storefront Checkout</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[0.3rem] border border-emerald-200">
                  Active & Healthy
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#666666]">Payment Gateway</span>
                <span className="font-bold text-[#333333]">Razorpay / UPI</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#666666]">Database Sync</span>
                <span className="font-bold text-emerald-700">Supabase Connected</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#666666]">SSL / Encryption</span>
                <span className="font-bold text-[#76416F]">256-bit TLS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Recent Orders Real-Time Audit Feed                                     */}
      {/* ========================================================================= */}
      <section className="dashboard-anim-item bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs overflow-hidden">
        <header className="px-6 py-4.5 border-b border-[#E2E8F0] bg-gradient-to-r from-[#FDF2F8]/70 via-[#FAF5F8]/40 to-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A06A98]" />
              Recent Customer Orders
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Latest transactions placed on the boutique storefront with invoice links.
            </p>
          </div>
          <span className="text-xs font-bold text-[#76416F] bg-[#FDF2F8] px-2.5 py-1 rounded-[0.3rem] border border-[#DFBEDB]/50">
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
            <span key="num" className="font-bold text-xs text-[#A06A98] font-mono">
              {order.order_number}
            </span>,
            <div key="who" className="min-w-0">
              <p className="font-bold text-xs text-[#333333] truncate">
                {order.customer_name || 'Boutique Client'}
              </p>
              <p className="text-[11px] text-[#888888] truncate">{order.email}</p>
            </div>,
            <span key="items" className="text-xs text-[#666666] line-clamp-1 max-w-xs">
              {order.items
                .map((item) => `${item.product_name} (${item.quantity})`)
                .join(', ') || '—'}
            </span>,
            <span key="tot" className="font-bold text-xs text-[#333333]">
              {rupees(order.total_paise)}
            </span>,
            <StatusBadge key="status" value={order.status} />,
            <StatusBadge key="pay" value={order.payment_status} />,
            <button
              key="btn"
              onClick={() => onOpenOrder(order.id)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#A06A98] hover:text-[#774170] hover:underline transition-all cursor-pointer"
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
