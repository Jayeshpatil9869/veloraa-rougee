import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { cartService } from '../services/cartService';
import { productService } from '../services/productService';
import { BrandImage } from '../components/ui/BrandImage';
import { ProductCard } from '../components/product/ProductCard';
import { ProductImageZoom } from '../components/product/ProductImageZoom';
import { ChevronRight, Plus, Minus, Check, ChevronDown, ChevronUp, Heart, Star, Edit3, Trash2, Zap } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/motion/ScrollReveal';
import { api, hasApi } from '../lib/api';
import { wishlistService } from '../services/wishlistService';

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
  const [buying, setBuying] = useState(false);
  const [saved, setSaved] = useState(() => wishlistService.isWishlisted(product, initialVariant?.id));
  const [signedIn, setSignedIn] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<{ id?: string; customerId?: string; rating: number; body: string; author: string }[]>([]);
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  // Editing state for existing review
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingStars, setEditingStars] = useState(5);
  const [editingComment, setEditingComment] = useState('');

  // Accordion open states
  const [openStory, setOpenStory] = useState(true);
  const [openHowTo, setOpenHowTo] = useState(false);
  const [openIngredients, setOpenIngredients] = useState(false);

  useEffect(() => {
    document.title = `${product.name} | VELORAA ROUGEE`;
    setSelectedVariant(initialVariant);
    setSelectedImageIndex(0);
    setQuantity(1);
    setBuying(false);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [product, initialVariantId]);

  const loadReviews = () => {
    if (!hasApi()) return;
    api<{ id?: string; customerId?: string; rating: number; body: string; author: string }[]>(`/products/${product.slug}/reviews`)
      .then(setReviews)
      .catch(() => setReviews([]));
  };

  useEffect(() => {
    if (!hasApi()) return;
    loadReviews();

    api<{ customer: { id: string; email: string } | null }>('/auth/me')
      .then((result) => {
        setSignedIn(Boolean(result.customer));
        setCurrentCustomerId(result.customer?.id || null);
      })
      .catch(() => {
        setSignedIn(false);
        setCurrentCustomerId(null);
      });
  }, [product.slug]);

  useEffect(() => {
    const updateSaved = () => {
      setSaved(wishlistService.isWishlisted(product, selectedVariant.id));
    };
    updateSaved();
    window.addEventListener('wishlist_updated', updateSaved);
    return () => window.removeEventListener('wishlist_updated', updateSaved);
  }, [product, selectedVariant.id]);

  const toggleWishlist = async () => {
    const next = await wishlistService.toggle(product, selectedVariant);
    setSaved(next);
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signedIn) {
      sessionStorage.setItem('vr_return_to', window.location.pathname);
      onNavigate('/en/login');
      return;
    }
    setReviewNote('');
    try {
      await api('/reviews', {
        method: 'POST',
        body: JSON.stringify({ productSlug: product.slug, rating: stars, body: comment }),
      });
      setComment('');
      setReviewNote('Thank you! Your review has been added.');
      loadReviews();
    } catch (err) {
      setReviewNote(err instanceof Error ? err.message : 'Could not submit review');
    }
  };

  const startEditReview = (review: { id?: string; rating: number; body: string }) => {
    if (!review.id) return;
    setEditingReviewId(review.id);
    setEditingStars(review.rating);
    setEditingComment(review.body);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditingComment('');
  };

  const saveEditReview = async (reviewId: string) => {
    try {
      await api(`/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ rating: editingStars, body: editingComment }),
      });
      setEditingReviewId(null);
      loadReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not update review');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api(`/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      loadReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete review');
    }
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

  const handleBuyNow = () => {
    if (buying) return;
    setBuying(true);
    // Local add + navigate immediately; checkout page syncs the server cart.
    cartService.addItem(product, selectedVariant, quantity);
    if (onCartUpdated) onCartUpdated();
    if (!signedIn) {
      sessionStorage.setItem('vr_return_to', '/en/checkout');
      onNavigate('/en/login');
      return;
    }
    onNavigate('/en/checkout');
  };

  const suggestedProducts = productService.getSuggestedProducts(product.id, 4);

  return (
    <div className="w-full bg-[var(--bg-primary)] select-none transition-colors">
      <div className="max-w-[1440px] 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-3 min-[400px]:px-4 lg:px-12 2xl:px-20 py-6 lg:py-10">
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

            {/* Quantity Selector, Add to Bag & Buy Now */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                <div className="flex items-center border border-[var(--border-subtle)] rounded-brand h-11 sm:h-12 bg-[var(--bg-secondary)] px-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 sm:w-9 text-center text-sm font-bold tabular-nums text-[var(--text-primary)]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void toggleWishlist()}
                  aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                  className={`h-11 sm:h-12 w-11 sm:w-12 shrink-0 border rounded-brand flex items-center justify-center transition-colors cursor-pointer ${
                    saved
                      ? 'border-[var(--accent-gold)] text-[var(--accent-gold)] bg-[var(--bg-secondary)] shadow-xs'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]'
                  }`}
                >
                  <Heart className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-200 active:scale-90 ${saved ? 'fill-[var(--accent-gold)]' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[140px] h-11 sm:h-12 btn-theme-primary text-xs sm:text-sm uppercase tracking-tight font-bold rounded-brand transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  {added ? (
                    <span className="flex items-center gap-1.5 font-bold">
                      <Check className="w-4 h-4" /> ADDED TO BAG
                    </span>
                  ) : (
                    <span className="truncate">
                      ADD TO BAG ─ <strong className="font-bold">₹{(selectedVariant.price * quantity).toFixed(2)}</strong>
                    </span>
                  )}
                </button>
              </div>

              {/* Direct BUY NOW Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={buying}
                aria-busy={buying}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-[#C5A262] via-[#E2C98A] to-[#C5A262] hover:brightness-105 active:scale-[0.99] text-[#121212] font-black text-xs sm:text-sm uppercase tracking-widest rounded-brand transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
              >
                <Zap className="w-4 h-4 fill-current shrink-0" />
                <span>{buying ? 'Opening checkout…' : 'BUY NOW'}</span>
              </button>

              <div className="text-[11px] sm:text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-2.5 sm:p-3 rounded-brand border border-[var(--border-subtle)] flex items-center justify-center font-medium">
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
            {reviews.map((review, index) => {
              const isMyReview = Boolean(currentCustomerId && review.customerId === currentCustomerId);
              const isEditing = editingReviewId === review.id;

              if (isEditing && review.id) {
                return (
                  <li key={review.id} className="p-4 rounded-xl bg-[var(--card-bg)] border-2 border-[var(--accent-primary)] text-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase text-[var(--accent-primary)] tracking-wider">Editing Your Review</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setEditingStars(val)}
                            className="p-0.5 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${val <= editingStars ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={editingComment}
                      onChange={(e) => setEditingComment(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] rounded-lg text-sm focus:border-[var(--focus-ring)] focus:outline-none"
                      placeholder="Update your review..."
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEditReview}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEditReview(review.id!)}
                        className="px-4 py-1.5 rounded-lg btn-theme-primary text-xs font-bold shadow-xs"
                      >
                        Save Changes
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li key={review.id || `${review.author}-${index}`} className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] text-sm relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <Star
                            key={val}
                            className={`w-4 h-4 ${val <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">· {review.author}</span>
                      {isMyReview && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--accent-primary)] border border-[var(--border-subtle)]">
                          You
                        </span>
                      )}
                    </div>
                    {isMyReview && review.id && (
                      <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => startEditReview(review)}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] rounded transition-colors"
                          title="Edit review"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteReview(review.id!)}
                          className="p-1 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[var(--text-secondary)] mt-1 leading-relaxed">{review.body}</p>
                </li>
              );
            })}
            {reviews.length === 0 && <li className="text-sm text-[var(--text-muted)]">No reviews yet. Be the first to share your thoughts!</li>}
          </ul>
          <form className="grid gap-3 max-w-xl" onSubmit={(event) => void submitReview(event)}>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5"
                onMouseLeave={() => setHoverStars(0)}
              >
                {[1, 2, 3, 4, 5].map((value) => {
                  const isFilled = (hoverStars || stars) >= value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStars(value)}
                      onMouseEnter={() => setHoverStars(value)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      aria-label={`${value} stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-400 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
                {hoverStars || stars} / 5 Stars
              </span>
            </div>
            <textarea required minLength={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder={signedIn ? 'Share how this shade wore' : 'Sign in to write a review'} className="min-h-24 px-3 py-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-[0.3rem] text-sm focus:border-[var(--focus-ring)] focus:outline-none transition-colors" />
            <button className="h-11 w-fit px-5 btn-theme-primary rounded-[0.3rem] text-sm font-medium transition-colors">{signedIn ? 'Submit review' : 'Sign in to review'}</button>
            {reviewNote && <p className="text-sm text-[var(--accent-primary)]">{reviewNote}</p>}
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
