import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface BrandImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
  containerClassName?: string;
}

export const BrandImage: React.FC<BrandImageProps> = ({
  src,
  alt = 'VELORAA ROUGEE Product',
  className = '',
  containerClassName = '',
  fallbackLabel,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FDF2F8] to-[#DFBEDB]/40 text-[#A06A98] p-4 text-center select-none ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-6 h-6 mb-2 opacity-60 text-[#A06A98]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[#76416F]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#FDF2F8] animate-pulse" />
      )}
    </div>
  );
};
