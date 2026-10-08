import { PRODUCTS, CATEGORIES } from '../data/products';
import { Category, CategoryId, Product } from '../types';
import { api, hasApi } from '../lib/api';

let products: Product[] = PRODUCTS;
let categories: Category[] = CATEGORIES;

export async function hydrateCatalog() {
  if (!hasApi()) return;
  const [nextProducts, nextCategories] = await Promise.all([
    api<Product[]>('/products'),
    api<Category[]>('/categories'),
  ]);
  products = nextProducts;
  categories = nextCategories;
}

export const productService = {
  getProducts: (): Product[] => [...products],
  getProductBySlug: (slug: string): Product | undefined => products.find((product) => product.slug === slug),
  getProductById: (id: string): Product | undefined => products.find((product) => product.id === id),
  getFeaturedProducts: (): Product[] => products.filter((product) => product.featured),
  getBestSellers: (): Product[] => products.filter((product) => product.bestseller).slice(0, 8),
  getProductsByCategory: (categoryId: CategoryId | 'all'): Product[] => {
    if (categoryId === 'all') return [...products];
    if (categoryId === 'best-sellers') return products.filter((product) => product.bestseller);
    return products.filter((product) => product.categoryId === categoryId);
  },
  getCategories: (): Category[] => [...categories],
  getCategoryBySlug: (slug: string): Category | undefined => categories.find((category) => category.slug === slug),
  getSuggestedProducts: (currentProductId: string, limit = 6): Product[] =>
    products.filter((product) => product.id !== currentProductId).slice(0, limit),
};
