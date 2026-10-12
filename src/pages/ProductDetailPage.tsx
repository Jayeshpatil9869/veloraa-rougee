import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { cartService } from '../services/cartService';
import { productService } from '../services/productService';
import { BrandImage } from '../components/ui/BrandImage';
import { ProductCard } from '../components/product/ProductCard';
import { ProductImageZoom } from '../components/product/ProductImageZoom';
import { ChevronRight, Plus, Minus, Check, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/motion/ScrollReveal';
import { api, hasApi } from '../lib/api';

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
  const [saved, setSaved] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [reviews, setReviews] = useState<{ rating: number; body: string; author: string }[]>([]);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewNote, setReviewNote] = useState('');

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

  useEffect(() => {
    if (!hasApi()) return;
    api<{ rating: number; body: string; author: string }[]>(`/products/${product.slug}/reviews`)
      .then(setReviews)
      .catch(() => setReviews([]));
    api<{ customer: { email: string } | null }>('/auth/me')
      .then(async (result) => {
        setSignedIn(Boolean(result.customer));
        if (!result.customer) return;
        const savedItems = await api<{ variantId: string; databaseVariantId: string }[]>('/account/wishlist');
        const ids = new Set(savedItems.flatMap((item) => [item.variantId, item.databaseVariantId]));
        setSaved(ids.has(selectedVariant.databaseId || '') || ids.has(selectedVariant.id));
      })
      .catch(() => setSignedIn(false));
  }, [product.slug, selectedVariant.id, selectedVariant.databaseId]);

  const toggleWishlist = async () => {
    if (!signedIn) {
      onNavigate('/en/login');
      return;
    }
    const variantId = selectedVariant.databaseId || selectedVariant.id;
    if (saved) {
      await api(`/account/wishlist/${variantId}`, { method: 'DELETE' });
      setSaved(false);
      return;
    }
    await api('/account/wishlist', { method: 'POST', body: JSON.stringify({ variantId }) });
    setSaved(true);
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signedIn) {
      onNavigate('/en/login');
      return;
    }
    setReviewNote('');
    await api('/reviews', {
      method: 'POST',
      body: JSON.stringify({ productSlug: product.slug, rating: stars, body: comment }),
    });
    setComment('');
    setReviewNote('Thank you. Your review is waiting for approval.');
  };

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
    <div className="w-full bg-[var(--bg-primary)] select-none transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-6 lg:py-10">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] mb-6 uppercase tracking-wider"
        >
          <button onClick={() => onNavigate('/en')} className="hover:text-[var(--accent-gold)] transition-colors">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => onNavigate('/en/collection')} className="hover:text-[var(--accent-gold)] transition-colors">
            Shop
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button
            onClick={() => onNavigate(`/en/collection/${product.categoryId}`)}
            className="hover:text-[var(--accent-gold)] transition-colors"
          >
            {product.categoryName}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--text-primary)] font-bold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Two-Column Purchase Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-16 border-b border-[var(--border-subtle)]">
          {/* Left Column: Gallery with Amazon-style Zoom Lens (Cols 1-7) */}
          <div className="lg:col-span-7">
            <ProductImageZoom
              images={allImages}
              selectedIndex={selectedImageIndex}
              onSelectIndex={setSelectedImageIndex}
              productName={product.name}
            />
          </div>

          {/* Right Column: Buy Box & Product Info (Cols 8-12) */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-brand inline-block">
                {product.categoryName}
              </span>
              <h1 className="text-3xl lg:text-4xl font-medium leading-tight text-[var(--text-primary)] max-w-[22ch]">
                {product.name}
              </h1>
              <div className="text-2xl font-bold text-[var(--accent-gold)] tabular-nums pt-1">
                ₹{selectedVariant.price.toFixed(2)}
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed pt-2">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Variant / Shade Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  <span>{product.optionName || 'Shade'}:</span>
                  <span className="text-[var(--accent-gold)] font-semibold text-sm capitalize">
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
                            ? 'ring-2 ring-[var(--accent-gold)] ring-offset-2 scale-110'
                            : 'border border-[var(--border-subtle)]'
                        }`}
                        style={{
                          backgroundColor: v.hexColor || 'var(--accent-gold)',
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
                <div className="flex items-center border border-[var(--border-subtle)] rounded-brand h-12 bg-[var(--bg-secondary)] px-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold tabular-nums text-[var(--text-primary)]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void toggleWishlist()}
                  aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                  className={`h-12 w-12 border rounded-brand flex items-center justify-center transition-colors ${saved ? 'border-[var(--accent-gold)] text-[var(--accent-gold)] bg-[var(--bg-secondary)]' : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--accent-gold)]'}`}
                >
                  <Heart className={`w-5 h-5 ${saved ? 'fill-[var(--accent-gold)]' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-12 btn-theme-primary text-sm uppercase tracking-tight font-bold rounded-brand transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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

              <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-brand border border-[var(--border-subtle)] flex items-center justify-center font-medium">
                ✨ Free Shipping on orders over ₹999.00
              </div>
            </div>

            {/* Accordions */}
            <div className="divide-y divide-[var(--border-subtle)] border-t border-b border-[var(--border-subtle)] pt-2">
              {/* Story */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenStory(!openStory)}
                  className="w-full flex items-center justify-between text-left text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <span className="font-bold">Story</span>
                  {openStory ? <ChevronUp className="w-4 h-4 text-[var(--accent-gold)]" /> : <ChevronDown className="w-4 h-4 text-[var(--accent-gold)]" />}
                </button>
                {openStory && (
                  <div className="pt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    <p>{product.story || product.description}</p>
                  </div>
                )}
              </div>

              {/* How to use */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenHowTo(!openHowTo)}
                  className="w-full flex items-center justify-between text-left text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <span className="font-bold">How to use</span>
                  {openHowTo ? <ChevronUp className="w-4 h-4 text-[var(--accent-gold)]" /> : <ChevronDown className="w-4 h-4 text-[var(--accent-gold)]" />}
                </button>
                {openHowTo && (
                  <div className="pt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    <p>{product.howToUse || 'Apply as desired to enhance your natural features.'}</p>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenIngredients(!openIngredients)}
                  className="w-full flex items-center justify-between text-left text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <span className="font-bold">Ingredients</span>
                  {openIngredients ? <ChevronUp className="w-4 h-4 text-[var(--accent-gold)]" /> : <ChevronDown className="w-4 h-4 text-[var(--accent-gold)]" />}
                </button>
                {openIngredients && (
                  <div className="pt-2 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
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

        <section className="py-12 border-b border-[var(--border-subtle)] grid gap-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Reviews</h2>
          <ul className="grid gap-4">
            {reviews.map((review, index) => (
              <li key={`${review.author}-${index}`} className="text-sm">
                <p className="font-bold text-[var(--accent-gold)]">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} · {review.author}</p>
                <p className="text-[var(--text-muted)] mt-1">{review.body}</p>
              </li>
            ))}
            {reviews.length === 0 && <li className="text-sm text-[var(--text-muted)]/80">No approved reviews yet.</li>}
          </ul>
          <form className="grid gap-3 max-w-xl" onSubmit={(event) => void submitReview(event)}>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => setStars(value)} className={`w-9 h-9 rounded-[0.3rem] border transition-colors ${stars >= value ? 'bg-[var(--accent-gold)] text-[var(--btn-primary-text)] border-[var(--accent-gold)]' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'}`} aria-label={`${value} stars`}>
                  {value}
                </button>
              ))}
            </div>
            <textarea required minLength={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder={signedIn ? 'Share how this shade wore' : 'Sign in to write a review'} className="min-h-24 px-3 py-2 border border-[var(--border-subtle)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-[0.3rem] text-sm focus:border-[var(--accent-gold)] focus:outline-none transition-colors" />
            <button className="h-11 w-fit px-5 btn-theme-primary font-bold rounded-[0.3rem] text-sm cursor-pointer transition-colors">{signedIn ? 'Submit review' : 'Sign in to review'}</button>
            {reviewNote && <p className="text-sm text-[var(--text-secondary)] font-medium">{reviewNote}</p>}
          </form>
        </section>

        {/* Suggested Products Section */}
        <div className="py-12 lg:py-16 space-y-8">
          <ScrollReveal direction="up" distance={20}>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
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
