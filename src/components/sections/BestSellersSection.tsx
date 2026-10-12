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
    <section className="max-w-[1440px] 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-3 min-[400px]:px-4 py-8 lg:px-12 2xl:px-20 lg:py-12 space-y-8 bg-[var(--bg-primary)] select-none">
      {/* Header Row with Scroll Reveal */}
      <ScrollReveal direction="up" distance={24}>
        <div className="grid grid-cols-3 gap-2 items-end">
          <h2 className="col-span-2 text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Best Sellers
          </h2>
          <button
            type="button"
            onClick={onNavigateToBestSellers}
            className="justify-self-end text-xs sm:text-sm md:text-base font-extrabold uppercase text-[var(--accent-gold)] hover:text-[var(--accent-rose-gold)] transition-colors flex items-center gap-1.5 sm:gap-2 group cursor-pointer"
          >
            <span>SHOP ALL</span>
            <BrandArrow />
          </button>
        </div>
      </ScrollReveal>

      {/* Clean 2-column on mobile, responsive up to 4 columns on large monitors */}
      <StaggerContainer
        staggerDelay={0.09}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
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

