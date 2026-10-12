import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  Tag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  MapPin,
  User,
  Mail,
  Phone,
  Sparkles,
  ShoppingBag,
  Circle,
} from 'lucide-react';
import { api, hasApi } from '../lib/api';
import { cartService, FREE_SHIPPING_THRESHOLD } from '../services/cartService';
import { CartItem } from '../types';
import { BrandImage } from '../components/ui/BrandImage';
import { ConfettiButton, confetti } from '../registry/magicui/confetti';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

interface SavedAddress {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postal_code: string;
  is_default?: boolean;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<CartItem[]>(() => cartService.getCart());
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<{ email: string; fullName: string } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    couponCode: '',
  });

  // Sync cart items on update
  useEffect(() => {
    const handleCartUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CartItem[]>;
      if (customEvent.detail) {
        setItems(customEvent.detail);
      } else {
        setItems(cartService.getCart());
      }
    };
    window.addEventListener('cart_updated', handleCartUpdate);
    return () => window.removeEventListener('cart_updated', handleCartUpdate);
  }, []);

  // Fetch logged in customer and addresses if available
  useEffect(() => {
    if (!hasApi()) return;

    api<{ customer: { email: string; fullName: string } | null }>('/auth/me')
      .then((res) => {
        if (res.customer) {
          setCustomer(res.customer);
          setForm((prev) => ({
            ...prev,
            email: prev.email || res.customer?.email || '',
            fullName: prev.fullName || res.customer?.fullName || '',
          }));
        }
      })
      .catch(() => undefined);

    api<SavedAddress[]>('/account/addresses')
      .then((addresses) => {
        if (Array.isArray(addresses) && addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
          if (defaultAddr) {
            setSelectedSavedId(defaultAddr.id);
            setForm((prev) => ({
              ...prev,
              fullName: defaultAddr.full_name || prev.fullName,
              phone: defaultAddr.phone || prev.phone,
              line1: defaultAddr.line1 || prev.line1,
              line2: defaultAddr.line2 || '',
              city: defaultAddr.city || prev.city,
              region: defaultAddr.region || prev.region,
              postalCode: defaultAddr.postal_code || prev.postalCode,
            }));
          }
        }
      })
      .catch(() => undefined);
  }, []);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedSavedId(addr.id);
    setForm((prev) => ({
      ...prev,
      fullName: addr.full_name || prev.fullName,
      phone: addr.phone || prev.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      region: addr.region,
      postalCode: addr.postal_code,
    }));
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (selectedSavedId) {
      setSelectedSavedId(null);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const code = couponInput.trim().toUpperCase();
    setForm((prev) => ({ ...prev, couponCode: code }));
    setAppliedCoupon(code);
    setCouponMsg({ text: `Promo code "${code}" applied.`, isError: false });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setForm((prev) => ({ ...prev, couponCode: '' }));
    setCouponMsg(null);
  };

  const handleUpdateQty = (variantId: string, delta: number, currentQty: number) => {
    const next = currentQty + delta;
    cartService.updateQuantity(variantId, next);
  };

  const handleRemoveItem = (variantId: string) => {
    cartService.removeItem(variantId);
  };

  const subtotal = cartService.getSubtotal(items);
  const totalQuantity = cartService.getItemCount(items);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCharge = subtotal > 0 && !isFreeShipping ? 99 : 0;
  const grandTotal = subtotal + shippingCharge;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    if (!hasApi()) {
      setError('Checkout needs the Veloraa API server running.');
      return;
    }

    setPending(true);
    try {
      const result = await api<{
        orderNumber: string;
        viewToken: string;
        amount: number;
        payu: Record<string, string> | null;
      }>('/checkout', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          couponCode: form.couponCode || undefined,
          address: {
            fullName: form.fullName,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            region: form.region || 'India',
            postalCode: form.postalCode,
            country: 'India',
          },
        }),
      });

      sessionStorage.setItem(`vr-order-${result.orderNumber}`, result.viewToken);

      if (paymentMethod === 'cod' || !result.payu) {
        onNavigate(`/en/checkout/return?order=${encodeURIComponent(result.orderNumber)}`);
        return;
      }

      // Automatically construct and submit PayU form
      const payuForm = document.createElement('form');
      payuForm.method = 'POST';
      payuForm.action = result.payu.action;
      for (const [key, value] of Object.entries(result.payu)) {
        if (key === 'action' || value == null) continue;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        payuForm.appendChild(input);
      }
      document.body.appendChild(payuForm);
      payuForm.submit();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'checkout_failed');
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-3 min-[400px]:px-4 sm:px-6 lg:px-8 2xl:px-20 py-6 sm:py-8 lg:py-12 pb-28 lg:pb-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('/en/collection')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Boutique Collection</span>
          </button>
        </div>

        {/* Step Indicator Header */}
        <div className="mb-8 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold tracking-wider uppercase">
            <div className="flex items-center gap-2 text-[var(--accent-gold)]">
              <span className="w-6 h-6 rounded-full bg-[var(--accent-gold)] text-[var(--text-inverse)] flex items-center justify-center text-xs font-bold shadow-xs">
                1
              </span>
              <span>Client &amp; Delivery Information</span>
            </div>
            <div className="w-8 h-[1px] bg-[var(--border-subtle)] hidden sm:block" />
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <span className="w-6 h-6 rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Payment Details</span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4 text-[var(--accent-gold)]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-serif" style={{ fontFamily: "'Amithen', cursive" }}>
              Your Bag is Empty
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto">
              You haven't selected any luxury cosmetics or skincare formulations yet. Browse our iconic collection to curate your look.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/en/collection')}
              className="btn-theme-primary px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all cursor-pointer"
            >
              Explore Boutique Collection
            </button>
          </div>
        ) : (
          /* Two-Column Responsive Checkout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Form Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h1 className="text-3xl sm:text-4xl text-[var(--text-primary)] tracking-wide mb-1.5" style={{ fontFamily: "'Amithen', cursive" }}>
                  Check Out Your Items
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  For a seamless experience, confirm your client details and choose your delivery address before ordering.
                </p>
              </div>

              <form id="checkout-form" onSubmit={submit} className="space-y-6">
                {/* 1. Client Information Card */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-[var(--accent-gold)]" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Client Information
                      </h2>
                    </div>
                    {customer && (
                      <span className="text-[11px] font-semibold text-[var(--accent-gold)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)]">
                        Logged in as {customer.fullName || customer.email.split('@')[0]}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={onChange}
                          placeholder="client@luxury.com"
                          className="w-full h-11 pl-10 pr-3.5 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={form.fullName}
                        onChange={onChange}
                        placeholder="e.g. Mohammad Bilal"
                        className="w-full h-11 px-3.5 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                        Mobile Phone <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={form.phone}
                          onChange={onChange}
                          placeholder="+91 98765 43210"
                          className="w-full h-11 pl-10 pr-3.5 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Address Card */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[var(--accent-gold)]" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Delivery Address
                      </h2>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                      Express Courier India
                    </span>
                  </div>

                  {/* Saved Address Cards if available */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-5 space-y-2.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Select From Saved Addresses:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedSavedId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => handleSelectSavedAddress(addr)}
                              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[var(--accent-gold)] bg-[var(--bg-secondary)] shadow-xs ring-1 ring-[var(--accent-gold)]'
                                  : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-gold)]/60'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                                  {addr.full_name}
                                </span>
                                {isSelected ? (
                                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-[var(--text-muted)] shrink-0 opacity-40" />
                                )}
                              </div>
                              <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                                {addr.line1}, {addr.city}, {addr.region} - {addr.postal_code}
                              </p>
                              <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">{addr.phone}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Address Input Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                        Street Address (Flat / House No, Building, Street) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="line1"
                        required
                        value={form.line1}
                        onChange={onChange}
                        placeholder="e.g. Flat 402, Royal Palms, Linking Road"
                        className="w-full h-11 px-3.5 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                        Apartment, Suite, Landmark <span className="text-[var(--text-muted)] lowercase font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="line2"
                        value={form.line2}
                        onChange={onChange}
                        placeholder="e.g. Near Palladium Mall"
                        className="w-full h-11 px-3.5 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                          City <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={form.city}
                          onChange={onChange}
                          placeholder="Mumbai"
                          className="w-full h-11 px-3.5 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                          State / Region <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="region"
                          required
                          value={form.region}
                          onChange={onChange}
                          placeholder="Maharashtra"
                          className="w-full h-11 px-3.5 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                          Postal Code / PIN <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          required
                          value={form.postalCode}
                          onChange={onChange}
                          placeholder="400050"
                          className="w-full h-11 px-3.5 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method Card (Reference UI) */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-[var(--accent-gold)]" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Payment Method
                      </h2>
                    </div>
                    <span className="text-[11px] text-[var(--accent-gold)] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> 256-bit Secure
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Option A: Online Payment (PayU) */}
                    <div
                      onClick={() => setPaymentMethod('online')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        paymentMethod === 'online'
                          ? 'border-[var(--accent-gold)] bg-[var(--bg-secondary)] shadow-xs ring-1 ring-[var(--accent-gold)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-gold)]/60'
                      }`}
                    >
                      <div className="mt-0.5">
                        {paymentMethod === 'online' ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[var(--accent-gold)] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[var(--border-subtle)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-[var(--text-primary)]">
                            Online Payment (Cards, UPI, Netbanking)
                          </p>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Instant confirmation &amp; priority dispatch via PayU Secure Gateway. Supports Visa, Mastercard, RuPay, UPI (GPay/PhonePe/Paytm), and NetBanking.
                        </p>
                      </div>
                    </div>

                    {/* Option B: Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        paymentMethod === 'cod'
                          ? 'border-[var(--accent-gold)] bg-[var(--bg-secondary)] shadow-xs ring-1 ring-[var(--accent-gold)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-gold)]/60'
                      }`}
                    >
                      <div className="mt-0.5">
                        {paymentMethod === 'cod' ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[var(--accent-gold)] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[var(--border-subtle)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-[var(--text-primary)]">
                            Cash on Delivery (COD)
                          </p>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-muted)]">
                            Doorstep Pay
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Pay directly to our delivery executive in cash or via QR UPI upon receiving your parcel.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <span>⚠️ {error}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column: Order Summary Card (5 Cols, Sticky) */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              <div className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-7 shadow-xs">
                {/* Header */}
                <div className="pb-4 border-b border-[var(--border-subtle)] mb-5">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Current Order</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    The sum of all luxury formulations in your bag
                  </p>
                </div>

                {/* Free Shipping Progress Indicator */}
                <div className="mb-5 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  {isFreeShipping ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-gold)]">
                      <Truck className="w-4 h-4 shrink-0" />
                      <span>Complimentary Luxury Shipping Unlocked!</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1.5">
                        <span>Add ₹{remainingForFreeShipping.toFixed(0)} more for Free Shipping</span>
                        <span className="font-bold font-mono">₹{FREE_SHIPPING_THRESHOLD}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent-gold)] transition-all duration-300 rounded-full"
                          style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="max-h-[320px] overflow-y-auto space-y-4 pr-1 divide-y divide-[var(--border-subtle)] mb-6">
                  {items.map((item) => (
                    <div key={item.variant.id} className="pt-4 first:pt-0 flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden shrink-0">
                        <BrandImage
                          src={item.variant.image || item.product.images[0]?.src}
                          alt={item.product.name}
                          fallbackLabel={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          Shade: <span className="font-medium text-[var(--text-primary)]">{item.variant.name}</span>
                        </p>
                        <p className="text-xs font-bold text-[var(--accent-gold)] tabular-nums mt-0.5">
                          ₹{item.variant.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Stepper & Delete */}
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-secondary)]">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.variant.id, -1, item.quantity)}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums text-[var(--text-primary)]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.variant.id, 1, item.quantity)}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.variant.id)}
                          className="text-[10px] text-[var(--text-muted)] hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="mb-6 pt-4 border-t border-[var(--border-subtle)]">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="VOUCHER OR PROMO CODE"
                        className="w-full h-10 pl-9 pr-3 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-xs uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)] font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 h-10 bg-[var(--bg-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                  {couponMsg && (
                    <div className="mt-2 flex items-center justify-between text-xs text-[var(--accent-gold)]">
                      <span>{couponMsg.text}</span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[10px] underline hover:text-rose-500 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown Calculation */}
                <div className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)] text-xs sm:text-sm">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Subtotal</span>
                    <span className="font-bold tabular-nums text-[var(--text-primary)]">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Items Count</span>
                    <span className="tabular-nums">{totalQuantity}x</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[var(--accent-gold)]">
                      <span>Promo Code ({appliedCoupon})</span>
                      <span className="font-bold">Applied</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Boutique Express Delivery</span>
                    <span>
                      {isFreeShipping ? (
                        <span className="text-[var(--accent-gold)] font-bold uppercase">Free</span>
                      ) : (
                        <span className="font-bold tabular-nums text-[var(--text-primary)]">₹99.00</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Taxes &amp; Duties (GST Included)</span>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                      ₹0.00 (Included)
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-[var(--border-subtle)]">
                    <div>
                      <span className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Total
                      </span>
                      <p className="text-[10px] text-[var(--text-muted)]">Inclusive of all taxes</p>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-[var(--accent-gold)] tabular-nums">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Big Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={pending}
                    className="w-full h-13 btn-theme-primary rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    {pending ? (
                      <span>Placing luxury order…</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[var(--accent-gold)]" />
                        <span>
                          {paymentMethod === 'online' ? `Pay ₹${grandTotal.toFixed(2)}` : 'Confirm COD Order'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Trust Guarantee Badges */}
                <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-3 text-[11px] text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                    <span>100% Authentic Luxury</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                    <span>Complimentary over ₹999</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                    <span>Bank-Grade Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                    <span>Cruelty-Free Formulas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Checkout Bar */}
      {items.length > 0 && (
        <aside
          aria-label="Mobile Checkout Actions"
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--card-bg)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] p-3 px-4 z-40 flex items-center justify-between shadow-[0_-8px_24px_rgba(0,0,0,0.15)]"
        >
          <div className="min-w-0 pr-2">
            <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider truncate">
              Total ({totalQuantity} items)
            </div>
            <div className="text-base font-bold text-[var(--accent-gold)] tabular-nums truncate">
              ₹{grandTotal.toFixed(2)}
            </div>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={pending}
            className="h-11 px-5 btn-theme-primary rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Lock className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>{paymentMethod === 'online' ? `Pay ₹${grandTotal.toFixed(2)}` : 'Place Order'}</span>
          </button>
        </aside>
      )}
    </div>
  );
};

