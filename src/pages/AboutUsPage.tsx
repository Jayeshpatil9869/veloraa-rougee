import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause } from 'lucide-react';
import { BrandImage } from '../components/ui/BrandImage';

export const AboutUsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    document.title = 'About us | Siella Beauty';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Header hero text fade-up
      gsap.from('.about-hero-text', {
        opacity: 0,
        y: 35,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // ScrollTrigger scale parallax on images
      const containers = gsap.utils.toArray<HTMLElement>('.image-and-text-container');
      containers.forEach((section) => {
        const img = section.querySelector<HTMLElement>('.parallax-img-wrap');
        const textContent = section.querySelector<HTMLElement>('.sticky-text-block');

        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.2 },
            {
              scale: 1.0,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            }
          );
        }

        if (textContent) {
          gsap.from(textContent, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-white select-none">
      {/* 1. Hero Banner with Looping Video and Gradient Overlay */}
      <section className="relative overflow-hidden">
        <div className="flex justify-center bg-gradient-to-b from-transparent from-10% to-secondary to-70% p-8 text-center md:p-20 lg:min-h-[80vh]">
          <div className="relative max-w-3xl space-y-4 self-end lg:space-y-6 pt-24 lg:pt-36">
            <div className="about-hero-text">
              <h1
                className="font-serif text-6xl sm:text-7xl lg:text-9xl whitespace-pre text-[#333333] leading-none"
                style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
              >
                {'About\nSiella Beauty'}
              </h1>
            </div>
            <div className="about-hero-text">
              <div className="font-sans text-sm text-light lg:text-base max-w-[75ch] mx-auto text-[#666666] leading-relaxed">
                <p>
                  We believe that makeup is more than just colors and products. It’s a tool to express yourself and boost self-confidence 💜
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Background Layer */}
        <div className="group absolute bottom-0 left-0 right-0 top-0 -z-10 flex w-full h-full items-center justify-center overflow-hidden">
          <button
            type="button"
            onClick={toggleVideo}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            className="absolute left-1/2 -translate-x-1/2 bottom-4 z-10 flex size-12 items-center justify-center rounded-full bg-secondary shadow-md lg:hidden"
          >
            {isPlaying ? (
              <Pause className="size-6 text-secondary-foreground" />
            ) : (
              <Play className="size-6 text-secondary-foreground ml-0.5" />
            )}
          </button>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute z-10 min-h-full w-auto min-w-full max-w-none object-cover"
          >
            <source
              src="https://cdn.sanity.io/files/03h1hklz/production/6af85428b2fada37497f8c93a8ee6971b5c777bf.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </section>

      {/* Main Content Sections (1440px container) */}
      <div className="max-w-[1440px] mx-auto">
        {/* Block 1: Our Aim (Image Left, Sticky Text Right) */}
        <section className="image-and-text-container grid gap-8 lg:grid-cols-3 lg:gap-20 px-4 py-8 lg:p-20">
          <div className="col-span-1 flex items-end order-1 lg:order-2">
            <div className="sticky-text-block lg:sticky bottom-20 space-y-4">
              <h2 className="font-sans text-2xl font-bold text-[#333333]">Our Aim</h2>
              <div className="text-base text-[#333333] leading-[28px] max-w-[75ch] space-y-4 font-normal">
                <p>
                  At Siella Beauty, we are convinced that feeling beautiful starts with taking care of yourself. That&apos;s why we have chosen to share a different vision of makeup: offering feel-good products to celebrate all kinds of beauty &amp; share positive energy.
                </p>
                <p>
                  Siella Beauty aims to motivate ladies from all age groups and personas to use makeup to highlight their natural features with confidence.
                </p>
              </div>
            </div>
          </div>
          <div className="relative col-span-1 lg:col-span-2 flex flex-col overflow-hidden order-2 lg:order-1 rounded-brand">
            <div className="parallax-img-wrap relative flex aspect-[10/6] w-full items-end overflow-hidden lg:aspect-[10/10] will-change-transform">
              <BrandImage
                src="https://cdn.sanity.io/images/03h1hklz/production/8ec0e8c0b5818d663afc29dcddcc60fe1a549c4c-6000x4000.jpg"
                alt="Our Aim"
                fallbackLabel="Our Aim"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        {/* Block 2: Our Inspiration (Sticky Text Left, Image Right) */}
        <section className="image-and-text-container grid gap-8 lg:grid-cols-3 lg:gap-20 px-4 py-8 lg:p-20">
          <div className="col-span-1 flex items-end">
            <div className="sticky-text-block lg:sticky bottom-20 space-y-4">
              <h2 className="font-sans text-2xl font-bold text-[#333333]">Our Inspiration</h2>
              <div className="text-base text-[#333333] leading-[28px] max-w-[75ch] font-normal">
                <p>
                  The brand uses inspiration and storytelling in crafting each product, inspired by ladies, nature, occasions, and most importantly by our audience.
                </p>
              </div>
            </div>
          </div>
          <div className="relative col-span-1 lg:col-span-2 flex flex-col overflow-hidden rounded-brand">
            <div className="parallax-img-wrap relative flex aspect-[10/6] w-full items-end overflow-hidden lg:aspect-[10/10] will-change-transform">
              <BrandImage
                src="https://cdn.sanity.io/images/03h1hklz/production/ecc537c04dccab33b018f955bc6cb99cfb7c4215-1667x2500.jpg"
                alt="Our Inspiration"
                fallbackLabel="Our Inspiration"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        {/* Block 3: Our Promise (Image Left, Sticky Text Right) */}
        <section className="image-and-text-container grid gap-8 lg:grid-cols-3 lg:gap-20 px-4 py-8 lg:p-20">
          <div className="col-span-1 flex items-end order-1 lg:order-2">
            <div className="sticky-text-block lg:sticky bottom-20 space-y-4">
              <h2 className="font-sans text-2xl font-bold text-[#333333]">Our Promise</h2>
              <div className="text-base text-[#333333] leading-[28px] max-w-[75ch] font-normal">
                <p>
                  Find your own beauty with Siella Beauty products: easy to use, instant beauty solutions embracing all kinds of skin tones, skin types, and beauty looks.
                </p>
              </div>
            </div>
          </div>
          <div className="relative col-span-1 lg:col-span-2 flex flex-col overflow-hidden order-2 lg:order-1 rounded-brand">
            <div className="parallax-img-wrap relative flex aspect-[10/6] w-full items-end overflow-hidden lg:aspect-[10/10] will-change-transform">
              <BrandImage
                src="https://cdn.sanity.io/images/03h1hklz/production/7eb0df366328fa04319a8c0e3f9385a9f81c838c-3936x2624.jpg"
                alt="Our Promise"
                fallbackLabel="Our Promise"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        {/* Block 4: About Our Founder (Sticky Text Left, Image Right) */}
        <section className="image-and-text-container grid gap-8 lg:grid-cols-3 lg:gap-20 px-4 py-8 lg:p-20">
          <div className="col-span-1 flex items-end">
            <div className="sticky-text-block lg:sticky bottom-20 space-y-4">
              <h2 className="font-sans text-2xl font-bold text-[#333333]">About Our Founder</h2>
              <div className="text-base text-[#333333] leading-[28px] max-w-[75ch] space-y-4 font-normal">
                <p>
                  Sali Maher Zein is the founder and CEO of the brand Siella Beauty. entrepreneur with a strong passion for business and makeup. Educated in Lebanon and Dubai, with a degree in Finance &amp; Accounting and a master’s in international business. Sali has always been personally active and heavily involved in running all facets of the business.
                </p>
                <p>
                  Sali&apos;s passion for makeup began early on. As a child, she was mesmerized by her mom doing her own makeup. Her love for makeup and business expertise led to establishing Siella Beauty in 2020 — a brand aimed to deliver high-quality products for women who want to celebrate their unique beauty with easy-to-use makeup products.
                </p>
                <p>
                  Her quest for the best led her to Italy, where she found a manufacturer that shared her vision to produce products that can compete with the global market. And as they say, the rest is history.
                </p>
              </div>
            </div>
          </div>
          <div className="relative col-span-1 lg:col-span-2 flex flex-col overflow-hidden rounded-brand">
            <div className="parallax-img-wrap relative flex aspect-[10/6] w-full items-end overflow-hidden lg:aspect-[10/10] will-change-transform">
              <BrandImage
                src="https://cdn.sanity.io/images/03h1hklz/production/175ed758c819c2ebd09d7b747d7026dcc352cc8e-2000x2500.jpg"
                alt="About Our Founder"
                fallbackLabel="About Our Founder"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
