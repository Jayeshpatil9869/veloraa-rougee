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
    <section className="px-4 py-8 lg:px-20 lg:py-12 space-y-8 bg-[#FDF2F8] lg:pr-0 select-none">
      {/* Header Row */}
      <div className="grid grid-cols-3 gap-2 items-end mr-0 lg:mr-20">
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

      {/* Horizontal Scroll Product Row with Snap */}
      <div className="relative overflow-hidden hover:overflow-x-auto overflow-x-auto pb-4 pt-1 snap-x snap-mandatory flex gap-3 lg:gap-4 no-scrollbar">
        {bestSellers.map((product) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[75vw] sm:w-[45vw] md:w-[32vw] lg:w-[23vw] max-w-sm"
          >
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
