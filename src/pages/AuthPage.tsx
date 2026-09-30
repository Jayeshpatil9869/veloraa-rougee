import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Eye, EyeOff, Lock, Mail, User, Phone, Check } from 'lucide-react';
import { FlowerTallSvg, FlowerShortSvg } from '../components/brand/BrandIcons';
import { VeloraaRougeeLogo } from '../components/brand/VeloraaRougeeLogo';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onNavigate: (path: string) => void;
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onNavigate,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
    subscribeNewsletter: true,
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    document.title = mode === 'login'
      ? 'Sign In | Veloraa Rougee Luxury Cosmetics'
      : 'Create an Account | Veloraa Rougee Luxury Cosmetics';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mode]);

  // Continuous organic smooth floating motion for botanical flower illustrations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Top-Left Flower - slow gentle drift
      gsap.to('.flower-float-1', {
        x: '+=22',
        y: '-=26',
        rotation: 6,
        scale: 1.05,
        duration: 7.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // 2. Bottom-Left Flower - slow organic sway
      gsap.to('.flower-float-2', {
        x: '-=18',
        y: '+=20',
        rotation: -7,
        scale: 1.04,
        duration: 8.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.6,
      });

      // 3. Top-Right Flower - slow diagonal float
      gsap.to('.flower-float-3', {
        x: '-=25',
        y: '+=28',
        rotation: -8,
        scale: 1.06,
        duration: 9.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.3,
      });

      // 4. Bottom-Right Flower - slow deep float
      gsap.to('.flower-float-4', {
        x: '+=24',
        y: '-=30',
        rotation: 7,
        scale: 1.05,
        duration: 8.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const name = mode === 'signup' && formData.fullName ? formData.fullName : 'Beauty Connoisseur';
      setAuthSuccess(
        mode === 'login'
          ? `Welcome back to Veloraa Rougee, ${name}!`
          : `Welcome to the Veloraa Rougee Atelier, ${name}! Your membership is activated.`
      );

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onNavigate('/en/collection');
      }, 1500);
    }, 1000);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess('Successfully authenticated with Google. Welcome!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onNavigate('/en/collection');
      }, 1200);
    }, 900);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[calc(100vh-120px)] w-full bg-gradient-to-b from-[#FAF5F8] via-[#FDF2F8]/80 to-white py-12 lg:py-20 flex items-center justify-center overflow-hidden select-none px-4 sm:px-6"
    >
      {/* ========================================================================= */}
      {/*             DECORATIVE BOTANICAL FLOWER ILLUSTRATIONS (THEME)             */}
      {/* ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {/* Top-Left Botanical Flower with continuous motion */}
        <div className="flower-float-1 will-change-transform absolute -left-12 -top-10 lg:left-4 lg:top-8 opacity-45 lg:opacity-65">
          <FlowerTallSvg className="w-36 sm:w-52 lg:w-64 h-auto text-[#D39DC7] -scale-x-100 drop-shadow-xs" />
        </div>

        {/* Bottom-Left Botanical Flower with continuous motion */}
        <div className="flower-float-2 will-change-transform absolute -left-8 -bottom-12 lg:left-8 lg:bottom-4 opacity-35 lg:opacity-55">
          <FlowerShortSvg className="w-28 sm:w-40 lg:w-48 h-auto text-[#A06A98] drop-shadow-xs" />
        </div>

        {/* Top-Right Botanical Flower with continuous motion */}
        <div className="flower-float-3 will-change-transform absolute -right-12 -top-8 lg:right-6 lg:top-12 opacity-40 lg:opacity-60">
          <FlowerShortSvg className="w-32 sm:w-44 lg:w-56 h-auto text-[#D39DC7] -scale-x-100 drop-shadow-xs" />
        </div>

        {/* Bottom-Right Large Botanical Flower with continuous motion */}
        <div className="flower-float-4 will-change-transform absolute -right-16 -bottom-16 lg:right-4 lg:bottom-2 opacity-50 lg:opacity-70">
          <FlowerTallSvg className="w-44 sm:w-60 lg:w-80 h-auto text-[#9F6998] drop-shadow-xs" />
        </div>

        {/* Soft Ambient Radial Blurs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#DFBEDB]/25 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/*                           AUTH CONTAINER CARD                             */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#F0DEF7] shadow-[0_16px_48px_rgba(119,65,112,0.12)] p-6 sm:p-8 lg:p-10 transition-all duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <div className="flex justify-center mb-1">
            <VeloraaRougeeLogo size="md" onClick={() => onNavigate('/en')} />
          </div>

          <h1
            className="font-serif text-4xl sm:text-5xl text-[#333333] leading-none pt-1"
            style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
          >
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
        </div>

        {/* Success Alert Banner */}
        {authSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Tab Switcher (Sign In vs Sign Up) */}
        <div className="grid grid-cols-2 p-1 bg-[#FDF2F8] rounded-xl border border-[#F0DEF7] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setAuthSuccess(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold tracking-wider rounded-lg transition-all duration-200 uppercase cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#A06A98] shadow-xs'
                : 'text-[#666666] hover:text-[#333333]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setAuthSuccess(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold tracking-wider rounded-lg transition-all duration-200 uppercase cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#A06A98] shadow-xs'
                : 'text-[#666666] hover:text-[#333333]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full h-11 sm:h-12 bg-white hover:bg-[#FDF2F8]/60 border border-[#DFBEDB] hover:border-[#A06A98] text-[#333333] rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs cursor-pointer mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-[#F0DEF7] w-full" />
          <span className="bg-white px-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#999999] absolute">
            Or with email
          </span>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#444444] uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A06A98] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Maya Thorne"
                    className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-[#FAF5F8] border border-[#DFBEDB] focus:border-[#A06A98] focus:bg-white rounded-xl outline-none transition-all placeholder:text-[#999999] text-[#333333]"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#444444] uppercase tracking-wider block">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A06A98] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-[#FAF5F8] border border-[#DFBEDB] focus:border-[#A06A98] focus:bg-white rounded-xl outline-none transition-all placeholder:text-[#999999] text-[#333333]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#444444] uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A06A98] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@luxuryatelier.com"
                className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-[#FAF5F8] border border-[#DFBEDB] focus:border-[#A06A98] focus:bg-white rounded-xl outline-none transition-all placeholder:text-[#999999] text-[#333333]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#444444] uppercase tracking-wider">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to your email.')}
                  className="text-[11px] font-semibold text-[#A06A98] hover:text-[#774170] transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A06A98] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••••••"
                className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-[#FAF5F8] border border-[#DFBEDB] focus:border-[#A06A98] focus:bg-white rounded-xl outline-none transition-all placeholder:text-[#999999] text-[#333333]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#A06A98] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#444444] uppercase tracking-wider block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A06A98] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-[#FAF5F8] border border-[#DFBEDB] focus:border-[#A06A98] focus:bg-white rounded-xl outline-none transition-all placeholder:text-[#999999] text-[#333333]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#A06A98] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Newsletter Opt-in */}
              <div className="pt-1 space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-[#555555] cursor-pointer">
                  <input
                    type="checkbox"
                    name="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onChange={handleChange}
                    className="mt-0.5 accent-[#A06A98] rounded cursor-pointer"
                  />
                  <span>
                    Receive exclusive beauty gifts, early collection access, and atelier updates.
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#A06A98] hover:bg-[#774170] active:scale-[0.99] text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{mode === 'login' ? 'SIGN IN' : 'SIGN UP'}</span>
            )}
          </button>
        </form>

        {/* Footer info & toggle */}
        <div className="mt-8 pt-6 border-t border-[#F0DEF7] text-center space-y-3">
          <p className="text-xs text-[#666666]">
            {mode === 'login' ? "Don't have an account yet?" : 'Already a Veloraa Rougee member?'}
            {' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setAuthSuccess(null);
              }}
              className="font-bold text-[#A06A98] hover:text-[#774170] underline underline-offset-2 transition-colors cursor-pointer"
            >
              {mode === 'login' ? 'Join Now' : 'Sign In'}
            </button>
          </p>

          <p className="text-[11px] text-[#888888]">
            Protected by 256-bit encryption. By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={() => onNavigate('/en/legal/terms-and-conditions')}
              className="underline hover:text-[#A06A98]"
            >
              Terms
            </button>{' '}
            &amp;{' '}
            <button
              type="button"
              onClick={() => onNavigate('/en/legal/privacy-policy')}
              className="underline hover:text-[#A06A98]"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
