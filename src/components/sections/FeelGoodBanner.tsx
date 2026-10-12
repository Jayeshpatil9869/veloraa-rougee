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
      className="bg-[var(--bg-primary)] px-3 min-[400px]:px-4 py-10 sm:py-12 lg:px-20 lg:py-16 mx-auto flex max-w-[95vw] lg:max-w-[75vw] 2xl:max-w-[1400px] justify-center text-center select-none overflow-visible transition-colors"
    >
      <div
        ref={textRef}
        className="inline-flex flex-wrap items-center justify-center font-bold gap-x-2 sm:gap-x-3 lg:gap-x-4 text-xl min-[360px]:text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-[var(--text-primary)] leading-snug lg:leading-[1.1]"
      >
        <span
          className="font-serif text-[var(--accent-gold)] font-normal text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl -mb-1"
          style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
        >
          Feel-good
        </span>

        <span className="font-bold tracking-tight">
          products
        </span>

        <span ref={flower1Ref} className="inline-flex items-center mx-1 will-change-transform text-[var(--accent-gold)]">
          <FlowerShortSvg className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 -mb-2" />
        </span>

        <span className="font-bold tracking-tight">
          to celebrate all kinds of beauty
        </span>

        <span ref={flower2Ref} className="inline-flex items-center mx-1 will-change-transform text-[var(--accent-gold)]">
          <FlowerTallSvg className="w-11 h-11 sm:w-18 sm:h-18 lg:w-22 lg:h-22 -mb-3" />
        </span>

        <span className="font-bold tracking-tight">&amp;</span>

        <span className="font-bold tracking-tight">share</span>

        <span
          className="font-serif text-[var(--accent-gold)] font-normal text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl -mb-1"
          style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
        >
          positive energy
        </span>
      </div>
    </section>
  );
};
