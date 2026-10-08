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
  const [slide1Swatch, setSlide1Swatch] = useState<'petite' | 'tall'>('petite');
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroImageRef1 = useRef<HTMLImageElement>(null);
  const heroImageRef2 = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      [heroImageRef1.current, heroImageRef2.current].forEach((img) => {
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

  const slides = [
    {
      id: 'slide-1',
      tag: 'LASH CHAMPION MASCARA TRAVEL SIZE',
      headline: (
        <span className="inline-flex flex-wrap items-center font-bold mb-4 justify-start gap-x-2 gap-y-1 text-2xl leading-snug lg:mb-8 lg:max-w-[45ch] lg:gap-x-4 lg:gap-y-4 lg:text-5xl">
          <span style={{ zoom: 1 }}>Give</span>
          <span style={{ zoom: 1 }}>your</span>
          <span style={{ zoom: 1 }}>sparse</span>
          <span style={{ zoom: 1 }}>lashes</span>
          <span style={{ zoom: 1 }}>the</span>
          <span style={{ zoom: 1.2 }} className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            Perfect
          </span>
          <span style={{ zoom: 1.2 }} className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            Definition
          </span>
        </span>
      ),
      heroImage:
        'https://cdn.sanity.io/images/03h1hklz/production/92853ba8fbefc02203817721d9e06f7b460f11c0-1440x1440.png',
      product: {
        id: 'travel-size-lash-champions-mascara',
        handle: 'travel-size-lash-champions-mascara',
        title: 'Travel Size Lash Champions Mascara',
        subtitle: 'Ideal for short and straight lashes',
        href: '/en/product/travel-size-lash-champions-mascara/44558150041855',
        image:
          'https://cdn.shopify.com/s/files/1/0669/7723/5199/files/Namshicopy2_47bd50d8-71fa-4125-a08f-ce64b9da9e99.jpg?v=1707148611',
        price: 65,
        currency: 'INR',
        category: 'eyes' as const,
        description: 'Ideal for short and straight lashes.',
      },
    },
    {
      id: 'slide-2',
      tag: 'Soft & Hydrated Lips 👄',
      headline: (
        <span className="inline-flex flex-wrap items-center font-bold mb-4 justify-start gap-x-2 gap-y-1 text-2xl leading-snug lg:mb-8 lg:max-w-[45ch] lg:gap-x-4 lg:gap-y-4 lg:text-5xl">
          <span style={{ zoom: 1 }}>Keep</span>
          <span style={{ zoom: 1 }}>your</span>
          <span style={{ zoom: 1 }}>lips</span>
          <span style={{ zoom: 1.2 }} className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            hydrated
          </span>
          <span style={{ zoom: 1.2 }} className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            this
          </span>
          <span style={{ zoom: 1.2 }} className="-mb-1 font-serif font-normal text-3xl sm:text-4xl lg:text-6xl">
            winter
          </span>
        </span>
      ),
      heroImage:
        'https://cdn.sanity.io/images/03h1hklz/production/d15a64facab69c0df3733aa4313045daa191bc13-1200x1200.jpg',
      product: {
        id: 'lip-balm',
        handle: 'lip-balm',
        title: 'Lip Balm',
        subtitle: 'A nourishing lip balm that maintains lips hydration.',
        href: '/en/product/lip-balm/44558145159423',
        image:
          'https://cdn.shopify.com/s/files/1/0669/7723/5199/files/LipBalm2048copy2.jpg?v=1707141316',
        price: 80,
        currency: 'INR',
        category: 'lips' as const,
        description: 'A nourishing lip balm that maintains lips hydration.',
      },
    },
  ];

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
    const wantedId = slideIndex === 0
      ? slide1Swatch === 'petite' ? '44558150041855' : '44558150074623'
      : '44558145159423';
    const variant = catalogProduct.variants.find((entry) => entry.id === wantedId) || catalogProduct.variants[0];
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
          {/* Slide 1 */}
          <div
            role="group"
            aria-roledescription="slide"
            className="min-w-0 shrink-0 grow-0 basis-full p-0"
            style={{ transform: 'translate3d(0px, 0px, 0px)' }}
          >
            <div className="grid grid-cols-12 bg-white p-0 lg:p-0">
              {/* Left Hero Banner */}
              <div className="relative col-span-full flex h-[14rem] items-end overflow-hidden text-white md:col-span-9 md:h-full min-h-[300px] lg:min-h-[580px]">
                <div className="relative z-[2] px-8 text-white lg:px-20 pb-8 lg:pb-16">
                  <div style={{ opacity: 1, transform: 'none' }}>
                    <p className="text font-sans font-bold mb-4 text-sm uppercase lg:mb-8 lg:text-base">
                      LASH CHAMPION MASCARA TRAVEL SIZE
                    </p>
                  </div>
                  <div className="max-w-[60ch]" style={{ opacity: 1, transform: 'none' }}>
                    {slides[0].headline}
                  </div>
                </div>
                <div className="absolute inset-0 h-full w-full overflow-hidden" style={{ transform: 'none' }}>
                  <div className="absolute inset-0 z-[1] rounded-md bg-gradient-to-b from-transparent to-stone-900 opacity-30" />
                  <img
                    ref={heroImageRef1}
                    alt="Hero Image"
                    fetchPriority="high"
                    loading="eager"
                    width={1200}
                    height={700}
                    decoding="async"
                    className="absolute inset-0 z-0 h-full w-full object-cover object-center will-change-transform"
                    src={slides[0].heroImage}
                  />
                </div>
              </div>

              {/* Right Product Card */}
              <div className="col-span-full flex items-center justify-center md:col-span-3">
                <div className="w-full p-4" style={{ opacity: 1, transform: 'none' }}>
                  <div
                    className="relative flex flex-col gap-2 overflow-hidden rounded-md bg-white lg:gap-4 w-full flex-none space-y-4 text-center"
                    style={{ opacity: 1, transform: 'none' }}
                  >
                    <a
                      className="relative aspect-1 overflow-hidden aspect-[10/7] lg:aspect-square block cursor-pointer"
                      href={slides[0].product.href}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onSelectProduct) {
                          const variant = {
                            id: slide1Swatch === 'petite' ? '44558150041855' : '44558150074623',
                            productId: slides[0].product.id,
                            name: slide1Swatch === 'petite' ? 'Curling Champ for Petite Travel Size' : 'Curling Champ for Tall Travel Size',
                            value: slide1Swatch === 'petite' ? 'Petite' : 'Tall',
                            price: slides[0].product.price,
                            sku: slides[0].product.id,
                          };
                          onSelectProduct({
                            id: slides[0].product.id,
                            slug: slides[0].product.handle,
                            name: slides[0].product.title,
                            categoryId: 'eyes',
                            categoryName: 'Eyes',
                            images: [{ id: '1', src: slides[0].product.image, alt: slides[0].product.title }],
                            variants: [variant],
                          });
                        }
                      }}
                    >
                      <img
                        alt={slides[0].product.title}
                        loading="lazy"
                        decoding="async"
                        className="object-cover object-center absolute inset-0 h-full w-full"
                        src={slides[0].product.image}
                      />
                    </a>
                    <div className="grid flex-grow gap-2 p-2 pt-0 lg:p-4">
                      <div className="w-full place-self-start px-2 lg:px-4 text-left">
                        <h3 className="lg:leading-1 text-base font-bold lg:text-lg lg:leading-tight">
                          {slides[0].product.title}
                        </h3>
                        <p className="line-clamp-1 text-xs text-light lg:text-sm">
                          {slides[0].product.subtitle}
                        </p>
                      </div>
                      <div className="w-full space-y-3 place-self-end">
                        <div className="-mx-2">
                          <div className="inline-flex items-center gap-2 py-1 lg:mx-0">
                            {/* Swatch 1: Petite */}
                            <button
                              type="button"
                              onClick={() => setSlide1Swatch('petite')}
                              className="cursor-pointer align-text-bottom relative block rounded-full bg-primary transition duration-300 ease-in-out hover:scale-105 size-6 p-0 border-0"
                            >
                              <img
                                alt="Curling Champ for Petite Travel Size"
                                loading="lazy"
                                width={32}
                                height={32}
                                decoding="async"
                                className="absolute inset-0 overflow-hidden rounded-full object-top transition duration-300 ease-in-out hover:scale-105 size-6"
                                src="https://cdn.shopify.com/s/files/1/0669/7723/5199/files/Namshi_ce5b8964-4506-4d0c-9742-c28e3b5295f6.jpg?v=1707148622"
                              />
                              {slide1Swatch === 'petite' && (
                                <span
                                  className="relative z-10 block rounded-full ring-2 ring-inset ring-white ring-offset-2 size-6"
                                  style={{ ['--tw-ring-offset-color' as any]: '#000000' }}
                                />
                              )}
                            </button>

                            {/* Swatch 2: Tall */}
                            <button
                              type="button"
                              onClick={() => setSlide1Swatch('tall')}
                              className="cursor-pointer align-text-bottom relative block rounded-full bg-primary transition duration-300 ease-in-out hover:scale-105 size-6 p-0 border-0"
                            >
                              <img
                                alt="Curling Champ for Tall Travel Size"
                                loading="lazy"
                                width={32}
                                height={32}
                                decoding="async"
                                className="absolute inset-0 overflow-hidden rounded-full object-top transition duration-300 ease-in-out hover:scale-105 size-6"
                                src="https://cdn.shopify.com/s/files/1/0669/7723/5199/files/Namshi_41015e3c-01f0-4b6f-8360-ec5403c1f218.jpg?v=1707148461"
                              />
                              {slide1Swatch === 'tall' && (
                                <span
                                  className="relative z-10 block rounded-full ring-2 ring-inset ring-white ring-offset-2 size-6"
                                  style={{ ['--tw-ring-offset-color' as any]: '#000000' }}
                                />
                              )}
                            </button>
                          </div>
                          <p className="line-clamp-1 overflow-ellipsis text-xs text-light mt-1">
                            {slide1Swatch === 'petite'
                              ? 'Curling Champ for Petite Travel Size'
                              : 'Curling Champ for Tall Travel Size'}
                          </p>
                        </div>
                        <form onSubmit={(e) => handleAddToCart(e, 0)}>
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 relative tracking-wide px-2 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm uppercase w-full hover:opacity-90 cursor-pointer"
                            aria-label="Add to cart"
                          >
                            <div className="flex items-center justify-center space-x-2 font-medium tracking-tight">
                              <span>Add to Bag</span>
                              <span>─</span>
                              <span className="font-bold">
                                <p>₹65.00</p>
                              </span>
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

          {/* Slide 2 */}
          <div
            role="group"
            aria-roledescription="slide"
            className="min-w-0 shrink-0 grow-0 basis-full p-0"
          >
            <div className="grid grid-cols-12 bg-white p-0 lg:p-0">
              {/* Left Hero Banner */}
              <div className="relative col-span-full flex h-[14rem] items-end overflow-hidden text-white md:col-span-9 md:h-full min-h-[300px] lg:min-h-[580px]">
                <div className="relative z-[2] px-8 text-white lg:px-20 pb-8 lg:pb-16">
                  <div style={{ opacity: 1, transform: 'none' }}>
                    <p className="text font-sans font-bold mb-4 text-sm uppercase lg:mb-8 lg:text-base">
                      Soft &amp; Hydrated Lips 👄
                    </p>
                  </div>
                  <div className="max-w-[60ch]" style={{ opacity: 1, transform: 'none' }}>
                    {slides[1].headline}
                  </div>
                </div>
                <div className="absolute inset-0 h-full w-full overflow-hidden" style={{ transform: 'none' }}>
                  <div className="absolute inset-0 z-[1] rounded-md bg-gradient-to-b from-transparent to-stone-900 opacity-30" />
                  <img
                    ref={heroImageRef2}
                    alt="Hero Image"
                    loading="lazy"
                    width={1200}
                    height={700}
                    decoding="async"
                    className="absolute inset-0 z-0 h-full w-full object-cover object-center will-change-transform"
                    src={slides[1].heroImage}
                  />
                </div>
              </div>

              {/* Right Product Card */}
              <div className="col-span-full flex items-center justify-center md:col-span-3">
                <div className="w-full p-4" style={{ opacity: 1, transform: 'none' }}>
                  <div
                    className="relative flex flex-col gap-2 overflow-hidden rounded-md bg-white lg:gap-4 w-full flex-none space-y-4 text-center"
                    style={{ opacity: 1, transform: 'none' }}
                  >
                    <a
                      className="relative aspect-1 overflow-hidden aspect-[10/7] lg:aspect-square block cursor-pointer"
                      href={slides[1].product.href}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onSelectProduct) {
                          const variant = {
                            id: '44558145159423',
                            productId: slides[1].product.id,
                            name: 'Lip Balm',
                            value: 'Default',
                            price: slides[1].product.price,
                            sku: slides[1].product.id,
                          };
                          onSelectProduct({
                            id: slides[1].product.id,
                            slug: slides[1].product.handle,
                            name: slides[1].product.title,
                            categoryId: 'lips',
                            categoryName: 'Lips',
                            images: [{ id: '1', src: slides[1].product.image, alt: slides[1].product.title }],
                            variants: [variant],
                          });
                        }
                      }}
                    >
                      <img
                        alt={slides[1].product.title}
                        loading="lazy"
                        decoding="async"
                        className="object-cover object-center absolute inset-0 h-full w-full"
                        src={slides[1].product.image}
                      />
                    </a>
                    <div className="grid flex-grow gap-2 p-2 pt-0 lg:p-4">
                      <div className="w-full place-self-start px-2 lg:px-4 text-left">
                        <h3 className="lg:leading-1 text-base font-bold lg:text-lg lg:leading-tight">
                          {slides[1].product.title}
                        </h3>
                        <p className="line-clamp-1 text-xs text-light lg:text-sm">
                          {slides[1].product.subtitle}
                        </p>
                      </div>
                      <div className="w-full space-y-3 place-self-end">
                        <div className="-mx-2">
                          <div className="inline-flex items-center gap-1 py-1 lg:mx-0">
                            <div>
                              <span
                                style={{ backgroundColor: '#fef4e7' }}
                                className="cursor-pointer align-text-bottom relative block rounded-full bg-primary transition duration-300 ease-in-out hover:scale-105 size-6"
                              >
                                <span
                                  className="relative z-10 block cursor-pointer rounded-full ring-2 ring-inset ring-white ring-offset-2 size-6"
                                  style={{
                                    ['--tw-ring-offset-color' as any]: '#fef4e7',
                                    opacity: 1,
                                  }}
                                />
                              </span>
                            </div>
                          </div>
                          <p className="line-clamp-1 overflow-ellipsis text-xs text-light mt-1">
                            Lip Balm
                          </p>
                        </div>
                        <form onSubmit={(e) => handleAddToCart(e, 1)}>
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 relative tracking-wide px-2 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm uppercase w-full hover:opacity-90 cursor-pointer"
                            aria-label="Add to cart"
                          >
                            <div className="flex items-center justify-center space-x-2 font-medium tracking-tight">
                              <span>Add to Bag</span>
                              <span>─</span>
                              <span className="font-bold">
                                <p>₹80.00</p>
                              </span>
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
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-2 z-10 inline-flex space-x-5 lg:right-8 lg:space-x-5 rtl:left-2 rtl:right-auto top-2 lg:top-8">
        <button
          type="button"
          onClick={handlePrev}
          className="inline-flex uppercase items-center justify-center whitespace-nowrap rounded-md text-sm font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 size-8 left-2 relative bottom-0 top-auto translate-x-0 translate-y-0 drop-shadow-2xl backdrop-blur-2xl transition-opacity duration-200 group-hover:opacity-90 lg:left-auto cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
          <span className="sr-only">Previous slide</span>
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex uppercase items-center justify-center whitespace-nowrap rounded-md text-sm font-normal ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 right-2 lg:right-4 relative bottom-0 top-auto translate-x-0 translate-y-0 drop-shadow-2xl backdrop-blur-2xl transition-opacity duration-200 group-hover:opacity-90 lg:left-auto cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="size-6" aria-hidden="true" />
          <span className="sr-only">Next slide</span>
        </button>
      </div>
      </div>
    </ScrollReveal>
  );
};
