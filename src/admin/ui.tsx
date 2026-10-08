import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { LucideIcon, Search, AlertCircle, CheckCircle2, Info, X, TrendingUp, TrendingDown } from 'lucide-react';

export const inputClass =
  'h-10 w-full px-3.5 bg-[#FAF5F8] border border-[#E2E8F0] rounded-[0.3rem] text-sm text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#A06A98] focus:bg-white focus:ring-1 focus:ring-[#A06A98] transition-all duration-200';

export function rupees(paise: number) {
  return `₹${(Number(paise) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function StatusBadge({
  value,
  className = '',
}: {
  value: string | null | undefined;
  className?: string;
}) {
  const label = value || 'unknown';
  const norm = label.toLowerCase().trim();

  let tone = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['paid', 'published', 'delivered', 'approved', 'resolved', 'active', 'confirmed', 'success', 'in stock'].includes(norm)) {
    tone = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['pending', 'open', 'in_progress', 'processing', 'packed', 'shipped', 'low stock'].includes(norm)) {
    tone = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['cancelled', 'refunded', 'rejected', 'failed', 'hidden', 'out of stock', 'archived', 'error'].includes(norm)) {
    tone = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['lips', 'brows', 'eyes', 'face', 'bundles', 'vip', 'email', 'google'].includes(norm)) {
    tone = 'bg-[#FDF2F8] text-[#76416F] border-[#DFBEDB]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-2.5 py-0.5 rounded-[0.3rem] capitalize tracking-wide transition-colors ${tone} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      {label.replaceAll('_', ' ')}
    </span>
  );
}

export function PrimaryButton({
  children,
  icon: Icon,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon }) {
  return (
    <button
      {...props}
      className={`group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#A06A98] to-[#76416F] hover:from-[#905788] hover:to-[#683561] text-[#F8FAFC] active:scale-[0.98] rounded-[0.3rem] px-4 py-2 font-medium text-sm transition-all duration-200 shadow-xs hover:shadow-md disabled:opacity-60 disabled:pointer-events-none cursor-pointer overflow-hidden ${className}`}
    >
      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      {Icon && <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />}
      <span>{children}</span>
    </button>
  );
}

