import { PRODUCTS, CATEGORIES } from '../data/products';
import { Category, CategoryId, Product } from '../types';

export const productService = {
  getProducts: (): Product[] => {
    return [...PRODUCTS];
  },

  getProductBySlug: (slug: string): Product | undefined => {
    return PRODUCTS.find((p) => p.slug === slug);
  },

  getProductById: (id: string): Product | undefined => {
    return PRODUCTS.find((p) => p.id === id);
  },

  getFeaturedProducts: (): Product[] => {
    return PRODUCTS.filter((p) => p.featured);
  },

  getBestSellers: (): Product[] => {
    // 8 items for the Best Sellers row as per the brief
    return PRODUCTS.slice(0, 8);
  },

  getProductsByCategory: (categoryId: CategoryId | 'all'): Product[] => {
    if (categoryId === 'all') return PRODUCTS;
    if (categoryId === 'best-sellers') return PRODUCTS.slice(0, 8);
    return PRODUCTS.filter((p) => p.categoryId === categoryId);
  },

  getCategories: (): Category[] => {
    return [...CATEGORIES];
  },

  getCategoryBySlug: (slug: string): Category | undefined => {
    return CATEGORIES.find((c) => c.slug === slug);
  },

  getSuggestedProducts: (currentProductId: string, limit = 6): Product[] => {
    return PRODUCTS.filter((p) => p.id !== currentProductId).slice(0, limit);
  },
};
