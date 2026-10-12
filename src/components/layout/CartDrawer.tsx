import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { cartService, FREE_SHIPPING_THRESHOLD } from '../../services/cartService';
import { CartItem } from '../../types';
import { BrandImage } from '../ui/BrandImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToShop: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigateToShop, onCheckout }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(cartService.getCart());
    refresh();
    window.addEventListener('cart_updated', refresh);
    return () => window.removeEventListener('cart_updated', refresh);
  }, []);

  const subtotal = cartService.getSubtotal(items);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleUpdateQuantity = (variantId: string, delta: number, currentQty: number) => {
    cartService.updateQuantity(variantId, currentQty + delta);
  };

  const handleRemove = (variantId: string) => {
    cartService.removeItem(variantId);
  };

  const handleCheckout = () => {
    onClose();
    onCheckout();
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      {/* Dimmed Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-1000 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)',
        }}
        onClick={onClose}
      />

      {/* Luxury Cart Drawer Panel Expanding Right-to-Left */}
      <div
        data-lenis-prevent
        className="fixed top-0 right-0 h-full bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col z-50 overflow-hidden transition-colors duration-200"
        style={{
          width: isOpen ? 'min(100%, max(360px, 40%))' : '0%',
          transition: 'width 1s cubic-bezier(0.19, 1, 0.22, 1)',
          willChange: 'width',
        }}
      >
        <div className="w-full h-full flex flex-col min-w-[320px] sm:min-w-[380px] min-h-0 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--accent-gold)]" />
              <h2 className="text-base font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Your Bag ({cartService.getItemCount(items)})
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close bag"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Free Shipping Tier Banner */}
        <div className="bg-[var(--bg-secondary)] px-4 sm:px-6 py-3 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            <span>
              {remainingForFreeShipping > 0
                ? `Add ₹${remainingForFreeShipping.toFixed(2)} for FREE Shipping`
                : '🎉 You have unlocked Free Shipping!'}
            </span>
            <span className="tabular-nums font-mono text-[11px]">
              ₹{subtotal.toFixed(2)} / ₹{FREE_SHIPPING_THRESHOLD}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-gold)] transition-all duration-300"
              style={{ width: `${shippingPercent}%` }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        {items.length > 0 ? (
          <div
            data-lenis-prevent
            className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-[var(--border-subtle)] overscroll-contain"
          >
            {items.map((item) => (
              <div key={item.variant.id} className="pt-4 first:pt-0 flex gap-4">
                <div className="w-20 h-20 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-brand overflow-hidden shrink-0">
                  <BrandImage
                    src={item.variant.image || item.product.images[0]?.src}
                    alt={item.product.name}
                    fallbackLabel={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Shade: <span className="font-medium text-[var(--text-primary)]">{item.variant.name}</span>
                    </p>
                    <span className="text-xs font-bold text-[var(--accent-gold)] tabular-nums mt-1 block">
                      ₹{item.variant.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[var(--border-subtle)] rounded-brand bg-[var(--bg-secondary)]">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.variant.id, -1, item.quantity)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold tabular-nums text-[var(--text-primary)]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.variant.id, 1, item.quantity)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.variant.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-[var(--accent-gold)] mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">Your bag is currently empty.</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
              Explore our best-selling lip liners, concealers, and Italian-crafted mascaras.
            </p>
            <button
              onClick={() => {
                onNavigateToShop();
                onClose();
              }}
              className="mt-6 px-6 py-2.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] text-xs font-bold uppercase tracking-wider rounded-brand transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[var(--text-muted)]">Subtotal</span>
              <span className="font-bold text-base text-[var(--text-primary)] tabular-nums">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Standard Courier Shipping</span>
              <span>{subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Calculated at Checkout'}</span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full h-11 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] text-xs font-bold uppercase tracking-wider rounded-brand transition-colors flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              <span>Proceed to Checkout ─ ₹{subtotal.toFixed(2)}</span>
            </button>
          </div>
        )}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
