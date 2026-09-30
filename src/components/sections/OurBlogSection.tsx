import React from 'react';
import { STORY_ARTICLES } from '../../data/content';
import { BrandArrow } from '../brand/BrandIcons';
import { BrandImage } from '../ui/BrandImage';
import { StoryArticle } from '../../types';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../motion/ScrollReveal';

interface OurBlogSectionProps {
  onSelectArticle: (article: StoryArticle) => void;
  onNavigateToStories: () => void;
}

export const OurBlogSection: React.FC<OurBlogSectionProps> = ({
  onSelectArticle,
  onNavigateToStories,
}) => {
  return (
    <section className="px-4 py-8 lg:px-20 lg:py-12 space-y-8 bg-[#FDF2F8] select-none">
      {/* Header Grid with Scroll Reveal */}
      <ScrollReveal direction="up" distance={24}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <h2 className="md:col-span-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#333333]">
            Our Blog
          </h2>
          <button
            type="button"
            onClick={onNavigateToStories}
            className="justify-self-start md:justify-self-end text-xs sm:text-sm md:text-base font-extrabold uppercase text-[#A06A98] hover:text-[#774170] transition-colors flex items-center gap-2 group cursor-pointer"
          >
            <span>VIEW ALL POSTS</span>
            <BrandArrow />
          </button>

          <p className="col-span-full mt-2 text-sm sm:text-base font-semibold text-[#666666] max-w-3xl">
            Understand your skin and its complex needs with our tips and tricks, extensive guides and blog posts.
          </p>
        </div>
      </ScrollReveal>

      {/* 4 Cards Grid with Staggered Scroll Reveal */}
      <StaggerContainer
        staggerDelay={0.09}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {STORY_ARTICLES.map((article) => (
          <StaggerItem key={article.slug} className="h-full">
            <article
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer bg-white rounded-brand border border-[#E2E8F0]/60 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 h-full"
            >
              {/* 1200x330 Landscape Cover */}
              <div className="relative aspect-[12/5] w-full overflow-hidden bg-slate-100">
                <BrandImage
                  src={article.coverImage}
                  alt={article.title}
                  fallbackLabel={article.kicker}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#A06A98]">
                    {article.kicker}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#333333] group-hover:text-[#A06A98] transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#888888]">
                  <span>Read Story</span>
                  <BrandArrow className="w-4 h-3 text-[#A06A98]" />
                </div>
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
};

