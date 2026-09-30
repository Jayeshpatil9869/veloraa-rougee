import React, { useEffect } from 'react';
import { HeroCarousel } from '../components/sections/HeroCarousel';
import { BestSellersSection } from '../components/sections/BestSellersSection';
import { FeelGoodBanner } from '../components/sections/FeelGoodBanner';
import { ShopByCategory } from '../components/sections/ShopByCategory';
import { SpotlightPromo } from '../components/sections/SpotlightPromo';
import { OurBlogSection } from '../components/sections/OurBlogSection';
import { ExploreFeedSection } from '../components/sections/ExploreFeedSection';
import { CategoryId, Product, StoryArticle } from '../types';

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
      <HeroCarousel onShopNow={() => onNavigate('/en/collection')} />

      {/* 4. Best Sellers on Blush */}
      <BestSellersSection
        onSelectProduct={onSelectProduct}
        onNavigateToBestSellers={() => onNavigate('/en/collection/best-sellers')}
        onCartUpdated={onCartUpdated}
      />

      {/* 5. Feel-good script statement line on white */}
      <FeelGoodBanner />

      {/* 6. Shop by Category on Lilac */}
      <ShopByCategory
        onSelectCategory={onSelectCategory}
        onNavigateToCollection={() => onNavigate('/en/collection')}
      />

      {/* 7. Spotlight pair carousel */}
      <SpotlightPromo
        onSelectProduct={onSelectProduct}
        onCartUpdated={onCartUpdated}
      />

      {/* 8. Our Blog on Blush */}
      <OurBlogSection
        onSelectArticle={onSelectArticle}
        onNavigateToStories={() => onNavigate('/en/stories')}
      />

      {/* 9. Explore Our Feed */}
      <ExploreFeedSection />
    </div>
  );
};
