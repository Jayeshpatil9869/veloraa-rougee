import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Search, ShoppingBag, User, Menu, ChevronDown } from 'lucide-react';
import { VeloraaRougeeLogo } from '../brand/VeloraaRougeeLogo';
import { TextRoll } from '../ui/TextRoll';
import { cartService } from '../../services/cartService';

interface SiteHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenMobileMenu: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  onOpenCart,
  onOpenMobileMenu,
}) => {
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const updateCount = () => {
      const items = cartService.getCart();
      setCartCount(cartService.getItemCount(items));
    };

    updateCount();
    window.addEventListener('cart_updated', updateCount);
    return () => window.removeEventListener('cart_updated', updateCount);
  }, []);

  // Initialize dropdown hidden state
  useEffect(() => {
    if (dropdownRef.current) {
      gsap.set(dropdownRef.current, {
        autoAlpha: 0,
        y: 10,
        scale: 0.98,
        pointerEvents: 'none',
      });
    }
  }, []);

  const handleMouseEnter = () => {
    if (!dropdownRef.current) return;

    gsap.killTweensOf([dropdownRef.current, chevronRef.current, ...itemsRef.current]);

    gsap.to(dropdownRef.current, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: 'power3.out',
      pointerEvents: 'auto',
    });

    if (chevronRef.current) {
      gsap.to(chevronRef.current, {
        rotate: 180,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    const validItems = itemsRef.current.filter(Boolean);
    if (validItems.length > 0) {
      gsap.fromTo(
        validItems,
        { y: 8, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.035,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        }
      );
    }
  };

  const handleMouseLeave = () => {
    if (!dropdownRef.current) return;

    gsap.killTweensOf([dropdownRef.current, chevronRef.current, ...itemsRef.current]);

    gsap.to(dropdownRef.current, {
      autoAlpha: 0,
      y: 8,
      scale: 0.98,
      duration: 0.22,
      ease: 'power2.in',
      pointerEvents: 'none',
    });

    if (chevronRef.current) {
      gsap.to(chevronRef.current, {
        rotate: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  };

  const shopItems = [
    { label: 'Brows', path: '/en/collection/brows' },
    { label: 'Lips', path: '/en/collection/lips' },
    { label: 'Eyes', path: '/en/collection/eyes' },
    { label: 'Face', path: '/en/collection/face' },
    { label: 'Offers & Bundles', path: '/en/collection/bundles' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-[#E2E8F0]/50 h-[72px] transition-all">
      <div className="h-full px-4 lg:px-20 grid grid-cols-5 items-center">
        {/* Left Column: Nav or Hamburger */}
        <div className="col-span-2 flex items-center">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open mobile menu"
            className="lg:hidden p-2 -ml-2 text-[#333333] hover:text-[#A06A98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06A98]"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-bold uppercase text-[#333333]">
            <button
              onClick={() => onNavigate('/en')}
              className={`group h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] cursor-pointer ${
                currentPath === '/' || currentPath === '/en' ? 'text-[#A06A98]' : ''
              }`}
            >
              <TextRoll>HOME</TextRoll>
            </button>

            {/* SHOP Dropdown with GSAP Smooth Hover */}
            <div
              className="relative py-3"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => onNavigate('/en/collection')}
                className={`group h-10 px-2.5 flex items-center gap-1.5 transition-colors hover:text-[#774170] cursor-pointer ${
                  currentPath.includes('/collection') || currentPath.includes('/shop')
                    ? 'text-[#A06A98]'
                    : ''
                }`}
              >
                <TextRoll>SHOP</TextRoll>
                <ChevronDown
                  ref={chevronRef}
                  className="w-3.5 h-3.5 opacity-60 transition-colors"
                />
              </button>

              <div
                ref={dropdownRef}
                className="absolute left-0 top-full pt-1.5 w-56 z-50 origin-top-left"
              >
                <div className="bg-white border border-[#F0DEF7] shadow-[0_16px_40px_rgba(119,65,112,0.12)] rounded-2xl py-2 px-1.5 overflow-hidden">
                  {shopItems.map((item, index) => (
                    <button
                      key={item.path}
                      ref={(el) => {
                        itemsRef.current[index] = el;
                      }}
                      onClick={() => {
                        onNavigate(item.path);
                        handleMouseLeave();
                      }}
                      className="group w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#333333] hover:bg-[#FDF2F8] hover:text-[#A06A98] transition-colors cursor-pointer block"
                    >
                      <TextRoll>{item.label}</TextRoll>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/en/about-us')}
              className={`group h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] cursor-pointer ${
                currentPath === '/en/about-us' ? 'text-[#A06A98]' : ''
              }`}
            >
              <TextRoll>ABOUT US</TextRoll>
            </button>

            <button
              onClick={() => onNavigate('/en/stories')}
              className={`group h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] cursor-pointer ${
                currentPath.startsWith('/en/stories') ? 'text-[#A06A98]' : ''
              }`}
            >
              <TextRoll>STORIES</TextRoll>
            </button>

            <button
              onClick={() => onNavigate('/en/locations')}
              className={`group h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] cursor-pointer ${
                currentPath === '/en/locations' ? 'text-[#A06A98]' : ''
              }`}
            >
              <TextRoll>LOCATIONS</TextRoll>
            </button>
          </nav>
        </div>

        {/* Center Column: Authoritative Brand Mark */}
        <div className="col-span-1 flex justify-center">
          <VeloraaRougeeLogo
            size="md"
            onClick={() => onNavigate('/en')}
          />
        </div>

        {/* Right Column: Actions */}
        <div className="col-span-2 flex items-center justify-end gap-2.5 sm:gap-3 lg:gap-6 text-[#333333]">
          {/* Search Trigger (Desktop Only) */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Open search dialog"
            className="hidden lg:flex p-2 text-[#333333] hover:text-[#A06A98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06A98]"
          >
            <Search className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

          {/* Account / Login Trigger (Shown on Mobile & Desktop) */}
          <button
            type="button"
            onClick={() => onNavigate('/en/login')}
            aria-label="Customer account"
            className="flex p-2 text-[#333333] hover:text-[#A06A98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06A98]"
          >
            <User className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Open shopping bag"
            className="relative p-2 text-[#333333] hover:text-[#A06A98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06A98]"
          >
            <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-0 min-w-[18px] h-[18px] px-1 bg-[#A06A98] text-[#F8FAFC] text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
