import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CategoryId, Product } from '../types';
import { CATEGORIES } from '../data/products';
import { searchService } from '../services/searchService';
import { ProductCard } from '../components/product/ProductCard';
import { BrandImage } from '../components/ui/BrandImage';
import { Filter, SlidersHorizontal, RotateCcw, ChevronDown, Check, Sparkles } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/motion/ScrollReveal';

interface ShopCollectionPageProps {
  currentCategory: CategoryId | 'all';
  onSelectCategory: (categoryId: CategoryId | 'all') => void;
  onSelectProduct: (product: Product, variantId?: string) => void;
  onCartUpdated?: () => void;
}

export const ShopCollectionPage: React.FC<ShopCollectionPageProps> = ({
  currentCategory,
  onSelectCategory,
  onSelectProduct,
  onCartUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Shop All | Veloraa Rougee';
  }, [currentCategory]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { value: 'featured', label: 'Featured Curations' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Alphabetical' },
  ] as const;

  const activeCategoryObj = CATEGORIES.find((c) => c.id === currentCategory);

  // Hero visual mapping
  const heroInfo = useMemo(() => {
    switch (currentCategory) {
      case 'face':
        return {
          title: 'Face',
          kicker: 'Face Formulations & Complexion',
          description: 'High-coverage creamy concealers, velvety blushes, and luminous bronzers.',
        };
      case 'lips':
        return {
          title: 'Lips',
          kicker: 'Lip Ensembles & Liquid Velvets',
          description: 'Precision transfer-proof liners, 12h matte lipsticks, and nourishing glosses.',
        };
      case 'eyes':
        return {
          title: 'Eyes',
          kicker: 'Eye Artistry & Kohl Essentials',
          description: 'Intense kohl kajal, lengthening mascaras, waterproof liners, and glam palettes.',
        };
      case 'brows':
        return {
          title: 'Brows',
          kicker: 'Sculpt & Define Brow Systems',
          description: 'Micro-precision 16H brow pencils and ultra-hold fixing mascaras.',
        };
      case 'bundles':
        return {
          title: 'Special Offers',
          kicker: 'Curated Sets & Exclusive Duos',
          description: 'Curated beauty bundles, exclusive collaborations, and seasonal kits.',
        };
      case 'best-sellers':
        return {
          title: 'Best Sellers',
          kicker: 'Most Loved & Celebrated Icons',
          description: 'Our most-loved formulas celebrated across the globe.',
        };
      default:
        return {
          title: 'Collections',
          kicker: 'Veloraa Rougee Catalog & Curations',
          description: 'Explore the complete VELORAA ROUGEE luxury cosmetic catalog.',
        };
    }
  }, [currentCategory]);

  const filteredProducts = useMemo(() => {
    return searchService.search({
      query: searchQuery,
      category: currentCategory,
      sortBy,
      maxPrice,
    });
  }, [searchQuery, currentCategory, sortBy, maxPrice]);

  const categoryOptions = [
    { id: 'all', label: 'All Collections' },
    { id: 'best-sellers', label: 'Best Sellers' },
    { id: 'face', label: 'Face' },
    { id: 'lips', label: 'Lips' },
    { id: 'eyes', label: 'Eyes' },
    { id: 'brows', label: 'Brows' },
    { id: 'bundles', label: 'Special Offers' },
  ];

  return (
    <div className="w-full bg-[var(--bg-primary)] select-none transition-colors">
      {/* Centered Editorial Masthead Banner (Matching Reference) */}
      <section className="relative w-full bg-[var(--bg-secondary)] py-12 sm:py-14 lg:py-20 border-b border-[var(--border-subtle)] overflow-hidden">
        <ScrollReveal direction="up" blur={true} className="max-w-[1440px] 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-4 lg:px-12 2xl:px-20 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[var(--bg-elevated)]/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] text-[10px] min-[360px]:text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            {heroInfo.kicker}
          </div>
          <h1
            className="font-serif text-5xl sm:text-7xl lg:text-8xl text-[var(--text-primary)] leading-tight"
            style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
          >
            {heroInfo.title}
          </h1>
          <p className="font-sans text-xs sm:text-sm lg:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            {heroInfo.description}
          </p>
        </ScrollReveal>
      </section>

      {/* Main Container */}
      <div className="max-w-[1440px] 2xl:max-w-[1600px] 3xl:max-w-[1800px] mx-auto px-3 min-[400px]:px-4 lg:px-12 2xl:px-20 py-6 sm:py-8 lg:py-12">
        {/* Mobile Toolbar Trigger */}
        <div className="flex lg:hidden items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-6">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-brand text-xs font-bold uppercase tracking-wider"
          >
            <Filter className="w-4 h-4 text-[var(--accent-gold)]" />
            <span>Filters &amp; Categories</span>
          </button>

          <span className="text-xs text-[var(--text-muted)] font-medium">
            {filteredProducts.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar (Cols 1-3) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 pr-6 border-r border-[var(--border-subtle)] sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
            {/* Category Navigation */}
            <div>
              <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                Collections
              </h2>
              <ul className="space-y-1 text-sm font-semibold">
                {categoryOptions.map((opt) => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCategory(opt.id as any)}
                      className={`w-full text-left py-2 px-2.5 rounded-brand transition-colors flex items-center justify-between ${
                        currentCategory === opt.id
                          ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold'
                          : 'text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {currentCategory === opt.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filter by Price */}
            <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Price Filter
              </h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[var(--accent-gold)]"
                />
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>From ₹100</span>
                  <span className="font-bold text-[var(--accent-gold)]">Up to ₹{maxPrice}</span>
                </div>
              </div>
            </div>

            {/* Quick Reset */}
            {(searchQuery || maxPrice < 1000 || sortBy !== 'featured' || currentCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setMaxPrice(1000);
                  setSortBy('featured');
                  onSelectCategory('all');
                }}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-brand hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </aside>

          {/* Mobile Filter Drawer / Collapse */}
          {mobileFilterOpen && (
            <div className="lg:hidden col-span-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-brand space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--text-secondary)]">Filter Collections</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs text-[var(--text-muted)] font-semibold uppercase"
                >
                  Done
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSelectCategory(opt.id as any);
                      setMobileFilterOpen(false);
                    }}
                    className={`py-1.5 px-3 rounded-brand text-xs font-semibold text-left transition-colors ${
                      currentCategory === opt.id
                        ? 'btn-theme-primary font-bold'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Grid Area (Cols 4-12) */}
          <main className="lg:col-span-9 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  Filters
                </h2>
                <span className="text-xs text-[var(--text-muted)]">
                  ({filteredProducts.length} products available)
                </span>
              </div>

              {/* Custom Luxury Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                    Sort:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center justify-between gap-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] rounded-xl text-xs font-bold py-2 px-3.5 text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs min-w-[180px]"
                  >
                    <span className="truncate">
                      {sortOptions.find((opt) => opt.value === sortBy)?.label}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[var(--accent-gold)] transition-transform duration-200 ${
                        sortDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {sortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-elevated)] backdrop-blur-md border border-[var(--border-subtle)] shadow-[0_12px_32px_rgba(0,0,0,0.18)] rounded-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                    {sortOptions.map((opt) => {
                      const isSelected = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors text-left cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold'
                              : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-gold)]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Product Card Grid (2-column on mobile, responsive up to 4 columns on large screens) */}
            {filteredProducts.length > 0 ? (
              <StaggerContainer
                key={`${currentCategory}-${sortBy}-${maxPrice}-${searchQuery}`}
                stagger={0.06}
                className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
              >
                {filteredProducts.map((product) => (
                  <StaggerItem key={product.id}>
                    <ProductCard
                      product={product}
                      onSelectProduct={onSelectProduct}
                      onAddedToCart={onCartUpdated}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="py-20 text-center space-y-3 bg-[var(--bg-secondary)]/50 rounded-brand p-8 border border-dashed border-[var(--border-subtle)]">
                <p className="text-base font-bold text-[var(--text-primary)]">
                  No cosmetics match your current filter settings.
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Try expanding the price range or select "All Collections".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setMaxPrice(1000);
                    onSelectCategory('all');
                  }}
                  className="mt-3 px-5 py-2 btn-theme-primary text-xs font-bold uppercase tracking-wider rounded-brand"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
