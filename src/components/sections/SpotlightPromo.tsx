import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandImage } from '../ui/BrandImage';
import { ProductCard } from '../product/ProductCard';
import { productService } from '../../services/productService';
import { Product } from '../../types';

interface SpotlightPromoProps {
  onSelectProduct: (product: Product, variantId?: string) => void;
  onCartUpdated?: () => void;
}

export const SpotlightPromo: React.FC<SpotlightPromoProps> = ({
  onSelectProduct,
  onCartUpdated,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const lashMascara = productService.getProductBySlug('travel-size-lash-champions-mascara');
  const lipBalm = productService.getProductBySlug('lip-balm');

  const slides = [
    {
      id: 1,
      eyebrow: 'LASH CHAMPION MASCARA TRAVEL SIZE',
      leadText: 'Give your sparse lashes the',
      scriptWords: 'Perfect Definition',
      photo: 'https://cdn.sanity.io/images/03h1hklz/production/92853ba8fbefc02203817721d9e06f7b460f11c0-1440x1440.png',
      product: lashMascara,
    },
    {
      id: 2,
      eyebrow: 'Soft & Hydrated Lips 👄',
      leadText: 'Keep your lips',
      scriptWords: 'hydrated this winter',
      photo: 'https://cdn.sanity.io/images/03h1hklz/production/d15a64facab69c0df3733aa4313045daa191bc13-1200x1200.jpg',
      product: lipBalm,
    },
  ];

  const current = slides[activeSlide];

  return (
    <section className="relative w-full overflow-hidden bg-white select-none">
      {/* Slide Navigation Controls at Top Right */}
      <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          aria-label="Previous spotlight"
          className="w-8 h-8 rounded-full bg-[#A06A98] hover:bg-[#774170] text-[#F8FAFC] flex items-center justify-center shadow-md transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
          aria-label="Next spotlight"
          className="w-8 h-8 rounded-full bg-[#A06A98] hover:bg-[#774170] text-[#F8FAFC] flex items-center justify-center shadow-md transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] lg:min-h-[580px]">
        {/* Photo Column with Copy Overlay */}
        <div className="md:col-span-8 lg:col-span-9 relative min-h-[340px] lg:min-h-[580px] overflow-hidden flex items-end">
          <BrandImage
            src={current.photo}
            alt={current.eyebrow}
            containerClassName="absolute inset-0 w-full h-full"
            className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
          />
          {/* Gradient Overlay for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent z-[1]" />

          {/* Copy Over Photo */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-16 text-white max-w-2xl space-y-2 lg:space-y-4">
            <span className="font-bold text-xs sm:text-sm lg:text-base uppercase tracking-widest text-[#DFBEDB] block">
              {current.eyebrow}
            </span>
            <h3 className="font-bold text-2xl sm:text-3xl lg:text-5xl leading-tight">
              <span>{current.leadText} </span>
              <span
                className="font-serif text-[#DFBEDB] font-normal text-3xl sm:text-4xl lg:text-6xl inline-block ml-1"
                style={{ fontFamily: "'Alex Brush', 'Cormorant Garamond', serif" }}
              >
                {current.scriptWords}
              </span>
            </h3>
          </div>
        </div>

        {/* Product Column */}
        <div className="md:col-span-4 lg:col-span-3 bg-white p-4 sm:p-6 lg:p-8 flex items-center justify-center border-l border-[#E2E8F0]">
          {current.product ? (
            <div className="w-full max-w-xs">
              <ProductCard
                product={current.product}
                onSelectProduct={onSelectProduct}
                onAddedToCart={onCartUpdated}
                className="border-none shadow-none"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
