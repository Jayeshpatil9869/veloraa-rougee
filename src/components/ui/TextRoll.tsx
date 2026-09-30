import React from 'react';

interface TextRollProps {
  children: React.ReactNode;
  className?: string;
}

export const TextRoll: React.FC<TextRollProps> = ({
  children,
  className = '',
}) => {
  return (
    <span className={`relative inline-block overflow-hidden leading-normal ${className}`}>
      {/* Primary text in normal flow */}
      <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full will-change-transform">
        {children}
      </span>
      {/* Duplicate positioned at top: 100% (hidden until hover) */}
      <span
        aria-hidden="true"
        className="absolute top-full left-0 w-full block transition-transform duration-300 ease-out group-hover:-translate-y-full will-change-transform pointer-events-none"
      >
        {children}
      </span>
    </span>
  );
};
