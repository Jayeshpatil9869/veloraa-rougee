import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { BrandImage } from '../ui/BrandImage';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';

interface ProductCardProps {
  product: Product;
  initialVariantId?: string;
  onSelectProduct: (product: Product, selectedVariantId?: string) => void;
  onAddedToCart?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  initialVariantId,
  onSelectProduct,
  onAddedToCart,
  className = '',
}) => {
  const defaultVar =
    (initialVariantId
      ? product.variants.find((v) => v.id === initialVariantId || v.databaseId === initialVariantId)
      : undefined) ||
    product.variants.find((v) => v.id === product.defaultVariantId) ||
    product.variants[0];

  const [activeVariant, setActiveVariant] = useState<ProductVariant>(defaultVar);
  const [showAllSwatches, setShowAllSwatches] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(() => wishlistService.isWishlisted(product, activeVariant?.id));

  useEffect(() => {
    if (initialVariantId) {
      const match = product.variants.find((v) => v.id === initialVariantId || v.databaseId === initialVariantId);
      if (match) setActiveVariant(match);
    }
  }, [initialVariantId, product]);

  useEffect(() => {
    const updateWishlist = () => {
      setIsWishlisted(wishlistService.isWishlisted(product, activeVariant?.id));
    };
    updateWishlist();
    window.addEventListener('wishlist_updated', updateWishlist);
    return () => window.removeEventListener('wishlist_updated', updateWishlist);
  }, [product, activeVariant?.id]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    void wishlistService.toggle(product, activeVariant);
  };

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
      className={`group cursor-pointer bg-[var(--card-bg)] text-center flex flex-col justify-between p-2.5 sm:p-3.5 lg:p-4 rounded-brand border border-[var(--border-subtle)] transition-all duration-300 hover:shadow-md hover:border-[var(--border-strong)] ${className}`}
    >
      {/* 1. Product Image Link */}
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--bg-secondary)] mb-1.5 sm:mb-2 rounded-xs">
        {/* Wishlist Heart Button at Top-Right */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? 'bg-[var(--card-bg)] text-[var(--accent-primary)] shadow-sm scale-105 border border-[var(--border-subtle)]'
              : 'bg-[var(--card-bg)]/85 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--card-bg)] hover:scale-110 shadow-2xs border border-[var(--border-subtle)]'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              isWishlisted ? 'fill-[var(--accent-primary)] text-[var(--accent-primary)]' : 'text-current'
            }`}
          />
        </button>
        <BrandImage
          src={activeVariant.image || product.images[0]?.src}
          alt={`${product.name} - ${activeVariant.name}`}
          fallbackLabel={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      {/* 2. Title & Blurb */}
      <div className="space-y-0.5 sm:space-y-1 my-0.5 sm:my-1">
        <h3 className="text-xs sm:text-base font-bold lg:text-lg leading-tight text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="line-clamp-1 text-[10px] sm:text-xs text-[var(--text-muted)] lg:text-sm font-normal">
          {product.shortDescription || product.categoryName}
        </p>
      </div>

      {/* 3. Shade Name Label */}
      <div className="h-4 sm:h-5 flex items-center justify-center my-0.5">
        <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium truncate max-w-[150px] sm:max-w-[200px]">
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
                      ? 'ring-2 ring-[var(--accent-gold)] ring-offset-1 sm:ring-offset-2 scale-105'
                      : 'border border-[var(--border-subtle)]'
                  }`}
                  style={{
                    backgroundColor: variant.hexColor || 'var(--accent-gold)',
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
                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full border border-[var(--border-subtle)] text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] flex items-center justify-center hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
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
          className="w-full h-8 sm:h-9 lg:h-10 btn-theme-primary text-[10px] min-[360px]:text-[11px] sm:text-xs lg:text-sm uppercase tracking-tight rounded-brand font-bold transition-all flex items-center justify-center px-1 sm:px-3 shadow-xs cursor-pointer active:scale-[0.98]"
          aria-label={`Add ${product.name} to cart`}
        >
          {justAdded ? (
            <span className="font-bold">ADDED ✓</span>
          ) : (
            <span className="truncate">
              <span className="hidden min-[380px]:inline">ADD TO BAG ─ </span>
              <span className="inline min-[380px]:hidden">BAG ─ </span>
              <strong className="font-bold">₹{activeVariant.price.toFixed(2)}</strong>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
