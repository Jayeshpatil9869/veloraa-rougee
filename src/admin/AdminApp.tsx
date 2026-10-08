import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CategoriesModule } from './modules/Categories';
import { CouponsModule } from './modules/Coupons';
import { CustomersModule } from './modules/Customers';
import { Dashboard } from './modules/Dashboard';
import { EnquiriesModule } from './modules/Enquiries';
import { OrdersModule } from './modules/Orders';
import { PaymentsModule } from './modules/Payments';
import { ProductsModule } from './modules/Products';
import { ReviewsModule } from './modules/Reviews';
import { inputClass, Notice, PrimaryButton } from './ui';

const NAV = [
  ['dashboard', 'Dashboard'],
  ['products', 'Products'],
  ['categories', 'Categories'],
  ['orders', 'Orders'],
  ['payments', 'Payments'],
  ['customers', 'Customers'],
  ['coupons', 'Coupons'],
  ['reviews', 'Reviews'],
  ['enquiries', 'Enquiries'],
] as const;

type ModuleId = (typeof NAV)[number][0];

function moduleFromPath(path: string): ModuleId {
  const requested = path.split('/')[2] || 'dashboard';
  const match = NAV.find(([id]) => id === requested);
  return match ? match[0] : 'dashboard';
}

export const AdminApp: React.FC<{ path: string; onNavigate: (path: string) => void }> = ({ path, onNavigate }) => {
  const module = moduleFromPath(path);
  const [admin, setAdmin] = useState<{ email: string; fullName?: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ admin: { email: string; fullName?: string } }>('/admin/auth/me')
      .then((result) => setAdmin(result.admin))
      .catch(() => setAdmin(null));
  }, []);

  useEffect(() => {
    const requested = path.split('/')[2] || 'dashboard';
    if (!NAV.some(([id]) => id === requested)) onNavigate('/admin/dashboard');
  }, [path, onNavigate]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await api('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      const result = await api<{ admin: { email: string } }>('/admin/auth/me');
      setAdmin(result.admin);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'invalid_credentials';
      setError(message === 'api_unreachable'
        ? 'The store API is not running. Start it with pnpm dev.'
        : message === 'database_unconfigured'
          ? 'The store API cannot reach Supabase. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env, then restart the API.'
          : message === 'invalid_credentials'
            ? 'That email or password does not match an admin account.'
            : message);
    }
  };

  if (!admin) {
    return (
      <main className="min-h-screen bg-[#FDF4F9] grid place-items-center px-4">
        <form onSubmit={(event) => void login(event)} className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-[0.3rem] p-6 grid gap-3 shadow-xs">
          <p className="text-4xl text-[#333333]" style={{ fontFamily: "'Amithen', cursive" }}>Welcome</p>
          <h1 className="text-sm font-bold uppercase tracking-wider text-[#76416F]">Veloraa admin</h1>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className={inputClass} placeholder="Email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className={inputClass} placeholder="Password" />
          {error && <Notice>{error}</Notice>}
          <PrimaryButton type="submit">Sign in</PrimaryButton>
        </form>
      </main>
    );
  }

  const title = NAV.find(([id]) => id === module)?.[1] ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-[#FDF4F9] text-[#333333] md:grid md:grid-cols-[256px_1fr]">
      <aside className="bg-white border-r border-[#E2E8F0] p-4 md:min-h-screen">
        <p className="text-3xl text-[#A06A98] mb-1" style={{ fontFamily: "'Amithen', cursive" }}>Veloraa</p>
        <p className="text-xs font-bold uppercase tracking-wider text-[#76416F] mb-6">Rougee studio</p>
        <nav className="grid gap-1">
          {NAV.map(([id, label]) => (
            <button
              key={id}
              onClick={() => onNavigate(`/admin/${id}`)}
              className={`text-left px-3.5 py-2.5 rounded-[0.3rem] text-sm transition-all duration-200 ${module === id ? 'text-[#76416F] bg-[#FDF2F8] border-l-2 border-[#A06A98] font-bold' : 'text-[#666666] font-medium hover:text-[#A06A98] hover:bg-[#FDF2F8]'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <header className="h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#666666]">{admin.email}</span>
            <button
              onClick={async () => {
                await api('/admin/auth/logout', { method: 'POST' });
                setAdmin(null);
              }}
              className="text-sm font-bold text-[#A06A98] hover:text-[#774170] transition-colors"
            >
              Log out
            </button>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto px-6 py-8 lg:px-10 lg:py-10">
          {module === 'dashboard' && <Dashboard onOpenOrder={(id) => onNavigate(`/admin/orders/${id}`)} />}
          {module === 'products' && <ProductsModule />}
          {module === 'categories' && <CategoriesModule />}
          {module === 'orders' && <OrdersModule path={path} onOpen={(id) => onNavigate(`/admin/orders/${id}`)} />}
          {module === 'payments' && <PaymentsModule />}
          {module === 'customers' && <CustomersModule />}
          {module === 'coupons' && <CouponsModule />}
          {module === 'reviews' && <ReviewsModule />}
          {module === 'enquiries' && <EnquiriesModule />}
        </div>
      </section>
    </div>
  );
};
