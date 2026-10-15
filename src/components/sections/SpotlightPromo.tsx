import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cartService } from '../../services/cartService';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { ScrollReveal } from '../motion/ScrollReveal';

gsap.registerPlugin(ScrollTrigger);

interface SpotlightPromoProps {
  onSelectProduct?: (product: Product, variantId?: string) => void;
  onCartUpdated?: () => void;
}

export const SpotlightPromo: React.FC<SpotlightPromoProps> = ({
  onSelectProduct,
  onCartUpdated,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroImageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const slides = [
    {
      id: 'slide-1',
      tag: 'HYDRAMATTE™ LIQUID LIPSTICK',
      headline: (
        <span className="inline-flex flex-wrap items-center font-bold mb-4 justify-start gap-x-2 gap-y-1 text-2xl leading-snug lg:mb-8 lg:max-w-[45ch] lg:gap-x-4 lg:gap-y-4 lg:text-5xl">
          <span>Drench</span>
          <span>your</span>
          <span>lips</span>
          <span>in</span>
          <span className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            Cool Red
          </span>
          <span className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            Perfection
          </span>
        </span>
      ),
      heroImage: '/images/promo/spotlight-editorial.png',
      shadeName: 'Crimson Vela',
      shadeDesc: 'Cool Red',
      hexColor: '#BA1328',
      product: {
        id: 'prod-crimson-vela',
        handle: 'hydramatte-liquid-lipstick-crimson-vela',
        title: 'HydraMatte™ Liquid Lipstick',
        subtitle: 'Crimson Vela — Cool Red',
        href: '/en/product/hydramatte-liquid-lipstick-crimson-vela/v-crimson-vela',
        image: '/images/products/card-crimson-vela.jpg',
        price: 499,
        currency: 'INR',
        category: 'lips' as const,
        description: 'Weightless transfer-proof liquid matte lipstick in cool red.',
        variantId: 'v-crimson-vela',
      },
    },
    {
      id: 'slide-2',
      tag: 'VELVET LIP CREAM',
      headline: (
        <span className="inline-flex flex-wrap items-center font-bold mb-4 justify-start gap-x-2 gap-y-1 text-2xl leading-snug lg:mb-8 lg:max-w-[45ch] lg:gap-x-4 lg:gap-y-4 lg:text-5xl">
          <span>Petal-soft</span>
          <span>cushiony</span>
          <span>comfort</span>
          <span className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            Fuchsia Pink
          </span>
          <span className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            Radiance
          </span>
        </span>
      ),
      heroImage: '/images/hero/hero-dark-2.jpg',
      shadeName: 'Orchid Rush',
      shadeDesc: 'Fuchsia Pink',
      hexColor: '#DE2876',
      product: {
        id: 'prod-orchid-rush',
        handle: 'velvet-lip-cream-orchid-rush',
        title: 'Velvet Lip Cream',
        subtitle: 'Orchid Rush — Fuchsia Pink',
        href: '/en/product/velvet-lip-cream-orchid-rush/v-orchid-rush',
        image: '/images/products/card-orchid-rush.jpg',
        price: 499,
        currency: 'INR',
        category: 'lips' as const,
        description: 'Cushiony fuchsia pink whipped lip cream with rich petal-soft velvet payoff.',
        variantId: 'v-orchid-rush',
      },
    },
    {
      id: 'slide-3',
      tag: 'SATIN LIP OIL',
      headline: (
        <span className="inline-flex flex-wrap items-center font-bold mb-4 justify-start gap-x-2 gap-y-1 text-2xl leading-snug lg:mb-8 lg:max-w-[45ch] lg:gap-x-4 lg:gap-y-4 lg:text-5xl">
          <span>Glass-like</span>
          <span>luminous</span>
          <span>shine</span>
          <span>in</span>
          <span className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            Warm Nude
          </span>
          <span className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            Cinnamon
          </span>
        </span>
      ),
      heroImage: '/images/promo/spotlight-editorial.png',
      shadeName: 'Mocha Ember',
      shadeDesc: 'Nude Cinnamon Brown with Warm Undertone',
      hexColor: '#9E5638',
      product: {
        id: 'prod-mocha-ember',
        handle: 'satin-lip-oil-mocha-ember',
        title: 'Satin Lip Oil',
        subtitle: 'Mocha Ember — Warm Nude Cinnamon',
        href: '/en/product/satin-lip-oil-mocha-ember/v-mocha-ember',
        image: '/images/products/card-mocha-ember.jpg',
        price: 499,
        currency: 'INR',
        category: 'lips' as const,
        description: 'Warm nude cinnamon brown hydrating lip nectar with luminous glass shine.',
        variantId: 'v-mocha-ember',
      },
    },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      heroImageRefs.current.forEach((img) => {
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -8, scale: 1.15 },
          {
            yPercent: 8,
            scale: 1.15,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleAddToCart = (e: React.FormEvent, slideIndex: number) => {
    e.preventDefault();
    const item = slides[slideIndex].product;
    const catalogProduct = productService.getProductBySlug(item.handle);
    if (!catalogProduct) return;
    const variant = catalogProduct.variants.find((entry) => entry.id === item.variantId) || catalogProduct.variants[0];
    if (!variant) return;
    cartService.addItem(catalogProduct, variant, 1);
    if (onCartUpdated) {
      onCartUpdated();
    }
  };

  return (
    <ScrollReveal direction="up" blur={true} duration={0.8} className="w-full">
      <div ref={sectionRef} className="relative group w-full" role="region" aria-roledescription="carousel">
        <div className="overflow-hidden">
          <div
            className="flex m-0 transition-transform duration-700 ease-in-out"
            style={{
              transform: `translate3d(-${currentSlide * 100}%, 0px, 0px)`,
            }}
          >
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                className="min-w-0 shrink-0 grow-0 basis-full p-0"
              >
                <div className="grid grid-cols-12 bg-[var(--bg-secondary)] border-y border-[var(--border-subtle)] p-0 lg:p-0">
                  {/* Left Hero Banner */}
                  <div className="relative col-span-full flex h-[14rem] items-end overflow-hidden text-white md:col-span-9 md:h-full min-h-[300px] lg:min-h-[580px]">
                    <div className="relative z-[2] px-8 text-white lg:px-20 pb-8 lg:pb-16">
                      <div>
                        <p className="font-sans font-bold mb-4 text-sm uppercase lg:mb-8 lg:text-base tracking-widest text-[#E6C687]">
                          {slide.tag}
                        </p>
                      </div>
                      <div className="max-w-[60ch]">
                        {slide.headline}
                      </div>
                    </div>
                    <div className="absolute inset-0 h-full w-full overflow-hidden">
                      <div className="absolute inset-0 z-[1] rounded-md bg-gradient-to-b from-transparent via-black/20 to-black/75" />
                      <img
                        ref={(el) => { heroImageRefs.current[idx] = el; }}
                        alt={slide.product.title}
                        fetchPriority={idx === 0 ? 'high' : 'auto'}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        width={1200}
                        height={700}
                        decoding="async"
                        className="absolute inset-0 z-0 h-full w-full object-cover object-center will-change-transform"
                        src={slide.heroImage}
                      />
                    </div>
                  </div>

                  {/* Right Product Card */}
                  <div className="col-span-full flex items-center justify-center md:col-span-3">
                    <div className="w-full p-4">
                      <div className="relative flex flex-col gap-2 overflow-hidden rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] lg:gap-4 w-full flex-none space-y-4 text-center">
                        <a
                          className="relative aspect-square overflow-hidden block cursor-pointer bg-[var(--bg-primary)]"
                          href={slide.product.href}
                          onClick={(e) => {
                            e.preventDefault();
                            const catalogProduct = productService.getProductBySlug(slide.product.handle);
                            if (catalogProduct && onSelectProduct) {
                              onSelectProduct(catalogProduct, slide.product.variantId);
                            }
                          }}
                        >
                          <img
                            alt={slide.product.title}
                            loading="lazy"
                            decoding="async"
                            className="object-cover object-center absolute inset-0 h-full w-full"
                            src={slide.product.image}
                          />
                        </a>
                        <div className="grid flex-grow gap-2 p-2 pt-0 lg:p-4">
                          <div className="w-full place-self-start px-2 lg:px-4 text-left">
                            <h3 className="text-base font-bold lg:text-lg leading-tight text-[var(--text-primary)]">
                              {slide.product.title}
                            </h3>
                            <p className="line-clamp-1 text-xs text-[var(--text-muted)] lg:text-sm mt-0.5">
                              {slide.product.subtitle}
                            </p>
                          </div>
                          <div className="w-full space-y-3 place-self-end">
                            <div className="px-2 lg:px-4 text-left">
                              <div className="inline-flex items-center gap-2 py-1">
                                <span
                                  style={{ backgroundColor: slide.hexColor }}
                                  className="relative block rounded-full size-6 ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-elevated)] shadow-xs"
                                />
                                <div className="text-xs">
                                  <span className="font-semibold text-[var(--text-primary)]">{slide.shadeName}</span>
                                  <span className="text-[var(--text-muted)] ml-1.5 text-[11px]">({slide.shadeDesc})</span>
                                </div>
                              </div>
                            </div>
                            <form onSubmit={(e) => handleAddToCart(e, idx)}>
                              <button
                                type="submit"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-brand font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--accent-gold)] text-black hover:bg-[#cfb06d] active:scale-[0.99] h-10 tracking-wider px-3 py-2 text-xs uppercase w-full cursor-pointer shadow-xs"
                                aria-label="Add to cart"
                              >
                                <div className="flex items-center justify-center space-x-2 font-bold tracking-tight">
                                  <span>Add to Bag</span>
                                  <span>─</span>
                                  <span>₹{slide.product.price}.00</span>
                                </div>
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute right-2 z-10 inline-flex space-x-3 lg:right-8 lg:space-x-4 rtl:left-2 rtl:right-auto top-3 lg:top-8">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex uppercase items-center justify-center whitespace-nowrap rounded-full text-sm font-normal bg-black/60 hover:bg-black/90 text-white size-9 drop-shadow-2xl backdrop-blur-md transition-all cursor-pointer border border-white/20 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
            <span className="sr-only">Previous slide</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex uppercase items-center justify-center whitespace-nowrap rounded-full text-sm font-normal bg-black/60 hover:bg-black/90 text-white size-9 drop-shadow-2xl backdrop-blur-md transition-all cursor-pointer border border-white/20 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
            <span className="sr-only">Next slide</span>
          </button>
        </div>
      </div>
    </ScrollReveal>
  );
};
