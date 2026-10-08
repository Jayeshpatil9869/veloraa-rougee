import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  Users,
  Tag,
  Star,
  MessageSquare,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Clock,
} from 'lucide-react';
import { api } from '../lib/api';
import { CategoriesModule } from './modules/Categories';
import { CouponsModule } from './modules/Coupons';
import { CustomersModule } from './modules/Customers';
import { Dashboard } from './modules/Dashboard';
import { EnquiriesModule } from './modules/Enquiries';
import { OrdersModule } from './modules/Orders';
import { PaymentsModule } from './modules/Payments';
import { ProductsModule } from './modules/Products';
import { ReviewsModule } from './modules/Reviews';
import { inputClass, Notice, PrimaryButton } from './ui';
import { FlowerShortSvg, FlowerTallSvg } from '../components/brand/BrandIcons';
import { VeloraaRougeeLogo } from '../components/brand/VeloraaRougeeLogo';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products & Formulas', icon: Package },
  { id: 'categories', label: 'Collections', icon: Layers },
  { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
  { id: 'payments', label: 'Payments Audit', icon: CreditCard },
  { id: 'customers', label: 'Clientele', icon: Users },
  { id: 'coupons', label: 'Promo Codes', icon: Tag },
  { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
  { id: 'enquiries', label: 'Concierge Inquiries', icon: MessageSquare },
] as const;

type ModuleId = (typeof NAV)[number]['id'];

function moduleFromPath(path: string): ModuleId {
  const requested = path.split('/')[2] || 'dashboard';
  const match = NAV.find((item) => item.id === requested);
  return match ? match.id : 'dashboard';
}

export const AdminApp: React.FC<{
  path: string;
  onNavigate: (path: string) => void;
}> = ({ path, onNavigate }) => {
  const module = moduleFromPath(path);
  const [admin, setAdmin] = useState<{ email: string; fullName?: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Live Time clock in header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Continuous organic smooth floating motion and multi-layer parallax for botanical flowers
  useEffect(() => {
    if (admin) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial luxury fade reveal entrance for login card and corner flowers
      gsap.fromTo(
        '.admin-login-card',
        { opacity: 0, y: 28, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.flower-reveal-1',
        { opacity: 0, x: -40, y: -30, scale: 0.82, rotate: -8 },
        { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 1.3, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.flower-reveal-3',
        { opacity: 0, x: 40, y: -30, scale: 0.82, rotate: 8 },
        { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 1.3, delay: 0.12, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.flower-reveal-2',
        { opacity: 0, x: -35, y: 35, scale: 0.82, rotate: 6 },
        { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 1.4, delay: 0.2, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.flower-reveal-4',
        { opacity: 0, x: 40, y: 40, scale: 0.82, rotate: -6 },
        { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 1.4, delay: 0.28, ease: 'power3.out' }
      );

      // 2. Continuous organic smooth floating motion
      gsap.to('.flower-float-1', {
        x: '+=24',
        y: '-=28',
        rotation: 6,
        scale: 1.05,
        duration: 7.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.flower-float-2', {
        x: '-=20',
        y: '+=24',
        rotation: -7,
        scale: 1.04,
        duration: 8.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.6,
      });

      gsap.to('.flower-float-3', {
        x: '-=26',
        y: '+=30',
        rotation: -8,
        scale: 1.06,
        duration: 9.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.3,
      });

      gsap.to('.flower-float-4', {
        x: '+=25',
        y: '-=32',
        rotation: 7,
        scale: 1.05,
        duration: 8.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.1,
      });

      // 3. Multi-layer interactive cursor parallax & scroll parallax
      const xTo1 = gsap.quickTo('.flower-parallax-1', 'x', { duration: 0.9, ease: 'power2.out' });
      const yTo1 = gsap.quickTo('.flower-parallax-1', 'y', { duration: 0.9, ease: 'power2.out' });
      const xTo2 = gsap.quickTo('.flower-parallax-2', 'x', { duration: 1.2, ease: 'power2.out' });
      const yTo2 = gsap.quickTo('.flower-parallax-2', 'y', { duration: 1.2, ease: 'power2.out' });
      const xTo3 = gsap.quickTo('.flower-parallax-3', 'x', { duration: 1.0, ease: 'power2.out' });
      const yTo3 = gsap.quickTo('.flower-parallax-3', 'y', { duration: 1.0, ease: 'power2.out' });
      const xTo4 = gsap.quickTo('.flower-parallax-4', 'x', { duration: 1.3, ease: 'power2.out' });
      const yTo4 = gsap.quickTo('.flower-parallax-4', 'y', { duration: 1.3, ease: 'power2.out' });
      const cardXTo = gsap.quickTo('.admin-login-card', 'x', { duration: 1.2, ease: 'power2.out' });
      const cardYTo = gsap.quickTo('.admin-login-card', 'y', { duration: 1.2, ease: 'power2.out' });

      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const normX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
        const normY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

        xTo1(normX * -32);
        yTo1(normY * -26);

        xTo2(normX * -24);
        yTo2(normY * 30);

        xTo3(normX * 28);
        yTo3(normY * -28);

        xTo4(normX * 36);
        yTo4(normY * 34);

        cardXTo(normX * 8);
        cardYTo(normY * 8);
      };

      const handleScroll = () => {
        const scrollY = window.scrollY || window.pageYOffset;
        gsap.to('.flower-reveal-1', { y: scrollY * -0.15, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
        gsap.to('.flower-reveal-3', { y: scrollY * -0.13, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
        gsap.to('.flower-reveal-2', { y: scrollY * -0.20, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
        gsap.to('.flower-reveal-4', { y: scrollY * -0.24, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [admin]);

  useEffect(() => {
    api<{ admin: { email: string; fullName?: string } }>('/admin/auth/me')
      .then((result) => setAdmin(result.admin))
      .catch(() => setAdmin(null));
  }, []);

  useEffect(() => {
    const requested = path.split('/')[2] || 'dashboard';
    if (!NAV.some((item) => item.id === requested)) {
      onNavigate('/admin/dashboard');
    }
    // Close mobile drawer on navigation
    setIsMobileMenuOpen(false);
  }, [path, onNavigate]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const result = await api<{ admin: { email: string; fullName?: string } }>('/admin/auth/me');
      setAdmin(result.admin);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'invalid_credentials';
      setError(
        message === 'api_unreachable'
          ? 'The store API is not running. Please start it with npm run dev.'
          : message === 'database_unconfigured'
            ? 'The store API cannot reach Supabase. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env, then restart the API.'
            : message === 'invalid_credentials'
              ? 'Invalid administrator email or password.'
              : message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api('/admin/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      setAdmin(null);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. Unauthenticated Login Screen with Botanical Floating & Parallax Effects
  // ---------------------------------------------------------------------------
  if (!admin) {
    return (
      <main
        ref={containerRef}
        className="min-h-screen w-full bg-gradient-to-b from-[#FAF5F8] via-[#FDF2F8]/80 to-white flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden"
      >
        {/* ========================================================================= */}
        {/*             DECORATIVE BOTANICAL FLOWER ILLUSTRATIONS (THEME)             */}
        {/* ========================================================================= */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {/* Top-Left Botanical Flower */}
          <div className="flower-reveal-1 absolute -left-12 -top-10 lg:left-6 lg:top-8 pointer-events-none">
            <div className="flower-parallax-1 will-change-transform">
              <div className="flower-float-1 will-change-transform opacity-45 lg:opacity-65">
                <FlowerTallSvg className="w-36 sm:w-52 lg:w-64 h-auto text-[#D39DC7] -scale-x-100 drop-shadow-xs" />
              </div>
            </div>
          </div>

          {/* Bottom-Left Botanical Flower */}
          <div className="flower-reveal-2 absolute -left-8 -bottom-12 lg:left-8 lg:bottom-4 pointer-events-none">
            <div className="flower-parallax-2 will-change-transform">
              <div className="flower-float-2 will-change-transform opacity-35 lg:opacity-55">
                <FlowerShortSvg className="w-28 sm:w-40 lg:w-48 h-auto text-[#A06A98] drop-shadow-xs" />
              </div>
            </div>
          </div>

          {/* Top-Right Botanical Flower */}
          <div className="flower-reveal-3 absolute -right-12 -top-8 lg:right-6 lg:top-12 pointer-events-none">
            <div className="flower-parallax-3 will-change-transform">
              <div className="flower-float-3 will-change-transform opacity-40 lg:opacity-60">
                <FlowerShortSvg className="w-32 sm:w-44 lg:w-56 h-auto text-[#DFBEDB] -scale-x-100 drop-shadow-xs" />
              </div>
            </div>
          </div>

          {/* Bottom-Right Large Botanical Flower */}
          <div className="flower-reveal-4 absolute -right-16 -bottom-16 lg:right-6 lg:bottom-2 pointer-events-none">
            <div className="flower-parallax-4 will-change-transform">
              <div className="flower-float-4 will-change-transform opacity-50 lg:opacity-70">
                <FlowerTallSvg className="w-44 sm:w-60 lg:w-80 h-auto text-[#9F6998] drop-shadow-xs" />
              </div>
            </div>
          </div>

          {/* Soft Ambient Radial Blurs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-[#DFBEDB]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#FDF2F8] rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ========================================================================= */}
        {/*                         LOGIN CONTAINER CARD                              */}
        {/* ========================================================================= */}
        <div className="admin-login-card w-full max-w-md bg-white/95 backdrop-blur-md border border-[#F0DEF7] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(119,65,112,0.16)] p-6 sm:p-10 relative z-10 overflow-hidden">
          {/* Top Luxury Gradient Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#A06A98] via-[#DFBEDB] to-[#76416F] absolute top-0 left-0 right-0" />

          <div className="text-center mb-8 pt-2">
            <div className="flex justify-center mb-3">
              <VeloraaRougeeLogo
                size="md"
                color="#A06A98"
                onClick={() => onNavigate('/en')}
                className="cursor-pointer hover:opacity-90 transition-opacity"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#DFBEDB]/60 mb-2">
              <Sparkles className="w-3 h-3 text-[#A06A98]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#76416F]">
                Backoffice Studio Portal
              </span>
            </div>
            <p
              className="text-2xl text-[#333333] leading-none pt-1"
              style={{ fontFamily: "'Amithen', cursive" }}
            >
              Studio Access
            </p>
          </div>

          <form onSubmit={(event) => void login(event)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#666666] block">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A06A98] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="w-full bg-[#FAF5F8] border border-[#E2E8F0] focus:border-[#A06A98] focus:ring-2 focus:ring-[#A06A98]/20 focus:bg-white text-sm text-[#333333] placeholder-[#999999] rounded-[0.35rem] py-2.5 pl-10 pr-3.5 transition-all outline-none"
                  placeholder="admin@veloraarougee.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#666666] block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A06A98] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-[#FAF5F8] border border-[#E2E8F0] focus:border-[#A06A98] focus:ring-2 focus:ring-[#A06A98]/20 focus:bg-white text-sm text-[#333333] placeholder-[#999999] rounded-[0.35rem] py-2.5 pl-10 pr-10 transition-all outline-none"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#76416F] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <Notice variant="error">{error}</Notice>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 font-bold uppercase tracking-widest text-xs rounded-[0.35rem] bg-gradient-to-r from-[#76416F] via-[#8E5385] to-[#A06A98] hover:opacity-95 active:scale-[0.98] text-white shadow-md shadow-[#76416F]/25 hover:shadow-lg hover:shadow-[#76416F]/35 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Authenticating Studio…' : 'Enter Studio Portal'}</span>
            </button>

            <div className="pt-4 border-t border-[#F1F5F9] text-center">
              <button
                type="button"
                onClick={() => onNavigate('/en')}
                className="group text-xs font-bold text-[#A06A98] hover:text-[#76416F] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className="transition-transform group-hover:-translate-x-1">←</span>
                <span className="underline underline-offset-4 decoration-[#DFBEDB] group-hover:decoration-[#76416F]">
                  Return to Customer Storefront
                </span>
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Fully Responsive Authenticated Admin Shell
  // ---------------------------------------------------------------------------
  const currentNav = NAV.find((item) => item.id === module);
  const title = currentNav?.label ?? 'Dashboard';

  const userInitials =
    admin.fullName
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || admin.email.slice(0, 2).toUpperCase();

  const renderNavLinks = () => (
    <nav className="p-3 grid gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = module === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(`/admin/${item.id}`)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[0.3rem] text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-[#76416F] bg-gradient-to-r from-[#FDF2F8] to-[#FAF5F8] border-l-[3px] border-[#A06A98] font-bold shadow-2xs'
                : 'text-[#666666] font-medium hover:text-[#A06A98] hover:bg-[#FAF5F8]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[#A06A98]' : 'text-[#999999]'
                }`}
              />
              <span>{item.label}</span>
            </div>
            {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#A06A98]" />}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#FDF4F9] text-[#333333] lg:grid lg:grid-cols-[260px_1fr] relative"
    >
      {/* ========================================================================= */}
      {/* 1. Mobile Off-Canvas Drawer Backdrop & Sheet                              */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Mobile Drawer Header */}
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FDF2F8]/60">
                <div className="flex items-center gap-2.5">
                  <VeloraaRougeeLogo
                    size="sm"
                    color="#A06A98"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('/admin/dashboard');
                    }}
                  />
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[0.25rem] bg-[#76416F] text-white">
                    Studio
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[#666666] hover:text-[#333333] hover:bg-white rounded-[0.3rem]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              {renderNavLinks()}
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#FAF5F8]/50 space-y-3">
              <button
                onClick={() => onNavigate('/en')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[0.3rem] bg-white border border-[#E2E8F0] text-xs font-bold text-[#333333] hover:text-[#A06A98]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live Store</span>
              </button>
              <button
                onClick={() => void handleLogout()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[0.3rem] bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Desktop Fixed Left Sidebar Shell                                      */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex bg-white border-r border-[#E2E8F0] flex-col justify-between min-h-screen sticky top-0 z-40">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#E2E8F0]/80 bg-gradient-to-b from-[#FAF5F8]/60 to-white">
            <div className="flex items-center justify-between gap-2 mb-2">
              <VeloraaRougeeLogo
                size="md"
                color="#A06A98"
                onClick={() => onNavigate('/admin/dashboard')}
                className="cursor-pointer"
              />
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-[0.3rem] bg-[#FDF2F8] text-[#76416F] border border-[#DFBEDB]/60 shadow-2xs">
                Studio
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#76416F]/75">
              Luxury Backoffice Suite
            </p>
          </div>

          {/* Desktop Nav Links */}
          {renderNavLinks()}
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#FAF5F8]/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#666666]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </span>
            <span className="text-[10px] text-[#999999] font-mono">v2.4.0</span>
          </div>

          <button
            onClick={() => onNavigate('/en')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[0.3rem] bg-white border border-[#E2E8F0] hover:border-[#DFBEDB] text-xs font-bold text-[#333333] hover:text-[#A06A98] transition-all shadow-2xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Store</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 3. Main Content Viewport & Header                                        */}
      {/* ========================================================================= */}
      <section className="min-w-0 flex flex-col min-h-screen">
        {/* Top Application Bar */}
        <header className="h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#333333] hover:text-[#A06A98] hover:bg-[#FAF5F8] rounded-[0.3rem] cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#666666]">
              <span className="font-semibold text-[#999999] hidden sm:inline">Admin</span>
              <span className="text-[#CCCCCC] hidden sm:inline">/</span>
              <span className="font-bold text-[#333333] flex items-center gap-1.5">
                {currentNav?.icon && (
                  <currentNav.icon className="w-4 h-4 text-[#A06A98]" />
                )}
                <span>{title}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Time Clock */}
            {currentTime && (
              <span className="text-xs text-[#888888] font-medium hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF5F8] rounded-[0.3rem] border border-[#E2E8F0]">
                <Clock className="w-3.5 h-3.5 text-[#A06A98]" />
                {currentTime}
              </span>
            )}

            {/* Admin User Profile Badge */}
            <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 py-1 pr-1 sm:pr-1.5 bg-[#FAF5F8] border border-[#E2E8F0] rounded-full">
              <span className="text-xs font-bold text-[#333333] hidden sm:inline">
                {admin.email}
              </span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A06A98] to-[#76416F] text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                {userInitials}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => void handleLogout()}
              className="p-2 text-[#666666] hover:text-rose-600 hover:bg-rose-50 rounded-[0.3rem] transition-colors cursor-pointer"
              title="Log out of Admin"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
          {module === 'dashboard' && (
            <Dashboard onOpenOrder={(id) => onNavigate(`/admin/orders/${id}`)} />
          )}
          {module === 'products' && <ProductsModule />}
          {module === 'categories' && <CategoriesModule />}
          {module === 'orders' && (
            <OrdersModule path={path} onOpen={(id) => onNavigate(`/admin/orders/${id}`)} />
          )}
          {module === 'payments' && <PaymentsModule />}
          {module === 'customers' && <CustomersModule />}
          {module === 'coupons' && <CouponsModule />}
          {module === 'reviews' && <ReviewsModule />}
          {module === 'enquiries' && <EnquiriesModule />}
        </main>
      </section>
    </div>
  );
};
