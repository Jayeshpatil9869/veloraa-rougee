import { CartItem, Product, ProductVariant } from '../types';
import { api, hasApi } from '../lib/api';
import { productService } from './productService';

const CART_STORAGE_KEY = 'veloraa_rougee_cart_v1';
export const FREE_SHIPPING_THRESHOLD = 999;

interface RemoteCart {
  items: {
    variantId: string;
    slug: string;
    quantity: number;
    price: number;
    image?: string;
    variantName: string;
    name: string;
    available: number;
  }[];
  subtotal: number;
  freeShippingThreshold: number;
}

let memory: CartItem[] = readLocal();

function readLocal(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? (JSON.parse(data) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function publish(items: CartItem[]) {
  memory = items;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
  window.dispatchEvent(new CustomEvent('cart_updated', { detail: items }));
}

function fromRemote(payload: RemoteCart) {
  const items: CartItem[] = [];
  for (const item of payload.items) {
    const product = productService.getProductBySlug(item.slug);
    const variant = product?.variants.find((entry) => entry.id === item.variantId);
    if (!product || !variant) continue;
    items.push({
      id: variant.id,
      product,
      variant: { ...variant, price: item.price, stock: item.available },
      quantity: item.quantity,
    });
  }
  publish(items);
}

export const cartService = {
  getCart: (): CartItem[] => memory,

  async refresh() {
    if (!hasApi()) {
      publish(readLocal());
      return memory;
    }
    try {
      const remote = await api<RemoteCart>('/cart');
      fromRemote(remote);
    } catch {
      publish(readLocal());
    }
    return memory;
  },

  addItem: (product: Product, variant: ProductVariant, quantity = 1): CartItem[] => {
    const current = [...memory];
    const existing = current.find((item) => item.variant.id === variant.id || item.id === variant.id);
    if (existing) existing.quantity += quantity;
    else current.push({ id: variant.id, product, variant, quantity });
    publish(current);

    if (hasApi()) {
      void api<RemoteCart>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variantId: variant.id, quantity }),
      })
        .then(fromRemote)
        .catch((err) => console.warn('Remote cart item add failed:', err));
    }
    return current;
  },

  updateQuantity: (variantId: string, quantity: number): CartItem[] => {
    const current =
      quantity <= 0
        ? memory.filter((item) => item.variant.id !== variantId && item.id !== variantId)
        : memory.map((item) => (item.variant.id === variantId || item.id === variantId ? { ...item, quantity } : item));
    publish(current);

    if (hasApi()) {
      void api<RemoteCart>(`/cart/items/${encodeURIComponent(variantId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      })
        .then(fromRemote)
        .catch((err) => console.warn('Remote cart quantity update failed:', err));
    }
    return current;
  },

  removeItem: (variantId: string): CartItem[] => {
    const current = memory.filter((item) => item.variant.id !== variantId && item.id !== variantId);
    publish(current);

    if (hasApi()) {
      void api<RemoteCart>(`/cart/items/${encodeURIComponent(variantId)}`, { method: 'DELETE' })
        .then(fromRemote)
        .catch((err) => console.warn('Remote cart item remove failed:', err));
    }
    return current;
  },

  clearCart: (): void => {
    publish([]);
  },

  getSubtotal: (items: CartItem[]): number => items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0),
  getItemCount: (items: CartItem[]): number => items.reduce((count, item) => count + item.quantity, 0),
};
