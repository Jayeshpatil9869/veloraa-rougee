import React from 'react';
import { productService } from '../../services/productService';
import { ProductCard } from '../product/ProductCard';
import { BrandArrow } from '../brand/BrandIcons';
import { Product } from '../../types';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../motion/ScrollReveal';

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
      {/* Header Row with Scroll Reveal */}
      <ScrollReveal direction="up" distance={24}>
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
      </ScrollReveal>

      {/* Clean 2-column on mobile, responsive 3 columns on tablet/desktop */}
      <StaggerContainer
        staggerDelay={0.09}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
      >
        {bestSellers.map((product) => (
          <StaggerItem key={product.id} className="w-full h-full">
            <ProductCard
              product={product}
              onSelectProduct={onSelectProduct}
              onAddedToCart={onCartUpdated}
              className="h-full"
            />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
};

