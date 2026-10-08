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
      // 1. Initial luxury fade reveal entrance for login card, items, and corner flowers
      gsap.fromTo(
        '.admin-login-card',
        { opacity: 0, y: 32, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.login-anim-item',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out', delay: 0.25 }
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

      // 2. Continuous ambient floating orbs
      gsap.to('.ambient-orb-1', {
        scale: 1.15,
        x: '+=25',
        y: '-=20',
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.ambient-orb-2', {
        scale: 1.12,
        x: '-=25',
        y: '+=20',
        duration: 9.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // 3. Continuous organic smooth floating motion for flowers
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

      // 4. Multi-layer interactive cursor parallax & scroll parallax
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

      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      if (isFinePointer) {
        window.addEventListener('mousemove', handleMouseMove);
      }
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        if (isFinePointer) {
          window.removeEventListener('mousemove', handleMouseMove);
        }
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
  // 1. Redesigned Luxury Unauthenticated Login Screen
  // ---------------------------------------------------------------------------
  if (!admin) {
    return (
      <main
        ref={containerRef}
        className="min-h-screen min-h-dvh w-full bg-gradient-to-br from-[#FAF5F8] via-[#FCF1F7] to-[#F7EBF4] flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden overflow-y-auto"
      >
        {/* Soft Ambient Dynamic Blurs & Light Sheens */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="ambient-orb-1 absolute -top-24 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] lg:w-[800px] h-[350px] sm:h-[600px] lg:h-[800px] bg-gradient-to-br from-[#DFBEDB]/45 via-[#F3D5EB]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="ambient-orb-2 absolute -bottom-28 right-10 w-[300px] sm:w-[500px] lg:w-[650px] h-[300px] sm:h-[500px] lg:h-[650px] bg-gradient-to-tl from-[#EBD1E7]/40 via-[#FDF2F8]/60 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-[260px] sm:w-[400px] h-[260px] sm:h-[400px] bg-[#FAF0F7]/80 rounded-full blur-2xl pointer-events-none" />

          {/* Top-Left Botanical Flower */}
          <div className="flower-reveal-1 absolute -left-8 -top-8 sm:-left-4 sm:-top-4 lg:left-8 lg:top-10 pointer-events-none">
            <div className="flower-parallax-1 will-change-transform">
              <div className="flower-float-1 will-change-transform opacity-35 sm:opacity-50 lg:opacity-75">
                <FlowerTallSvg className="w-28 sm:w-44 md:w-56 lg:w-72 h-auto text-[#D39DC7] -scale-x-100 drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Bottom-Left Botanical Flower */}
          <div className="flower-reveal-2 absolute -left-6 -bottom-8 sm:-left-4 sm:-bottom-4 lg:left-10 lg:bottom-6 pointer-events-none">
            <div className="flower-parallax-2 will-change-transform">
              <div className="flower-float-2 will-change-transform opacity-30 sm:opacity-40 lg:opacity-65">
                <FlowerShortSvg className="w-24 sm:w-36 md:w-48 lg:w-56 h-auto text-[#A06A98] drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Top-Right Botanical Flower */}
          <div className="flower-reveal-3 absolute -right-8 -top-8 sm:-right-4 sm:-top-4 lg:right-10 lg:top-14 pointer-events-none">
            <div className="flower-parallax-3 will-change-transform">
              <div className="flower-float-3 will-change-transform opacity-30 sm:opacity-45 lg:opacity-70">
                <FlowerShortSvg className="w-24 sm:w-40 md:w-52 lg:w-64 h-auto text-[#DFBEDB] -scale-x-100 drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Bottom-Right Large Botanical Flower */}
          <div className="flower-reveal-4 absolute -right-10 -bottom-10 sm:-right-6 sm:-bottom-6 lg:right-10 lg:bottom-4 pointer-events-none">
            <div className="flower-parallax-4 will-change-transform">
              <div className="flower-float-4 will-change-transform opacity-35 sm:opacity-55 lg:opacity-80">
                <FlowerTallSvg className="w-32 sm:w-52 md:w-68 lg:w-92 h-auto text-[#9F6998] drop-shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Center Luxury Card with Double Border Glow & Glassmorphism */}
        <div className="admin-login-card w-full max-w-[440px] relative z-10 my-auto">
          {/* Outer Glassmorphic Border Wrap */}
          <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white via-[#F3DFEE]/80 to-[#DFBEDB]/50 shadow-[0_24px_70px_-12px_rgba(118,65,111,0.2),0_10px_24px_-4px_rgba(160,106,152,0.08)]">
            <div className="bg-white/92 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 md:p-10 relative overflow-hidden">
              {/* Top Luxury Shimmer Jewel Bar */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#A06A98] to-transparent absolute top-0 left-0 right-0 opacity-80" />

              {/* Brand Logo Header */}
              <div className="login-anim-item flex flex-col items-center justify-center mb-7 pt-1">
                <VeloraaRougeeLogo
                  size="md"
                  color="#262626"
                  onClick={() => onNavigate('/en')}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
                {/* Subtle Luxury Divider */}
                <div className="flex items-center gap-3 w-full max-w-[180px] mt-4 opacity-70">
                  <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#DFBEDB]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A06A98]/60" />
                  <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#DFBEDB]" />
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={(event) => void login(event)} className="space-y-4 sm:space-y-5">
                {/* Email Field */}
                <div className="login-anim-item space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#666666] flex items-center justify-between">
                    <span>Admin Email / Username</span>
                  </label>
                  <div className="relative group/field">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E7398] group-focus-within/field:text-[#76416F] transition-colors pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="text"
                      inputMode="email"
                      required
                      autoComplete="username"
                      className="w-full bg-[#FAF6F9]/90 border border-[#E8DAE5] hover:border-[#D5B8D1] focus:border-[#A06A98] focus:bg-white focus:ring-4 focus:ring-[#A06A98]/12 text-base sm:text-sm text-[#2A2A2A] placeholder-[#A0939F] rounded-xl py-3 sm:py-2.5 pl-10 pr-3.5 transition-all duration-200 outline-none"
                      placeholder="admin@veloraarougee.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="login-anim-item space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#666666] flex items-center justify-between">
                    <span>Password</span>
                  </label>
                  <div className="relative group/field">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E7398] group-focus-within/field:text-[#76416F] transition-colors pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      className="w-full bg-[#FAF6F9]/90 border border-[#E8DAE5] hover:border-[#D5B8D1] focus:border-[#A06A98] focus:bg-white focus:ring-4 focus:ring-[#A06A98]/12 text-base sm:text-sm text-[#2A2A2A] placeholder-[#A0939F] rounded-xl py-3 sm:py-2.5 pl-10 pr-11 transition-all duration-200 outline-none"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#76416F] hover:bg-[#FAF2F8] transition-all p-2 rounded-lg cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Notice */}
                {error && (
                  <div className="login-anim-item">
                    <Notice variant="error">{error}</Notice>
                  </div>
                )}

                {/* CTA Submit Button */}
                <div className="login-anim-item pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 font-bold uppercase tracking-widest text-xs sm:text-[13px] rounded-xl bg-gradient-to-r from-[#76416F] via-[#8C4E84] to-[#A06A98] hover:brightness-105 active:scale-[0.98] text-white shadow-[0_10px_25px_-5px_rgba(118,65,111,0.35)] hover:shadow-[0_14px_30px_-5px_rgba(118,65,111,0.45)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 relative overflow-hidden touch-manipulation group"
                  >
                    {/* Shimmer Sweep Effect */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
                    <ShieldCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{isLoading ? 'Authenticating Studio…' : 'Enter Studio Portal'}</span>
                  </button>
                </div>

                {/* Footer Security Badge & Storefront Link */}
                <div className="login-anim-item pt-4 border-t border-[#F1E6EE]/80 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#888888]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>256-Bit TLS Encrypted Gateway</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('/en')}
                    className="group text-xs font-bold text-[#A06A98] hover:text-[#76416F] transition-colors inline-flex items-center gap-1.5 py-1 cursor-pointer touch-manipulation"
                  >
                    <span className="transition-transform group-hover:-translate-x-1 duration-200">←</span>
                    <span className="underline underline-offset-4 decoration-[#DFBEDB] group-hover:decoration-[#76416F] transition-all">
                      Return to Customer Storefront
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
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
