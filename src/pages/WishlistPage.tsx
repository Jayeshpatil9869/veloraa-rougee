import React, { useEffect, useState } from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { api, hasApi } from '../lib/api';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { wishlistService } from '../services/wishlistService';
import { BrandImage } from '../components/ui/BrandImage';
import { Product } from '../types';

interface WishlistItem {
  variantId: string;
  databaseVariantId: string;
  shade: string;
  productName: string;
  slug: string;
  pricePaise?: number;
  imageUrl?: string;
}

export const WishlistPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api<WishlistItem[]>('/account/wishlist')
      .then((data) => {
        setItems(data);
        setError('');
      })
      .catch((reason) => {
        const message = reason instanceof Error ? reason.message : 'load_failed';
        if (message === 'unauthorized') {
          // If guest, we can match local wishlist IDs from catalog
          const localIds = new Set(wishlistService.getWishlistIds());
          const allProducts = productService.getProducts();
          const guestItems: WishlistItem[] = [];
          for (const p of allProducts) {
            for (const v of p.variants) {
              if (localIds.has(v.id) || (v.databaseId && localIds.has(v.databaseId))) {
                guestItems.push({
                  variantId: v.id,
                  databaseVariantId: v.databaseId || v.id,
                  shade: v.name,
                  productName: p.name,
                  slug: p.slug,
                  imageUrl: v.image || p.images[0]?.src,
                });
              }
            }
          }
          setItems(guestItems);
        } else {
          setError(message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const handleWishlistUpdated = () => {
      load();
    };
    window.addEventListener('wishlist_updated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlist_updated', handleWishlistUpdated);
  }, []);

  const handleRemove = async (variantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await wishlistService.remove(variantId);
    setItems((prev) => prev.filter((i) => i.variantId !== variantId && i.databaseVariantId !== variantId));
  };

  return (
  return (
    <div className="w-full min-h-[calc(100vh-160px)] bg-[var(--bg-primary)] text-[var(--text-primary)] py-10 lg:py-16 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] leading-none"
              style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
            >
              Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 font-medium">
              Your saved beauty curation, favorite formulas, &amp; signature shades.
            </p>
          </div>

          {items.length > 0 && (
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--bg-secondary)] px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] w-fit">
              {items.length} {items.length === 1 ? 'item saved' : 'items saved'}
            </span>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Wishlist Product Cards Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {items.map((item) => {
              const matchedProduct: Product | undefined = productService.getProductBySlug(item.slug);

              if (matchedProduct) {
                return (
                  <ProductCard
                    key={`${item.slug}-${item.variantId}`}
                    product={matchedProduct}
                    onSelectProduct={(p, vId) =>
                      onNavigate(`/en/product/${p.slug}/${vId || item.variantId}`)
                    }
                  />
                );
              }

              // Fallback card if product not found in active catalog
              return (
                <div
                  key={`${item.slug}-${item.variantId}`}
                  onClick={() => onNavigate(`/en/product/${item.slug}/${item.variantId}`)}
                  className="group cursor-pointer bg-[var(--card-bg)] text-center flex flex-col justify-between p-3 sm:p-4 rounded-brand border border-[var(--border-subtle)] transition-all duration-300 hover:shadow-md relative"
                >
                  {/* Top-Right Filled Heart for Wishlist */}
                  <button
                    type="button"
                    onClick={(e) => void handleRemove(item.variantId, e)}
                    aria-label="Remove from wishlist"
                    title="Remove from wishlist"
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[var(--card-bg)] text-[var(--accent-primary)] border border-[var(--border-subtle)] shadow-sm flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
                  </button>

                  <div className="relative aspect-square w-full overflow-hidden bg-[var(--bg-secondary)] mb-2 rounded-xs">
                    <BrandImage
                      src={item.imageUrl || ''}
                      alt={item.productName}
                      fallbackLabel={item.productName}
                      className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-1 my-1">
                    <h3 className="text-xs sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
                      {item.productName}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[var(--accent-primary)] font-medium">
                      {item.shade}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !loading ? (
          /* Empty State */
          <div className="text-center py-16 sm:py-24 max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)]">
              <Heart className="w-8 h-8 text-[var(--accent-primary)]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Your Wishlist is Empty</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Save your favorite shades, lip formulas, and velvety concealers to review or purchase anytime.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/en/collection')}
              className="inline-flex items-center gap-2 px-6 py-3.5 btn-theme-primary rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-20 text-center text-[var(--text-muted)] text-sm">Loading wishlist…</div>
        )}
      </div>
    </div>
  );
};
