import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandImage } from '../ui/BrandImage';
import { useTheme } from '../../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

interface HeroCarouselProps {
  onShopNow?: () => void;
}

interface HeroSlide {
  id: string;
  kicker: string;
  titleLines: string[];
  scriptAccent?: string;
  subtitle: string;
  cta: string;
  image: string;
  alt: string;
  imagePositionClass?: string;
}

const darkSlides: HeroSlide[] = [
  {
    id: 'dark-1',
    kicker: 'LUXURY LIPSTICK COLLECTION',
    titleLines: ['India doesn’t have', 'one shade of beauty —', 'it has'],
    scriptAccent: 'millions.',
    subtitle: 'RICH COLOUR  •  LONG WEAR  •  ALL SKIN TONES',
    cta: 'EXPLORE SHADES →',
    image: '/images/hero/hero-dark-1.jpg',
    alt: 'Veloraa Rougee Luxury Lipstick Collection — Indian Beauty',
  },
  {
    id: 'dark-2',
    kicker: 'THE SHADES • SIGNATURE NOIR',
    titleLines: ['More than just a lipstick.', 'It’s a'],
    scriptAccent: 'feeling.',
    subtitle: 'BOLD MATTE & CREAM VELVET  •  WEIGHTLESS WEAR',
    cta: 'SHOP COLLECTION →',
    image: '/images/hero/hero-dark-2.jpg',
    alt: 'Veloraa Rougee Three Signature Shades on Nero Marquina Marble',
  },
];

