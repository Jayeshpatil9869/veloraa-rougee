import React from 'react';
import { X, ChevronRight, Globe } from 'lucide-react';
import { VeloraaRougeeLogo } from '../brand/VeloraaRougeeLogo';
import { CATEGORIES } from '../../data/products';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const handleNav = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      <div className="w-[85vw] max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0]">
          <VeloraaRougeeLogo size="sm" onClick={() => handleNav('/en')} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 text-[#666666] hover:text-[#333333]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          <div className="space-y-3">
            <button
              onClick={() => handleNav('/en')}
              className="w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between"
            >
              <span>Home</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('/en/collection')}
              className="w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between"
            >
              <span>Shop All Products</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('/en/about-us')}
              className="w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between"
            >
              <span>About Us</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('/en/stories')}
              className="w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between"
            >
              <span>Stories &amp; Blog</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('/en/locations')}
              className="w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between"
            >
              <span>Store Locations</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNav('/en/contact-us')}
              className="w-full text-left py-2 text-base font-bold uppercase tracking-wider text-[#333333] hover:text-[#A06A98] flex items-center justify-between"
            >
              <span>Contact Concierge</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
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
                  className="text-left text-sm py-1.5 text-[#666666] hover:text-[#A06A98] transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info in drawer */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#666666]">
            <Globe className="w-4 h-4 text-[#A06A98]" />
            <span>Currency: AED | Language: English</span>
          </div>
          <p className="text-[11px] text-[#888888]">
            GST: 27BJKPG4947G1ZZ
          </p>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};
