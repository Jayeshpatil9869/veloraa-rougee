import React from 'react';
import { LEGAL_PAGES_CONTENT } from '../data/content';
import { BrandImage } from '../components/ui/BrandImage';

export type LegalTab = 'shipping' | 'return-policy' | 'terms-and-conditions' | 'privacy-policy';

interface LegalPageProps {
  currentTab: LegalTab;
  onSelectTab: (tab: LegalTab) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ currentTab, onSelectTab }) => {
  const content = LEGAL_PAGES_CONTENT[currentTab] || LEGAL_PAGES_CONTENT.shipping;

  const tabs: { id: LegalTab; label: string }[] = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'return-policy', label: 'Return Policy' },
    { id: 'terms-and-conditions', label: 'Terms And Conditions' },
    { id: 'privacy-policy', label: 'Privacy Policy' },
  ];

  return (
    <div className="w-full bg-white select-none">
      {/* Hero */}
      <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[340px] overflow-hidden bg-[#DFBEDB] flex items-center justify-center text-center">
        <BrandImage
          src="https://cdn.sanity.io/images/03h1hklz/production/ff6e93f6880662c9fbcb1055fd48daa07d1aa9bd-1200x450.png"
          alt={content.title}
          fallbackLabel={content.title}
          containerClassName="absolute inset-0 w-full h-full"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-stone-900/40 z-[1]" />
        <h1
          className="relative z-10 font-serif text-5xl sm:text-7xl lg:text-9xl text-[#F8FAFC] leading-none drop-shadow-md"
          style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
        >
          {content.title}
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-10 lg:py-16 space-y-10">
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-brand whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#A06A98] text-white border border-[#A06A98]'
                    : 'border border-[#9CA3AF] text-[#4B5563] hover:border-[#A06A98] hover:text-[#A06A98] bg-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Legal Body Sections */}
        <div className="max-w-3xl space-y-8 text-[#333333]">
          {content.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-medium text-[#333333]">
                {sec.heading}
              </h2>
              <p className="text-sm sm:text-base text-[#555555] leading-[1.8]">
                {sec.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
