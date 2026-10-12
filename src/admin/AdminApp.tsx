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
  Bell,
  BookOpen,
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
import { StoriesModule } from './modules/Stories';
import { inputClass, Notice, PrimaryButton } from './ui';
import { FlowerShortSvg, FlowerTallSvg } from '../components/brand/BrandIcons';
import { VeloraaRougeeLogo } from '../components/brand/VeloraaRougeeLogo';
import { ThemeToggle } from '../components/ui/ThemeToggle';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products & Formulas', icon: Package },
  { id: 'categories', label: 'Collections', icon: Layers },
  { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
  { id: 'payments', label: 'Payments Audit', icon: CreditCard },
  { id: 'customers', label: 'Clientele', icon: Users },
  { id: 'coupons', label: 'Promo Codes', icon: Tag },
  { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
  { id: 'stories', label: 'Cosmetics Articles & SEO', icon: BookOpen },
  { id: 'enquiries', label: 'Concierge Inquiries', icon: MessageSquare },
] as const;

type ModuleId = (typeof NAV)[number]['id'];

function moduleFromPath(path: string): ModuleId {
  const clean = path.replace(/^\/admin\/?/, '');
  const requested = clean.split('/')[0] || 'dashboard';
  const match = NAV.find((item) => item.id === requested);
  return match ? match.id : 'dashboard';
}

export const AdminApp: React.FC<{
  path: string;
  onNavigate: (path: string) => void;
}> = ({ path, onNavigate }) => {
  // When accessed via admin.veloraarougee.com the URL root is "/" not "/admin"
  const isAdminSubdomain = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
  const adminNav = (to: string) => {
    // to is like '/admin/products'. On subdomain we strip the /admin prefix.
    const finalPath = isAdminSubdomain ? to.replace(/^\/admin/, '') || '/' : to;
    onNavigate(finalPath);
  };
  const module = moduleFromPath(path);
  // Synchronous session hydration from localStorage prevents flash of login screen on page reload
  const [admin, setAdmin] = useState<{ email: string; fullName?: string } | null>(() => {
    try {
      const cached = localStorage.getItem('vr_admin_session');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Track whether we are verifying authentication on initial mount
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    try {
      // If we already have a cached session, we don't block the UI with a full splash
      return !localStorage.getItem('vr_admin_session');
    } catch {
      return true;
    }
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState<{
    id: string;
    type: string;
    title: string;
    body: string;
    href?: string | null;
    read_at?: string | null;
    created_at: string;
  }[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    api<{ id: string; type: string; title: string; body: string; href?: string | null; read_at?: string | null; created_at: string }[]>('/admin/notifications')
      .then(setNotifications)
      .catch(() => {});
  };

  useEffect(() => {
    if (!admin) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 12000);
    return () => clearInterval(interval);
  }, [admin]);

  // Click outside listener so dropdown stays open during scroll and closes when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifMouseEnter = () => {
    if (notifLeaveTimerRef.current) {
      clearTimeout(notifLeaveTimerRef.current);
      notifLeaveTimerRef.current = null;
    }
    setIsNotificationOpen(true);
  };

  const handleNotifMouseLeave = () => {
    if (notifLeaveTimerRef.current) clearTimeout(notifLeaveTimerRef.current);
    notifLeaveTimerRef.current = setTimeout(() => {
      setIsNotificationOpen(false);
    }, 450);
  };

  const handleMarkAllRead = async () => {
    try {
      await api('/admin/notifications/read', { method: 'POST', body: JSON.stringify({ all: true }) });
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    } catch {}
  };

  const handleNotificationClick = async (notif: { id: string; href?: string | null; read_at?: string | null }) => {
    if (!notif.read_at) {
      try {
        await api('/admin/notifications/read', { method: 'POST', body: JSON.stringify({ id: notif.id }) });
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)));
      } catch {}
    }
    setIsNotificationOpen(false);
    if (notif.href) {
      onNavigate(notif.href);
    }
  };

  // Close notifications dropdown on click outside
  useEffect(() => {
    if (!isNotificationOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

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
    if (admin || isCheckingAuth) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial luxury fade reveal entrance for login card, items, and corner flowers
      gsap.fromTo(
        '.admin-login-card',
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.login-anim-item',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );

      gsap.fromTo(
        '.flower-reveal-1',
        { opacity: 0, x: -40, y: -30, scale: 0.82, rotate: -8 },
        { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 1.1, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.flower-reveal-3',
        { opacity: 0, x: 40, y: -30, scale: 0.82, rotate: 8 },
        { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 1.1, delay: 0.1, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.flower-reveal-2',
        { opacity: 0, x: -35, y: 35, scale: 0.82, rotate: 6 },
        { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 1.2, delay: 0.15, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.flower-reveal-4',
        { opacity: 0, x: 40, y: 40, scale: 0.82, rotate: -6 },
        { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 1.2, delay: 0.2, ease: 'power3.out' }
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
  }, [admin, isCheckingAuth]);

  useEffect(() => {
    let isMounted = true;
    api<{ admin: { email: string; fullName?: string } }>('/admin/auth/me')
      .then((result) => {
        if (!isMounted) return;
        setAdmin(result.admin);
        try {
          localStorage.setItem('vr_admin_session', JSON.stringify(result.admin));
        } catch {
          // ignore
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setAdmin(null);
        try {
          localStorage.removeItem('vr_admin_session');
        } catch {
          // ignore
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const clean = path.replace(/^\/admin\/?/, '');
    const requested = clean.split('/')[0] || 'dashboard';
    if (!NAV.some((item) => item.id === requested)) {
      adminNav('/admin/dashboard');
    }
    // Close mobile drawer on navigation
    setIsMobileMenuOpen(false);
  }, [path]);

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
      try {
        localStorage.setItem('vr_admin_session', JSON.stringify(result.admin));
      } catch {
        // ignore
      }
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
      try {
        localStorage.removeItem('vr_admin_session');
      } catch {
        // ignore
      }
      setAdmin(null);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. Sleek Branded Session Verification Loading Screen (Prevents Auth Glitch)
  // ---------------------------------------------------------------------------
  if (isCheckingAuth) {
    return (
      <main className="min-h-screen min-h-dvh w-full bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-subtle)] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-200">
        {/* Soft Ambient Dynamic Blurs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[var(--accent-primary)]/20 via-[var(--bg-subtle)]/25 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 right-10 w-[450px] h-[450px] bg-gradient-to-tl from-[var(--accent-secondary)]/15 via-[var(--bg-secondary)]/50 to-transparent rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center p-8 sm:p-10 rounded-3xl bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border-subtle)] shadow-[var(--shadow-card)] max-w-sm w-full text-center">
          <div className="text-[var(--text-primary)] mb-6">
            <VeloraaRougeeLogo size="md" color="currentColor" />
          </div>

          {/* Luxury Animated Loader */}
          <div className="relative w-11 h-11 mb-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--border-subtle)]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent-primary)] border-r-[var(--text-muted)] animate-spin" />
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)] animate-pulse" />
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            Veloraa Rougee Studio
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
            Verifying secure credentials…
          </p>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. High-Contrast Luxury Unauthenticated Login Screen
  // ---------------------------------------------------------------------------
  if (!admin) {
    return (
      <main
        ref={containerRef}
        className="min-h-screen min-h-dvh w-full bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-subtle)] flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden overflow-y-auto transition-colors duration-200"
      >
        {/* Top Floating Controls on Login Screen */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2.5">
          <ThemeToggle />
        </div>

        {/* Soft Ambient Dynamic Blurs & Light Sheens */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="ambient-orb-1 absolute -top-24 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] lg:w-[800px] h-[350px] sm:h-[600px] lg:h-[800px] bg-gradient-to-br from-[var(--accent-primary)]/20 via-[var(--bg-subtle)]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="ambient-orb-2 absolute -bottom-28 right-10 w-[300px] sm:w-[500px] lg:w-[650px] h-[300px] sm:h-[500px] lg:h-[650px] bg-gradient-to-tl from-[var(--accent-secondary)]/20 via-[var(--bg-secondary)]/50 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-[260px] sm:w-[400px] h-[260px] sm:h-[400px] bg-[var(--bg-secondary)]/60 rounded-full blur-2xl pointer-events-none" />

          {/* Top-Left Botanical Flower */}
          <div className="flower-reveal-1 absolute -left-8 -top-8 sm:-left-4 sm:-top-4 lg:left-8 lg:top-10 pointer-events-none">
            <div className="flower-parallax-1 will-change-transform">
              <div className="flower-float-1 will-change-transform opacity-30 sm:opacity-45 lg:opacity-60 text-[var(--accent-secondary)]">
                <FlowerTallSvg className="w-28 sm:w-44 md:w-56 lg:w-72 h-auto -scale-x-100 drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Bottom-Left Botanical Flower */}
          <div className="flower-reveal-2 absolute -left-6 -bottom-8 sm:-left-4 sm:-bottom-4 lg:left-10 lg:bottom-6 pointer-events-none">
            <div className="flower-parallax-2 will-change-transform">
              <div className="flower-float-2 will-change-transform opacity-25 sm:opacity-35 lg:opacity-50 text-[var(--accent-primary)]">
                <FlowerShortSvg className="w-24 sm:w-36 md:w-48 lg:w-56 h-auto drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Top-Right Botanical Flower */}
          <div className="flower-reveal-3 absolute -right-8 -top-8 sm:-right-4 sm:-top-4 lg:right-10 lg:top-14 pointer-events-none">
            <div className="flower-parallax-3 will-change-transform">
              <div className="flower-float-3 will-change-transform opacity-25 sm:opacity-40 lg:opacity-55 text-[var(--border-strong)]">
                <FlowerShortSvg className="w-24 sm:w-40 md:w-52 lg:w-64 h-auto -scale-x-100 drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Bottom-Right Large Botanical Flower */}
          <div className="flower-reveal-4 absolute -right-10 -bottom-10 sm:-right-6 sm:-bottom-6 lg:right-10 lg:bottom-4 pointer-events-none">
            <div className="flower-parallax-4 will-change-transform">
              <div className="flower-float-4 will-change-transform opacity-30 sm:opacity-45 lg:opacity-65 text-[var(--text-muted)]">
                <FlowerTallSvg className="w-32 sm:w-52 md:w-68 lg:w-92 h-auto drop-shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Center Luxury Card with Double Border Glow & Glassmorphism */}
        <div className="admin-login-card w-full max-w-[440px] relative z-10 my-auto">
          {/* Outer Glassmorphic Border Wrap */}
          <div className="p-[1px] rounded-3xl bg-gradient-to-b from-[var(--border-strong)]/30 via-[var(--border-subtle)] to-[var(--border-subtle)]/40 shadow-[var(--shadow-card)]">
            <div className="bg-[var(--card-bg)] backdrop-blur-2xl rounded-3xl p-7 sm:p-9 md:p-10 relative overflow-hidden border border-[var(--border-subtle)]">
              {/* Top Luxury Shimmer Jewel Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent absolute top-0 left-0 right-0 opacity-90" />

              {/* Brand Logo Header */}
              <div className="login-anim-item flex flex-col items-center justify-center mb-7 pt-1">
                <div className="text-[var(--text-primary)]">
                  <VeloraaRougeeLogo
                    size="md"
                    color="currentColor"
                    onClick={() => onNavigate('/en')}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>
                {/* Subtle Luxury Divider */}
                <div className="flex items-center gap-3 w-full max-w-[180px] mt-4 opacity-75">
                  <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[var(--accent-secondary)]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                  <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[var(--accent-secondary)]" />
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={(event) => void login(event)} className="space-y-4 sm:space-y-5">
                {/* Email Field */}
                <div className="login-anim-item space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
                    <span>Admin Email / Username</span>
                  </label>
                  <div className="relative group/field">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent-secondary)] group-focus-within/field:text-[var(--text-primary)] transition-colors pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="text"
                      inputMode="email"
                      required
                      autoComplete="username"
                      className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] hover:border-[var(--accent-secondary)] focus:border-[var(--focus-ring)] focus:bg-[var(--card-bg)] focus:ring-4 focus:ring-[var(--accent-secondary)]/15 text-base sm:text-sm text-[var(--input-text)] font-medium placeholder-[var(--text-muted)]/50 rounded-xl py-3 sm:py-2.5 pl-10 pr-3.5 transition-all duration-200 outline-none shadow-xs"
                      placeholder="admin@veloraarougee.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="login-anim-item space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
                    <span>Password</span>
                  </label>
                  <div className="relative group/field">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent-secondary)] group-focus-within/field:text-[var(--text-primary)] transition-colors pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] hover:border-[var(--accent-secondary)] focus:border-[var(--focus-ring)] focus:bg-[var(--card-bg)] focus:ring-4 focus:ring-[var(--accent-secondary)]/15 text-base sm:text-sm text-[var(--input-text)] font-medium placeholder-[var(--text-muted)]/50 rounded-xl py-3 sm:py-2.5 pl-10 pr-11 transition-all duration-200 outline-none shadow-xs"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all p-2 rounded-lg cursor-pointer"
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
                    className="w-full py-3.5 font-bold uppercase tracking-widest text-xs sm:text-[13px] rounded-xl bg-gradient-to-r from-[var(--accent-secondary)] via-[var(--accent-primary)] to-[var(--accent-metallic)] hover:brightness-105 active:scale-[0.98] text-[var(--button-primary-text)] shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 relative overflow-hidden touch-manipulation group"
                  >
                    {/* Shimmer Sweep Effect */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
                    <ShieldCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{isLoading ? 'Authenticating Studio…' : 'Enter Studio Portal'}</span>
                  </button>
                </div>

                {/* Footer Security Badge & Storefront Link */}
                <div className="login-anim-item pt-4 border-t border-[var(--border-subtle)] space-y-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>256-Bit TLS Encrypted Gateway</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('/en')}
                    className="group text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5 py-1 cursor-pointer touch-manipulation"
                  >
                    <span className="transition-transform group-hover:-translate-x-1 duration-200">←</span>
                    <span className="underline underline-offset-4 decoration-[var(--accent-secondary)] group-hover:decoration-[var(--accent-primary)] transition-all">
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
            onClick={() => adminNav(`/admin/${item.id}`)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[0.3rem] text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-[var(--accent-primary)] bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] border-l-[3px] border-[var(--accent-primary)] font-bold shadow-2xs dark:bg-gradient-to-r dark:from-[#1A100A] dark:to-[#100B08] dark:border-[#D1AF92] dark:shadow-[0_0_12px_rgba(209,175,146,0.14)]'
                : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/60 dark:hover:bg-[#160E09]/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                }`}
              />
              <span>{item.label}</span>
            </div>
            {isActive && <ChevronRight className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] lg:grid lg:grid-cols-[260px_1fr] relative transition-colors duration-200"
    >
      {/* ========================================================================= */}
      {/* 1. Mobile Off-Canvas Drawer Backdrop & Sheet                              */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[var(--card-bg)] text-[var(--text-primary)] border-r border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Mobile Drawer Header */}
              <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]/80">
                <div className="flex items-center gap-2.5">
                  <VeloraaRougeeLogo
                    size="sm"
                    color="currentColor"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      adminNav('/admin/dashboard');
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-[0.3rem]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              {renderNavLinks()}
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 space-y-3">
              <div className="flex items-center justify-between py-1 px-1">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Appearance</span>
                <ThemeToggle showLabel />
              </div>
              <button
                onClick={() => onNavigate('/en')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[0.3rem] bg-[var(--card-bg)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live Store</span>
              </button>
              <button
                onClick={() => void handleLogout()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[0.3rem] bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Desktop Fixed Left Sidebar Shell (Sticky On Scroll)                   */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex bg-[var(--card-bg)] border-r border-[var(--border-subtle)] flex-col justify-between h-screen h-dvh max-h-screen sticky top-0 self-start z-40 shadow-[4px_0_24px_-4px_rgba(65,31,17,0.04)] transition-colors duration-200">
        {/* Top Header & Scrollable Nav Region */}
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
          {/* Brand Header */}
          <div className="py-6 px-4 border-b border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-secondary)]/60 to-[var(--card-bg)] shrink-0 flex items-center justify-center">
            <div className="w-full flex items-center justify-center text-[var(--text-primary)]">
              <VeloraaRougeeLogo
                size="md"
                color="currentColor"
                onClick={() => adminNav('/admin/dashboard')}
                className="cursor-pointer mx-auto transition-transform hover:scale-105"
              />
            </div>
          </div>

          {/* Desktop Nav Links - Smoothly scrollable if screen height is constrained */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:var(--border-subtle)_transparent]">
            {renderNavLinks()}
          </div>
        </div>

        {/* Desktop Sidebar Footer - Always docked cleanly at bottom of viewport */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 shrink-0">
          <button
            onClick={() => onNavigate('/en')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[0.3rem] bg-[var(--card-bg)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-all shadow-2xs cursor-pointer"
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
        <header className="h-16 sticky top-0 z-30 bg-[var(--card-bg)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3 transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] rounded-[0.3rem] cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-muted)] hidden sm:inline">Admin</span>
              <span className="text-[var(--border-subtle)] hidden sm:inline">/</span>
              <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                {currentNav?.icon && (
                  <currentNav.icon className="w-4 h-4 text-[var(--accent-primary)]" />
                )}
                <span>{title}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Time Clock */}
            {currentTime && (
              <span className="text-xs text-[var(--text-secondary)] font-medium hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-secondary)]/60 rounded-[0.3rem] border border-[var(--border-subtle)]">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                {currentTime}
              </span>
            )}

            {/* Theme Toggle Button in Header */}
            <ThemeToggle />

            {/* Notifications Bell Dropdown */}
            <div
              className="relative py-1"
              ref={notifRef}
              onMouseEnter={handleNotifMouseEnter}
              onMouseLeave={handleNotifMouseLeave}
            >
              <button
                type="button"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors cursor-pointer"
                title="Activity Alerts"
                aria-label="Activity alerts and notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {notifications.filter((n) => !n.read_at).length > 0 && (
                  <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-[var(--accent-primary)] text-[var(--button-primary-text)] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {notifications.filter((n) => !n.read_at).length > 9
                      ? '9+'
                      : notifications.filter((n) => !n.read_at).length}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full pt-1.5 w-80 sm:w-96 max-w-[calc(100vw-24px)] z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150"
                  onMouseEnter={handleNotifMouseEnter}
                  onMouseLeave={handleNotifMouseLeave}
                >
                  <div className="bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden flex flex-col max-h-[460px]">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--card-bg)] flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[var(--accent-primary)]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                          Live Store Alerts
                        </span>
                        {notifications.filter((n) => !n.read_at).length > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)] text-[var(--button-primary-text)]">
                            {notifications.filter((n) => !n.read_at).length} new
                          </span>
                        )}
                      </div>
                      {notifications.filter((n) => !n.read_at).length > 0 && (
                        <button
                          type="button"
                          onClick={() => void handleMarkAllRead()}
                          className="text-[11px] font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification list - fully scrollable */}
                    <div
                      data-lenis-prevent
                      onWheel={(e) => e.stopPropagation()}
                      className="flex-1 min-h-0 max-h-[350px] overflow-y-auto overscroll-contain divide-y divide-[var(--border-subtle)]/60 touch-pan-y modal-luxury-scroll"
                      tabIndex={0}
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--accent-primary) var(--bg-secondary)',
                      }}
                    >
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                          No recent alerts or activity.
                        </div>
                      ) : (
                        notifications.slice(0, 40).map((n) => {
                          const isUnread = !n.read_at;
                          return (
                            <div
                              key={n.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleNotificationClick(n);
                              }}
                              className={`p-3 sm:p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                                isUnread ? 'bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)]' : 'hover:bg-[var(--bg-secondary)]/30'
                              }`}
                            >
                              <div className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-subtle)] text-[var(--accent-primary)] shrink-0 mt-0.5">
                                {n.type.startsWith('customer') ? (
                                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : n.type.startsWith('order') ? (
                                  <ShoppingBag className="w-4 h-4 text-[var(--accent-primary)]" />
                                ) : n.type.startsWith('payment') ? (
                                  <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                ) : n.type.startsWith('review') ? (
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                ) : (
                                  <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <p className={`text-xs ${isUnread ? 'font-bold text-[var(--text-primary)]' : 'font-semibold text-[var(--text-secondary)]'} truncate`}>
                                    {n.title}
                                  </p>
                                  {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                                  {n.body}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">
                                  {new Date(n.created_at).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin User Profile Badge */}
            <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 py-1 pr-1 sm:pr-1.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-subtle)] rounded-full">
              <span className="text-xs font-bold text-[var(--text-primary)] hidden sm:inline">
                {admin.email}
              </span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-secondary)] to-[var(--accent-primary)] text-[var(--button-primary-text)] text-xs font-bold flex items-center justify-center shadow-2xs">
                {userInitials}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => void handleLogout()}
              className="p-2 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-[0.3rem] transition-colors cursor-pointer"
              title="Log out of Admin"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 max-w-[1720px] 2xl:max-w-[1850px] w-full mx-auto px-3 sm:px-6 lg:px-10 py-5 sm:py-8 lg:py-10">
          {module === 'dashboard' && (
            <Dashboard onOpenOrder={(id) => adminNav(`/admin/orders/${id}`)} />
          )}
          {module === 'products' && <ProductsModule />}
          {module === 'categories' && <CategoriesModule />}
          {module === 'orders' && (
            <OrdersModule path={path} onOpen={(id) => adminNav(`/admin/orders/${id}`)} />
          )}
          {module === 'payments' && <PaymentsModule />}
          {module === 'customers' && <CustomersModule />}
          {module === 'coupons' && <CouponsModule />}
          {module === 'reviews' && <ReviewsModule />}
          {module === 'stories' && <StoriesModule />}
          {module === 'enquiries' && <EnquiriesModule />}
        </main>
      </section>
    </div>
  );
};
