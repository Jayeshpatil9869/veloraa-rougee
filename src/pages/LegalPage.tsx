import React, { useEffect } from 'react';
import { getLegalPages } from '../services/contentStore';
import { BrandImage } from '../components/ui/BrandImage';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/motion/ScrollReveal';

export type LegalTab = 'shipping' | 'return-policy' | 'terms-and-conditions' | 'privacy-policy';

interface LegalPageProps {
  currentTab: LegalTab;
  onSelectTab: (tab: LegalTab) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ currentTab, onSelectTab }) => {
  const content = getLegalPages()[currentTab] || getLegalPages().shipping;

  useEffect(() => {
    document.title = `${content.title} | Veloraa Rougee`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab, content.title]);

  const tabs: { id: LegalTab; label: string }[] = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'return-policy', label: 'Return Policy' },
    { id: 'terms-and-conditions', label: 'Terms And Conditions' },
    { id: 'privacy-policy', label: 'Privacy Policy' },
  ];

  return (
    <div className="w-full bg-[var(--bg-primary)] select-none transition-colors">
      {/* Centered Editorial Masthead Banner */}
      <section className="relative w-full bg-[var(--bg-secondary)] py-14 lg:py-20 border-b border-[var(--border-subtle)] overflow-hidden">
        <ScrollReveal direction="up" blur={true} className="max-w-[1440px] mx-auto px-4 lg:px-20 text-center relative z-10 space-y-4">
          <h1
            className="font-serif text-6xl sm:text-7xl lg:text-8xl text-[var(--text-primary)] leading-tight"
            style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
          >
            {content.title}
          </h1>
          <p className="font-sans text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            VELORAA ROUGEE customer terms, policies, and shopping guarantees.
          </p>
        </ScrollReveal>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-10 lg:py-16 space-y-10">
        {/* Tabs Bar */}
        <ScrollReveal direction="up" delay={0.05}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-subtle)]">
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-brand whitespace-nowrap transition-colors ${
                    isActive
                      ? 'btn-theme-primary'
                      : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Legal Body Sections */}
        <StaggerContainer stagger={0.1} className="max-w-3xl space-y-8 text-[var(--text-primary)]">
          {content.sections.map((sec, idx) => (
            <StaggerItem key={idx}>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
                  {sec.heading}
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-[1.8]">
                  {sec.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};
