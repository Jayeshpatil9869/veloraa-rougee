import React, { useState, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StoryArticle, Product } from '../types';
import { getStoryArticles } from '../services/contentStore';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { BrandImage } from '../components/ui/BrandImage';
import { BrandArrow } from '../components/brand/BrandIcons';
import { Search, Clock, BookOpen, Share2, Check, ArrowLeft, Sparkles, Heart } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/motion/ScrollReveal';

interface StoriesPageProps {
  currentArticleSlug?: string;
  onSelectArticle: (article: StoryArticle) => void;
  onSelectProduct: (product: Product, variantId?: string) => void;
  onCartUpdated?: () => void;
}

export const StoriesPage: React.FC<StoriesPageProps> = ({
  currentArticleSlug,
  onSelectArticle,
  onSelectProduct,
  onCartUpdated,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const selectedArticle = useMemo(() => {
    return currentArticleSlug
      ? getStoryArticles().find((a) => a.slug === currentArticleSlug)
      : null;
  }, [currentArticleSlug]);

  useEffect(() => {
    if (selectedArticle) {
      document.title = `${selectedArticle.title} | Veloraa Rougee Stories`;
    } else {
      document.title = 'Stories & Atelier Journal | Veloraa Rougee';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArticle, currentArticleSlug]);

  const categories = [
    { id: 'all', label: 'All Stories' },
    { id: 'Featured', label: 'Featured' },
    { id: 'Beauty', label: 'Beauty Guides' },
    { id: 'Makeup', label: 'Makeup Trends' },
  ];

  const filteredArticles = useMemo(() => {
    return getStoryArticles().filter((article) => {
      const matchesCategory =
        activeCategory === 'all' || article.chips.includes(activeCategory);
      const matchesSearch =
        searchQuery.trim() === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.paragraphs.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (article.intro && article.intro.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Featured Spotlight story (top article)
  const featuredHeroStory = getStoryArticles()[0];

  const handleQuickAdd = (product: Product) => {
    const variant = product.variants[0];
    if (variant) {
      cartService.addItem(product, variant, 1);
      setAddedItem(product.id);
      setTimeout(() => setAddedItem(null), 2000);
      if (onCartUpdated) onCartUpdated();
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // GSAP Entrance animation
  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.story-fade-in', {
        opacity: 0,
        y: 25,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      });
    }, pageRef);

    return () => ctx.revert();
  }, [selectedArticle, activeCategory]);

  return (
    <div ref={pageRef} className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] select-none transition-colors">
      {selectedArticle ? (
        /* ========================================================================= */
        /*                           ARTICLE DETAIL VIEW                             */
        /* ========================================================================= */
        <article className="max-w-[1440px] mx-auto px-4 lg:px-20 py-8 lg:py-14 animate-in fade-in duration-300">
          {/* Top Breadcrumbs & Back Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] mb-8">
            <button
              onClick={() => onSelectArticle({ slug: '' } as any)}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1.5 px-3 rounded-brand bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to all stories
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors py-1.5 px-3 rounded-brand border border-[var(--border-subtle)] bg-[var(--card-bg)]"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Story</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Chips & Metadata */}
            <div className="flex flex-wrap items-center gap-2.5">
              {selectedArticle.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-brand bg-[var(--bg-secondary)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                >
                  {chip}
                </span>
              ))}
              <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                3 MIN READ
              </span>
              <span className="text-xs text-[var(--text-muted)]">·</span>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {selectedArticle.date || 'Beauty Editorial'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-[var(--text-primary)] leading-tight">
              {selectedArticle.title}
            </h1>

            {/* Intro Lead Paragraph */}
            {selectedArticle.intro && (
              <p className="text-lg sm:text-xl text-[var(--text-muted)] font-normal leading-relaxed border-l-2 border-[var(--accent-primary)] pl-4 italic">
                {selectedArticle.intro}
              </p>
            )}

            {/* Big Cinematic Cover Visual */}
            <div className="aspect-[16/8] sm:aspect-[16/7] w-full rounded-brand overflow-hidden shadow-xs border border-[var(--border-subtle)] relative bg-[var(--bg-secondary)]">
              <BrandImage
                src={selectedArticle.coverImage}
                alt={selectedArticle.title}
                fallbackLabel={selectedArticle.title}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Body Prose Content */}
            <div className="text-base sm:text-lg text-[var(--text-primary)] leading-[1.85] space-y-6 pt-4 font-sans">
              {selectedArticle.paragraphs.map((p, i) => (
                <p key={i} className="text-[var(--text-primary)]">
                  {p}
                </p>
              ))}
            </div>

            {/* Embedded Featured Products in this Story */}
            {selectedArticle.linkedProductHandles && selectedArticle.linkedProductHandles.length > 0 && (
              <section
                aria-label="Featured Products"
                className="pt-10 mt-12 border-t border-[var(--border-subtle)] space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-brand border border-[var(--border-subtle)] inline-block mb-1">
                      Shop The Look
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                      Featured in this story
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {selectedArticle.linkedProductHandles.map((handle) => {
                    const prod = productService.getProductBySlug(handle);
                    if (!prod) return null;
                    return (
                      <div
                        key={prod.id}
                        className="group bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--border-subtle)] rounded-brand p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-sm"
                      >
                        <div className="flex gap-3.5 items-center">
                          <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-brand overflow-hidden shrink-0 border border-[var(--border-subtle)] relative">
                            <BrandImage
                              src={prod.images[0]?.src}
                              alt={prod.name}
                              fallbackLabel={prod.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                              {prod.categoryName}
                            </span>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors">
                              {prod.name}
                            </h4>
                            <span className="text-xs font-bold text-[var(--accent-primary)] block mt-1">
                              ₹{prod.variants[0]?.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-[var(--border-subtle)]">
                          <button
                            type="button"
                            onClick={() => onSelectProduct(prod)}
                            className="flex-1 py-1.5 px-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] rounded-brand border border-[var(--border-subtle)] transition-colors text-center"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(prod)}
                            className="flex-1 py-1.5 px-2 btn-theme-primary text-[11px] font-bold uppercase tracking-wider rounded-brand text-center"
                          >
                            {addedItem === prod.id ? 'Added ✓' : 'Add to Bag'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Read More Stories Recommendation Bar */}
            <div className="pt-12 mt-12 border-t border-[var(--border-subtle)] space-y-6">
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                Continue Reading
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getStoryArticles().filter((a) => a.slug !== selectedArticle.slug)
                  .slice(0, 3)
                  .map((article) => (
                    <div
                      key={article.slug}
                      onClick={() => onSelectArticle(article)}
                      className="group cursor-pointer bg-[var(--card-bg)] rounded-brand border border-[var(--border-subtle)] overflow-hidden flex flex-col hover:border-[var(--border-strong)] hover:shadow-md transition-all duration-300"
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-[var(--bg-secondary)] relative">
                        <BrandImage
                          src={article.coverImage}
                          alt={article.title}
                          fallbackLabel={article.kicker}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                          {article.kicker}
                        </span>
                        <h4 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>Read Story</span>
                          <BrandArrow className="w-4 h-3 text-[var(--accent-primary)] transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </article>
      ) : (
        /* ========================================================================= */
        /*                           STORIES INDEX VIEW                              */
        /* ========================================================================= */
        <div>
          {/* 1. Masthead Editorial Hero */}
          <section className="relative w-full bg-[var(--bg-secondary)] py-14 lg:py-20 border-b border-[var(--border-subtle)] overflow-hidden transition-colors">
            <ScrollReveal direction="up" blur={true} className="max-w-[1440px] mx-auto px-4 lg:px-20 text-center relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[var(--card-bg)] backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                Veloraa Rougee Atelier &amp; Editorial
              </div>
              <h1
                className="font-serif text-6xl sm:text-7xl lg:text-8xl text-[var(--text-primary)] leading-tight"
                style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
              >
                Stories
              </h1>
              <p className="font-sans text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                Expert tips, formulation secrets, trend forecasts, and step-by-step masterclasses curated by our beauty artisans.
              </p>
            </ScrollReveal>
          </section>

          {/* 2. Main Body Container */}
          <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-10 lg:py-16 space-y-12">
            {/* Top Spotlight / Featured Hero Article (When no active search/filter) */}
            {activeCategory === 'all' && searchQuery.trim() === '' && featuredHeroStory && (
              <ScrollReveal direction="up" blur={true} duration={0.7}>
                <div
                  onClick={() => onSelectArticle(featuredHeroStory)}
                  className="group cursor-pointer bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] rounded-brand border border-[var(--border-subtle)] overflow-hidden transition-all duration-300 hover:shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 p-4 sm:p-6 lg:p-8 items-center"
                >
                <div className="lg:col-span-7 aspect-[16/10] sm:aspect-[16/9] w-full rounded-brand overflow-hidden bg-[var(--bg-secondary)] relative shadow-xs">
                  <BrandImage
                    src={featuredHeroStory.coverImage}
                    alt={featuredHeroStory.title}
                    fallbackLabel={featuredHeroStory.title}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-[var(--accent-primary)] text-[var(--button-primary-text)] text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-brand shadow-xs">
                    Editor&apos;s Spotlight
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-brand border border-[var(--border-subtle)]">
                        {featuredHeroStory.kicker}
                      </span>
                      <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        4 MIN READ
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-snug">
                      {featuredHeroStory.title}
                    </h2>

                    <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed line-clamp-3">
                      {featuredHeroStory.intro || featuredHeroStory.paragraphs[0]}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 btn-theme-primary text-xs font-bold uppercase tracking-wider rounded-brand">
                      Read Editorial Story
                      <BrandArrow className="w-4 h-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
              </ScrollReveal>
            )}

            {/* Filter Pill Tabs & Search Controls */}
            <ScrollReveal direction="up" delay={0.08}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-b border-[var(--border-subtle)]">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
                  {categories.map((cat) => {
                    const count =
                      cat.id === 'all'
                        ? getStoryArticles().length
                        : getStoryArticles().filter((a) => a.chips.includes(cat.id)).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-brand text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                          activeCategory === cat.id
                            ? 'bg-[var(--accent-primary)] text-[var(--button-primary-text)] shadow-xs'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                        }`}
                      >
                        {cat.label}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            activeCategory === cat.id
                              ? 'bg-black/15 text-current'
                              : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles & tips..."
                    className="w-full pl-9 pr-4 py-2 bg-[var(--input-bg)] rounded-brand border border-[var(--input-border)] focus:border-[var(--focus-ring)] focus:outline-none text-xs text-[var(--input-text)] placeholder:text-[var(--text-muted)]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Articles Grid (Luxury 3-column Magazine Layout) */}
            {filteredArticles.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <p className="text-base text-[var(--text-muted)]">
                  No stories found matching your filter &quot;{searchQuery}&quot;.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold uppercase text-[var(--accent-primary)] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <StaggerContainer stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                  <StaggerItem key={article.slug}>
                    <article
                      onClick={() => onSelectArticle(article)}
                      className="group cursor-pointer bg-[var(--card-bg)] rounded-brand border border-[var(--border-subtle)] hover:border-[var(--border-strong)] overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 h-full"
                    >
                      {/* Visual Aspect Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-secondary)]">
                        <BrandImage
                          src={article.coverImage}
                          alt={article.title}
                          fallbackLabel={article.kicker}
                          containerClassName="w-full h-full"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          {article.chips.map((c) => (
                            <span
                              key={c}
                              className="bg-[var(--card-bg)]/95 backdrop-blur-xs text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-brand shadow-xs border border-[var(--border-subtle)]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Content Block */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
                            <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                            <span>3 MIN READ</span>
                            <span>·</span>
                            <span>{article.date || 'Editorial'}</span>
                          </div>

                          <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-snug">
                            {article.title}
                          </h3>

                          <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2">
                            {article.intro || article.paragraphs[0]}
                          </p>
                        </div>

                        {/* Footer Row with Direct Read Link */}
                        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                          <span className="group-hover:text-[var(--text-primary)] transition-colors">
                            Read Story
                          </span>
                          <BrandArrow className="w-4 h-3 transition-transform duration-300 group-hover:translate-x-1.5" />
                        </div>
                      </div>
                    </article>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            {/* Bottom VIP Atelier Newsletter Banner */}
            <ScrollReveal direction="up" blur={true}>
              <div className="mt-16 p-8 lg:p-12 rounded-brand bg-[var(--card-bg)] border border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-primary)]">
                    Atelier Newsletter
                  </span>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                    Receive Beauty Masterclasses In Your Inbox
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-lg">
                    Get formulation breakthroughs, pro makeup tips, and seasonal trend guides before anyone else.
                  </p>
                </div>

                <div className="flex w-full md:w-auto items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-2.5 bg-[var(--input-bg)] rounded-brand border border-[var(--input-border)] text-xs text-[var(--input-text)] placeholder:text-[var(--text-muted)] w-full md:w-64 focus:outline-none focus:border-[var(--focus-ring)]"
                  />
                  <button
                    type="button"
                    className="px-5 py-2.5 btn-theme-primary text-xs font-bold uppercase tracking-wider rounded-brand whitespace-nowrap"
                  >
                    Join Atelier
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}
    </div>
  );
};
