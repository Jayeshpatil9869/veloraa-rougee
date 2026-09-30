import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlowerShortSvg, FlowerTallSvg } from '../brand/BrandIcons';

gsap.registerPlugin(ScrollTrigger);

export const FeelGoodBanner: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const flower1Ref = useRef<HTMLSpanElement>(null);
  const flower2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger text entrance animation
      if (textRef.current) {
        gsap.from(textRef.current.children, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 24,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
        });
      }

      // Parallax scroll scrub for Flower 1 (Short Dandelion)
      if (flower1Ref.current) {
        gsap.fromTo(
          flower1Ref.current,
          { y: 30, rotate: -6 },
          {
            y: -30,
            rotate: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
      }

      // Parallax scroll scrub for Flower 2 (Tall Dandelion)
      if (flower2Ref.current) {
        gsap.fromTo(
          flower2Ref.current,
          { y: -25, rotate: 5 },
          {
            y: 35,
            rotate: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Brand Philosophy"
      className="bg-white px-4 py-12 lg:px-20 lg:py-16 mx-auto flex max-w-[92vw] lg:max-w-[75vw] justify-center text-center select-none overflow-visible"
    >
      <div
        ref={textRef}
        className="inline-flex flex-wrap items-center justify-center font-bold gap-x-2.5 sm:gap-x-3 lg:gap-x-4 text-2xl sm:text-3xl lg:text-4xl text-[#333333] leading-snug lg:leading-[1.1]"
      >
        <span
          className="font-serif text-[#DFBEDB] font-normal text-3xl sm:text-4xl lg:text-5xl -mb-1"
          style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
        >
          Feel-good
        </span>

        <span className="font-bold tracking-tight">
          products
        </span>

        <span ref={flower1Ref} className="inline-flex items-center mx-1 will-change-transform">
          <FlowerShortSvg className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 -mb-2" />
        </span>

        <span className="font-bold tracking-tight">
          to celebrate all kinds of beauty
        </span>

        <span ref={flower2Ref} className="inline-flex items-center mx-1 will-change-transform">
          <FlowerTallSvg className="w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 -mb-3" />
        </span>

        <span className="font-bold tracking-tight">&amp;</span>

        <span className="font-bold tracking-tight">share</span>

        <span
          className="font-serif text-[#DFBEDB] font-normal text-3xl sm:text-4xl lg:text-5xl -mb-1"
          style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
        >
          positive energy
        </span>
      </div>
    </section>
  );
};
