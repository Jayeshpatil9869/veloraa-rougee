import React, { useEffect, useState } from 'react';
import { api, hasApi } from '../lib/api';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const [customer, setCustomer] = useState<{ email: string; fullName: string; phone: string | null } | null>(null);
  const [orders, setOrders] = useState<{ order_number: string; status: string; total_paise: number; payment_status: string }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasApi()) {
      onNavigate('/en/login');
      return;
    }
    api<{ customer: { email: string; fullName: string; phone: string | null } | null }>('/auth/me')
      .then(async (result) => {
        if (!result.customer) {
          onNavigate('/en/login');
          return;
        }
        setCustomer(result.customer);
        setOrders(await api('/account/orders'));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'account_failed'));
  }, [onNavigate]);

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    onNavigate('/en');
  };

  return (
    <div className="max-w-[960px] mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-5xl" style={{ fontFamily: "'Amithen', cursive" }}>Account</h1>
        <button onClick={logout} className="text-sm font-bold text-[#A06A98]">Log out</button>
      </div>
      {error && <p className="text-[#EF4444]">{error}</p>}
      {customer && <p className="mb-6 text-[#333333]">{customer.fullName || customer.email}</p>}
      <ul className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-[0.3rem]">
        {orders.map((order) => (
          <li key={order.order_number} className="p-4 flex justify-between text-sm">
            <span>{order.order_number}</span>
            <span>{order.status} / {order.payment_status}</span>
            <span>₹{(order.total_paise / 100).toFixed(2)}</span>
          </li>
        ))}
        {orders.length === 0 && <li className="p-4 text-[#666666]">No orders yet.</li>}
      </ul>
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
