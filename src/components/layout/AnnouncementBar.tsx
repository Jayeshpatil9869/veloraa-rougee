import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../../services/contentStore';

export const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);
  const messages = getAnnouncements();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <aside
      aria-label="Announcement"
      className="h-[44px] w-full bg-[#FDF2F8] text-[#76416F] flex items-center justify-center px-4 text-xs lg:text-sm font-medium tracking-wide transition-opacity duration-300 border-b border-[#F0DEF7]/40 z-30 relative"
    >
      <div className="flex items-center gap-2 transition-transform duration-500 text-center">
        <span>{messages[index]}</span>
      </div>
    </aside>
  );
};
