import React from 'react';
import { productService } from '../../services/productService';
import { ProductCard } from '../product/ProductCard';
import { BrandArrow } from '../brand/BrandIcons';
import { Product } from '../../types';

interface BestSellersSectionProps {
  onSelectProduct: (product: Product, variantId?: string) => void;
  onNavigateToBestSellers: () => void;
  onCartUpdated?: () => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({
  onSelectProduct,
  onNavigateToBestSellers,
  onCartUpdated,
}) => {
  const bestSellers = productService.getBestSellers();

  return (
    <section className="px-4 py-8 lg:px-20 lg:py-12 space-y-8 bg-secondary select-none">
      {/* Header Row */}
      <div className="grid grid-cols-3 gap-2 items-end">
        <h2 className="col-span-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#333333]">
          Best Sellers
        </h2>
        <button
          type="button"
          onClick={onNavigateToBestSellers}
          className="justify-self-end text-xs sm:text-sm md:text-base font-extrabold uppercase text-[#A06A98] hover:text-[#774170] transition-colors flex items-center gap-2 group cursor-pointer"
        >
          <span>SHOP ALL</span>
          <BrandArrow />
        </button>
      </div>

      {/* Clean 2-column on mobile, responsive up to 4 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {bestSellers.slice(0, 4).map((product) => (
          <div key={product.id} className="w-full">
            <ProductCard
              product={product}
              onSelectProduct={onSelectProduct}
              onAddedToCart={onCartUpdated}
              className="h-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
