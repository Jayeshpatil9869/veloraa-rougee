import React, { useState, useEffect } from 'react';
import { getStoreLocations } from '../services/contentStore';
import { MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/motion/ScrollReveal';

export const LocationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'nashik' | 'pune'>('all');

  useEffect(() => {
    document.title = 'Store Locations | Veloraa Rougee';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredStores = getStoreLocations().filter((s) => {
    if (activeTab === 'all') return true;
    return s.cityId === activeTab;
  });

  const tabs: { id: 'all' | 'nashik' | 'pune'; label: string }[] = [
    { id: 'all', label: 'All Locations' },
    { id: 'nashik', label: 'Nashik' },
    { id: 'pune', label: 'Pune' },
  ];

  return (
    <div className="w-full bg-white select-none">
      {/* Centered Editorial Masthead Banner */}
      <section className="relative w-full bg-[#FDF2F8] py-14 lg:py-20 border-b border-[#F0DEF7]/60 overflow-hidden">
        <ScrollReveal direction="up" distance={20}>
          <div className="max-w-[1440px] mx-auto px-4 lg:px-20 text-center relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#DFBEDB]/40 text-xs font-bold uppercase tracking-widest text-[#76416F]">
              <Sparkles className="w-3.5 h-3.5 text-[#A06A98]" />
              Veloraa Rougee Boutiques &amp; Stores
            </div>
            <h1
              className="font-serif text-6xl sm:text-7xl lg:text-8xl text-[#333333] leading-tight"
              style={{ fontFamily: "'Amithen', 'Alex Brush', cursive" }}
            >
              Locations
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#666666] max-w-2xl mx-auto leading-relaxed">
              Locate your nearest Veloraa Rougee beauty atelier, flagship boutique, and experience counters.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-12 lg:py-16 space-y-8">
        <ScrollReveal direction="up" distance={16}>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#A06A98]">
              Find Our Products
            </h2>
            <p className="text-sm sm:text-base text-[#666666] font-medium">
              Locate Your Nearest Store for VELORAA ROUGEE Essentials
            </p>
          </div>
        </ScrollReveal>

        {/* Location Tabs */}
        <ScrollReveal direction="up" delay={0.1} distance={12}>
          <div className="flex items-center gap-2 p-1.5 bg-[#FDF2F8] rounded-brand border border-[#F0DEF7] w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-brand text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#A06A98] shadow-xs'
                    : 'text-[#666666] hover:text-[#333333]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Store Cards List with Staggered Scroll Reveal */}
        <StaggerContainer
          key={activeTab}
          staggerDelay={0.08}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
        >
          {filteredStores.map((store) => (
            <StaggerItem key={store.id} className="h-full">
              <div
                className="p-6 bg-white border border-[#E2E8F0] rounded-brand shadow-xs hover:border-[#A06A98] transition-colors space-y-3 h-full flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#A06A98]">
                        {store.name}
                      </h3>
                      <p className="text-xs text-[#666666] mt-0.5">{store.mall}</p>
                    </div>
                    <MapPin className="w-5 h-5 text-[#A06A98] shrink-0" />
                  </div>

                  <div className="text-xs text-[#555555] space-y-1">
                    <p>
                      City:{' '}
                      <strong className="font-semibold text-[#333333]">
                        {store.city}, {store.state}
                      </strong>
                    </p>
                    <p>Authorized Beauty Retailer</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A06A98] hover:text-[#774170] transition-colors"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};

