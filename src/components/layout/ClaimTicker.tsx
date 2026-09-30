import React from 'react';
import { BRAND_INFO } from '../../data/content';

export const ClaimTicker: React.FC = () => {
  const phrases = BRAND_INFO.claimTicker;
  // Double list for seamless looping
  const loopList = [...phrases, ...phrases, ...phrases, ...phrases];

  return (
    <div
      className="overflow-x-hidden bg-white border-y border-[#E2E8F0]/60 py-6 select-none"
      role="region"
      aria-label="Brand Philosophy Marquee"
    >
      <div className="animate-marquee flex items-center whitespace-nowrap text-xl lg:text-2xl font-medium text-[#A06A98]">
        {loopList.map((phrase, i) => (
          <div key={i} className="mr-10 flex items-center gap-10">
            <span>{phrase}</span>
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#A06A98] inline-block shrink-0"
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
