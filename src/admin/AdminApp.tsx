import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const NAV = [
  ['dashboard', 'Dashboard'],
  ['products', 'Products'],
  ['categories', 'Categories'],
  ['orders', 'Orders'],
  ['payments', 'Payments'],
  ['inventory', 'Inventory'],
  ['customers', 'Customers'],
  ['coupons', 'Coupons'],
  ['reviews', 'Reviews'],
  ['stories', 'Stories'],
  ['homepage', 'Homepage'],
  ['locations', 'Locations'],
  ['enquiries', 'Enquiries'],
  ['newsletter', 'Newsletter'],
  ['legal', 'Legal'],
  ['media', 'Media'],
  ['seo', 'SEO'],
  ['activity', 'Activity'],
  ['settings', 'Settings'],
] as const;

type ModuleId = (typeof NAV)[number][0];

export const AdminApp: React.FC<{ path: string; onNavigate: (path: string) => void }> = ({ path, onNavigate }) => {
  const module = (path.split('/')[2] || 'dashboard') as ModuleId;
  const [admin, setAdmin] = useState<{ email: string; roleId: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<unknown>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api<{ admin: { email: string; roleId: string } }>('/admin/auth/me')
      .then((result) => setAdmin(result.admin))
      .catch(() => setAdmin(null));
  }, []);

  useEffect(() => {
    if (!admin) return;
    const source = new EventSource(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/admin/notifications/stream`, { withCredentials: true });
    source.onmessage = () => setUnread((count) => count + 1);
    return () => source.close();
  }, [admin]);

  useEffect(() => {
    if (!admin) return;
    const endpoints: Record<string, string> = {
      dashboard: '/admin/analytics',
      products: '/admin/products',
      categories: '/admin/categories',
      orders: '/admin/orders',
      payments: '/admin/payments',
      inventory: '/admin/inventory',
      customers: '/admin/customers',
      coupons: '/admin/coupons',
      reviews: '/admin/reviews',
      stories: '/admin/stories',
      homepage: '/admin/homepage',
      locations: '/admin/locations',
      enquiries: '/admin/enquiries',
      newsletter: '/admin/newsletter',
      legal: '/admin/legal',
      media: '/admin/media',
      seo: '/admin/seo/issues',
      activity: '/admin/activity',
      settings: '/admin/settings',
    };
    api(endpoints[module] || '/admin/analytics').then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  }, [admin, module]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await api('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      const result = await api<{ admin: { email: string; roleId: string } }>('/admin/auth/me');
      setAdmin(result.admin);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'invalid_credentials';
      setError(message === 'api_unreachable'
        ? 'The store API is not running. Start it with npm run dev:api.'
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
        <form onSubmit={login} className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-[0.3rem] p-6 grid gap-3">
          <h1 className="text-2xl font-bold text-[#333333]">Veloraa admin</h1>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="h-11 px-3 bg-[#FAF5F8] border border-[#F0DEF7] rounded-[0.3rem]" placeholder="Email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="h-11 px-3 bg-[#FAF5F8] border border-[#F0DEF7] rounded-[0.3rem]" placeholder="Password" />
          {error && <p className="text-sm text-[#EF4444]">{error}</p>}
          <button className="h-11 bg-[#A06A98] text-white font-bold rounded-[0.3rem]">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF4F9] text-[#333333] md:grid md:grid-cols-[256px_1fr]">
      <aside className="bg-white border-r border-[#E2E8F0] p-4">
        <p className="font-bold text-[#A06A98] mb-4">Veloraa Rougee</p>
        <nav className="grid gap-1">
          {NAV.map(([id, label]) => (
            <button key={id} onClick={() => onNavigate(`/admin/${id}`)} className={`text-left px-3 py-2 rounded-[0.3rem] text-sm font-bold ${module === id ? 'bg-[#FDF2F8] text-[#76416F]' : ''}`}>
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between">
          <h1 className="font-bold capitalize">{module}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#666666]">{admin.email}</span>
            <button onClick={() => onNavigate('/admin/activity')} className="text-sm font-bold">Notifications {unread}</button>
            <button
              onClick={async () => {
                await api('/admin/auth/logout', { method: 'POST' });
                setAdmin(null);
              }}
              className="text-sm font-bold text-[#A06A98]"
            >
              Log out
            </button>
          </div>
        </header>
        <div className="max-w-[1600px] p-6">
          {error && <p className="text-[#EF4444] mb-4">{error}</p>}
          <RecordView data={data} />
          {module === 'products' && <ProductCreator onCreated={() => onNavigate('/admin/products')} />}
          {module === 'seo' && <SeoEditor />}
        </div>
      </section>
    </div>
  );
};

const ProductCreator: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shades, setShades] = useState([{ name: 'Rose Nude', price: '90', stock: '25' }]);
  const [message, setMessage] = useState('');
  const create = async () => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    await api('/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name,
        slug,
        categorySlug: 'lips',
        description: description || name,
        shortDescription: description || name,
        images: [],
        variants: shades.map((shade, index) => ({
          name: shade.name,
          price: Number(shade.price),
          stock: Number(shade.stock),
          images: [],
          isDefault: index === 0,
        })),
      }),
    });
    setMessage('Product created as a draft.');
    onCreated();
  };
  return (
    <form className="mt-6 grid gap-2 max-w-2xl bg-white border border-[#E2E8F0] rounded-[0.3rem] p-4" onSubmit={(event) => { event.preventDefault(); void create(); }}>
      <h2 className="font-bold">New product</h2>
      <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Product name" className="h-11 px-3 border border-[#E2E8F0] rounded-[0.3rem]" />
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="min-h-24 px-3 py-2 border border-[#E2E8F0] rounded-[0.3rem]" />
      {shades.map((shade, index) => (
        <div key={index} className="grid grid-cols-3 gap-2">
          <input value={shade.name} onChange={(event) => setShades(shades.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} required placeholder="Shade" className="h-11 px-3 border border-[#E2E8F0] rounded-[0.3rem]" />
          <input value={shade.price} onChange={(event) => setShades(shades.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item))} required placeholder="Price ₹" className="h-11 px-3 border border-[#E2E8F0] rounded-[0.3rem]" />
          <input value={shade.stock} onChange={(event) => setShades(shades.map((item, itemIndex) => itemIndex === index ? { ...item, stock: event.target.value } : item))} required placeholder="Stock" className="h-11 px-3 border border-[#E2E8F0] rounded-[0.3rem]" />
        </div>
      ))}
      <button type="button" className="h-10 border border-[#E2E8F0] rounded-[0.3rem]" onClick={() => setShades([...shades, { name: '', price: '90', stock: '25' }])}>Add shade</button>
      <button className="h-11 bg-[#A06A98] text-white rounded-[0.3rem]">Create draft</button>
      {message && <p>{message}</p>}
    </form>
  );
};

function recordsOf(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter((item) => item && typeof item === 'object') as Record<string, unknown>[];
  if (data && typeof data === 'object') {
    const nested = Object.values(data).find((value) => Array.isArray(value));
    if (Array.isArray(nested)) return nested.filter((item) => item && typeof item === 'object') as Record<string, unknown>[];
  }
  return [];
}

const RecordView: React.FC<{ data: unknown }> = ({ data }) => {
  const rows = recordsOf(data);
  if (rows.length === 0) {
    return <p className="text-sm text-[#666666] bg-white border border-[#E2E8F0] rounded-[0.3rem] p-4">No records yet.</p>;
  }
  const columns = Object.keys(rows[0]).filter((key) => ['string', 'number', 'boolean'].includes(typeof rows[0][key]) || rows[0][key] == null).slice(0, 8);
  return (
    <div className="overflow-auto bg-white border border-[#E2E8F0] rounded-[0.3rem]">
      <table className="w-full text-sm">
        <thead className="bg-[#FDF2F8] text-left">
          <tr>{columns.map((column) => <th key={column} className="px-3 py-2 font-bold">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-[#E2E8F0]">
              {columns.map((column) => <td key={column} className="px-3 py-2 align-top">{String(row[column] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SeoEditor: React.FC = () => {
  const [path, setPath] = useState('/en');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [primaryTopic, setPrimaryTopic] = useState('');
  const [message, setMessage] = useState('');
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    await api('/admin/seo/metadata', {
      method: 'PUT',
      body: JSON.stringify({ path, seoTitle, metaDescription, primaryTopic }),
    });
    setMessage('SEO record saved.');
  };
  return (
    <form onSubmit={save} className="mt-6 grid gap-2 max-w-2xl bg-white border border-[#E2E8F0] rounded-[0.3rem] p-4">
      <h2 className="font-bold">Page SEO</h2>
      <input value={path} onChange={(event) => setPath(event.target.value)} required className="h-11 px-3 border border-[#E2E8F0] rounded-[0.3rem]" placeholder="Path" />
      <input value={primaryTopic} onChange={(event) => setPrimaryTopic(event.target.value)} className="h-11 px-3 border border-[#E2E8F0] rounded-[0.3rem]" placeholder="Primary topic" />
      <input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} className="h-11 px-3 border border-[#E2E8F0] rounded-[0.3rem]" placeholder="Title" />
      <textarea value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} className="min-h-24 px-3 py-2 border border-[#E2E8F0] rounded-[0.3rem]" placeholder="Description" />
      <button className="h-11 bg-[#A06A98] text-white rounded-[0.3rem]">Save SEO</button>
      {message && <p>{message}</p>}
    </form>
  );
};
