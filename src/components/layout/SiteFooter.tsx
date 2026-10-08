import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { VeloraaRougeeLogo } from '../brand/VeloraaRougeeLogo';
import { TextRoll } from '../ui/TextRoll';
import { FlowerTallSvg, FlowerShortSvg, MastercardSvg, VisaSvg } from '../brand/BrandIcons';
import { api, hasApi } from '../../lib/api';

gsap.registerPlugin(ScrollTrigger);

interface SiteFooterProps {
  onNavigate: (path: string) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const footerRef = useRef<HTMLElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState({ left: 100, center: 30, right: 180 });

  useEffect(() => {
    let ticking = false;
    const updateParallax = () => {
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // distance traveled since footer entered the viewport
        const travel = Math.max(0, windowHeight - rect.top);

        setParallaxOffset({
          left: Math.round(travel * 0.16),
          center: Math.round(travel * 0.08),
          right: Math.round(travel * 0.26),
        });
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // GSAP Wheel Marquee Animation (Silky Smooth & Relaxed Pace)
  useEffect(() => {
    const marqueeElements = marqueeTrackRef.current?.querySelectorAll('.marque');
    const arrowElements = marqueeTrackRef.current?.querySelectorAll('.marque-arrow');

    if (!marqueeElements || marqueeElements.length === 0) return;

    // Initial positioning
    gsap.set(marqueeElements, { xPercent: 0 });
    if (arrowElements) {
      gsap.set(arrowElements, { rotate: 180 });
    }

    // Infinite timeline with a calm, elegant luxury speed (35s per loop)
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(marqueeElements, {
      xPercent: -100,
      duration: 35,
      ease: 'none',
    });

    let isScrollingDown = true;

    const handleWheel = (dets: WheelEvent) => {
      if (dets.deltaY > 0 && !isScrollingDown) {
        // Scrolling Down: seamlessly glide forward
        isScrollingDown = true;
        gsap.to(tl, {
          timeScale: 1,
          duration: 1.2,
          ease: 'power2.out',
        });
        if (arrowElements) {
          gsap.to(arrowElements, {
            rotate: 180,
            duration: 0.7,
            ease: 'power3.out',
          });
        }
      } else if (dets.deltaY < 0 && isScrollingDown) {
        // Scrolling Up: seamlessly glide in reverse
        isScrollingDown = false;
        gsap.to(tl, {
          timeScale: -1,
          duration: 1.2,
          ease: 'power2.out',
        });
        if (arrowElements) {
          gsap.to(arrowElements, {
            rotate: 0,
            duration: 0.7,
            ease: 'power3.out',
          });
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      tl.kill();
      gsap.killTweensOf(marqueeElements);
      if (arrowElements) gsap.killTweensOf(arrowElements);
    };
  }, []);

  const hasAnimatedRef = useRef(false);

  // GSAP Flower Bottom-to-Top Rising Animation (Executes strictly once on initial footer encounter)
  const playFlowerRising = () => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    gsap.to(
      ['.flower-anim-left', '.flower-anim-center', '.flower-anim-right'],
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        stagger: 0.18,
        ease: 'power3.out',
        overwrite: 'auto',
      }
    );
  };

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    // Initially position flowers below and hidden
    if (!hasAnimatedRef.current) {
      gsap.set(['.flower-anim-left', '.flower-anim-center', '.flower-anim-right'], {
        y: 130,
        opacity: 0,
      });
    }

    // Trigger reveal when user scrolls and reaches/touches the footer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            playFlowerRising();
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError('');
    if (!email.includes('@')) return;
    if (!hasApi()) {
      setNewsletterError('Newsletter signup needs the store API.');
      return;
    }
    try {
      await api('/newsletter', { method: 'POST', body: JSON.stringify({ email, source: 'footer' }) });
      setSubmitted(true);
      setEmail('');
    } catch (reason) {
      setNewsletterError(reason instanceof Error ? reason.message : 'newsletter_failed');
    }
  };

  const claimsList = [
    'Clean',
    'Made with love',
    'Not tested on animals',
    'Made in Italy',
    'Cruelty free',
    'Skin loving products',
  ];

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-secondary"
    >
      {/* GSAP Wheel-Driven Interactive Marquee */}
      <div className="overflow-hidden bg-white border-y border-[#F3E8EE] py-6 select-none">
        <div ref={marqueeTrackRef} className="flex flex-nowrap w-max overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((groupIndex) => (
            <div
              key={groupIndex}
              className="marque flex-shrink-0 flex items-center gap-8 md:gap-12 px-4 md:px-6 will-change-transform"
            >
              {claimsList.map((claim, idx) => (
                <React.Fragment key={idx}>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-[#774170] font-medium tracking-wide whitespace-nowrap">
                    {claim}
                  </h2>
                  <svg
                    className="marque-arrow w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[#A06A98] flex-none inline-block origin-center transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="7" x2="17" y2="17"></line>
                    <polyline points="17 7 17 17 7 17"></polyline>
                  </svg>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Container */}
      <div className="px-4 py-8 lg:px-20 lg:py-12 relative z-10">
        <div className="lg:gap-y-18 grid gap-y-8 lg:grid-cols-3 lg:gap-x-12">
          {/* Column 1: Brand & Newsletter */}
          <div className="col-span-1 font-medium">
            <VeloraaRougeeLogo
              size="lg"
              onClick={() => onNavigate('/en')}
              className="lg:mb-18 mb-8"
            />
            <div>
              <h3 className="text-lg font-bold leading-loose">
                Sign up for exclusive offers and updates.
              </h3>
              <div className="text-base font-medium leading-normal text-muted-foreground">
                Get the latest news and updates from our team.
              </div>
              <form onSubmit={handleSubmit} className="relative mt-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-12"
                    placeholder="Enter Email Address"
                    name="email"
                  />
                  <button
                    className="inline-flex uppercase items-center justify-center whitespace-nowrap rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 w-10 absolute-center-y right-2 text-primary hover:bg-transparent cursor-pointer"
                    type="submit"
                    aria-label="Submit email"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-move-right h-6 w-6"
                      aria-hidden="true"
                    >
                      <path d="M18 8L22 12L18 16"></path>
                      <path d="M2 12H22"></path>
                    </svg>
                  </button>
                </div>
              </form>
              {submitted && (
                <span className="text-xs text-[#76416F] font-medium block mt-2">
                  Thank you for subscribing!
                </span>
              )}
              {newsletterError && (
                <span className="text-xs text-[#EF4444] block mt-2" role="alert">{newsletterError}</span>
              )}
              {newsletterError && (
                <span className="text-xs text-[#EF4444] block mt-2" role="alert">{newsletterError}</span>
              )}
            </div>
          </div>

          {/* Column 2: 4 Navigation Sub-columns */}
          <div className="col-span-2 grid grid-cols-2 gap-y-8 lg:grid-cols-4 lg:gap-y-0">
            {/* About */}
            <div>
              <h3 className="text font-sans font-extrabold mb-4 text-primary lg:mb-8">
                About
              </h3>
              <ul className="leading-loose space-y-1">
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/about-us')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>About us</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/legal/terms-and-conditions')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Terms And Conditions</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/legal/privacy-policy')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Privacy Policy</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Shop */}
            <div>
              <h3 className="text font-sans font-extrabold mb-4 text-primary lg:mb-8">
                Shop
              </h3>
              <ul className="leading-loose space-y-1">
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/collection/best-sellers')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Best Sellers</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/collection')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Collections</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/locations')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Locations</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/collection/bundles')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Special Offers</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Help & Advice */}
            <div>
              <h3 className="text font-sans font-extrabold mb-4 text-primary lg:mb-8">
                Help &amp; Advice
              </h3>
              <ul className="leading-loose space-y-1">
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/legal/return-policy')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Return Policy</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/legal/shipping')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Shipping</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-start"
                    onClick={() => onNavigate('/en/contact-us')}
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Contact Us</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text font-sans font-extrabold mb-4 text-primary lg:mb-8">
                Social
              </h4>
              <ul className="leading-loose space-y-1">
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors inline-flex items-start"
                    href="https://www.instagram.com/veloraa_rougee"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Instagram</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors inline-flex items-start"
                    href="https://www.facebook.com/veloraarougee"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Facebook</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors inline-flex items-start"
                    href="https://www.youtube.com/@veloraarougee"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>Youtube</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="group relative text-sm font-medium hover:text-primary transition-colors inline-flex items-start"
                    href="https://www.tiktok.com/@veloraarougee"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="relative inline-flex flex-col">
                      <TextRoll>TikTok</TextRoll>
                      <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="col-span-full pt-8 mt-4 border-t border-[#DFBEDB]/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#666666] font-medium text-center md:text-left">
            <p>
              © 2026 VELORAA ROUGEE. All Rights Reserved.
            </p>
            <p className="flex flex-wrap items-center justify-center md:justify-end gap-x-1.5 gap-y-1">
              <span>Crafted by</span>
              <a
                href="https://divinescode.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#A06A98] hover:text-[#774170] transition-colors underline underline-offset-2"
              >
                Divines Code
              </a>
              <span>•</span>
              <span>Designed by</span>
              <a
                href="https://jayeshbpatil.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#A06A98] hover:text-[#774170] transition-colors underline underline-offset-2"
              >
                Jayesh Patil
              </a>
              <span>•</span>
              <span>Developed with</span>
              <a
                href="https://mahendranagpure.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#A06A98] hover:text-[#774170] transition-colors underline underline-offset-2"
              >
                Mahendra Nagpure
              </a>
              <span>&</span>
              <a
                href="https://apurvahire.divinescode.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#A06A98] hover:text-[#774170] transition-colors underline underline-offset-2"
              >
                Apurv Ahire
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Floating Floral Dandelion Illustrations with Bottom-to-Top Reveal & Multi-speed Parallax */}
      <div className="pointer-events-none overflow-visible">
        {/* Left Dandelion */}
        <div className="flower-anim-left pointer-events-none absolute -left-10 bottom-48 z-0 hidden lg:inline-block will-change-transform">
          <div
            className="will-change-transform transition-transform duration-75 ease-out"
            style={{ transform: `translate3d(0, ${parallaxOffset.left}px, 0)` }}
          >
            <FlowerTallSvg className="h-auto w-[10.5rem] -scale-x-100 transform text-[#D39DC7]" />
          </div>
        </div>

        {/* Center / Form Dandelion */}
        <div className="flower-anim-center lg:absolute-center-x pointer-events-none absolute bottom-24 left-[30%] z-0 will-change-transform">
          <div
            className="will-change-transform transition-transform duration-75 ease-out"
            style={{ transform: `translate3d(0, ${parallaxOffset.center}px, 0)` }}
          >
            <FlowerShortSvg className="h-auto w-[6.25rem] -scale-x-100 transform text-[#D39DC7]" />
          </div>
        </div>

        {/* Right Large Dandelion */}
        <div className="flower-anim-right lg:bottom-70 pointer-events-none absolute -right-14 bottom-80 z-0 will-change-transform">
          <div
            className="will-change-transform transition-transform duration-75 ease-out"
            style={{ transform: `translate3d(0, ${parallaxOffset.right}px, 0)` }}
          >
            <FlowerTallSvg className="h-auto w-[16rem] text-[#9F6998]" />
          </div>
        </div>
      </div>
    </footer>
  );
};

