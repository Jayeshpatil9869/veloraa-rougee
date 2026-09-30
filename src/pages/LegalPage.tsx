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
      {/* Centered Editorial Masthead Banner */}
      <section className="relative w-full bg-[#FDF2F8] py-14 lg:py-20 border-b border-[#F0DEF7]/60 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-20 text-center relative z-10 space-y-4">
          <h1
            className="font-serif text-6xl sm:text-7xl lg:text-8xl text-[#333333] leading-tight"
            style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
          >
            {content.title}
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#666666] max-w-2xl mx-auto leading-relaxed">
            VELORAA ROUGEE customer terms, policies, and shopping guarantees.
          </p>
        </div>
      </section>

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
