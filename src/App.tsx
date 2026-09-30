import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnnouncementBar } from './components/layout/AnnouncementBar';

gsap.registerPlugin(ScrollTrigger);
import { SiteHeader } from './components/layout/SiteHeader';
import { MobileMenu } from './components/layout/MobileMenu';
import { SiteFooter } from './components/layout/SiteFooter';
import { SearchModal } from './components/layout/SearchModal';
import { CartDrawer } from './components/layout/CartDrawer';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopCollectionPage } from './pages/ShopCollectionPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { StoriesPage } from './pages/StoriesPage';
import { LocationsPage } from './pages/LocationsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { LegalPage, LegalTab } from './pages/LegalPage';

import { CategoryId, Product, StoryArticle } from './types';
import { productService } from './services/productService';
import { STORY_ARTICLES } from './data/content';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/en';
  });

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeVariantId, setActiveVariantId] = useState<string | undefined>(undefined);
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | undefined>(undefined);
  const [collectionCategory, setCollectionCategory] = useState<CategoryId | 'all'>('all');
  const [legalTab, setLegalTab] = useState<LegalTab>('shipping');

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize Lenis smooth scroll and integrate with GSAP ScrollTrigger
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      lenis.on('scroll', ScrollTrigger.update);

      const updateTicker = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(updateTicker);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(updateTicker);
        lenis?.destroy();
      };
    } catch (e) {
      console.warn('Lenis/GSAP initialization bypassed:', e);
    }
  }, []);

  // Parse path and sync state
  const parsePath = (path: string) => {
    const normalized = path === '/' ? '/en' : path;

    if (normalized.startsWith('/en/product/')) {
      const parts = normalized.replace('/en/product/', '').split('/');
      const slug = parts[0];
      const variantId = parts[1];
      const prod = productService.getProductBySlug(slug);
      if (prod) {
        setActiveProduct(prod);
        setActiveVariantId(variantId);
      }
    } else if (normalized.startsWith('/en/stories/')) {
      const slug = normalized.replace('/en/stories/', '');
      const article = STORY_ARTICLES.find((a) => a.slug === slug);
      if (article) {
        setActiveArticleSlug(slug);
      } else {
        setActiveArticleSlug(undefined);
      }
    } else if (normalized.startsWith('/en/collection/')) {
      const cat = normalized.replace('/en/collection/', '') as CategoryId;
      setCollectionCategory(cat || 'all');
      setActiveProduct(null);
    } else if (normalized === '/en/collection' || normalized === '/en/shop-all') {
      setCollectionCategory('all');
      setActiveProduct(null);
    } else if (normalized.startsWith('/en/legal/')) {
      const tab = normalized.replace('/en/legal/', '') as LegalTab;
      setLegalTab(tab || 'shipping');
    }
  };

  useEffect(() => {
    parsePath(currentPath);
  }, [currentPath]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/en';
      setCurrentPath(path);
      parsePath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const target = path === '/' ? '/en' : path;
    if (window.location.pathname !== target) {
      window.history.pushState({}, '', target);
    }
    setCurrentPath(target);
    parsePath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Nav actions
  const handleSelectProduct = (product: Product, variantId?: string) => {
    setActiveProduct(product);
    setActiveVariantId(variantId || product.defaultVariantId);
    navigate(`/en/product/${product.slug}/${variantId || product.defaultVariantId || product.variants[0]?.id}`);
  };

  const handleSelectCategory = (categoryId: CategoryId | 'all') => {
    setCollectionCategory(categoryId);
    navigate(categoryId === 'all' ? '/en/collection' : `/en/collection/${categoryId}`);
  };

  const handleSelectArticle = (article: StoryArticle) => {
    if (article.slug) {
      setActiveArticleSlug(article.slug);
      navigate(`/en/stories/${article.slug}`);
    } else {
      setActiveArticleSlug(undefined);
      navigate('/en/stories');
    }
  };

  // Determine which page to render
  const renderPage = () => {
    if (currentPath.startsWith('/en/product/') && activeProduct) {
      return (
        <ProductDetailPage
          product={activeProduct}
          initialVariantId={activeVariantId}
          onSelectProduct={handleSelectProduct}
          onNavigate={navigate}
          onCartUpdated={() => setCartOpen(true)}
        />
      );
    }

    if (currentPath === '/en/about-us') {
      return <AboutUsPage onNavigateToShop={() => navigate('/en/collection')} />;
    }

    if (currentPath.startsWith('/en/stories')) {
      return (
        <StoriesPage
          currentArticleSlug={activeArticleSlug}
          onSelectArticle={handleSelectArticle}
          onSelectProduct={handleSelectProduct}
          onCartUpdated={() => setCartOpen(true)}
        />
      );
    }

    if (currentPath === '/en/locations') {
      return <LocationsPage />;
    }

    if (currentPath === '/en/contact-us') {
      return <ContactUsPage />;
    }

    if (currentPath.startsWith('/en/legal/')) {
      return (
        <LegalPage
          currentTab={legalTab}
          onSelectTab={(tab) => {
            setLegalTab(tab);
            navigate(`/en/legal/${tab}`);
          }}
        />
      );
    }

    if (
      currentPath.startsWith('/en/collection') ||
      currentPath === '/en/shop-all'
    ) {
      return (
        <ShopCollectionPage
          currentCategory={collectionCategory}
          onSelectCategory={handleSelectCategory}
          onSelectProduct={handleSelectProduct}
          onCartUpdated={() => setCartOpen(true)}
        />
      );
    }

    // Default to Homepage
    return (
      <HomePage
        onSelectProduct={handleSelectProduct}
        onSelectCategory={handleSelectCategory}
        onSelectArticle={handleSelectArticle}
        onNavigate={navigate}
        onCartUpdated={() => setCartOpen(true)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#333333]">
      {/* 1. Announcement bar, 44px, blush #FDF2F8 */}
      <AnnouncementBar />

      {/* 2. White sticky header, 72px */}
      <SiteHeader
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Mobile Drawer Sheet */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={navigate}
      />

      {/* Main Route Content */}
      <main className="flex-1 w-full">{renderPage()}</main>

      {/* Footer with Integrated Top Claim Marquee */}
      <SiteFooter onNavigate={navigate} />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigateToCatalog={() => navigate('/en/collection')}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onNavigateToShop={() => navigate('/en/collection')}
      />
    </div>
  );
}
