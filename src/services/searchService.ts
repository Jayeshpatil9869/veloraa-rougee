import { PRODUCTS } from '../data/products';
import { Product } from '../types';

export interface SearchOptions {
  query?: string;
  category?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
  maxPrice?: number;
}

export const searchService = {
  search: (options: SearchOptions): Product[] => {
    let results = [...PRODUCTS];

    if (options.query && options.query.trim().length > 0) {
      const q = options.query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
          p.variants.some((v) => v.name.toLowerCase().includes(q))
      );
    }

    if (options.category && options.category !== 'all') {
      if (options.category === 'best-sellers') {
        results = results.slice(0, 8);
      } else {
        results = results.filter((p) => p.categoryId === options.category);
      }
    }

    if (options.maxPrice && options.maxPrice > 0) {
      results = results.filter((p) => p.variants[0]?.price <= (options.maxPrice || 9999));
    }

    if (options.sortBy) {
      switch (options.sortBy) {
        case 'price-asc':
          results.sort((a, b) => a.variants[0].price - b.variants[0].price);
          break;
        case 'price-desc':
          results.sort((a, b) => b.variants[0].price - a.variants[0].price);
          break;
        case 'name-asc':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'featured':
        default:
          // Keep default curated order
          break;
      }
    }

    return results;
  },
};
