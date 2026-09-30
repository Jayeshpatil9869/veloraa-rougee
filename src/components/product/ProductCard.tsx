import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { BrandImage } from '../ui/BrandImage';
import { cartService } from '../../services/cartService';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product, selectedVariantId?: string) => void;
  onAddedToCart?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddedToCart,
  className = '',
}) => {
  const defaultVar =
    product.variants.find((v) => v.id === product.defaultVariantId) ||
    product.variants[0];

  const [activeVariant, setActiveVariant] = useState<ProductVariant>(defaultVar);
  const [showAllSwatches, setShowAllSwatches] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleSwatchClick = (variant: ProductVariant, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVariant(variant);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    cartService.addItem(product, activeVariant, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    if (onAddedToCart) onAddedToCart();
  };

  const visibleSwatches = showAllSwatches
    ? product.variants
    : product.variants.slice(0, 5);
  const remainingSwatchesCount = product.variants.length - 5;

  return (
    <div
      onClick={() => onSelectProduct(product, activeVariant.id)}
      className={`group cursor-pointer bg-white text-center flex flex-col justify-between p-2.5 sm:p-3.5 lg:p-4 rounded-brand border border-[#E2E8F0]/50 transition-all duration-300 hover:shadow-md ${className}`}
    >
      {/* 1. Product Image Link */}
      <div className="relative aspect-square w-full overflow-hidden bg-white mb-1.5 sm:mb-2 rounded-xs">
        <BrandImage
          src={activeVariant.image || product.images[0]?.src}
          alt={`${product.name} - ${activeVariant.name}`}
          fallbackLabel={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      {/* 2. Title & Blurb */}
      <div className="space-y-0.5 sm:space-y-1 my-0.5 sm:my-1">
        <h3 className="text-xs sm:text-base font-bold lg:text-lg leading-tight text-[#333333] group-hover:text-[#A06A98] transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="line-clamp-1 text-[10px] sm:text-xs text-[#666666] lg:text-sm font-normal">
          {product.shortDescription || product.categoryName}
        </p>
      </div>

      {/* 3. Shade Name Label */}
      <div className="h-4 sm:h-5 flex items-center justify-center my-0.5">
        <span className="text-[10px] sm:text-xs text-[#666666] font-medium truncate max-w-[150px] sm:max-w-[200px]">
          {activeVariant.name}
        </span>
      </div>

      {/* 4. Swatches */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap min-h-[24px] sm:min-h-[30px] my-0.5 sm:my-1">
        {product.variants.length > 1 && (
          <>
            {visibleSwatches.map((variant) => {
              const isSelected = activeVariant.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={(e) => handleSwatchClick(variant, e)}
                  title={variant.name}
                  aria-label={`Select shade ${variant.name}`}
                  className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full transition-transform duration-200 hover:scale-110 flex items-center justify-center ${
                    isSelected
                      ? 'ring-2 ring-[#A06A98] ring-offset-1 sm:ring-offset-2 scale-105'
                      : 'border border-slate-300/60'
                  }`}
                  style={{
                    backgroundColor: variant.hexColor || '#A06A98',
                  }}
                />
              );
            })}

            {!showAllSwatches && remainingSwatchesCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllSwatches(true);
                }}
                aria-label="View more shades"
                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full border border-slate-300 text-[9px] sm:text-[10px] font-bold text-[#666666] flex items-center justify-center hover:border-[#A06A98] hover:text-[#A06A98] transition-colors"
              >
                +{remainingSwatchesCount}
              </button>
            )}
          </>
        )}
      </div>

      {/* 5. Add to Bag Button */}
      <div className="pt-1.5 sm:pt-2 mt-auto">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full h-8 sm:h-9 lg:h-10 bg-[#A06A98] hover:bg-[#774170] text-[#F8FAFC] text-[10px] sm:text-xs lg:text-sm uppercase tracking-tight rounded-brand font-medium transition-colors flex items-center justify-center px-1.5 sm:px-3"
          aria-label={`Add ${product.name} to cart`}
        >
          {justAdded ? (
            <span className="font-bold">ADDED ✓</span>
          ) : (
            <span className="truncate">
              ADD TO BAG ─ <strong className="font-bold">₹{activeVariant.price.toFixed(2)}</strong>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
