import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'switch' | 'compact';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  variant = 'switch',
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Interactive Luxury Tactile Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to blackish-golden dark theme'}
        title={isDark ? 'Blackish-Golden Dark Mode Active (Click for Light)' : 'Light Mode Active (Click for Blackish-Golden Dark)'}
        className={`group relative inline-flex items-center h-7 w-[52px] sm:w-[56px] rounded-full p-[3px] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] cursor-pointer select-none ${
          isDark
            ? 'bg-[#080704] border border-[#D1AF92]/60 shadow-[0_0_16px_rgba(209,175,146,0.35),inset_0_0_8px_rgba(0,0,0,0.8)]'
            : 'bg-[#F1E7DA] border border-[#E6D9CB] shadow-xs'
        }`}
      >
        {/* Track Internal Ambient Glow (Dark Mode Only) */}
        {isDark && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[#D1AF92]/10 to-transparent pointer-events-none animate-pulse" />
        )}

        {/* Sliding Thumb Bezel */}
        <div
          className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ease-out transform shadow-md ${
            isDark
              ? 'translate-x-[26px] sm:translate-x-[29px] bg-gradient-to-tr from-[#A9755A] via-[#D1AF92] to-[#F5EBE0] text-[#080704] shadow-[0_0_10px_rgba(209,175,146,0.6)]'
              : 'translate-x-0 bg-gradient-to-tr from-[#30110A] to-[#512418] text-[#F5EBE0]'
          }`}
        >
          {isDark ? (
            <Sun className="w-3 h-3 text-[#080704] transition-transform duration-300 group-hover:rotate-45" />
          ) : (
            <Moon className="w-2.5 h-2.5 text-[#F5EBE0] transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </div>

        {/* Ambient Subtle Track Emblems */}
        <div className="absolute inset-x-2 flex items-center justify-between text-[10px] pointer-events-none opacity-40">
          <Moon className={`w-2.5 h-2.5 transition-opacity ${isDark ? 'opacity-30 text-[#D1AF92]' : 'opacity-0'}`} />
          <Sun className={`w-2.5 h-2.5 transition-opacity ${isDark ? 'opacity-0' : 'opacity-30 text-[#86533A]'}`} />
        </div>
      </button>

      {/* Optional Descriptive Mode Tag */}
      {showLabel && (
        <span
          onClick={toggleTheme}
          className={`text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
            isDark ? 'text-[#D1AF92] hover:text-[#F5EBE0]' : 'text-[#411F11] hover:text-[#080604]'
          }`}
        >
          {isDark ? (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D1AF92]" />
              Black & Gold
            </span>
          ) : (
            'Light Mode'
          )}
        </span>
      )}
    </div>
  );
};
