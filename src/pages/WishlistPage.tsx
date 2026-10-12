import React, { useEffect, useState } from 'react';
import { api, hasApi } from '../lib/api';

interface WishlistItem {
  variantId: string;
  databaseVariantId: string;
  shade: string;
  productName: string;
  slug: string;
}

export const WishlistPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [error, setError] = useState('');

  const load = () => {
    api<WishlistItem[]>('/account/wishlist').then(setItems).catch((reason) => {
      const message = reason instanceof Error ? reason.message : 'load_failed';
      if (message === 'unauthorized') onNavigate('/en/login');
      else setError(message);
    });
  };

  useEffect(() => {
    if (!hasApi()) {
      onNavigate('/en/login');
      return;
    }
    load();
  }, [onNavigate]);

  const remove = async (variantId: string) => {
    await api(`/account/wishlist/${variantId}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="max-w-[960px] mx-auto px-4 py-12 grid gap-6 text-[var(--text-primary)]">
      <h1 className="text-5xl text-[var(--text-primary)]" style={{ fontFamily: "'Amithen', cursive" }}>Wishlist</h1>
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
      <ul className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-brand bg-[var(--bg-elevated)]">
        {items.map((item) => (
          <li key={item.databaseVariantId} className="p-4 flex items-center justify-between gap-4 text-sm">
            <button className="text-left" onClick={() => onNavigate(`/en/product/${item.slug}/${item.variantId}`)}>
              <span className="block font-bold text-[var(--text-primary)]">{item.productName}</span>
              <span className="text-[var(--accent-gold)]">{item.shade}</span>
            </button>
            <button className="text-[#EF4444] font-bold" onClick={() => void remove(item.databaseVariantId)}>Remove</button>
          </li>
        ))}
        {items.length === 0 && <li className="p-4 text-[var(--text-muted)]">Your wishlist is empty.</li>}
      </ul>
    </div>
  );
};
