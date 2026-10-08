import React, { useEffect } from 'react';
import { HeroCarousel } from '../components/sections/HeroCarousel';
import { BestSellersSection } from '../components/sections/BestSellersSection';
import { FeelGoodBanner } from '../components/sections/FeelGoodBanner';
import { ShopByCategory } from '../components/sections/ShopByCategory';
import { SpotlightPromo } from '../components/sections/SpotlightPromo';
import { OurBlogSection } from '../components/sections/OurBlogSection';
import { ExploreFeedSection } from '../components/sections/ExploreFeedSection';
import { CategoryId, Product, StoryArticle } from '../types';
import { isHomepageSectionEnabled } from '../services/contentStore';

interface HomePageProps {
  onSelectProduct: (product: Product, variantId?: string) => void;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectArticle: (article: StoryArticle) => void;
  onNavigate: (path: string) => void;
  onCartUpdated?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onSelectCategory,
  onSelectArticle,
  onNavigate,
  onCartUpdated,
}) => {
  useEffect(() => {
    document.title = 'VELORAA ROUGEE';
  }, []);

  return (
    <div className="w-full">
      {/* 3. Hero Carousel */}
      {isHomepageSectionEnabled('hero') && <HeroCarousel onShopNow={() => onNavigate('/en/collection')} />}

      {isHomepageSectionEnabled('best-sellers') && (
        <BestSellersSection
          onSelectProduct={onSelectProduct}
          onNavigateToBestSellers={() => onNavigate('/en/collection/best-sellers')}
          onCartUpdated={onCartUpdated}
        />
      )}

      {isHomepageSectionEnabled('feel-good') && <FeelGoodBanner />}

      {isHomepageSectionEnabled('shop-by-category') && (
        <ShopByCategory
          onSelectCategory={onSelectCategory}
          onNavigateToCollection={() => onNavigate('/en/collection')}
        />
      )}

      {isHomepageSectionEnabled('spotlight') && (
        <SpotlightPromo
          onSelectProduct={onSelectProduct}
          onCartUpdated={onCartUpdated}
        />
      )}

      {isHomepageSectionEnabled('stories') && (
        <OurBlogSection
          onSelectArticle={onSelectArticle}
          onNavigateToStories={() => onNavigate('/en/stories')}
        />
      )}

      {isHomepageSectionEnabled('explore-feed') && <ExploreFeedSection />}
    </div>
  );
};
