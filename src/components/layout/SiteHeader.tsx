import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Search, ShoppingBag, User, Menu, ChevronDown, Heart, LogIn, LogOut, UserPlus } from 'lucide-react';
import { VeloraaRougeeLogo } from '../brand/VeloraaRougeeLogo';
import { TextRoll } from '../ui/TextRoll';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { api, hasApi } from '../../lib/api';

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
  const [wishlistCount, setWishlistCount] = useState(() => wishlistService.getCount());
  const [customer, setCustomer] = useState<{ email: string; fullName: string; avatarUrl?: string | null } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const updateCount = () => {
      const items = cartService.getCart();
      setCartCount(cartService.getItemCount(items));
    };
    const updateWishlist = () => {
      setWishlistCount(wishlistService.getCount());
    };

    updateCount();
    updateWishlist();
    window.addEventListener('cart_updated', updateCount);
    window.addEventListener('wishlist_updated', updateWishlist);
    return () => {
      window.removeEventListener('cart_updated', updateCount);
      window.removeEventListener('wishlist_updated', updateWishlist);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!hasApi()) return;
      try {
        const res = await api<{ customer: { email: string; fullName: string; avatarUrl?: string | null } | null }>('/auth/me');
        setCustomer(res.customer || null);
      } catch {
        setCustomer(null);
      }
    };
    void checkAuth();
    window.addEventListener('auth_state_changed', checkAuth);
    return () => window.removeEventListener('auth_state_changed', checkAuth);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setCustomer(null);
    window.dispatchEvent(new Event('auth_state_changed'));
    onNavigate('/en');
  };

  const handleUserAction = (targetPath: string, storeReturn: boolean = true) => {
    setUserMenuOpen(false);
    if (storeReturn && !currentPath.startsWith('/en/login') && !currentPath.startsWith('/en/signup') && !currentPath.startsWith('/en/auth/callback')) {
      sessionStorage.setItem('vr_return_to', currentPath);
    }
    onNavigate(targetPath);
  };

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
              className={`group relative h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] cursor-pointer ${
                currentPath === '/' || currentPath === '/en' ? 'text-[#A06A98]' : ''
              }`}
            >
              <span className="relative inline-flex flex-col items-center">
                <TextRoll>HOME</TextRoll>
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#A06A98] to-[#774170] rounded-full transition-transform duration-300 ease-out origin-left ${
                    currentPath === '/' || currentPath === '/en'
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </span>
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
                className={`group relative h-10 px-2.5 flex items-center gap-1.5 transition-colors hover:text-[#774170] cursor-pointer ${
                  currentPath.includes('/collection') || currentPath.includes('/shop')
                    ? 'text-[#A06A98]'
                    : ''
                }`}
              >
                <span className="relative inline-flex items-center gap-1.5">
                  <TextRoll>SHOP</TextRoll>
                  <ChevronDown
                    ref={chevronRef}
                    className="w-3.5 h-3.5 opacity-60 transition-colors group-hover:opacity-100"
                  />
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#A06A98] to-[#774170] rounded-full transition-transform duration-300 ease-out origin-left ${
                      currentPath.includes('/collection') || currentPath.includes('/shop')
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </span>
              </button>

              <div
                ref={dropdownRef}
                className="absolute left-0 top-full pt-1.5 w-56 z-50 origin-top-left"
              >
                <div className="bg-white border border-[#F0DEF7] shadow-[0_16px_40px_rgba(119,65,112,0.12)] rounded-2xl py-2 px-1.5 overflow-hidden">
                  {shopItems.map((item, index) => {
                    const isItemActive = currentPath === item.path;
                    return (
                      <button
                        key={item.path}
                        ref={(el) => {
                          itemsRef.current[index] = el;
                        }}
                        onClick={() => {
                          onNavigate(item.path);
                          handleMouseLeave();
                        }}
                        className={`group relative w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-between ${
                          isItemActive
                            ? 'bg-[#FDF2F8] text-[#A06A98]'
                            : 'text-[#333333] hover:bg-[#FDF2F8] hover:text-[#A06A98]'
                        }`}
                      >
                        <span className="relative inline-flex flex-col">
                          <TextRoll>{item.label}</TextRoll>
                          <span
                            className={`absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[#A06A98] rounded-full transition-transform duration-300 ease-out origin-left ${
                              isItemActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                            }`}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/en/about-us')}
              className={`group relative h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] cursor-pointer ${
                currentPath === '/en/about-us' ? 'text-[#A06A98]' : ''
              }`}
            >
              <span className="relative inline-flex flex-col items-center">
                <TextRoll>ABOUT US</TextRoll>
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#A06A98] to-[#774170] rounded-full transition-transform duration-300 ease-out origin-left ${
                    currentPath === '/en/about-us'
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => onNavigate('/en/stories')}
              className={`group relative h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] cursor-pointer ${
                currentPath.startsWith('/en/stories') ? 'text-[#A06A98]' : ''
              }`}
            >
              <span className="relative inline-flex flex-col items-center">
                <TextRoll>STORIES</TextRoll>
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#A06A98] to-[#774170] rounded-full transition-transform duration-300 ease-out origin-left ${
                    currentPath.startsWith('/en/stories')
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => onNavigate('/en/locations')}
              className={`group relative h-10 px-2.5 flex items-center transition-colors hover:text-[#774170] cursor-pointer ${
                currentPath === '/en/locations' ? 'text-[#A06A98]' : ''
              }`}
            >
              <span className="relative inline-flex flex-col items-center">
                <TextRoll>LOCATIONS</TextRoll>
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#A06A98] to-[#774170] rounded-full transition-transform duration-300 ease-out origin-left ${
                    currentPath === '/en/locations'
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </span>
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

          <button
            type="button"
            onClick={() => onNavigate('/en/wishlist')}
            aria-label="Wishlist"
            className={`relative flex p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06A98] ${
              currentPath === '/en/wishlist' ? 'text-[#A06A98]' : 'text-[#333333] hover:text-[#A06A98]'
            }`}
          >
            <Heart className="w-5 h-5 lg:w-6 lg:h-6" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-0 min-w-[18px] h-[18px] px-1 bg-[#A06A98] text-[#F8FAFC] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Account / Login Trigger with Dropdown on Hover & Click */}
          <div
            className="relative py-2"
            ref={userMenuRef}
            onMouseEnter={() => setUserMenuOpen(true)}
            onMouseLeave={() => setUserMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => handleUserAction(customer ? '/en/account' : '/en/login')}
              aria-label="Customer account menu"
              aria-expanded={userMenuOpen}
              className={`flex items-center p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06A98] cursor-pointer ${
                userMenuOpen || currentPath.includes('/account') || currentPath.includes('/login') || currentPath.includes('/signup')
                  ? 'text-[#A06A98]'
                  : 'text-[#333333] hover:text-[#A06A98]'
              }`}
            >
              {customer?.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt={customer.fullName || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-[#DFBEDB]"
                />
              ) : (
                <User className="w-5 h-5 lg:w-6 lg:h-6" />
              )}
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 top-full pt-1.5 w-64 sm:w-72 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="bg-white border border-[#F0DEF7] rounded-2xl shadow-[0_16px_40px_rgba(119,65,112,0.14)] py-2 overflow-hidden">
                {customer ? (
                  <>
                    <div className="px-4 py-3 border-b border-[#F0DEF7]/70 bg-[#FDF2F8]/40">
                      <p className="text-[11px] font-bold text-[#A06A98] uppercase tracking-wider">Welcome,</p>
                      <p className="text-sm font-bold text-[#333333] truncate">
                        {customer.fullName || customer.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-[#777777] truncate">{customer.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/account', false)}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#333333] hover:bg-[#FDF2F8] hover:text-[#A06A98] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#A06A98]" />
                        <span>My Account</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/wishlist', false)}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#333333] hover:bg-[#FDF2F8] hover:text-[#A06A98] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-[#A06A98]" />
                        <span>My Wishlist</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[#F0DEF7]/70">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-[#F0DEF7]/70 bg-[#FDF2F8]/30">
                      <p className="text-xs font-bold text-[#333333] uppercase tracking-wider">
                        Veloraa Rougee Account
                      </p>
                      <p className="text-[11px] text-[#777777] mt-0.5">
                        Sign in for personalized orders, saved details, &amp; wishlist.
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/login', true)}
                        className="w-full text-center py-2.5 px-4 bg-[#A06A98] hover:bg-[#774170] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/signup', true)}
                        className="w-full text-center py-2 px-4 bg-[#FDF2F8] hover:bg-[#FBE8F4] text-[#A06A98] border border-[#DFBEDB] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[#F0DEF7]/70">
                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/wishlist', false)}
                        className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#333333] hover:bg-[#FDF2F8] hover:text-[#A06A98] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-[#A06A98]" />
                        <span>Wishlist</span>
                      </button>
                    </div>
                  </>
                )}
                </div>
              </div>
            )}
          </div>

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
