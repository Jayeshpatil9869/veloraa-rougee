import React, { useEffect, useState } from 'react';
import {
  User,
  MapPin,
  Package,
  CreditCard,
  Heart,
  Phone,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Clock,
  Mail,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { api, hasApi } from '../lib/api';
import { getBrowserSupabase } from '../lib/supabase';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

interface CustomerProfile {
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
}

interface AddressRow {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

interface OrderRow {
  order_number: string;
  status: string;
  total_paise: number;
  payment_status: string | null;
  created_at: string;
}

interface OrderDetail {
  order: {
    order_number: string;
    status: string;
    subtotal_paise: number;
    discount_paise: number;
    shipping_paise: number;
    total_paise: number;
  };
  items: {
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price_paise: number;
  }[];
  address: {
    full_name: string;
    phone: string;
    line1: string;
    city: string;
    postal_code: string;
  } | null;
  payments: {
    status: string;
    amount_paise: number;
    gateway: string;
    created_at: string;
  }[];
}

interface PaymentRow {
  id: string;
  order_number: string;
  amount_paise: number;
  gateway: string;
  status: string;
  created_at: string;
}

type TabType = 'overview' | 'orders' | 'addresses' | 'payments';

const fieldClass =
  'h-11 w-full px-4 border border-[var(--input-border)] rounded-[0.3rem] bg-[var(--input-bg)] text-[var(--input-text)] text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200';

function money(paise: number) {
  return `₹${(Number(paise) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    postalCode: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    const result = await api<{ customer: CustomerProfile | null }>('/auth/me');
    if (!result.customer) {
      onNavigate('/en/login');
      return;
    }
    setCustomer(result.customer);
    setFullName(result.customer.fullName || '');
    setPhone(result.customer.phone ?? '');
    const [nextAddresses, nextOrders, nextPayments] = await Promise.all([
      api<AddressRow[]>('/account/addresses').catch(() => []),
      api<OrderRow[]>('/account/orders').catch(() => []),
      api<PaymentRow[]>('/account/payments').catch(() => []),
    ]);
    setAddresses(nextAddresses);
    setOrders(nextOrders);
    setPayments(nextPayments);
  };

  useEffect(() => {
    if (!hasApi()) {
      onNavigate('/en/login');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const orderNumber = params.get('order');
    if (tab === 'orders' || tab === 'addresses' || tab === 'payments' || tab === 'overview') {
      setActiveTab(tab);
    }
    void load()
      .then(async () => {
        if (orderNumber) {
          setActiveTab('orders');
          try {
            setDetail(await api<OrderDetail>(`/account/orders/${orderNumber}`));
          } catch {
            // order detail is optional if lookup fails
          }
        }
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load client account.'),
      );
  }, [onNavigate]);

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    window.dispatchEvent(new Event('auth_state_changed'));
    onNavigate('/en');
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      await api('/auth/profile', { method: 'PATCH', body: JSON.stringify({ fullName, phone }) });
      setMessage('Profile updated successfully.');
      setTimeout(() => setMessage(''), 3500);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const addAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await api('/account/addresses', { method: 'POST', body: JSON.stringify(addressForm) });
      setAddressForm({ fullName: '', phone: '', line1: '', city: '', postalCode: '' });
      setIsAddingAddress(false);
      setMessage('Delivery address added.');
      setTimeout(() => setMessage(''), 3500);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address.');
    }
  };

  const removeAddress = async (id: string) => {
    try {
      await api(`/account/addresses/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove address.');
    }
  };

  const openOrder = async (orderNumber: string) => {
    try {
      setDetail(await api<OrderDetail>(`/account/orders/${orderNumber}`));
    } catch {
      setError('Could not fetch order invoice details.');
    }
  };

  const userInitial = (customer?.fullName || customer?.email || 'V')
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className="w-full min-h-[calc(100vh-160px)] bg-[var(--bg-primary)] text-[var(--text-primary)] py-10 lg:py-16 transition-colors relative overflow-hidden">
      {/* Soft Ambient Radial Background Lights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[380px] h-[380px] bg-[var(--accent-secondary)]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 lg:space-y-10">
        {/* ========================================================================= */}
        {/* 1. Editorial Header Bar with Cursive Brand Title & Privé Badge            */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                Veloraa Rougee • Privé Atelier
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] leading-none"
              style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
            >
              Clientele Account
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-medium max-w-xl">
              Manage your personal formula curation, saved addresses, order invoices, and luxury boutique benefits.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/en/wishlist')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider bg-[var(--bg-secondary)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-all cursor-pointer shadow-2xs"
            >
              <Heart className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Wishlist</span>
            </button>

            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Notifications */}
        {error && (
          <div className="p-4 rounded-[0.3rem] bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="p-4 rounded-[0.3rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. Main 2-Column Luxury Atelier Layout                                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Client Summary Card & Quick Tabs (col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* VIP Client Profile Summary Card */}
            <div className="blackish-gold-card bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] p-6 shadow-xs relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D1AF92] via-[#A9755A] to-[#9C6144]" />

              <div className="flex items-center gap-4 mb-5">
                {customer?.avatarUrl ? (
                  <img
                    src={customer.avatarUrl}
                    alt={customer.fullName || 'Client'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[var(--accent-primary)] shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#160E09] via-[#30110A] to-[#080704] text-[var(--accent-primary)] border-2 border-[var(--accent-primary)]/40 flex items-center justify-center font-bold text-2xl shadow-sm">
                    {userInitial}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
                      Privé Member
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
                    {customer?.fullName || 'Boutique Member'}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] truncate">{customer?.email}</p>
                </div>
              </div>

              {/* Quick Summary Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-[var(--bg-secondary)]/60 rounded-[0.3rem] border border-[var(--border-subtle)] text-center">
                <div>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{orders.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Orders
                  </p>
                </div>
                <div className="border-x border-[var(--border-subtle)]">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{addresses.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Addresses
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{payments.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Payments
                  </p>
                </div>
              </div>

              {/* Atelier Navigation Tabs */}
              <nav className="mt-6 space-y-1.5">
                {[
                  { id: 'overview', label: 'Profile & Settings', icon: User },
                  { id: 'orders', label: 'Order History', icon: Package, badge: orders.length },
                  { id: 'addresses', label: 'Saved Addresses', icon: MapPin, badge: addresses.length },
                  { id: 'payments', label: 'Payments Audit', icon: CreditCard },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[0.3rem] text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent-primary)] text-[var(--button-primary-text)] shadow-xs font-bold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-black/20 text-current'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Concierge Support Card */}
            <div className="blackish-gold-card bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-elevated)] to-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-[0.3rem] p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Boutique Concierge
                </h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                Need shade consultations, formula recommendations, or order guidance? Our artists are at your service.
              </p>
              <a
                href="tel:+919975499040"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[var(--card-bg)] hover:bg-[var(--accent-primary)] hover:text-[var(--button-primary-text)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[0.3rem] text-xs font-bold tracking-wider uppercase transition-all shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+91 99754 99040</span>
              </a>
            </div>
          </aside>

          {/* Right Column: Tab Panels (col-span-8) */}
          <main className="lg:col-span-8 space-y-6 min-w-0">
            {/* --------------------------------------------------------------- */}
            {/* TAB 1: Profile & Details                                        */}
            {/* --------------------------------------------------------------- */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Profile Form Panel */}
                <section className="blackish-gold-card bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] shadow-xs overflow-hidden">
                  <header className="px-6 py-4.5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-secondary)]/70 to-[var(--card-bg)] flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--accent-primary)]" />
                        Personal Information
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Update your registered boutique client name and contact phone number.
                      </p>
                    </div>
                  </header>

                  <form onSubmit={(e) => void saveProfile(e)} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Jayesh Patil"
                          className={fieldClass}
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className={fieldClass}
                        />
                      </div>

                      {/* Email (Readonly) */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
                          <span>Registered Email Address</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-normal">
                            Managed by Auth
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            disabled
                            value={customer?.email || ''}
                            className={`${fieldClass} opacity-70 bg-[var(--bg-secondary)] cursor-not-allowed`}
                          />
                          <ShieldCheck className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-theme-primary px-6 py-2.5 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider disabled:opacity-60 cursor-pointer shadow-xs"
                      >
                        {isSaving ? 'Updating Profile…' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                </section>

                {/* Wishlist Direct Teaser Card */}
                <section className="blackish-gold-card bg-gradient-to-r from-[var(--bg-elevated)] via-[var(--bg-secondary)] to-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-[0.3rem] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-[var(--accent-primary)] fill-[var(--accent-primary)]/20" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Saved Formulations &amp; Wishlist
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-md">
                      Your hand-selected velvet mattes, satin finishes, and iconic seasonal shades.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('/en/wishlist')}
                    className="relative z-10 btn-theme-primary px-5 py-2.5 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-xs"
                  >
                    Open Wishlist
                  </button>
                </section>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 2: Orders & Invoices                                        */}
            {/* --------------------------------------------------------------- */}
            {activeTab === 'orders' && (
              <section className="blackish-gold-card bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] shadow-xs overflow-hidden">
                <header className="px-6 py-4.5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-secondary)]/70 to-[var(--card-bg)] flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Package className="w-4 h-4 text-[var(--accent-primary)]" />
                      Orders &amp; Invoices
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Track fulfillment, review itemized receipts, and download order invoices.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-[0.3rem] border border-[var(--border-subtle)]">
                    {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                </header>

                <div className="p-6">
                  {orders.length === 0 ? (
                    <div className="py-14 text-center space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                        <Package className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        No orders recorded yet
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                        Explore our curated luxury cosmetic collections and place your first order.
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('/en/collection')}
                        className="btn-theme-primary px-5 py-2 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider mt-2 cursor-pointer shadow-xs"
                      >
                        Explore Boutique
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.order_number}
                          className="border border-[var(--border-subtle)] rounded-[0.3rem] p-4 bg-[var(--bg-secondary)]/40 hover:bg-[var(--bg-secondary)]/80 hover:border-[var(--accent-primary)] transition-all cursor-pointer"
                          onClick={() => void openOrder(order.order_number)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                                  {order.order_number}
                                </span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-[0.25rem] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--text-muted)]">
                                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4">
                              <span className="text-sm font-bold text-[var(--text-primary)]">
                                {money(order.total_paise)}
                              </span>
                              <span className="text-xs font-bold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1">
                                <span>View Receipt</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order Detail Modal / Accordion */}
                  {detail && (
                    <div className="mt-6 border border-[var(--border-subtle)] rounded-[0.3rem] p-5 bg-[var(--bg-secondary)]/70 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                            Order Breakdown
                          </p>
                          <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono">
                            {detail.order.order_number}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDetail(null)}
                          className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          Close Details ✕
                        </button>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {detail.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border-subtle)]/40 text-[var(--text-secondary)]"
                          >
                            <span>
                              {item.product_name} ({item.variant_name}) × {item.quantity}
                            </span>
                            <span className="font-bold text-[var(--text-primary)]">
                              {money(item.unit_price_paise * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="pt-2 flex flex-col gap-1 text-xs">
                        <div className="flex justify-between text-[var(--text-muted)]">
                          <span>Subtotal</span>
                          <span>{money(detail.order.subtotal_paise)}</span>
                        </div>
                        <div className="flex justify-between text-[var(--text-muted)]">
                          <span>Shipping</span>
                          <span>{money(detail.order.shipping_paise)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-[var(--text-primary)] pt-1 border-t border-[var(--border-subtle)]">
                          <span>Total Paid</span>
                          <span>{money(detail.order.total_paise)}</span>
                        </div>
                      </div>

                      {/* Address */}
                      {detail.address && (
                        <div className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                          <span className="font-bold text-[var(--text-primary)] block mb-0.5">
                            Delivered to:
                          </span>
                          {detail.address.full_name}, {detail.address.line1}, {detail.address.city} {detail.address.postal_code}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 3: Saved Addresses                                          */}
            {/* --------------------------------------------------------------- */}
            {activeTab === 'addresses' && (
              <section className="blackish-gold-card bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] shadow-xs overflow-hidden">
                <header className="px-6 py-4.5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-secondary)]/70 to-[var(--card-bg)] flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
                      Delivery Addresses
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Save multiple addresses for expedited checkout and doorstep luxury delivery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider bg-[var(--accent-primary)] text-[var(--button-primary-text)] hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingAddress ? 'Cancel' : 'Add New'}</span>
                  </button>
                </header>

                <div className="p-6 space-y-6">
                  {/* Address List */}
                  {addresses.length === 0 && !isAddingAddress ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        No saved delivery addresses
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                        Add an address to ensure effortless boutique deliveries across India.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(true)}
                        className="btn-theme-primary px-5 py-2 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider mt-2 cursor-pointer shadow-xs"
                      >
                        Add Delivery Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="border border-[var(--border-subtle)] rounded-[0.3rem] p-4 bg-[var(--bg-secondary)]/40 hover:border-[var(--accent-primary)] transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-[var(--text-primary)] text-sm">
                                {addr.full_name}
                              </span>
                              <button
                                type="button"
                                onClick={() => void removeAddress(addr.id)}
                                className="text-rose-500 hover:text-rose-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                            <p className="text-[var(--text-secondary)]">{addr.line1}</p>
                            <p className="text-[var(--text-secondary)]">
                              {addr.city}, {addr.postal_code}
                            </p>
                            <p className="text-[var(--text-muted)] font-mono pt-1">
                              Phone: {addr.phone}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Address Form Accordion */}
                  {isAddingAddress && (
                    <form
                      onSubmit={(e) => void addAddress(e)}
                      className="border border-[var(--accent-primary)]/40 bg-[var(--bg-secondary)]/50 rounded-[0.3rem] p-5 space-y-4 animate-in fade-in"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                        Add New Address
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={addressForm.fullName}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, fullName: e.target.value })
                          }
                          className={fieldClass}
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          value={addressForm.phone}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, phone: e.target.value })
                          }
                          className={fieldClass}
                        />
                        <input
                          type="text"
                          required
                          placeholder="Street Address Line"
                          value={addressForm.line1}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, line1: e.target.value })
                          }
                          className={`${fieldClass} sm:col-span-2`}
                        />
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, city: e.target.value })
                          }
                          className={fieldClass}
                        />
                        <input
                          type="text"
                          required
                          placeholder="Postal / PIN Code"
                          value={addressForm.postalCode}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, postalCode: e.target.value })
                          }
                          className={fieldClass}
                        />
                      </div>
                      <div className="flex justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingAddress(false)}
                          className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-[0.3rem] text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-theme-primary px-5 py-2 rounded-[0.3rem] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 4: Payments Audit                                           */}
            {/* --------------------------------------------------------------- */}
            {activeTab === 'payments' && (
              <section className="blackish-gold-card bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] shadow-xs overflow-hidden">
                <header className="px-6 py-4.5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-secondary)]/70 to-[var(--card-bg)] flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[var(--accent-primary)]" />
                      Payment Transactions &amp; Audit
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Verified transaction logs processed through 256-bit encrypted gateways.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-[0.3rem] border border-[var(--border-subtle)]">
                    {payments.length} Recorded
                  </span>
                </header>

                <div className="p-6">
                  {payments.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        No payment transactions recorded
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                        Once an order is settled, the financial audit trail will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-[0.3rem] overflow-hidden">
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-secondary)]/20 hover:bg-[var(--bg-secondary)]/60 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                                {p.order_number}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-[0.25rem] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                {p.status}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">
                              Gateway: {p.gateway} · {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[var(--text-primary)]">
                            {money(p.amount_paise)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export const ResetPasswordPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const hash = new URLSearchParams(window.location.hash.replace('#', ''));
    const accessToken = hash.get('access_token');
    if (!accessToken) {
      setMessage('Open the reset link from your email.');
      return;
    }
    await api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ accessToken, password }) });
    setMessage('Password updated.');
    onNavigate('/en/login');
  };
  return (
    <form onSubmit={submit} className="max-w-md mx-auto py-16 px-4 grid gap-3">
      <h1 className="font-serif text-5xl text-[var(--text-primary)]" style={{ fontFamily: "'Amithen', cursive" }}>Reset password</h1>
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required className="h-11 px-3 border border-[var(--input-border)] rounded-[0.3rem] bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]" />
      <button className="h-11 btn-theme-primary">Save password</button>
      {message && <p className="text-sm text-[var(--accent-primary)]">{message}</p>}
    </form>
  );
};

export const AuthCallbackPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [message, setMessage] = useState('Confirming Google sign-in…');
  useEffect(() => {
    const finish = async () => {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        setMessage('Google sign-in is not configured.');
        return;
      }
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage('Google did not return a session.');
        return;
      }
      await api('/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        }),
      });
      await api('/cart/merge', { method: 'POST' }).catch(() => undefined);
      window.dispatchEvent(new Event('auth_state_changed'));
      const returnTo = sessionStorage.getItem('vr_return_to');
      sessionStorage.removeItem('vr_return_to');
      if (returnTo && !returnTo.startsWith('/en/login') && !returnTo.startsWith('/en/signup') && !returnTo.startsWith('/en/auth/callback')) {
        onNavigate(returnTo);
      } else {
        onNavigate('/en/account');
      }
    };
    void finish().catch((error) => setMessage(error instanceof Error ? error.message : 'google_failed'));
  }, [onNavigate]);
  return <p className="py-20 text-center text-[var(--text-muted)]">{message}</p>;
};
