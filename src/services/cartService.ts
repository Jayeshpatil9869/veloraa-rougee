import { CartItem, Product, ProductVariant } from '../types';

const CART_STORAGE_KEY = 'veloraa_rougee_cart_v1';
export const FREE_SHIPPING_THRESHOLD = 440; // AED

export const cartService = {
  getCart: (): CartItem[] => {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCart: (items: CartItem[]): void => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('cart_updated', { detail: items }));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  },

  addItem: (product: Product, variant: ProductVariant, quantity = 1): CartItem[] => {
    const current = cartService.getCart();
    const existingIndex = current.findIndex((item) => item.variant.id === variant.id);

    if (existingIndex > -1) {
      current[existingIndex].quantity += quantity;
    } else {
      current.push({
        id: variant.id,
        product,
        variant,
        quantity,
      });
    }

    cartService.saveCart(current);
    return current;
  },

  updateQuantity: (variantId: string, quantity: number): CartItem[] => {
    let current = cartService.getCart();
    if (quantity <= 0) {
      current = current.filter((item) => item.variant.id !== variantId);
    } else {
      current = current.map((item) =>
        item.variant.id === variantId ? { ...item, quantity } : item
      );
    }
    cartService.saveCart(current);
    return current;
  },

  removeItem: (variantId: string): CartItem[] => {
    const current = cartService.getCart().filter((item) => item.variant.id !== variantId);
    cartService.saveCart(current);
    return current;
  },

  clearCart: (): void => {
    cartService.saveCart([]);
  },

  getSubtotal: (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  },

  getItemCount: (items: CartItem[]): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  },
};
