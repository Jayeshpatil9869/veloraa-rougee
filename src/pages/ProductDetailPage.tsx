import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { cartService } from '../services/cartService';
import { productService } from '../services/productService';
import { BrandImage } from '../components/ui/BrandImage';
import { ProductCard } from '../components/product/ProductCard';
import { ChevronRight, Plus, Minus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/motion/ScrollReveal';

interface ProductDetailPageProps {
  product: Product;
  initialVariantId?: string;
  onSelectProduct: (product: Product, variantId?: string) => void;
  onNavigate: (path: string) => void;
  onCartUpdated?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  initialVariantId,
  onSelectProduct,
  onNavigate,
  onCartUpdated,
}) => {
  const initialVariant =
    product.variants.find((v) => v.id === initialVariantId) ||
    product.variants.find((v) => v.id === product.defaultVariantId) ||
    product.variants[0];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(initialVariant);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Accordion open states
  const [openStory, setOpenStory] = useState(true);
  const [openHowTo, setOpenHowTo] = useState(false);
  const [openIngredients, setOpenIngredients] = useState(false);

  useEffect(() => {
    document.title = `${product.name} | VELORAA ROUGEE`;
    setSelectedVariant(initialVariant);
    setSelectedImageIndex(0);
    setQuantity(1);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [product, initialVariantId]);

  const allImages = [
    ...(selectedVariant.image ? [{ id: 'var-img', src: selectedVariant.image, alt: selectedVariant.name }] : []),
    ...product.images,
  ];

  const currentImage = allImages[selectedImageIndex] || product.images[0];

  const handleAddToCart = () => {
    cartService.addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    if (onCartUpdated) onCartUpdated();
  };

  const suggestedProducts = productService.getSuggestedProducts(product.id, 4);

  return (
    <div className="w-full bg-white select-none">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-6 lg:py-10">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-semibold text-[#888888] mb-6 uppercase tracking-wider"
        >
          <button onClick={() => onNavigate('/en')} className="hover:text-[#A06A98]">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => onNavigate('/en/collection')} className="hover:text-[#A06A98]">
            Shop
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button
            onClick={() => onNavigate(`/en/collection/${product.categoryId}`)}
            className="hover:text-[#A06A98]"
          >
            {product.categoryName}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#333333] font-bold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Two-Column Purchase Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-16 border-b border-[#E2E8F0]">
          {/* Left Column: Gallery (Cols 1-7) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails list */}
            {allImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:w-20 shrink-0 no-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Product Image ${idx + 1}`}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-brand overflow-hidden border transition-all duration-300 ${
                      selectedImageIndex === idx
                        ? 'border-[#A06A98] scale-105 opacity-100 ring-1 ring-[#A06A98]'
                        : 'border-[#E2E8F0] opacity-85 hover:opacity-100'
                    }`}
                  >
                    <BrandImage
                      src={img.src}
                      alt={img.alt}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image with Smooth Crossfade Gallery */}
            <div className="flex-1 aspect-square rounded-brand overflow-hidden bg-white border border-[#E2E8F0] relative cursor-zoom-in group shadow-xs">
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                    selectedImageIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <BrandImage
                    src={img.src}
                    alt={img.alt || product.name}
                    fallbackLabel={product.name}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Buy Box & Product Info (Cols 8-12) */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#76416F] bg-[#FDF2F8] px-2.5 py-1 rounded-brand inline-block">
                {product.categoryName}
              </span>
              <h1 className="text-3xl lg:text-4xl font-medium leading-tight text-[#A06A98] max-w-[22ch]">
                {product.name}
              </h1>
              <div className="text-2xl font-bold text-[#A06A98] tabular-nums pt-1">
                ₹{selectedVariant.price.toFixed(2)}
              </div>
              <p className="text-sm text-[#666666] leading-relaxed pt-2">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Variant / Shade Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#333333]">
                  <span>{product.optionName || 'Shade'}:</span>
                  <span className="text-[#A06A98] font-semibold text-sm capitalize">
                    {selectedVariant.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(v);
                          if (v.image) setSelectedImageIndex(0);
                        }}
                        title={v.name}
                        aria-label={`Select shade ${v.name}`}
                        className={`w-7 h-7 rounded-full transition-transform duration-200 hover:scale-110 flex items-center justify-center ${
                          isSelected
                            ? 'ring-2 ring-[#A06A98] ring-offset-2 scale-110'
                            : 'border border-slate-300'
                        }`}
                        style={{
                          backgroundColor: v.hexColor || '#A06A98',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Bag */}
            <div className="pt-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E2E8F0] rounded-brand h-12 bg-slate-50 px-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-[#666666] hover:text-[#A06A98]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold tabular-nums text-[#333333]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-[#666666] hover:text-[#A06A98]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-[#A06A98] hover:bg-[#774170] text-[#F8FAFC] text-sm uppercase tracking-tight font-medium rounded-brand transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  {added ? (
                    <span className="flex items-center gap-2 font-bold">
                      <Check className="w-4 h-4" /> ADDED TO BAG
                    </span>
                  ) : (
                    <span>
                      ADD TO BAG ─ <strong className="font-bold">₹{(selectedVariant.price * quantity).toFixed(2)}</strong>
                    </span>
                  )}
                </button>
              </div>

              <div className="text-xs text-[#76416F] bg-[#FDF2F8] p-3 rounded-brand border border-[#F0DEF7] flex items-center justify-center">
                ✨ Free Shipping on orders over ₹999.00
              </div>
            </div>

            {/* Accordions */}
            <div className="divide-y divide-[#E2E8F0] border-t border-b border-[#E2E8F0] pt-2">
              {/* Story */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenStory(!openStory)}
                  className="w-full flex items-center justify-between text-left text-sm font-medium text-[#A06A98] hover:underline"
                >
                  <span className="font-bold">Story</span>
                  {openStory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openStory && (
                  <div className="pt-2 text-xs sm:text-sm text-[#555555] leading-relaxed">
                    <p>{product.story || product.description}</p>
                  </div>
                )}
              </div>

              {/* How to use */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenHowTo(!openHowTo)}
                  className="w-full flex items-center justify-between text-left text-sm font-medium text-[#A06A98] hover:underline"
                >
                  <span className="font-bold">How to use</span>
                  {openHowTo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openHowTo && (
                  <div className="pt-2 text-xs sm:text-sm text-[#555555] leading-relaxed">
                    <p>{product.howToUse || 'Apply as desired to enhance your natural features.'}</p>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenIngredients(!openIngredients)}
                  className="w-full flex items-center justify-between text-left text-sm font-medium text-[#A06A98] hover:underline"
                >
                  <span className="font-bold">Ingredients</span>
                  {openIngredients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openIngredients && (
                  <div className="pt-2 text-xs sm:text-sm text-[#555555] leading-relaxed">
                    {product.ingredients && product.ingredients.length > 0 ? (
                      <p>{product.ingredients.join(', ')}</p>
                    ) : (
                      <p>Formulated with high-grade cosmetic pigments and conditioning waxes.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Products Section */}
        <div className="py-12 lg:py-16 space-y-8">
          <ScrollReveal direction="up" distance={20}>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-[#333333]">
              Suggested Products
            </h2>
          </ScrollReveal>
          <StaggerContainer
            staggerDelay={0.08}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          >
            {suggestedProducts.map((p) => (
              <StaggerItem key={p.id} className="h-full">
                <ProductCard
                  product={p}
                  onSelectProduct={onSelectProduct}
                  onAddedToCart={onCartUpdated}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </div>
  );
};
