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
      className="min-h-[38px] w-full bg-[var(--announcement-bg)] text-[var(--announcement-text)] flex items-center justify-center px-3 sm:px-4 py-1.5 text-[10px] min-[360px]:text-[11px] sm:text-xs lg:text-sm font-medium tracking-wide transition-colors duration-200 border-b border-[var(--border-subtle)] z-30 relative"
    >
      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto w-full flex items-center justify-center text-center px-2">
        <span className="line-clamp-2 sm:line-clamp-1 leading-snug sm:leading-normal">
          {messages[index]}
        </span>
      </div>
    </aside>
  );
};
