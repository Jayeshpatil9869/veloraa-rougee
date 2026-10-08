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
    <div className="max-w-[960px] mx-auto px-4 py-12 grid gap-6">
      <h1 className="text-5xl text-[#333333]" style={{ fontFamily: "'Amithen', cursive" }}>Wishlist</h1>
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
      <ul className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-[0.3rem] bg-white">
        {items.map((item) => (
          <li key={item.databaseVariantId} className="p-4 flex items-center justify-between gap-4 text-sm">
            <button className="text-left" onClick={() => onNavigate(`/en/product/${item.slug}/${item.variantId}`)}>
              <span className="block font-bold text-[#333333]">{item.productName}</span>
              <span className="text-[#A06A98]">{item.shade}</span>
            </button>
            <button className="text-[#EF4444] font-bold" onClick={() => void remove(item.databaseVariantId)}>Remove</button>
          </li>
        ))}
        {items.length === 0 && <li className="p-4 text-[#666666]">Your wishlist is empty.</li>}
      </ul>
    </div>
  );
};
