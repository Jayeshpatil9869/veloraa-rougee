import React, { useState } from 'react';
import { STORE_LOCATIONS } from '../data/content';
import { BrandImage } from '../components/ui/BrandImage';
import { MapPin, ExternalLink } from 'lucide-react';

export const LocationsPage: React.FC = () => {
  const [activeCountry, setActiveCountry] = useState<'uae' | 'saudiArabia' | 'qatar'>('uae');

  const filteredStores = STORE_LOCATIONS.filter((s) => s.country === activeCountry);

  const tabs: { id: 'uae' | 'saudiArabia' | 'qatar'; label: string }[] = [
    { id: 'uae', label: 'UAE' },
    { id: 'saudiArabia', label: 'Saudi Arabia' },
    { id: 'qatar', label: 'Qatar' },
  ];

  return (
    <div className="w-full bg-white select-none">
      {/* Banner */}
      <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[340px] overflow-hidden bg-[#DFBEDB] flex items-center justify-center text-center">
        <BrandImage
          src="https://cdn.sanity.io/images/03h1hklz/production/ff6e93f6880662c9fbcb1055fd48daa07d1aa9bd-1200x450.png"
          alt="VELORAA ROUGEE Locations Banner"
          fallbackLabel="Locations"
          containerClassName="absolute inset-0 w-full h-full"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-stone-900/40 z-[1]" />
        <h1
          className="relative z-10 font-serif text-5xl sm:text-7xl lg:text-8xl text-[#F8FAFC] leading-none drop-shadow-md"
          style={{ fontFamily: "'Alex Brush', 'Cormorant Garamond', serif" }}
        >
          Locations
        </h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-12 lg:py-16 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#A06A98]">
            Find Our Products
          </h2>
          <p className="text-sm sm:text-base text-[#666666] font-medium">
            Locate Your Nearest Store for VELORAA ROUGEE Essentials
          </p>
        </div>

        {/* Country Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#FDF2F8] rounded-brand border border-[#F0DEF7] w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCountry(tab.id)}
              className={`px-5 py-2 rounded-brand text-xs font-bold uppercase tracking-wider transition-colors ${
                activeCountry === tab.id
                  ? 'bg-white text-[#A06A98] shadow-xs'
                  : 'text-[#666666] hover:text-[#333333]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Store List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <div
                key={store.id}
                className="p-6 bg-white border border-[#E2E8F0] rounded-brand shadow-xs hover:border-[#A06A98] transition-colors space-y-3"
              >
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
                  <p>City: <strong className="font-semibold text-[#333333]">{store.city}</strong></p>
                  <p>Authorized Beauty Retailer</p>
                </div>

                <div className="pt-2">
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
            ))
          ) : (
            <div className="col-span-full py-12 text-center p-8 bg-[#FDF2F8]/50 rounded-brand border border-[#F0DEF7] text-[#666666] space-y-2">
              <p className="font-bold text-sm text-[#333333]">
                Upcoming Retail Launch in Qatar
              </p>
              <p className="text-xs">
                Our flagship beauty counters are scheduled to launch soon in Doha. In the meantime, direct orders deliver within 4 business days.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
