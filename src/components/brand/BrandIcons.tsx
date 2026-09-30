import React from 'react';
export { MonogramIcon } from './MonogramIcon';

export const BrandArrow: React.FC<{ className?: string }> = ({ className = 'w-[22px] h-[14px]' }) => (
  <svg
    viewBox="0 0 22 14"
    fill="currentColor"
    className={`inline-block shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${className}`}
    aria-hidden="true"
  >
    <path d="m18.568 6.1-4.81-4.827L15.028 0 22 7l-6.973 7-1.268-1.273L18.568 7.9H0V6.1h18.568Z" />
  </svg>
);

export const FlowerShortSvg: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 81 94"
    fill="#D39DC7"
    className={`inline-block ${className}`}
    aria-label="Flower Short Icon"
  >
    <path d="M40.5 0C32.1 14.8 28.2 27.6 28.8 38.4 20.3 31.9 11.2 27.9 1.5 26.4 12.8 38.7 18.9 49.6 19.8 59.1 8.9 59.8 0 63.6 0 70.5c15.2 3.1 26.4 0.2 33.6-8.7 1.8 11.7 6.3 22.5 13.5 32.2 7.2-9.7 11.7-20.5 13.5-32.2 7.2 8.9 18.4 11.8 33.6 8.7 0-6.9-8.9-10.7-19.8-11.4 0.9-9.5 7-20.4 18.3-32.7-9.7 1.5-18.8 5.5-27.3 12C60.9 27.6 57 14.8 48.6 0c-2.7 10.4-5.4 17.5-8.1 21.3C37.8 17.5 35.1 10.4 40.5 0Z" />
  </svg>
);

export const FlowerTallSvg: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg
    viewBox="0 0 128 122"
    fill="#D39DC7"
    className={`inline-block ${className}`}
    aria-label="Flower Tall Icon"
  >
    <path d="M64 0C50.7 19.2 44.5 35.8 45.4 49.8 32 41.4 17.6 36.2 2.4 34.3c17.9 16 27.6 30.1 29 42.4C17.4 77.6 3.4 82.5 3.4 91.5c24 4 41.7 0.3 53.1-11.3 2.8 15.2 10 29.2 21.5 41.8 11.5-12.6 18.7-26.6 21.5-41.8 11.4 11.6 29.1 15.3 53.1 11.3 0-9-14-13.9-28-14.8 1.4-12.3 11.1-26.4 29-42.4-15.2 1.9-29.6 7.1-43 15.5 0.9-14-5.3-30.6-18.6-49.8-4.3 13.5-8.6 22.7-12.9 27.6C74.6 22.7 70.3 13.5 64 0Z" />
  </svg>
);

export const MastercardSvg: React.FC = () => (
  <div className="w-9 h-6 bg-white border border-slate-200 rounded flex items-center justify-center shadow-xs">
    <svg viewBox="0 0 32 20" className="w-6 h-4" aria-label="Mastercard">
      <circle cx="10" cy="10" r="7" fill="#EB001B" />
      <circle cx="22" cy="10" r="7" fill="#F79E1B" fillOpacity="0.85" />
      <path
        d="M16 4.9A7 7 0 0 1 18.8 10 7 7 0 0 1 16 15.1 7 7 0 0 1 13.2 10 7 7 0 0 1 16 4.9Z"
        fill="#FF5F00"
      />
    </svg>
  </div>
);

export const VisaSvg: React.FC = () => (
  <div className="w-9 h-6 bg-white border border-slate-200 rounded flex items-center justify-center shadow-xs font-serif font-bold text-xs tracking-tighter text-[#1A1F71]">
    <span>VISA</span>
  </div>
);
