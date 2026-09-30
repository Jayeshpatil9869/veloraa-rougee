import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Globe, Menu, ChevronDown } from 'lucide-react';
import { VeloraaRougeeLogo } from '../brand/VeloraaRougeeLogo';
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
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const items = cartService.getCart();
      setCartCount(cartService.getItemCount(items));
    };

    updateCount();
    window.addEventListener('cart_updated', updateCount);
    return () => window.removeEventListener('cart_updated', updateCount);
  }, []);

  const shopItems = [
    { label: 'Shop All', path: '/en/collection' },
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
              className={`h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] ${
                currentPath === '/' || currentPath === '/en' ? 'text-[#A06A98]' : ''
              }`}
            >
              HOME
            </button>

            {/* SHOP Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => onNavigate('/en/collection')}
                className={`h-10 px-2.5 flex items-center gap-1 transition-colors hover:text-[#774170] ${
                  currentPath.includes('/collection') || currentPath.includes('/shop')
                    ? 'text-[#A06A98]'
                    : ''
                }`}
              >
                <span>SHOP</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {shopMenuOpen && (
                <div className="absolute left-0 top-full w-48 bg-white border border-[#E2E8F0] shadow-md rounded-brand py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {shopItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        onNavigate(item.path);
                        setShopMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#333333] hover:bg-[#FDF2F8] hover:text-[#A06A98] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('/en/about-us')}
              className={`h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] ${
                currentPath === '/en/about-us' ? 'text-[#A06A98]' : ''
              }`}
            >
              ABOUT US
            </button>

            <button
              onClick={() => onNavigate('/en/stories')}
              className={`h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] ${
                currentPath.startsWith('/en/stories') ? 'text-[#A06A98]' : ''
              }`}
            >
              STORIES
            </button>

            <button
              onClick={() => onNavigate('/en/locations')}
              className={`h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] ${
                currentPath === '/en/locations' ? 'text-[#A06A98]' : ''
              }`}
            >
              LOCATIONS
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
        <div className="col-span-2 flex items-center justify-end gap-3 lg:gap-6 text-[#333333]">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Open search dialog"
            className="p-2 text-[#333333] hover:text-[#A06A98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06A98]"
          >
            <Search className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

          {/* Account (Desktop Only) */}
          <button
            type="button"
            onClick={() => onNavigate('/en/contact-us')}
            aria-label="Customer account"
            className="hidden lg:flex p-2 text-[#333333] hover:text-[#A06A98] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06A98]"
          >
            <User className="w-6 h-6" />
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

          {/* Language / Currency (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-[#666666] tracking-wider pl-2 border-l border-slate-200">
            <Globe className="w-4 h-4 text-[#A06A98]" />
            <span>EN / AED</span>
          </div>
        </div>
      </div>
    </header>
  );
};
