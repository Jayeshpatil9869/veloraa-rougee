import React, { useState } from 'react';
import { api, hasApi } from '../lib/api';
import { cartService } from '../services/cartService';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const items = cartService.getCart();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    region: '',
    postalCode: '',
    couponCode: '',
  });

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!hasApi()) {
      setError('Checkout needs the Veloraa API. Start the server and set VITE_API_URL.');
      return;
    }
    setPending(true);
    try {
      const result = await api<{
        orderNumber: string;
        viewToken: string;
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
            city: form.city,
            region: form.region,
            postalCode: form.postalCode,
            country: 'India',
          },
        }),
      });
      sessionStorage.setItem(`vr-order-${result.orderNumber}`, result.viewToken);
      if (!result.payu) {
        onNavigate(`/en/checkout/return?order=${encodeURIComponent(result.orderNumber)}`);
        return;
      }
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
    <div className="max-w-[960px] mx-auto px-4 py-12">
      <h1 className="font-serif text-5xl text-[#333333] mb-8" style={{ fontFamily: "'Amithen', cursive" }}>Checkout</h1>
      {items.length === 0 ? (
        <p className="text-[#666666]">Your bag is empty.</p>
      ) : (
        <form onSubmit={submit} className="grid gap-4 bg-[#FDF4F9] p-6 rounded-[0.3rem] border border-[#E2E8F0]">
          {(['email', 'fullName', 'phone', 'line1', 'city', 'region', 'postalCode', 'couponCode'] as const).map((field) => (
            <label key={field} className="grid gap-1 text-sm text-[#333333]">
              <span className="font-bold">{field}</span>
              <input name={field} required={field !== 'couponCode' && field !== 'region'} value={form[field]} onChange={onChange} className="h-11 px-3 bg-[#FAF5F8] border border-[#F0DEF7] rounded-[0.3rem]" />
            </label>
          ))}
          {error && <p className="text-[#EF4444] text-sm">{error}</p>}
          <button disabled={pending} className="h-11 bg-[#A06A98] text-white font-bold rounded-[0.3rem]">{pending ? 'Placing order…' : 'Pay with PayU'}</button>
        </form>
      )}
    </div>
  );
};

export const CheckoutReturnPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const order = params.get('order') || '';
  const token = sessionStorage.getItem(`vr-order-${order}`) || '';
  const [state, setState] = React.useState<{ payment_status?: string; status?: string } | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!order || !token || !hasApi()) return;
    api<{ order: { payment_status: string; status: string } }>(`/orders/lookup?order=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`)
      .then((result) => setState(result.order))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'lookup_failed'));
  }, [order, token]);

  return (
    <div className="max-w-[720px] mx-auto px-4 py-16">
      <h1 className="font-serif text-5xl mb-4" style={{ fontFamily: "'Amithen', cursive" }}>Order {order}</h1>
      {error && <p className="text-[#EF4444]">{error}</p>}
      {state && (
        <p className="text-[#333333]">Payment: {state.payment_status}. Order: {state.status}.</p>
      )}
      {!token && <p className="text-[#666666]">Open this page from the same browser that started checkout.</p>}
    </div>
  );
};
