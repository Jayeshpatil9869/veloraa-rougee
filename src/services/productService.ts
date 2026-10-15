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
  getBestSellers: (): Product[] => {
    const priority = ['prod-crimson-vela', 'prod-orchid-rush', 'prod-mocha-ember'];
    return [...products]
      .filter((product) => product.bestseller)
      .sort((a, b) => {
        const idxA = priority.indexOf(a.id);
        const idxB = priority.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      })
      .slice(0, 8);
  },
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
