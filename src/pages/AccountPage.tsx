import React, { useEffect, useState } from 'react';
import { api, hasApi } from '../lib/api';

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
  line2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface OrderRow {
  order_number: string;
  status: string;
  total_paise: number;
  payment_status: string | null;
  created_at: string;
}

interface OrderDetail {
  order: { order_number: string; status: string; subtotal_paise: number; discount_paise: number; shipping_paise: number; total_paise: number };
  items: { product_name: string; variant_name: string; quantity: number; unit_price_paise: number }[];
  address: { full_name: string; phone: string; line1: string; city: string; postal_code: string } | null;
  payments: { status: string; amount_paise: number; gateway: string; created_at: string }[];
}

interface PaymentRow {
  id: string;
  order_number: string;
  amount_paise: number;
  gateway: string;
  status: string;
  created_at: string;
}

const fieldClass = 'h-11 px-3 border border-[#F0DEF7] rounded-[0.3rem] bg-white text-sm';

function money(paise: number) {
  return `₹${(Number(paise) / 100).toFixed(2)}`;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', line1: '', city: '', postalCode: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const result = await api<{ customer: CustomerProfile | null }>('/auth/me');
    if (!result.customer) {
      onNavigate('/en/login');
      return;
    }
    setCustomer(result.customer);
    setFullName(result.customer.fullName);
    setPhone(result.customer.phone ?? '');
    const [nextAddresses, nextOrders, nextPayments] = await Promise.all([
      api<AddressRow[]>('/account/addresses'),
      api<OrderRow[]>('/account/orders'),
      api<PaymentRow[]>('/account/payments'),
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
    void load().catch((reason) => setError(reason instanceof Error ? reason.message : 'account_failed'));
  }, [onNavigate]);

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    onNavigate('/en');
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    await api('/auth/profile', { method: 'PATCH', body: JSON.stringify({ fullName, phone }) });
    setMessage('Profile saved.');
    await load();
  };

  const addAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    await api('/account/addresses', { method: 'POST', body: JSON.stringify(addressForm) });
    setAddressForm({ fullName: '', phone: '', line1: '', city: '', postalCode: '' });
    await load();
  };

  const removeAddress = async (id: string) => {
    await api(`/account/addresses/${id}`, { method: 'DELETE' });
    await load();
  };

  const openOrder = async (orderNumber: string) => {
    setDetail(await api<OrderDetail>(`/account/orders/${orderNumber}`));
  };

  return (
    <div className="max-w-[960px] mx-auto px-4 py-12 grid gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-5xl text-[#333333]" style={{ fontFamily: "'Amithen', cursive" }}>Account</h1>
        <button onClick={() => void logout()} className="text-sm font-bold text-[#A06A98]">Log out</button>
      </div>
      {error && <p className="text-[#EF4444] text-sm">{error}</p>}
      {message && <p className="text-sm text-[#76416F]">{message}</p>}
      {customer && (
        <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 grid gap-4">
          <div className="flex items-center gap-4">
            {customer.avatarUrl ? (
              <img src={customer.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover border border-[#DFBEDB]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#FDF2F8] border border-[#DFBEDB] grid place-items-center text-[#76416F] font-bold">
                {(customer.fullName || customer.email).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-[#333333]">Profile</h2>
              <p className="text-sm text-[#666666]">{customer.email}</p>
            </div>
          </div>
          <form className="grid sm:grid-cols-2 gap-3" onSubmit={(event) => void saveProfile(event)}>
            <input className={fieldClass} required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Name" />
            <input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" />
            <button className="h-11 bg-[#A06A98] text-white rounded-[0.3rem] text-sm font-medium sm:col-span-2 w-fit px-5">Save profile</button>
          </form>
        </section>
      )}

      <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 grid gap-4">
        <h2 className="text-lg font-bold">Addresses</h2>
        <ul className="grid gap-3">
          {addresses.map((address) => (
            <li key={address.id} className="flex justify-between gap-4 text-sm border border-[#F0DEF7] rounded-[0.3rem] p-3">
              <span>{address.full_name}, {address.line1}, {address.city} {address.postal_code}</span>
              <button className="text-[#EF4444] font-bold shrink-0" onClick={() => void removeAddress(address.id)}>Delete</button>
            </li>
          ))}
          {addresses.length === 0 && <li className="text-sm text-[#666666]">No saved addresses.</li>}
        </ul>
        <form className="grid sm:grid-cols-2 gap-3" onSubmit={(event) => void addAddress(event)}>
          <input className={fieldClass} required placeholder="Full name" value={addressForm.fullName} onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })} />
          <input className={fieldClass} required placeholder="Phone" value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })} />
          <input className={`${fieldClass} sm:col-span-2`} required placeholder="Address line" value={addressForm.line1} onChange={(event) => setAddressForm({ ...addressForm, line1: event.target.value })} />
          <input className={fieldClass} required placeholder="City" value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} />
          <input className={fieldClass} required placeholder="Postal code" value={addressForm.postalCode} onChange={(event) => setAddressForm({ ...addressForm, postalCode: event.target.value })} />
          <button className="h-11 bg-[#FDF2F8] text-[#76416F] border border-[#DFBEDB] rounded-[0.3rem] text-sm font-medium w-fit px-5">Add address</button>
        </form>
      </section>

      <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 grid gap-3">
        <h2 className="text-lg font-bold">Orders</h2>
        <ul className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-[0.3rem]">
          {orders.map((order) => (
            <li key={order.order_number}>
              <button className="w-full p-4 flex justify-between text-sm text-left hover:bg-[#FDF4F9]" onClick={() => void openOrder(order.order_number)}>
                <span className="font-bold text-[#A06A98]">{order.order_number}</span>
                <span>{order.status} / {order.payment_status ?? 'unpaid'}</span>
                <span>{money(order.total_paise)}</span>
              </button>
            </li>
          ))}
          {orders.length === 0 && <li className="p-4 text-sm text-[#666666]">No orders yet.</li>}
        </ul>
        {detail && (
          <div className="text-sm grid gap-2 bg-[#FDF4F9] rounded-[0.3rem] p-4">
            <p className="font-bold">{detail.order.order_number}</p>
            {detail.address && <p>{detail.address.full_name}, {detail.address.line1}, {detail.address.city} {detail.address.postal_code}</p>}
            {detail.items.map((item, index) => (
              <p key={`${item.product_name}-${index}`}>{item.product_name} {item.variant_name} × {item.quantity} — {money(item.unit_price_paise)}</p>
            ))}
            <p>Subtotal {money(detail.order.subtotal_paise)} · Shipping {money(detail.order.shipping_paise)} · Total {money(detail.order.total_paise)}</p>
            {detail.payments.map((payment, index) => (
              <p key={`${payment.created_at}-${index}`}>{payment.gateway} · {payment.status} · {money(payment.amount_paise)}</p>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 grid gap-3">
        <h2 className="text-lg font-bold">Payments</h2>
        <ul className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-[0.3rem]">
          {payments.map((payment) => (
            <li key={payment.id} className="p-4 flex justify-between text-sm">
              <span>{payment.order_number}</span>
              <span>{payment.gateway} · {payment.status}</span>
              <span>{money(payment.amount_paise)}</span>
              <span className="text-[#666666]">{new Date(payment.created_at).toLocaleDateString('en-IN')}</span>
            </li>
          ))}
          {payments.length === 0 && <li className="p-4 text-sm text-[#666666]">No payments yet.</li>}
        </ul>
      </section>

      <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Wishlist</h2>
          <p className="text-sm text-[#666666]">Shades you saved for later.</p>
        </div>
        <button onClick={() => onNavigate('/en/wishlist')} className="h-11 px-5 bg-[#A06A98] text-white rounded-[0.3rem] text-sm font-medium">Open wishlist</button>
      </section>

      <section className="bg-[#FDF2F8] border border-[#DFBEDB] rounded-[0.3rem] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#76416F]">Support</h2>
          <p className="text-sm text-[#666666]">Call the studio if an order needs a hand.</p>
        </div>
        <a href="tel:+919975499040" className="h-11 px-5 inline-flex items-center bg-white border border-[#A06A98] text-[#76416F] rounded-[0.3rem] text-sm font-bold">+91 99754 99040</a>
      </section>
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
      <h1 className="font-serif text-5xl" style={{ fontFamily: "'Amithen', cursive" }}>Reset password</h1>
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required className="h-11 px-3 border border-[#F0DEF7] rounded-[0.3rem]" />
      <button className="h-11 bg-[#A06A98] text-white rounded-[0.3rem]">Save password</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export const AuthCallbackPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [message, setMessage] = useState('Confirming Google sign-in…');
  useEffect(() => {
    const finish = async () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key) {
        setMessage('Google sign-in is not configured.');
        return;
      }
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, key);
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
      await api('/cart/merge', { method: 'POST' });
      onNavigate('/en/account');
    };
    void finish().catch((error) => setMessage(error instanceof Error ? error.message : 'google_failed'));
  }, [onNavigate]);
  return <p className="py-20 text-center text-[#333333]">{message}</p>;
};
