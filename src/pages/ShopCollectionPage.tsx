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
  const [maxPrice, setMaxPrice] = useState<number>(250);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="w-full bg-white select-none">
      {/* Centered Editorial Masthead Banner (Matching Reference) */}
      <section className="relative w-full bg-[#FDF2F8] py-14 lg:py-20 border-b border-[#F0DEF7]/60 overflow-hidden">
        <ScrollReveal direction="up" blur={true} className="max-w-[1440px] mx-auto px-4 lg:px-20 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/85 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#DFBEDB]/40 text-xs font-bold uppercase tracking-widest text-[#76416F] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#A06A98]" />
            {heroInfo.kicker}
          </div>
          <h1
            className="font-serif text-6xl sm:text-7xl lg:text-8xl text-[#333333] leading-tight"
            style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
          >
            {heroInfo.title}
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#666666] max-w-2xl mx-auto leading-relaxed">
            {heroInfo.description}
          </p>
        </ScrollReveal>
      </section>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-8 lg:py-12">
        {/* Mobile Toolbar Trigger */}
        <div className="flex lg:hidden items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-[#FDF2F8] text-[#76416F] rounded-brand text-xs font-bold uppercase tracking-wider"
          >
            <Filter className="w-4 h-4 text-[#A06A98]" />
            <span>Filters &amp; Categories</span>
          </button>

          <span className="text-xs text-[#666666] font-medium">
            {filteredProducts.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar (Cols 1-3) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 pr-6 border-r border-[#E2E8F0] sticky top-24 self-start">
            {/* Category Navigation */}
            <div>
              <h2 className="text-lg font-medium text-[#A06A98] mb-4">
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
                          ? 'bg-[#FDF2F8] text-[#A06A98] font-bold'
                          : 'text-[#444444] hover:text-[#A06A98] hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {currentCategory === opt.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A06A98]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filter by Price */}
            <div className="pt-6 border-t border-[#E2E8F0] space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#333333]">
                Price Filter
              </h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="60"
                  max="220"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#A06A98]"
                />
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span>From ₹60</span>
                  <span className="font-bold text-[#A06A98]">Up to ₹{maxPrice}</span>
                </div>
              </div>
            </div>

            {/* Quick Reset */}
            {(searchQuery || maxPrice < 250 || sortBy !== 'featured' || currentCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setMaxPrice(250);
                  setSortBy('featured');
                  onSelectCategory('all');
                }}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-[#A06A98] hover:text-[#774170] border border-[#F0DEF7] rounded-brand hover:bg-[#FDF2F8] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </aside>

          {/* Mobile Filter Drawer / Collapse */}
          {mobileFilterOpen && (
            <div className="lg:hidden col-span-full p-4 bg-[#FDF2F8]/60 border border-[#F0DEF7] rounded-brand space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#76416F]">Filter Collections</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs text-[#666666] font-semibold uppercase"
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
                    className={`py-1.5 px-3 rounded-brand text-xs font-semibold text-left ${
                      currentCategory === opt.id
                        ? 'bg-[#A06A98] text-white'
                        : 'bg-white text-[#444444] border border-[#E2E8F0]'
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#333333]">
                  Filters
                </h2>
                <span className="text-xs text-[#888888]">
                  ({filteredProducts.length} products available)
                </span>
              </div>

              {/* Custom Luxury Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#666666] uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#A06A98]" />
                    Sort:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center justify-between gap-3 bg-[#FDF2F8]/70 hover:bg-[#FDF2F8] border border-[#F0DEF7] hover:border-[#A06A98] rounded-xl text-xs font-bold py-2 px-3.5 text-[#333333] transition-all cursor-pointer shadow-2xs min-w-[180px]"
                  >
                    <span className="truncate">
                      {sortOptions.find((opt) => opt.value === sortBy)?.label}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#A06A98] transition-transform duration-200 ${
                        sortDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {sortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/98 backdrop-blur-md border border-[#F0DEF7] shadow-[0_12px_32px_rgba(119,65,112,0.12)] rounded-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
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
                              ? 'bg-[#FDF2F8] text-[#A06A98] font-bold'
                              : 'text-[#444444] hover:bg-[#FDF2F8]/60 hover:text-[#A06A98]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#A06A98]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Product Card Grid (2-column on mobile, responsive up to 3 columns) */}
            {filteredProducts.length > 0 ? (
              <StaggerContainer
                key={`${currentCategory}-${sortBy}-${maxPrice}-${searchQuery}`}
                stagger={0.06}
                className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
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
              <div className="py-20 text-center space-y-3 bg-[#FDF2F8]/30 rounded-brand p-8 border border-dashed border-[#DFBEDB]">
                <p className="text-base font-bold text-[#333333]">
                  No cosmetics match your current filter settings.
                </p>
                <p className="text-xs text-[#666666]">
                  Try expanding the price range or select "All Collections".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setMaxPrice(250);
                    onSelectCategory('all');
                  }}
                  className="mt-3 px-5 py-2 bg-[#A06A98] text-white text-xs font-bold uppercase tracking-wider rounded-brand hover:bg-[#774170] transition-colors"
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