export function SoftButton({
  children,
  icon: Icon,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 bg-[#FDF2F8] text-[#76416F] hover:bg-[#FCE7F3] hover:text-[#5B2E55] border border-[#DFBEDB]/50 rounded-[0.3rem] px-3.5 py-2 font-medium text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  icon: Icon,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 border border-[#A06A98] text-[#A06A98] hover:bg-[#A06A98] hover:text-white rounded-[0.3rem] px-3.5 py-2 font-medium text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  icon: Icon,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 text-[#666666] hover:text-[#A06A98] hover:bg-[#FDF2F8] px-3 py-1.5 rounded-[0.3rem] text-sm font-medium transition-colors duration-200 disabled:opacity-60 cursor-pointer ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  icon: Icon,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-[0.3rem] px-3 py-1.5 font-medium text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function StatCard({
  label,
  value,
  trend,
  trendLabel = 'vs last month',
  icon: Icon,
}: {
  label: string;
  value: string;
  trend?: { value: string; isPositive: boolean };
  trendLabel?: string;
  icon?: LucideIcon;
}) {
  return (
    <article className="stat-card-anim bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 sm:p-6 relative overflow-hidden shadow-xs hover:border-[#DFBEDB] hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
      {/* Signature Orchid-to-Plum Gradient Top Accent Bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#A06A98] via-[#DFBEDB] to-[#76416F] group-hover:h-1.5 transition-all" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#666666] mb-1.5">
            {label}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#333333] tracking-tight truncate font-sans">
            {value}
          </h3>
          {trend && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-[0.3rem] border ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value}
              </span>
              <span className="text-xs text-[#777777]">{trendLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[0.3rem] bg-gradient-to-br from-[#FDF2F8] to-[#FAF5F8] text-[#76416F] flex items-center justify-center shrink-0 border border-[#DFBEDB]/60 group-hover:scale-110 group-hover:bg-[#FDF2F8] transition-all duration-300 shadow-2xs">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
    </article>
  );
}

export function WeeklySalesBarChart({
  data = [
    { day: 'Mon', amount: 32000, orders: 12 },
    { day: 'Tue', amount: 48000, orders: 18 },
    { day: 'Wed', amount: 29000, orders: 11 },
    { day: 'Thu', amount: 56000, orders: 22 },
    { day: 'Fri', amount: 74000, orders: 28 },
    { day: 'Sat', amount: 98000, orders: 36 },
    { day: 'Sun', amount: 84000, orders: 31 },
  ],
}: {
  data?: { day: string; amount: number; orders: number }[];
}) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 100000);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56 pt-6 px-2">
        {data.map((item, idx) => {
          const heightPercent = Math.max(15, Math.round((item.amount / maxAmount) * 100));
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#333333] text-white text-[10px] sm:text-xs py-1 px-2 rounded-[0.3rem] pointer-events-none whitespace-nowrap shadow-md mb-1 -translate-y-1">
                ₹{(item.amount / 100).toLocaleString('en-IN')} ({item.orders} orders)
              </div>

              {/* Bar Fill with Luxury Mauve Gradient */}
              <div
                className="w-full max-w-[42px] bg-gradient-to-t from-[#76416F] via-[#A06A98] to-[#DFBEDB] rounded-t-[0.3rem] transition-all duration-500 group-hover:brightness-110 group-hover:shadow-md cursor-pointer relative"
                style={{ height: `${heightPercent}%` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-[0.3rem]" />
              </div>

              {/* Day Label */}
              <span className="text-[11px] sm:text-xs font-bold text-[#666666] group-hover:text-[#A06A98] transition-colors">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]/80 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#333333] tracking-tight font-sans">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#666666] mt-1 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-full pl-9 pr-3.5 bg-[#FAF5F8] border border-[#E2E8F0] rounded-[0.3rem] text-xs sm:text-sm text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#A06A98] focus:bg-white focus:ring-1 focus:ring-[#A06A98] transition-all duration-200"
      />
    </div>
  );
}

export function FilterTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  activeTab: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#FAF5F8] border border-[#E2E8F0] rounded-[0.3rem] overflow-x-auto max-w-full">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 rounded-[0.3rem] text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isActive
                ? 'bg-white text-[#76416F] shadow-2xs border border-[#DFBEDB]/60'
                : 'text-[#666666] hover:text-[#333333] hover:bg-white/60'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-[#FDF2F8] text-[#76416F]' : 'bg-[#E2E8F0] text-[#666666]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs overflow-hidden ${className}`}>
      <header className="px-5 py-4 border-b border-[#E2E8F0] bg-gradient-to-r from-[#FDF2F8]/60 to-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#333333]">{title}</h2>
          {subtitle && <p className="text-xs text-[#666666] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function DataTable({
  columns,
  rows,
  emptyMessage = 'No records found.',
}: {
  columns: string[];
  rows: React.ReactNode[][];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-12 text-center shadow-xs">
        <p className="text-sm font-medium text-[#666666]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[0.3rem] overflow-x-auto shadow-xs">
      <table className="w-full text-sm text-[#333333] text-left border-collapse min-w-[640px]">
        <thead className="bg-[#FDF2F8]/90 text-[#76416F] text-xs uppercase tracking-wider font-bold border-b border-[#E2E8F0]">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={column}
                className={`py-3.5 px-4 font-bold ${
                  idx === columns.length - 1 ? 'text-right' : 'text-left'
                }`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {rows.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-[#FAF5F8]/70 transition-colors duration-150"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`py-3.5 px-4 align-middle ${
                    cellIndex === row.length - 1 ? 'text-right' : 'text-left'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 'max-w-5xl',
  footer,
  confirmOnClose = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
  confirmOnClose?: boolean;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const requestClose = () => {
    if (confirmOnClose) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    // 1. Lock background scrolling on both documentElement and body
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalTouchAction = document.body.style.touchAction;

    // Compensate for scrollbar layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // 2. Keyboard accessibility
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showConfirm) {
          setShowConfirm(false);
        } else if (confirmOnClose) {
          setShowConfirm(true);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, confirmOnClose, showConfirm]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-hidden overscroll-none"
      onClick={requestClose}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} max-h-[92vh] h-auto flex flex-col bg-white border border-[#DFBEDB]/80 rounded-xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.22)] overflow-hidden relative my-auto`}
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
      >
        {/* Top Luxury Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#A06A98] via-[#DFBEDB] to-[#76416F] absolute top-0 left-0 right-0 z-20 shrink-0" />

        <header className="px-5 sm:px-7 py-4 border-b border-[#E2E8F0] bg-gradient-to-r from-[#FDF2F8]/90 via-[#FAF5F8]/70 to-white flex items-center justify-between shrink-0 pt-4.5 z-10">
          <div className="min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#333333] tracking-tight font-sans truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#666666] mt-0.5 font-medium leading-relaxed truncate sm:whitespace-normal">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="p-1.5 text-[#666666] hover:text-[#333333] hover:bg-white rounded-[0.3rem] transition-colors cursor-pointer border border-transparent hover:border-[#DFBEDB]/60 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-5 sm:p-7 overflow-y-auto flex-1 min-h-0 modal-luxury-scroll overscroll-contain">
          {children}
        </div>

        {footer && (
          <footer className="px-5 sm:px-7 py-3.5 border-t border-[#E2E8F0] bg-[#FAF5F8] flex items-center justify-between gap-3 shrink-0 z-10">
            {footer}
          </footer>
        )}

        {/* Confirmation Dialog Overlay - Instant, Clean, Industry Standard */}
        {showConfirm && (
          <div
            className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border border-[#DFBEDB] rounded-xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="w-11 h-11 rounded-full bg-[#FDF2F8] border border-[#DFBEDB] text-[#A06A98] mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#A06A98]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-[#333333]">Discard Unsaved Changes?</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Are you sure you want to exit? Any changes made to this formula will not be saved.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-2 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-[0.3rem] transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-[#A06A98] to-[#76416F] hover:opacity-95 rounded-[0.3rem] transition-opacity cursor-pointer shadow-xs"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Notice({
  children,
  variant = 'error',
}: {
  children: React.ReactNode;
  variant?: 'error' | 'success' | 'info';
}) {
  if (!children) return null;

  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info: 'bg-sky-50 border-sky-200 text-sky-700',
  };

  const Icons = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
  };

  const Icon = Icons[variant];

  return (
    <div
      className={`p-3.5 border rounded-[0.3rem] text-xs sm:text-sm font-medium flex items-center gap-2.5 ${styles[variant]}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
