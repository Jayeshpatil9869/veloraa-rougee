import React from 'react';
import { BrandImage } from '../ui/BrandImage';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../motion/ScrollReveal';

export const ExploreFeedSection: React.FC = () => {
  const feedImages = [
    {
      id: 'feed-1',
      src: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/files/2048x2048_5b4ae2c3-bbbe-4bf4-95d8-6d0438976909.jpg?v=1756197958',
      caption: 'Precision lip contouring with The Lip Liner in Cashmere Rose.',
    },
    {
      id: 'feed-2',
      src: 'https://cdn.sanity.io/images/03h1hklz/production/8ec0e8c0b5818d663afc29dcddcc60fe1a549c4c-6000x4000.jpg',
      caption: 'Velvety textures and fresh skin radiant glow.',
    },
    {
      id: 'feed-3',
      src: 'https://cdn.shopify.com/s/files/1/0669/7723/5199/files/732388909438_-_Alanoud_-_2048x2048_copy_2.jpg?v=1756197580',
      caption: '12h transfer-proof liquid matte finish.',
    },
    {
      id: 'feed-4',
      src: 'https://cdn.sanity.io/images/03h1hklz/production/fe85aca6f5624d80faa55cc0f2d78172181dd488-1400x800.png',
      caption: 'The Pink Glam palette in studio lighting.',
    },
  ];

  return (
    <section className="px-4 py-12 lg:px-20 lg:py-16 bg-white space-y-6 text-center select-none">
      <ScrollReveal direction="up" distance={20}>
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#333333]">
            Explore Our Feed
          </h2>
          <p className="text-sm sm:text-base font-bold text-[#666666] leading-relaxed">
            We promise you top quality make-up that makes you stand out from the crowd by staying true to your natural self! #veloraarougee
          </p>
        </div>
      </ScrollReveal>

      <StaggerContainer
        staggerDelay={0.08}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 max-w-5xl mx-auto pt-4"
      >
        {feedImages.map((post, index) => {
          // In mobile view only: swap 1st and 2nd images (index 0 -> order 2 on mobile, order 1 on md+; index 1 -> order 1 on mobile, order 2 on md+)
          const orderClass =
            index === 0
              ? 'order-2 md:order-1'
              : index === 1
              ? 'order-1 md:order-2'
              : index === 2
              ? 'order-3 md:order-3'
              : 'order-4 md:order-4';

          return (
            <StaggerItem key={post.id} className={`${orderClass} h-full`}>
              <div className="group relative aspect-square rounded-brand overflow-hidden bg-slate-50 border border-[#E2E8F0] shadow-xs">
                <BrandImage
                  src={post.src}
                  alt={post.caption}
                  fallbackLabel="VELORAA"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center z-10">
                  <span className="text-white text-xs font-medium leading-snug">
                    {post.caption}
                  </span>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
};

