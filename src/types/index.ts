/**
 * VELORAA ROUGEE — Domain Data Types & Contracts
 */

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  sku?: string;
  image?: string;
  hexColor?: string;
}

export type CategoryId = 'face' | 'lips' | 'eyes' | 'brows' | 'bundles' | 'best-sellers';

export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  image: string;
  description?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  categoryId: CategoryId;
  categoryName: string;
  images: ProductImage[];
  variants: ProductVariant[];
  optionName?: string; // e.g. "Shade", "Color", "Title"
  defaultVariantId?: string;
  ingredients?: string[];
  howToUse?: string;
  story?: string;
  benefits?: string[];
  tags?: string[];
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  id: string; // cart item unique key (variantId)
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface StoryArticle {
  slug: string;
  title: string;
  kicker: string;
  chips: string[];
  coverImage: string;
  date?: string;
  intro?: string;
  paragraphs: string[];
  linkedProductHandles?: string[];
}

export interface StoreLocation {
  id: string;
  name: string;
  cityId: 'nashik' | 'pune' | string;
  mall: string;
  city: string;
  state: string;
  address?: string;
  timing?: string;
  phone?: string;
  mapUrl: string;
}

