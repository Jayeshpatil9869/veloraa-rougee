import React, { useState, useMemo } from 'react';
import { CategoryId, Product } from '../types';
import { CATEGORIES } from '../data/products';
import { searchService } from '../services/searchService';
import { ProductCard } from '../components/product/ProductCard';
import { BrandImage } from '../components/ui/BrandImage';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

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

  const activeCategoryObj = CATEGORIES.find((c) => c.id === currentCategory);

  // Hero visual mapping
  const heroInfo = useMemo(() => {
    switch (currentCategory) {
      case 'face':
        return {
          title: 'Face',
          image: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/collections/3af5c15f3fcbde5e0c08e2fac987e1db.png?v=1701093520',
          description: 'High-coverage creamy concealers, velvety blushes, and luminous bronzers.',
        };
      case 'lips':
        return {
          title: 'Lips',
          image: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/collections/87a3c8adb0ed018995037065d525a732.png?v=1701093474',
          description: 'Precision transfer-proof liners, 12h matte lipsticks, and nourishing glosses.',
        };
      case 'eyes':
        return {
          title: 'Eyes',
          image: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/collections/1b9ceb75ddc74cfca13c79fc3e12ff41.png?v=1701093441',
          description: 'Intense kohl kajal, lengthening mascaras, waterproof liners, and glam palettes.',
        };
      case 'brows':
        return {
          title: 'Brows',
          image: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/collections/64b92ceee7d9780028250bd5.jpg?v=1701093586',
          description: 'Micro-precision 16H brow pencils and ultra-hold fixing mascaras.',
        };
      case 'bundles':
        return {
          title: 'Special Offers',
          image: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/collections/3af5c15f3fcbde5e0c08e2fac987e1db.png?v=1701093520',
          description: 'Curated beauty bundles, exclusive collaborations, and seasonal kits.',
        };
      case 'best-sellers':
        return {
          title: 'Best Sellers',
          image: 'https://cdn.sanity.io/images/03h1hklz/production/fe85aca6f5624d80faa55cc0f2d78172181dd488-1400x800.png',
          description: 'Our most-loved formulas celebrated across the globe.',
        };
      default:
        return {
          title: 'Collections',
          image: 'https://cdn.sanity.io/images/03h1hklz/production/fe85aca6f5624d80faa55cc0f2d78172181dd488-1400x800.png',
          description: 'Explore the complete VELORAA ROUGEE cosmetic catalog.',
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
      {/* Collection Hero Banner */}
      <div className="relative w-full h-[260px] sm:h-[320px] lg:h-[400px] overflow-hidden bg-[#DFBEDB] flex items-center justify-center text-center">
        <BrandImage
          src={heroInfo.image}
          alt={heroInfo.title}
          fallbackLabel={heroInfo.title}
          containerClassName="absolute inset-0 w-full h-full"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-stone-900/40 z-[1]" />

        <div className="relative z-10 px-4 max-w-3xl space-y-2">
          <h1
            className="font-serif text-5xl sm:text-7xl lg:text-9xl text-[#F8FAFC] leading-none drop-shadow-md"
            style={{ fontFamily: "'Alex Brush', 'Cormorant Garamond', serif" }}
          >
            {heroInfo.title}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-white/90 font-medium max-w-xl mx-auto drop-shadow-xs">
            {heroInfo.description}
          </p>
        </div>
      </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Left Sidebar (Cols 1-3) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 pr-6 border-r border-[#E2E8F0]">
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
                  <span>From AED 60</span>
                  <span className="font-bold text-[#A06A98]">Up to AED {maxPrice}</span>
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

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#A06A98]" />
                <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-[#E2E8F0] rounded-brand text-xs font-semibold py-1.5 px-2.5 text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#A06A98]"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Product Card Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={onSelectProduct}
                    onAddedToCart={onCartUpdated}
                  />
                ))}
              </div>
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