const lightSlides: HeroSlide[] = [
  {
    id: 'light-1',
    kicker: 'LUXURY LIPSTICK FOR INDIAN SKIN TONES',
    titleLines: ['Every Shade Deserves', 'Its Own'],
    scriptAccent: 'Moment.',
    subtitle: 'Rich colours. Effortless elegance. Made for every you.',
    cta: 'EXPLORE THE SHADES →',
    image: '/images/hero/hero-light-1.jpg',
    alt: 'Veloraa Rougee Every Shade Deserves Its Own Moment — Three Skin Tones',
    imagePositionClass: 'object-[center_top] translate-y-6 sm:translate-y-8 lg:translate-y-9',
  },
  {
    id: 'light-2',
    kicker: 'VELORAA ROUGEE • RADIANT BEAUTY',
    titleLines: ['Luxury in', 'Every'],
    scriptAccent: 'Swipe.',
    subtitle: 'Nourishing botanical oils with pure intense pigment payoff.',
    cta: 'SHOP NOW →',
    image: '/images/hero/hero-light-2.jpg',
    alt: 'Veloraa Rougee Luxury in Every Swipe — Creamy Lipstick Application',
  },
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onShopNow }) => {
  const { isDark: themeIsDark } = useTheme();

  // Dual synchronization: track ThemeContext AND live DOM data-theme / classList
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      return root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark');
    }
    return themeIsDark;
  });

  useEffect(() => {
    setIsDark(themeIsDark);
  }, [themeIsDark]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const checkDark = () => {
      const root = document.documentElement;
      const active = root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark');
      setIsDark(active);
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    window.addEventListener('storage', checkDark);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', checkDark);
    };
  }, []);

  const slides = isDark ? darkSlides : lightSlides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef<boolean>(false);

  // Gesture drag/swipe state
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragCurrentX, setDragCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Animate text IN on mount or slide change
  const animateTextIn = useCallback(() => {
    if (!textContainerRef.current) return;
    gsap.killTweensOf(textContainerRef.current);
    const elements = textContainerRef.current.children;
    gsap.killTweensOf(elements);

    gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        onComplete: () => {
          isTransitioningRef.current = false;
        },
      }
    );
  }, []);

  // Smooth, non-overlapping transition function
  const changeSlide = useCallback(
    (targetIndex: number) => {
      if (isTransitioningRef.current || targetIndex === currentSlide) return;

      isTransitioningRef.current = true;

      // Animate current text OUT cleanly before swapping to prevent ANY overlap
      if (textContainerRef.current) {
        gsap.to(textContainerRef.current, {
          opacity: 0,
          y: -14,
          duration: 0.22,
          ease: 'power2.in',
          onComplete: () => {
            setCurrentSlide(targetIndex);
            // After React renders the new activeSlide text in the DOM, animate it in
            requestAnimationFrame(() => {
              animateTextIn();
            });
          },
        });
      } else {
        setCurrentSlide(targetIndex);
        isTransitioningRef.current = false;
      }
    },
    [currentSlide, animateTextIn]
  );

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % slides.length;
    changeSlide(next);
  }, [currentSlide, slides.length, changeSlide]);

  const prevSlide = useCallback(() => {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    changeSlide(prev);
  }, [currentSlide, slides.length, changeSlide]);

  // Initial text entrance animation
  useEffect(() => {
    animateTextIn();
  }, [animateTextIn]);

  // Reset slide index when theme changes
  useEffect(() => {
    setCurrentSlide(0);
    requestAnimationFrame(() => {
      animateTextIn();
    });
  }, [isDark, animateTextIn]);

  // Automatic slideshow timer
  useEffect(() => {
    if (isPaused || isDragging) return;
    const timer = setInterval(() => {
      if (!isTransitioningRef.current) {
        nextSlide();
      }
    }, 7000);
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

  // GSAP Scroll Parallax on Hero Background
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current || !bgRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgRef.current,
        { yPercent: 0 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const dragOffset = isDragging && dragStartX !== null && dragCurrentX !== null
    ? dragCurrentX - dragStartX
    : 0;

  const activeSlide = slides[currentSlide] || slides[0];

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
      className={`relative w-full bg-[var(--bg-primary)] min-h-[540px] sm:min-h-[600px] lg:min-h-[720px] 2xl:min-h-[780px] overflow-hidden group select-none flex items-center transition-colors duration-500 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Stacked Background Images with Smooth Crossfade, Gesture Parallax & Scroll Parallax */}
      <div
        ref={bgRef}
        className="absolute -top-[10%] -bottom-[10%] inset-x-0 z-0 will-change-transform pointer-events-none"
        style={{
          transform: dragOffset ? `translateX(${dragOffset * 0.25}px)` : undefined,
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
                  className={`w-full h-full object-cover ${s.imagePositionClass || 'object-[center_right] lg:object-center'}`}
                />
              </div>

              {/* Dynamic Contrast Gradient Overlays Tailored to Active Theme */}
              {isDark ? (
                <>
                  <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-black/92 via-black/50 to-transparent transition-opacity duration-700" />
                  <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40 transition-opacity duration-700" />
                </>
              ) : (
                <>
                  <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#F5EBE0]/95 via-[#F5EBE0]/60 to-transparent transition-opacity duration-700" />
                  <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-[#F5EBE0]/96 via-[#F5EBE0]/75 to-[#F5EBE0]/30 transition-opacity duration-700" />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Single Active HTML Text Container with Sequential Exit-then-Entrance to prevent overlapping glitches */}
      <div className="relative z-[2] max-w-[1440px] 2xl:max-w-[1600px] w-full mx-auto px-6 py-12 lg:px-16 2xl:px-20 pointer-events-none">
        <div
          ref={textContainerRef}
          key={`${activeSlide.id}-${isDark}`}
          className="max-w-[42ch] sm:max-w-[48ch] lg:max-w-[56ch] space-y-4 sm:space-y-6 flex flex-col justify-center items-start text-left pointer-events-auto"
        >
          {/* 1. Kicker badge */}
          <div className="flex items-center gap-2.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[var(--accent-gold)]' : 'bg-[#773323]'}`} />
            <p
              className={`text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] ${
                isDark ? 'text-[var(--accent-gold)]' : 'text-[#86533A]'
              }`}
            >
              {activeSlide.kicker}
            </p>
          </div>

          {/* 2. Heading with Sofia Pro bold sans-serif and Amithen cursive script matching Image 2 */}
          <h1
            className={`font-sans font-bold text-3xl sm:text-5xl lg:text-6xl 2xl:text-7xl leading-[1.12] tracking-tight ${
              isDark ? 'text-white' : 'text-[#080604]'
            }`}
            style={{
              fontFamily: "'Sofia Pro', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {activeSlide.titleLines.map((line, i) => (
              <span key={i} className="block">
                {line}
                {i === activeSlide.titleLines.length - 1 && activeSlide.scriptAccent && (
                  <span
                    className={`font-serif font-normal ml-2 sm:ml-3 text-4xl sm:text-6xl lg:text-7xl 2xl:text-8xl inline-block ${
                      isDark ? 'text-[var(--accent-gold)]' : 'text-[#773323]'
                    }`}
                    style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
                  >
                    {activeSlide.scriptAccent}
                  </span>
                )}
              </span>
            ))}
          </h1>

          {/* 3. Subtitle / Spec line */}
          <p
            className={`text-xs sm:text-sm uppercase tracking-[0.18em] font-medium ${
              isDark ? 'text-white/80' : 'text-[#411F11]/90'
            }`}
          >
            {activeSlide.subtitle}
          </p>

          {/* 4. Luxury CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onShopNow) onShopNow();
              }}
              className={`inline-flex items-center justify-center gap-3 px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] transition-all duration-300 cursor-pointer shadow-md active:scale-95 border rounded-xs ${
                isDark
                  ? 'bg-black/60 hover:bg-[var(--accent-gold)] text-white hover:text-black border-[var(--border-strong)] hover:border-[var(--accent-gold)]'
                  : 'bg-[#080604] hover:bg-[#773323] text-[#F5EBE0] border-[#080604]'
              }`}
            >
              {activeSlide.cta}
            </button>
          </div>
        </div>
      </div>

      {/* Controls: Left & Right Chevrons */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous slide"
        className={`absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full transition-all duration-300 opacity-75 hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer shadow-md ${
          isDark
            ? 'text-white bg-black/40 hover:bg-black/70 border border-white/10'
            : 'text-[#080604] bg-white/60 hover:bg-white/90 border border-[#080604]/10'
        }`}
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
        className={`absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full transition-all duration-300 opacity-75 hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer shadow-md ${
          isDark
            ? 'text-white bg-black/40 hover:bg-black/70 border border-white/10'
            : 'text-[#080604] bg-white/60 hover:bg-white/90 border border-[#080604]/10'
        }`}
      >
        <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
      </button>

      {/* Slide Indicators with smooth expansion animation */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 px-3 py-1.5 rounded-full backdrop-blur-xs ${
          isDark ? 'bg-black/40 border border-white/10' : 'bg-black/10 border border-black/5'
        }`}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              changeSlide(i);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
              currentSlide === i
                ? isDark
                  ? 'w-7 bg-[var(--accent-gold)] shadow-xs'
                  : 'w-7 bg-[#080604] shadow-xs'
                : isDark
                ? 'w-2 bg-white/40 hover:bg-white/70'
                : 'w-2 bg-[#080604]/30 hover:bg-[#080604]/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
