import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandImage } from '../ui/BrandImage';

interface HeroCarouselProps {
  onShopNow: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onShopNow }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'The Glam Eyes\nPalette💕',
      cta: 'Shop Now!🩷',
      image: 'https://cdn.sanity.io/images/03h1hklz/production/fe85aca6f5624d80faa55cc0f2d78172181dd488-1400x800.png',
      alt: 'The Glam Eyes Palette💕',
    },
    {
      id: 2,
      title: 'The Glam Eyes\nis Here🩷',
      cta: 'Shop Now!🩷',
      image: 'https://cdn.sanity.io/images/03h1hklz/production/cf21fa5b3c44368ddc77fd6c50b6e23555e86bbb-1400x800.png',
      alt: 'The Glam Eyes is Here🩷',
    },
    {
      id: 3,
      title: 'Explore All\nBeauty Essentials💕',
      cta: 'Shop Collection →',
      image: 'https://cdn.sanity.io/images/03h1hklz/production/11c677ea9da701bf1bf07bc467a4e970ae37295b-1400x800.jpg',
      alt: 'Explore All Beauty Essentials💕',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section
      data-id="hero-promo"
      aria-label="Featured Hero Promotions"
      className="relative w-full bg-[#DFBEDB] min-h-[460px] lg:min-h-[720px] overflow-hidden group select-none flex items-center"
    >
      {/* Background Image with slow crossfade */}
      <div className="absolute inset-0 z-0">
        <BrandImage
          src={slide.image}
          alt={slide.alt}
          containerClassName="w-full h-full"
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out"
        />
        {/* Dark gradient for high contrast reading on large screens */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-stone-900/60 via-stone-900/25 to-transparent z-[1]" />
        <div className="lg:hidden absolute inset-0 bg-stone-900/40 z-[1]" />
      </div>

      {/* HTML Text Overlay */}
      <div className="relative z-[2] max-w-[1440px] w-full mx-auto px-6 py-12 lg:px-20 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
        <div className="max-w-[45ch] space-y-4 lg:space-y-6">
          <h1
            className="font-serif text-3xl sm:text-5xl lg:text-7xl leading-tight lg:leading-none text-white whitespace-pre-line drop-shadow-sm transition-all duration-500"
            style={{ fontFamily: "'Alex Brush', 'Cormorant Garamond', serif" }}
          >
            {slide.title}
          </h1>

          <div>
            <button
              type="button"
              onClick={onShopNow}
              className="inline-block text-lg sm:text-xl lg:text-2xl font-bold text-white hover:text-[#DFBEDB] transition-colors drop-shadow-sm cursor-pointer"
            >
              {slide.cta}
            </button>
          </div>
        </div>
      </div>

      {/* Controls: Left & Right Chevrons */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-white bg-black/20 hover:bg-black/40 rounded-full transition-all opacity-80 hover:opacity-100 focus:outline-none"
      >
        <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-white bg-black/20 hover:bg-black/40 rounded-full transition-all opacity-80 hover:opacity-100 focus:outline-none"
      >
        <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === i ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
