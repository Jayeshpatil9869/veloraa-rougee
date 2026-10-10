import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CategoryId } from '../../types';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../motion/ScrollReveal';

gsap.registerPlugin(ScrollTrigger);

interface ShopByCategoryProps {
  onSelectCategory: (categoryId: CategoryId) => void;
  onNavigateToCollection: () => void;
}

interface CategoryItem {
  id: CategoryId;
  name: string;
  href: string;
  image: string;
  alt: string;
}

export const ShopByCategory: React.FC<ShopByCategoryProps> = ({
  onSelectCategory,
  onNavigateToCollection,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardImagesRef = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      cardImagesRef.current.forEach((img) => {
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -8, scale: 1.15 },
          {
            yPercent: 8,
            scale: 1.15,
            ease: 'none',
            scrollTrigger: {
              trigger: img.parentElement,
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

  const categories: CategoryItem[] = [
    {
      id: 'face',
      name: 'Face',
      href: '/en/collection/face',
      image: '/images/categories/face.png',
      alt: 'Collection Face',
    },
    {
      id: 'lips',
      name: 'Lips',
      href: '/en/collection/lips',
      image: '/images/categories/lips.jpg',
      alt: 'Collection Lips',
    },
    {
      id: 'eyes',
      name: 'Eyes',
      href: '/en/collection/eyes',
      image: '/images/categories/eyes.png',
      alt: 'Collection Eyes',
    },
    {
      id: 'brows',
      name: 'Brows',
      href: '/en/collection/brows',
      image: '/images/categories/brows.png',
      alt: 'Collection Brows',
    },
  ];

  return (
    <div ref={sectionRef} className="px-4 py-8 lg:px-20 lg:py-12 flex flex-col gap-8 lg:gap-12 bg-tertiary">
      <ScrollReveal direction="up" distance={20}>
        <div className="grid grid-cols-3 gap-2">
          <h2 className="text font-sans text-3xl lg:text-5xl leading-9 font-bold tracking-tight col-span-2">
            Shop by Category
          </h2>
          <a
            className="text font-sans font-extrabold flex items-center gap-2 justify-self-end text-sm uppercase text-primary transition-colors duration-200 hover:text-[#774170] md:text-base cursor-pointer"
            href="/en/collection"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToCollection();
            }}
          >
            Shop All
            <svg
              className="h-6 w-5 rtl:-rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 22 14"
              aria-label="Right arrow icon"
            >
              <g clipPath="url(#shop-by-cat-arrow)">
                <path
                  fill="currentColor"
                  d="m18.568 6.1-4.81-4.827L15.028 0 22 7l-6.973 7-1.268-1.273L18.568 7.9H0V6.1h18.568Z"
                />
              </g>
              <defs>
                <clipPath id="shop-by-cat-arrow">
                  <path fill="#fff" d="M0 0h22v14H0z" />
                </clipPath>
              </defs>
            </svg>
          </a>
        </div>
      </ScrollReveal>

      <StaggerContainer
        staggerDelay={0.08}
        className="grid auto-cols-[75%] grid-flow-col gap-x-2 overflow-x-auto lg:grid-cols-4 lg:gap-x-4"
      >
        {categories.map((category, index) => (
          <StaggerItem key={category.id} className="h-full">
            <div
              className="group relative flex h-[29.5rem] w-full flex-none items-end overflow-hidden rounded-md bg-white p-2 lg:h-[30vw] lg:p-4"
            >
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  ref={(el) => {
                    cardImagesRef.current[index] = el;
                  }}
                  alt={category.alt}
                  loading="lazy"
                  width="550"
                  height="450"
                  decoding="async"
                  className="h-full w-full object-cover will-change-transform transition-opacity duration-300 group-hover:opacity-95"
                  src={category.image}
                />
              </div>
              <a
                className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary bg-white hover:bg-primary hover:text-white uppercase px-8 py-3.5 z-[1] w-full font-bold cursor-pointer shadow-sm"
                href={category.href}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectCategory(category.id);
                }}
              >
                <h3>{category.name}</h3>
                <div className="absolute inset-0" aria-hidden="true" />
              </a>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
};


