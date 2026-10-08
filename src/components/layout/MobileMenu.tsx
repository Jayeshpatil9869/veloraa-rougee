import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, ChevronRight } from 'lucide-react';
import { VeloraaRougeeLogo } from '../brand/VeloraaRougeeLogo';
import { CATEGORIES } from '../../data/products';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const menuContentRef = useRef<HTMLDivElement>(null);

  const handleNav = (path: string) => {
    onNavigate(path);
    onClose();
  };

  useEffect(() => {
    if (isOpen && menuContentRef.current) {
      const items = menuContentRef.current.querySelectorAll('.mobile-menu-item');
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.45,
            stagger: 0.045,
            delay: 0.15,
            ease: 'power3.out',
            overwrite: 'auto',
          }
        );
      }
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 flex lg:hidden ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Dimmed Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-700 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)',
        }}
        onClick={onClose}
      />

      {/* Luxury Left-to-Right Expanding Drawer Panel (0% -> min(88vw, 360px)) */}
      <div
        data-lenis-prevent
        className="fixed top-0 left-0 h-full bg-white shadow-2xl flex flex-col z-50 overflow-hidden"
        style={{
          width: isOpen ? 'min(88vw, 360px)' : '0%',
          transition: 'width 0.85s cubic-bezier(0.19, 1, 0.22, 1)',
          willChange: 'width',
        }}
      >
        <div
          ref={menuContentRef}
          className="w-full h-full flex flex-col min-w-[280px] sm:min-w-[340px] p-6 min-h-0 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0] shrink-0">
            <VeloraaRougeeLogo size="sm" onClick={() => handleNav('/en')} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="p-2 text-[#666666] hover:text-[#333333] cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Navigation with GSAP animated items */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            <div className="space-y-3">
              <button
                onClick={() => handleNav('/en')}
                className="mobile-menu-item w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between cursor-pointer"
              >
                <span>Home</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleNav('/en/collection')}
                className="mobile-menu-item w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between cursor-pointer"
              >
                <span>Shop All Products</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleNav('/en/about-us')}
                className="mobile-menu-item w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between cursor-pointer"
              >
                <span>About Us</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleNav('/en/stories')}
                className="mobile-menu-item w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between cursor-pointer"
              >
                <span>Stories &amp; Blog</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleNav('/en/locations')}
                className="mobile-menu-item w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between cursor-pointer"
              >
                <span>Store Locations</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleNav('/en/contact-us')}
                className="mobile-menu-item w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between cursor-pointer"
              >
                <span>Contact Concierge</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleNav('/en/account')}
                className="mobile-menu-item w-full text-left py-2.5 px-3 mt-2 bg-[#FDF2F8] rounded-xl text-xs font-bold uppercase tracking-widest text-[#76416F] hover:bg-[#FDF2F8]/80 flex items-center justify-between border border-[#F0DEF7] cursor-pointer"
              >
                <span>Sign In / Register</span>
                <ChevronRight className="w-4 h-4 text-[#A06A98]" />
              </button>
            </div>

            {/* Categories Submenu */}
            <div className="pt-4 border-t border-[#E2E8F0]">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A06A98] mb-3 block">
                Categories
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleNav(`/en/collection/${cat.slug}`)}
                    className="mobile-menu-item text-left text-sm py-1.5 text-[#666666] hover:text-[#A06A98] transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer info in drawer */}
          <div className="pt-4 border-t border-[#E2E8F0] shrink-0 space-y-1">
            <p className="text-[11px] text-[#888888]">
              GST: 27BJKPG4947G1ZZ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

