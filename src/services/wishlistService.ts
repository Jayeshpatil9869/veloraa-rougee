import { Product, ProductVariant } from '../types';
import { api, hasApi } from '../lib/api';

const WISHLIST_STORAGE_KEY = 'veloraa_rougee_wishlist_ids_v1';

class WishlistService {
  private ids: Set<string> = new Set();
  private initialized = false;

  constructor() {
    this.readLocal();
    if (typeof window !== 'undefined') {
      window.addEventListener('auth_state_changed', () => {
        void this.refresh();
      });
    }
  }

  private readLocal(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) {
        this.ids = new Set(JSON.parse(raw));
      }
    } catch {
      this.ids = new Set();
    }
  }

  private saveLocal(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([...this.ids]));
    } catch {
      // ignore
    }
  }

  private notify(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('wishlist_updated', {
        detail: { ids: [...this.ids] },
      }),
    );
  }

  public async refresh(): Promise<Set<string>> {
    this.readLocal();
    if (hasApi()) {
      try {
        const remote = await api<{ variantId: string; databaseVariantId?: string }[]>('/account/wishlist');
        if (Array.isArray(remote)) {
          const remoteIds = new Set<string>();
          for (const item of remote) {
            if (item.variantId) remoteIds.add(item.variantId);
            if (item.databaseVariantId) remoteIds.add(item.databaseVariantId);
          }
          this.ids = remoteIds;
          this.saveLocal();
        }
      } catch {
        // Fallback to local
      }
    }
    this.initialized = true;
    this.notify();
    return this.ids;
  }

  public isWishlisted(product: Product, variantId?: string): boolean {
    if (!this.initialized) {
      this.readLocal();
    }
    const targetVariantId = variantId || product.defaultVariantId || product.variants[0]?.id;
    if (targetVariantId && this.ids.has(targetVariantId)) {
      return true;
    }
    // Also check if any variant of this product is wishlisted
    return product.variants.some((v) => this.ids.has(v.id) || (v.databaseId && this.ids.has(v.databaseId)));
  }

  public isVariantWishlisted(variantId?: string): boolean {
    if (!variantId) return false;
    if (!this.initialized) {
      this.readLocal();
    }
    return this.ids.has(variantId);
  }

  public async toggle(product: Product, variant?: ProductVariant): Promise<boolean> {
    const targetVariant = variant || product.variants.find((v) => v.id === product.defaultVariantId) || product.variants[0];
    if (!targetVariant) return false;

    const variantId = targetVariant.id;
    const isCurrentlyWishlisted = this.isWishlisted(product, variantId);

    if (isCurrentlyWishlisted) {
      // Remove
      this.ids.delete(variantId);
      if (targetVariant.databaseId) this.ids.delete(targetVariant.databaseId);
      // Remove all variants of this product from set
      for (const v of product.variants) {
        this.ids.delete(v.id);
        if (v.databaseId) this.ids.delete(v.databaseId);
      }
      this.saveLocal();
      this.notify();

      if (hasApi()) {
        try {
          await api(`/account/wishlist/${variantId}`, { method: 'DELETE' });
        } catch {
          // ignore
        }
      }
      return false;
    } else {
      // Add
      this.ids.add(variantId);
      if (targetVariant.databaseId) this.ids.add(targetVariant.databaseId);
      this.saveLocal();
      this.notify();

      if (hasApi()) {
        try {
          await api('/account/wishlist', {
            method: 'POST',
            body: JSON.stringify({ variantId }),
          });
        } catch {
          // ignore
        }
      }
      return true;
    }
  }

  public async remove(variantId: string): Promise<void> {
    this.ids.delete(variantId);
    this.saveLocal();
    this.notify();

    if (hasApi()) {
      try {
        await api(`/account/wishlist/${variantId}`, { method: 'DELETE' });
      } catch {
        // ignore
      }
    }
  }

  public getWishlistIds(): string[] {
    if (!this.initialized) {
      this.readLocal();
    }
    return [...this.ids];
  }

  public getCount(): number {
    if (!this.initialized) {
      this.readLocal();
    }
    return this.ids.size;
  }
}

export const wishlistService = new WishlistService();