export const CheckoutReturnPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const order = params.get('order') || '';
  const token = sessionStorage.getItem(`vr-order-${order}`) || '';
  const [state, setState] = useState<{
    order_number: string;
    payment_status?: string;
    status?: string;
    total_paise?: number;
    email?: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order || !token || !hasApi()) {
      setLoading(false);
      return;
    }
    api<{ order: { order_number: string; payment_status: string; status: string; total_paise: number; email: string } }>(
      `/orders/lookup?order=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`
    )
      .then((result) => {
        setState(result.order);
        setLoading(false);
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'lookup_failed');
        setLoading(false);
      });
  }, [order, token]);

  // Automatic celebration confetti on successful order confirmation
  useEffect(() => {
    if (!loading && !error) {
      const end = Date.now() + 1.2 * 1000;
      const colors = ['#D1AF92', '#A9755A', '#E6D9CB', '#591215', '#F5EBE0', '#FFD700'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [loading, error]);

  const isPaid = state?.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-16 px-4">
      <div className="max-w-xl mx-auto bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h1 className="text-4xl text-[var(--text-primary)] mb-2" style={{ fontFamily: "'Amithen', cursive" }}>
          Thank You for Your Order
        </h1>
        <p className="text-xs uppercase tracking-widest font-bold text-[var(--accent-gold)] mb-6">
          Order Reference #{order || 'VERIFIED'}
        </p>

        {loading ? (
          <p className="text-sm text-[var(--text-muted)] py-6">Verifying your luxury order status…</p>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm mb-6">
            {error}
          </div>
        ) : (
          <div className="space-y-4 my-6 text-left p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-[var(--text-muted)]">Order Status</span>
              <span className="font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                {state?.status || 'Processing'}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-[var(--text-muted)]">Payment Status</span>
              <span className={`font-bold uppercase tracking-wider ${isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                {state?.payment_status || 'Pending'}
              </span>
            </div>
            {state?.email && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[var(--text-muted)]">Confirmation Sent To</span>
                <span className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">{state.email}</span>
              </div>
            )}
            {state?.total_paise != null && (
              <div className="flex justify-between text-xs sm:text-sm pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Total Amount</span>
                <span className="font-bold text-[var(--accent-gold)] tabular-nums">
                  ₹{((state.total_paise || 0) / 100).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-8">
          <div className="relative">
            <ConfettiButton
              options={{
                get angle() {
                  return Math.random() * 360;
                },
              }}
              className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--accent-gold)] text-[var(--text-inverse)] hover:opacity-90 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <span>Celebrate Order 🎉</span>
            </ConfettiButton>
          </div>
          <button
            type="button"
            onClick={() => (window.location.href = '/en')}
            className="btn-theme-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            Continue Shopping
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = '/en/account')}
            className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--bg-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all cursor-pointer"
          >
            View My Account
          </button>
        </div>
      </div>
    </div>
  );
};

export function ConfettiButtonDemo() {
  return (
    <div className="relative inline-block">
      <ConfettiButton
        options={{
          get angle() {
            return Math.random() * 360;
          },
        }}
        className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--accent-gold)] text-[var(--text-inverse)] hover:opacity-90 transition-all cursor-pointer shadow-md"
      >
        Random Confetti 🎉
      </ConfettiButton>
    </div>
  );
}

