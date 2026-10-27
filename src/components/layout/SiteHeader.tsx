import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShoppingBag, User, Menu, ChevronDown, Heart, LogIn, LogOut, UserPlus, Package, MapPin } from 'lucide-react';
import { VeloraaRougeeLogo } from '../brand/VeloraaRougeeLogo';
import { TextRoll } from '../ui/TextRoll';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cartService } from '../../services/cartService';
import { api, hasApi } from '../../lib/api';

interface SiteHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
  onOpenCart: () => void;
  onOpenMobileMenu: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenCart,
  onOpenMobileMenu,
}) => {
  const [cartCount, setCartCount] = useState(0);
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

    updateCount();
    window.addEventListener('cart_updated', updateCount);
    return () => {
      window.removeEventListener('cart_updated', updateCount);
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
    <header className="sticky top-0 z-40 bg-[var(--header-bg)] backdrop-blur-md shadow-xs border-b border-[var(--header-border)] h-[72px] transition-colors duration-200">
      <div className="h-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-12 2xl:px-16 flex items-center justify-between relative lg:grid lg:grid-cols-5">
        {/* Left Column: Nav or Hamburger + Mobile Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-1 lg:col-span-2 z-10">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open mobile menu"
            className="lg:hidden p-2 -ml-1 text-[var(--text-primary)] hover:text-[var(--accent-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Theme Toggle on Mobile ONLY (Positioned immediately on the left next to hamburger) */}
          <div className="flex lg:hidden items-center">
            <ThemeToggle className="scale-90 origin-left" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-bold uppercase text-[var(--text-primary)]">
            <button
              onClick={() => onNavigate('/en')}
              className={`group relative h-10 px-2.5 flex items-center transition-colors hover:text-[var(--accent-gold)] cursor-pointer ${
                currentPath === '/' || currentPath === '/en' ? 'text-[var(--accent-gold)]' : ''
              }`}
            >
              <span className="relative inline-flex flex-col items-center">
                <TextRoll>HOME</TextRoll>
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[var(--accent-gold)] rounded-full transition-transform duration-300 ease-out origin-left ${
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
                className={`group relative h-10 px-2.5 flex items-center gap-1.5 transition-colors hover:text-[var(--accent-gold)] cursor-pointer ${
                  currentPath.includes('/collection') || currentPath.includes('/shop')
                    ? 'text-[var(--accent-gold)]'
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
                    className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[var(--accent-gold)] rounded-full transition-transform duration-300 ease-out origin-left ${
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
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[0_16px_40px_rgba(0,0,0,0.18)] rounded-2xl py-2 px-1.5 overflow-hidden">
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
                            ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                            : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="relative inline-flex flex-col">
                          <TextRoll>{item.label}</TextRoll>
                          <span
                            className={`absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-[var(--accent-gold)] rounded-full transition-transform duration-300 ease-out origin-left ${
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
              className={`group relative h-10 px-2.5 flex items-center transition-colors hover:text-[var(--accent-gold)] cursor-pointer ${
                currentPath === '/en/about-us' ? 'text-[var(--accent-gold)]' : ''
              }`}
            >
              <span className="relative inline-flex flex-col items-center">
                <TextRoll>ABOUT US</TextRoll>
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[var(--accent-gold)] rounded-full transition-transform duration-300 ease-out origin-left ${
                    currentPath === '/en/about-us'
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => onNavigate('/en/stories')}
              className={`group relative h-10 px-2.5 flex items-center transition-colors hover:text-[var(--accent-gold)] cursor-pointer ${
                currentPath.startsWith('/en/stories') ? 'text-[var(--accent-gold)]' : ''
              }`}
            >
              <span className="relative inline-flex flex-col items-center">
                <TextRoll>STORIES</TextRoll>
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[var(--accent-gold)] rounded-full transition-transform duration-300 ease-out origin-left ${
                    currentPath.startsWith('/en/stories')
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => onNavigate('/en/locations')}
              className={`group relative h-10 px-2.5 flex items-center transition-colors hover:text-[var(--accent-gold)] cursor-pointer ${
                currentPath === '/en/locations' ? 'text-[var(--accent-gold)]' : ''
              }`}
            >
              <span className="relative inline-flex flex-col items-center">
                <TextRoll>LOCATIONS</TextRoll>
                <span
                  className={`absolute -bottom-1 left-0 w-full h-[2px] bg-[var(--accent-gold)] rounded-full transition-transform duration-300 ease-out origin-left ${
                    currentPath === '/en/locations'
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </span>
            </button>
          </nav>
        </div>

        {/* Center Column: Authoritative Brand Mark (Dead-center on mobile, col-span-1 on desktop) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 lg:static lg:left-auto lg:top-auto lg:translate-x-0 lg:translate-y-0 lg:col-span-1 flex items-center justify-center text-[var(--text-primary)] dark:text-[var(--accent-gold)] shrink-0 z-10 pointer-events-auto">
          <VeloraaRougeeLogo
            size="md"
            onClick={() => onNavigate('/en')}
          />
        </div>

        {/* Right Column: Actions */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 lg:gap-4 text-[var(--text-primary)] lg:col-span-2 z-10">
          {/* Theme Toggle Button (Desktop Only on Right side) */}
          <div className="hidden lg:flex items-center">
            <ThemeToggle />
          </div>


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
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer ${
                userMenuOpen || currentPath.includes('/account') || currentPath.includes('/orders') || currentPath.includes('/login') || currentPath.includes('/signup')
                  ? 'text-[var(--accent-primary)]'
                  : 'text-[var(--text-primary)] hover:text-[var(--accent-primary)]'
              }`}
            >
              {customer?.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt={customer.fullName || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-[var(--border-subtle)]"
                />
              ) : (
                <User className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
              )}
              {customer && (
                <>
                  <span className="hidden md:inline text-sm font-medium max-w-[7rem] truncate">
                    {(customer.fullName || customer.email).split(' ')[0].split('@')[0]}
                  </span>
                  <ChevronDown className={`hidden md:block w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 top-full pt-1.5 w-64 sm:w-72 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.2)] py-2 overflow-hidden text-[var(--text-primary)]">
                {customer ? (
                  <>
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                      <p className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">Welcome,</p>
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {customer.fullName || customer.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{customer.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/account', false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/orders', false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                        <span>Orders</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/account?tab=addresses', false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                        <span>Addresses</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/wishlist', false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                        <span>Wishlist</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenCart();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                        <span>Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                      <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Veloraa Rougee Account
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Sign in for personalized orders, saved details, &amp; wishlist.
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/login', true)}
                        className="w-full text-center py-2.5 px-4 btn-theme-primary rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/signup', true)}
                        className="w-full text-center py-2 px-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-subtle)] text-[var(--accent-primary)] border border-[var(--border-subtle)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => handleUserAction('/en/wishlist', false)}
                        className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-[var(--accent-primary)]" />
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
            className="relative p-2 text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-0 min-w-[18px] h-[18px] px-1 bg-[var(--accent-gold)] text-[var(--text-inverse)] text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
