import React, { useState, useEffect } from 'react';
import { Heart, Star } from 'lucide-react';
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
    setTimeout(() => setJustAdded(false), 1400);
    if (onAddedToCart) onAddedToCart();
  };

  return (
    <div
      onClick={() => onSelectProduct(product, activeVariant.id)}
      className={`group cursor-pointer bg-[var(--card-bg)] text-left flex flex-col justify-between p-2.5 sm:p-3.5 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-300 hover:shadow-md relative select-none rounded-none sm:rounded-xs ${className}`}
    >
      <div>
        {/* 1. Image Container with Wishlist & Bottom Shade Label */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#FAF8F5] dark:bg-[#161619] border border-[var(--border-subtle)]/40 mb-2.5 rounded-none flex items-center justify-center">

          {/* Top-Right Wishlist Heart */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isWishlisted
                ? 'bg-[var(--card-bg)] text-[#7B1B29] dark:text-[var(--accent-gold)] shadow-sm scale-105 border border-[var(--border-subtle)]'
                : 'bg-white/90 dark:bg-[#1A1A1E]/90 text-[var(--text-muted)] hover:text-[#7B1B29] dark:hover:text-[var(--accent-gold)] shadow-2xs border border-[var(--border-subtle)] hover:scale-105'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
                isWishlisted ? 'fill-current' : 'text-current'
              }`}
            />
          </button>

          {/* Centered Packshot Image */}
          <div className="w-full h-full flex items-center justify-center p-3 sm:p-4">
            <BrandImage
              src={activeVariant.image || product.images[0]?.src}
              alt={`${product.name} - ${activeVariant.name}`}
              fallbackLabel={product.name}
              className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>

          {/* Bottom Shade Label: appears when user selects an alternate swatch to avoid covering packshot typography */}
          {activeVariant.id !== defaultVar.id && (
            <div className="absolute bottom-2.5 inset-x-2 text-center pointer-events-none transition-all duration-300">
              <span className="inline-block bg-black/80 dark:bg-black/90 text-white text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-xs border border-white/10">
                {activeVariant.name || activeVariant.value}
              </span>
            </div>
          )}
        </div>

        {/* 2. Product Title */}
        <h3 className="text-xs sm:text-[13px] lg:text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 min-h-[34px] group-hover:text-[var(--accent-gold)] transition-colors">
          {product.name}
        </h3>

        {/* 3. Color Swatches */}
        <div className="my-2 flex items-center min-h-[26px]">
          {product.variants.length > 1 ? (
            <div
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 pl-1.5 pr-2 w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {product.variants.map((variant) => {
                const isSelected = activeVariant.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={(e) => handleSwatchClick(variant, e)}
                    title={variant.name}
                    aria-label={`Select shade ${variant.name}`}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0 transition-transform duration-200 hover:scale-110 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[var(--text-primary)] dark:ring-[var(--accent-gold)] ring-offset-1 sm:ring-offset-2 scale-110 shadow-xs'
                        : 'border border-black/15 dark:border-white/20'
                    }`}
                    style={{
                      backgroundColor: variant.hexColor || '#C22032',
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>

        {/* 4. Price Row */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
            Rs. {activeVariant.price}
          </span>
          {activeVariant.compareAtPrice && activeVariant.compareAtPrice > activeVariant.price && (
            <span className="text-xs text-[var(--text-muted)] line-through">
              Rs. {activeVariant.compareAtPrice}
            </span>
          )}
        </div>

        {/* 5. Rating Stars & Review Count */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex items-center text-[#7B1B29] dark:text-[var(--accent-gold)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current text-current" />
            ))}
          </div>
          <span className="text-[11px] sm:text-xs text-[var(--text-muted)] font-normal">
            {product.reviewCount || 48} reviews
          </span>
        </div>
      </div>

      {/* 6. Add To Cart Button */}
      <div className="pt-3 mt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full py-2 sm:py-2.5 px-3 border border-[var(--text-primary)] dark:border-[var(--border-strong)] bg-white dark:bg-transparent text-[var(--text-primary)] dark:text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-white dark:hover:bg-[var(--accent-gold)] dark:hover:text-black dark:hover:border-[var(--accent-gold)] text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-[0.99] rounded-none sm:rounded-xs"
          aria-label={`Add ${product.name} to cart`}
        >
          {justAdded ? (
            <span className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              Added To Cart ✓
            </span>
          ) : (
            <span>Add To Cart</span>
          )}
        </button>
      </div>
    </div>
  );
};
