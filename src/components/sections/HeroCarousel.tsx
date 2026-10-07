import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandImage } from '../ui/BrandImage';

interface HeroCarouselProps {
  onShopNow?: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onShopNow }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Gesture drag/swipe state
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragCurrentX, setDragCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const slides = [
    {
      id: 1,
      title: 'The Glam Eyes\nPalette💕',
      cta: 'Shop Now!🩷',
      image: '/images/eyeshadow-swatches.jpg',
      alt: 'The Glam Eyes Palette💕',
      align: 'center' as const,
    },
    {
      id: 2,
      title: 'The Glam Eyes\nis Here🩷',
      cta: 'Shop Now!🩷',
      image: 'https://cdn.sanity.io/images/03h1hklz/production/cf21fa5b3c44368ddc77fd6c50b6e23555e86bbb-1400x800.png',
      alt: 'The Glam Eyes is Here🩷',
      align: 'left' as const,
    },
    {
      id: 3,
      title: 'Explore All\nBeauty Essentials💕',
      cta: 'Shop Collection →',
      image: 'https://cdn.sanity.io/images/03h1hklz/production/11c677ea9da701bf1bf07bc467a4e970ae37295b-1400x800.jpg',
      alt: 'Explore All Beauty Essentials💕',
      align: 'left' as const,
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Automatic slideshow timer
  useEffect(() => {
    if (isPaused || isDragging) return;
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, isDragging]);

  // Touch & Mouse gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || dragStartX === null) return;
    setDragCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (dragStartX !== null && dragCurrentX !== null) {
      const diff = dragCurrentX - dragStartX;
      const threshold = 45; // Gesture threshold in px
      if (diff < -threshold) {
        nextSlide();
      } else if (diff > threshold) {
        prevSlide();
      }
    }
    setIsDragging(false);
    setDragStartX(null);
    setDragCurrentX(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX === null) return;
    setDragCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (dragStartX !== null && dragCurrentX !== null) {
      const diff = dragCurrentX - dragStartX;
      const threshold = 50;
      if (diff < -threshold) {
        nextSlide();
      } else if (diff > threshold) {
        prevSlide();
      }
    }
    setIsDragging(false);
    setDragStartX(null);
    setDragCurrentX(null);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
    setIsPaused(false);
  };

  const dragOffset = isDragging && dragStartX !== null && dragCurrentX !== null
    ? dragCurrentX - dragStartX
    : 0;

  return (
    <section
      ref={containerRef}
      data-id="hero-promo"
      aria-label="Featured Hero Promotions"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full bg-[#DFBEDB] min-h-[460px] lg:min-h-[720px] overflow-hidden group select-none flex items-center ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Stacked Background Images with Smooth Crossfade & Gesture Parallax */}
      <div
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
        style={{
          transform: dragOffset ? `translateX(${dragOffset * 0.25}px)` : 'none',
        }}
      >
        {slides.map((s, index) => {
          const isActive = currentSlide === index;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Ken-Burns Slow Zoom & Panning Animation */}
              <div
                className={`w-full h-full transition-transform duration-[7000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              >
                <BrandImage
                  src={s.image}
                  alt={s.alt}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Dynamic Contrast Gradient Overlays */}
              {s.align === 'center' ? (
                <div className="absolute inset-0 bg-stone-900/35 transition-opacity duration-700" />
              ) : (
                <>
                  <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-stone-900/70 via-stone-900/35 to-transparent transition-opacity duration-700" />
                  <div className="lg:hidden absolute inset-0 bg-stone-900/45 transition-opacity duration-700" />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* HTML Text Overlay with Smooth Fade and Slide Transitions */}
      <div className="relative z-[2] max-w-[1440px] w-full mx-auto px-6 py-12 lg:px-20 pointer-events-none">
        {slides.map((s, index) => {
          const isActive = currentSlide === index;
          const isCentered = s.align === 'center';

          return (
            <div
              key={s.id}
              className={`transition-all duration-700 ease-out flex flex-col justify-center ${
                isActive
                  ? 'opacity-100 translate-y-0 relative pointer-events-auto'
                  : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
              } ${
                isCentered
                  ? 'items-center text-center'
                  : 'items-center lg:items-start text-center lg:text-left'
              }`}
            >
              <div className={`max-w-[45ch] space-y-4 lg:space-y-6 ${isCentered ? 'text-center mx-auto' : ''}`}>
                <h1
                  className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-tight lg:leading-none text-white whitespace-pre-line drop-shadow-md transition-transform duration-700 ease-out"
                  style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
                >
                  {s.title}
                </h1>

                <div className={isCentered ? 'flex justify-center' : ''}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShopNow) onShopNow();
                    }}
                    className="inline-block text-lg sm:text-xl lg:text-2xl font-bold text-white hover:text-[#DFBEDB] transition-colors drop-shadow-md cursor-pointer hover:scale-105 active:scale-95 duration-200"
                  >
                    {s.cta}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls: Left & Right Chevrons */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous slide"
        className="absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-white bg-black/25 hover:bg-black/50 backdrop-blur-xs rounded-full transition-all duration-300 opacity-75 hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer shadow-md"
      >
        <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next slide"
        className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-white bg-black/25 hover:bg-black/50 backdrop-blur-xs rounded-full transition-all duration-300 opacity-75 hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer shadow-md"
      >
        <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
      </button>

      {/* Slide Indicators with smooth expansion animation */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-xs">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(i);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
              currentSlide === i
                ? 'w-7 bg-white shadow-xs'
                : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

