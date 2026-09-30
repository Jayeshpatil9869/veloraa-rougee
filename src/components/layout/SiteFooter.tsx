import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { VeloraaRougeeLogo } from '../brand/VeloraaRougeeLogo';
import { FlowerTallSvg, MastercardSvg, VisaSvg } from '../brand/BrandIcons';
import { BRAND_INFO } from '../../data/content';

interface SiteFooterProps {
  onNavigate: (path: string) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[#FDF2F8] text-[#333333] pt-12 pb-8 border-t border-[#F0DEF7]">
      {/* Decorative floral watermark in background */}
      <div
        className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none text-[#9F6998]"
        aria-hidden="true"
      >
        <FlowerTallSvg className="w-80 h-80" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#DFBEDB]/40">
          {/* Column 1: Brand & Newsletter (Cols 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <VeloraaRougeeLogo
              size="sm"
              onClick={() => onNavigate('/en')}
              className="mb-4"
            />
            <h3 className="text-base lg:text-lg font-bold text-[#333333] leading-snug">
              Sign up for exclusive offers and updates.
            </h3>
            <p className="text-xs text-[#666666]">
              Get the latest beauty arrivals and curated routine guides from our team.
            </p>

            <form onSubmit={handleSubmit} className="relative max-w-sm mt-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                required
                className="w-full h-10 bg-white text-sm text-[#333333] placeholder-[#888888] pl-3 pr-12 rounded-brand border border-[#F0DEF7] focus:outline-none focus:ring-2 focus:ring-[#A06A98] transition-all"
              />
              <button
                type="submit"
                aria-label="Submit newsletter"
                className="absolute right-1 top-1 bottom-1 w-9 bg-transparent text-[#A06A98] hover:text-[#774170] flex items-center justify-center transition-colors"
              >
                {submitted ? <Check className="w-4 h-4 text-emerald-600" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
            {submitted && (
              <span className="text-xs text-[#76416F] font-medium block">
                Thank you for subscribing to VELORAA ROUGEE.
              </span>
            )}

            <div className="pt-2 text-xs text-[#666666] space-y-1">
              <p>Company: <strong className="font-semibold text-[#333333]">{BRAND_INFO.company}</strong></p>
              <p>GST: <span className="font-mono text-[#444444]">{BRAND_INFO.gst}</span></p>
              <p>Support: <a href={`mailto:${BRAND_INFO.supportEmail}`} className="text-[#A06A98] hover:underline">{BRAND_INFO.supportEmail}</a></p>
            </div>
          </div>

          {/* Column 2: About (Cols 5-6) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs lg:text-sm font-extrabold uppercase tracking-wider text-[#A06A98]">
              About
            </h4>
            <ul className="space-y-2 text-sm font-medium text-[#444444]">
              <li>
                <button
                  onClick={() => onNavigate('/en/about-us')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  About us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/en/legal/terms-and-conditions')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  Terms And Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/en/legal/privacy-policy')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Shop (Cols 7-8) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs lg:text-sm font-extrabold uppercase tracking-wider text-[#A06A98]">
              Shop
            </h4>
            <ul className="space-y-2 text-sm font-medium text-[#444444]">
              <li>
                <button
                  onClick={() => onNavigate('/en/collection/best-sellers')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/en/collection')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  Collections
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/en/locations')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  Locations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/en/collection/bundles')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  Special Offers
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Advice (Cols 9-10) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs lg:text-sm font-extrabold uppercase tracking-wider text-[#A06A98]">
              Help &amp; Advice
            </h4>
            <ul className="space-y-2 text-sm font-medium text-[#444444]">
              <li>
                <button
                  onClick={() => onNavigate('/en/legal/return-policy')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  Return Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/en/legal/shipping')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  Shipping
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/en/contact-us')}
                  className="hover:text-[#A06A98] transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Social (Cols 11-12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs lg:text-sm font-extrabold uppercase tracking-wider text-[#A06A98]">
              Social
            </h4>
            <ul className="space-y-2 text-sm font-medium text-[#444444]">
              <li>
                <span className="text-slate-700 hover:text-[#A06A98] cursor-pointer transition-colors">
                  Instagram
                </span>
              </li>
              <li>
                <span className="text-slate-700 hover:text-[#A06A98] cursor-pointer transition-colors">
                  Facebook
                </span>
              </li>
              <li>
                <span className="text-slate-700 hover:text-[#A06A98] cursor-pointer transition-colors">
                  YouTube
                </span>
              </li>
              <li>
                <span className="text-slate-700 hover:text-[#A06A98] cursor-pointer transition-colors">
                  TikTok
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Plates */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#666666]">
          <p>© 2023–2026 VELORAA ROUGEE. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#777777]">Secured Payment</span>
            <div className="flex items-center gap-2">
              <MastercardSvg />
              <VisaSvg />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
