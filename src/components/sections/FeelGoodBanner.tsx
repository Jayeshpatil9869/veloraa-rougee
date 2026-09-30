import React from 'react';
import { FlowerShortSvg, FlowerTallSvg } from '../brand/BrandIcons';

export const FeelGoodBanner: React.FC = () => {
  return (
    <section
      aria-label="Brand Philosophy"
      className="bg-white px-4 py-12 lg:px-20 lg:py-16 mx-auto flex max-w-[92vw] lg:max-w-[75vw] justify-center text-center select-none"
    >
      <div className="inline-flex flex-wrap items-center justify-center font-bold gap-x-2.5 sm:gap-x-3 lg:gap-x-4 text-2xl sm:text-3xl lg:text-4xl text-[#333333] leading-snug lg:leading-[1.1]">
        <span
          className="font-serif text-[#DFBEDB] font-normal text-3xl sm:text-4xl lg:text-5xl -mb-1"
          style={{ fontFamily: "'Alex Brush', 'Cormorant Garamond', serif" }}
        >
          Feel-good
        </span>

        <span className="font-bold tracking-tight">
          products
        </span>

        <span className="inline-flex items-center mx-1">
          <FlowerShortSvg className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 -mb-2" />
        </span>

        <span className="font-bold tracking-tight">
          to celebrate all kinds of beauty
        </span>

        <span className="inline-flex items-center mx-1">
          <FlowerTallSvg className="w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 -mb-3" />
        </span>

        <span className="font-bold tracking-tight">&amp;</span>

        <span className="font-bold tracking-tight">share</span>

        <span
          className="font-serif text-[#DFBEDB] font-normal text-3xl sm:text-4xl lg:text-5xl -mb-1"
          style={{ fontFamily: "'Alex Brush', 'Cormorant Garamond', serif" }}
        >
          positive energy
        </span>
      </div>
    </section>
  );
};
