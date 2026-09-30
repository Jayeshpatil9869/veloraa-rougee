import React from 'react';
import { BrandImage } from '../components/ui/BrandImage';

interface AboutUsPageProps {
  onNavigateToShop: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onNavigateToShop }) => {
  return (
    <div className="w-full bg-white select-none py-12 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 space-y-16 lg:space-y-24">
        {/* Editorial Heading in Page Flow */}
        <div className="max-w-3xl space-y-6">
          <h1
            className="font-serif text-5xl sm:text-7xl lg:text-9xl text-[#333333] leading-none"
            style={{ fontFamily: "'Alex Brush', 'Cormorant Garamond', serif" }}
          >
            About VELORAA ROUGEE
          </h1>
          <p className="text-base sm:text-lg text-[#333333] font-normal leading-relaxed pt-2 border-l-2 border-[#A06A98] pl-4">
            We believe that makeup is more than just colors and products. It’s a tool to express yourself and boost self-confidence 💜
          </p>
        </div>

        {/* Block 1: Our Aim */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#333333]">
              Our Aim
            </h2>
            <div className="text-sm sm:text-base text-[#555555] leading-relaxed space-y-3">
              <p>
                At VELORAA ROUGEE, we are convinced that feeling beautiful starts with taking care of yourself. That's why we have chosen to share a different vision of makeup: offering feel-good products to celebrate all kinds of beauty &amp; share positive energy.
              </p>
              <p>
                VELORAA ROUGEE aims to motivate individuals across all age groups and personas to use makeup to highlight their natural features with effortless confidence.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 aspect-[4/3] rounded-brand overflow-hidden shadow-xs border border-[#E2E8F0]">
            <BrandImage
              src="https://cdn.sanity.io/images/03h1hklz/production/8ec0e8c0b5818d663afc29dcddcc60fe1a549c4c-6000x4000.jpg"
              alt="Our Aim"
              fallbackLabel="Our Aim"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Block 2: Our Inspiration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1 aspect-[4/3] rounded-brand overflow-hidden shadow-xs border border-[#E2E8F0]">
            <BrandImage
              src="https://cdn.sanity.io/images/03h1hklz/production/ecc537c04dccab33b018f955bc6cb99cfb7c4215-1667x2500.jpg"
              alt="Our Inspiration"
              fallbackLabel="Our Inspiration"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#333333]">
              Our Inspiration
            </h2>
            <div className="text-sm sm:text-base text-[#555555] leading-relaxed space-y-3">
              <p>
                The brand uses genuine inspiration and storytelling in crafting each formula, inspired by everyday beauty, diverse skin tones, celebratory moments, and most importantly by our audience.
              </p>
              <p>
                Every texture, pigment undertone, and wand curvature is refined to deliver sensorial ease and dependable wear in warm climates.
              </p>
            </div>
          </div>
        </div>

        {/* Block 3: Our Promise */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#333333]">
              Our Promise
            </h2>
            <div className="text-sm sm:text-base text-[#555555] leading-relaxed space-y-3">
              <p>
                Find your own beauty with VELORAA ROUGEE: easy to use, instant beauty solutions embracing all kinds of skin tones, skin types, and beauty aesthetics.
              </p>
              <p>
                Formulated without compromise, verified cruelty-free, and designed to perform from morning routines to evening events.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 aspect-[4/3] rounded-brand overflow-hidden shadow-xs border border-[#E2E8F0]">
            <BrandImage
              src="https://cdn.sanity.io/images/03h1hklz/production/7eb0df366328fa04319a8c0e3f9385a9f81c838c-3936x2624.jpg"
              alt="Our Promise"
              fallbackLabel="Our Promise"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Block 4: About Our Founder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center pt-8 border-t border-[#E2E8F0]">
          <div className="lg:col-span-7 order-2 lg:order-1 aspect-[10/10] sm:aspect-[10/8] lg:aspect-[10/10] rounded-brand overflow-hidden shadow-xs border border-[#E2E8F0]">
            <BrandImage
              src="https://cdn.sanity.io/images/03h1hklz/production/175ed758c819c2ebd09d7b747d7026dcc352cc8e-2000x2500.jpg"
              alt="Brand Founder"
              fallbackLabel="Founder"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#333333]">
              About Our Founder
            </h2>
            <div className="text-sm sm:text-base text-[#555555] leading-relaxed space-y-3">
              <p>
                An entrepreneur with a lifelong passion for beauty craftsmanship and high-performance formulations, educated in international business and cosmetics development.
              </p>
              <p>
                Her quest for perfection led her to Northern Italy, partnering with premier laboratories sharing the vision to produce products that rival the world's most prestigious cosmetics houses.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onNavigateToShop}
                  className="px-6 py-3 bg-[#A06A98] hover:bg-[#774170] text-[#F8FAFC] text-xs font-bold uppercase tracking-wider rounded-brand transition-colors"
                >
                  Explore The Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
