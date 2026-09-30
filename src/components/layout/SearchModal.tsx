import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { searchService } from '../../services/searchService';
import { Product } from '../../types';
import { BrandImage } from '../ui/BrandImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCatalog: (category?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigateToCatalog,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setResults(searchService.search({ query, category: activeCategory }));
    }
  }, [isOpen, query, activeCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'face', label: 'Face' },
    { id: 'lips', label: 'Lips' },
    { id: 'eyes', label: 'Eyes' },
    { id: 'brows', label: 'Brows' },
    { id: 'bundles', label: 'Special Offers' },
  ];

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search Catalog"
    >
      <div
        data-lenis-prevent
        className="w-full max-w-2xl bg-white rounded-brand shadow-2xl overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[#E2E8F0]">
          <Search className="w-5 h-5 text-[#A06A98] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, shades, formulas..."
            className="w-full text-base text-[#333333] placeholder-[#888888] focus:outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#888888] hover:text-[#333333] mr-2"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#666666] hover:text-[#333333] rounded-brand border border-[#E2E8F0] text-xs font-semibold px-2 uppercase"
          >
            Esc
          </button>
        </div>

        {/* Category Pills (Functional filter buttons) */}
        <div className="px-4 py-2.5 bg-[#FDF2F8]/60 border-b border-[#F0DEF7]/40 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[#76416F] font-bold uppercase tracking-wider shrink-0 mr-1">
            Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-brand text-xs font-semibold transition-colors shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[#A06A98] text-white shadow-xs'
                  : 'bg-white text-[#555555] hover:bg-[#FDF2F8] border border-[#E2E8F0]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Stream */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-slate-100">
          {results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="py-3 px-2 flex items-center gap-4 cursor-pointer hover:bg-[#FDF2F8]/50 rounded-brand transition-colors group"
              >
                <div className="w-14 h-14 bg-white border border-[#E2E8F0] rounded-brand overflow-hidden shrink-0">
                  <BrandImage
                    src={product.images[0]?.src}
                    alt={product.name}
                    fallbackLabel={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A06A98] block">
                    {product.categoryName}
                  </span>
                  <h4 className="text-sm font-bold text-[#333333] truncate group-hover:text-[#A06A98] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-[#666666] truncate">
                    {product.shortDescription}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#333333] tabular-nums block">
                    ₹{product.variants[0]?.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-[#A06A98] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[#666666]">
              <p className="text-sm font-semibold text-[#333333]">
                No beauty products match "{query}".
              </p>
              <p className="text-xs mt-1 text-[#888888]">
                Try checking spelling or explore our complete collections.
              </p>
              <button
                onClick={() => {
                  onNavigateToCatalog();
                  onClose();
                }}
                className="mt-4 px-4 py-2 bg-[#A06A98] text-white text-xs font-bold uppercase tracking-wider rounded-brand hover:bg-[#774170] transition-colors"
              >
                Browse All 23 Products
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
