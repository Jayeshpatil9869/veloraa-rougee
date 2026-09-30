import React, { useState } from 'react';
import { STORY_ARTICLES } from '../data/content';
import { StoryArticle, Product } from '../types';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { BrandImage } from '../components/ui/BrandImage';
import { BrandArrow } from '../components/brand/BrandIcons';

interface StoriesPageProps {
  currentArticleSlug?: string;
  onSelectArticle: (article: StoryArticle) => void;
  onSelectProduct: (product: Product) => void;
  onCartUpdated?: () => void;
}

export const StoriesPage: React.FC<StoriesPageProps> = ({
  currentArticleSlug,
  onSelectArticle,
  onSelectProduct,
  onCartUpdated,
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const selectedArticle = currentArticleSlug
    ? STORY_ARTICLES.find((a) => a.slug === currentArticleSlug)
    : null;

  const categories = [
    { id: 'all', label: 'All Stories' },
    { id: 'Featured', label: 'Featured' },
    { id: 'Beauty', label: 'Beauty' },
    { id: 'Makeup', label: 'Makeup' },
  ];

  const filteredArticles = STORY_ARTICLES.filter((a) => {
    if (activeCategory === 'all') return true;
    return a.chips.includes(activeCategory);
  });

  const handleQuickAdd = (product: Product) => {
    cartService.addItem(product, product.variants[0], 1);
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 1500);
    if (onCartUpdated) onCartUpdated();
  };

  return (
    <div className="w-full bg-white select-none">
      {/* Shared Stories Banner */}
      <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[340px] overflow-hidden bg-[#DFBEDB] flex items-center justify-center text-center">
        <BrandImage
          src="https://cdn.sanity.io/images/03h1hklz/production/5f091a27c5b5ff1b72ff2a5c31ae296ec992a3fd-4096x2734.jpg"
          alt="VELORAA ROUGEE Stories Banner"
          fallbackLabel="Stories"
          containerClassName="absolute inset-0 w-full h-full"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-stone-900/40 z-[1]" />
        <h1
          className="relative z-10 font-serif text-5xl sm:text-7xl lg:text-8xl text-[#F8FAFC] leading-none drop-shadow-md"
          style={{ fontFamily: "'Alex Brush', 'Cormorant Garamond', serif" }}
        >
          Stories
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-8 lg:py-16">
        {selectedArticle ? (
          /* Article Detail View */
          <article className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Back button */}
            <button
              onClick={() => onSelectArticle({ slug: '' } as any)}
              className="text-xs font-bold uppercase tracking-wider text-[#A06A98] hover:text-[#774170] flex items-center gap-1.5"
            >
              ← Back to All Stories
            </button>

            {/* Chips */}
            <div className="flex items-center gap-2">
              {selectedArticle.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-brand bg-[#FDF2F8] px-2.5 py-1 text-xs font-bold uppercase text-[#A06A98] border border-[#F0DEF7]"
                >
                  {chip}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#333333] leading-tight">
              {selectedArticle.title}
            </h2>

            {/* Cover Image */}
            <div className="aspect-[12/5] rounded-brand overflow-hidden shadow-xs border border-[#E2E8F0]">
              <BrandImage
                src={selectedArticle.coverImage}
                alt={selectedArticle.title}
                fallbackLabel={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Body Prose */}
            <div className="text-base text-[#444444] leading-[1.8] space-y-5 pt-4">
              {selectedArticle.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Embedded Products */}
            {selectedArticle.linkedProductHandles && selectedArticle.linkedProductHandles.length > 0 && (
              <div className="pt-8 border-t border-[#E2E8F0] space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#A06A98]">
                  Featured in this story:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedArticle.linkedProductHandles.map((handle) => {
                    const prod = productService.getProductBySlug(handle);
                    if (!prod) return null;
                    return (
                      <div
                        key={prod.id}
                        className="p-3 bg-[#FDF2F8]/60 border border-[#DFBEDB]/40 rounded-brand flex gap-3 items-center"
                      >
                        <div className="w-16 h-16 bg-white rounded-brand overflow-hidden shrink-0 border border-slate-200">
                          <BrandImage
                            src={prod.images[0]?.src}
                            alt={prod.name}
                            fallbackLabel={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#333333] truncate">
                            {prod.name}
                          </h4>
                          <span className="text-xs font-bold text-[#A06A98] block">
                            AED {prod.variants[0]?.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => onSelectProduct(prod)}
                              className="text-[11px] font-bold uppercase text-[#A06A98] hover:underline"
                            >
                              View Details
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              onClick={() => handleQuickAdd(prod)}
                              className="text-[11px] font-bold uppercase text-[#76416F] hover:underline"
                            >
                              {addedItem === prod.id ? 'Added ✓' : 'Add to Bag'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </article>
        ) : (
          /* Stories Index View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Categories */}
            <aside className="lg:col-span-3 space-y-6">
              <h2 className="text-lg font-medium text-[#A06A98]">Categories</h2>
              <div className="flex lg:flex-col gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-left py-2 px-3 rounded-brand text-xs font-bold uppercase tracking-wider transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-[#A06A98] text-white'
                        : 'bg-white text-[#555555] hover:bg-[#FDF2F8] border border-[#E2E8F0]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Articles Stream */}
            <main className="lg:col-span-9 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArticles.map((article) => (
                  <article
                    key={article.slug}
                    onClick={() => onSelectArticle(article)}
                    className="group cursor-pointer bg-white rounded-brand border border-[#E2E8F0] overflow-hidden flex flex-col hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-[12/5] w-full overflow-hidden bg-slate-100">
                      <BrandImage
                        src={article.coverImage}
                        alt={article.title}
                        fallbackLabel={article.kicker}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <span className="text-xs uppercase font-bold tracking-widest text-[#A06A98]">
                          {article.kicker}
                        </span>
                        <h3 className="text-xl font-bold text-[#333333] group-hover:text-[#A06A98] transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-xs text-[#666666] line-clamp-2">
                          {article.intro || article.paragraphs[0]}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#888888]">
                        <span>Read Full Story</span>
                        <BrandArrow className="w-4 h-3 text-[#A06A98]" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
