import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`group relative inline-flex items-center gap-2 p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] cursor-pointer ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[var(--accent-gold)] transition-transform duration-300 ease-out group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[var(--text-primary)] transition-transform duration-300 ease-out group-hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
