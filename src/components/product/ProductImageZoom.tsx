import React, { useState, useRef, useCallback } from 'react';

interface ProductImageZoomProps {
  images: Array<{ id?: string; src: string; alt?: string }>;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  productName: string;
}

export const ProductImageZoom: React.FC<ProductImageZoomProps> = ({
  images,
  selectedIndex,
  onSelectIndex,
  productName,
}) => {
  const currentImage = images[selectedIndex] || images[0];
  const stageRef = useRef<HTMLDivElement>(null);
  const zoomViewerRef = useRef<HTMLDivElement>(null);

  // Hover lens states
  const [isHovering, setIsHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [stageDims, setStageDims] = useState({ width: 0, height: 0 });

  const [viewerDims, setViewerDims] = useState({ width: 560, height: 560 });

  // Lens size & zoom factor
  const LENS_SIZE = 170;
  const ZOOM_FACTOR = 2.8;

  const updatePosition = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const stageW = rect.width;
    const stageH = rect.height;

    // Mouse relative to container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Center lens on cursor, clamped to boundaries
    const rawX = mouseX - LENS_SIZE / 2;
    const rawY = mouseY - LENS_SIZE / 2;

    const maxX = Math.max(0, stageW - LENS_SIZE);
    const maxY = Math.max(0, stageH - LENS_SIZE);

    const clampedX = Math.max(0, Math.min(rawX, maxX));
    const clampedY = Math.max(0, Math.min(rawY, maxY));

    setStageDims({ width: stageW, height: stageH });
    setLensPos({ x: clampedX, y: clampedY });
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovering(true);
    updatePosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const onViewerRef = useCallback((node: HTMLDivElement | null) => {
    zoomViewerRef.current = node;
    if (node) {
      const rect = node.getBoundingClientRect();
      if (rect.width && rect.height) {
        setViewerDims({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  // Magnified Viewer coordinates calculation
  const vW = viewerDims.width || 560;
  const vH = viewerDims.height || (stageDims.height || 560);
  const bgWidth = (stageDims.width || 560) * ZOOM_FACTOR;
  const bgHeight = (stageDims.height || 560) * ZOOM_FACTOR;
  const maxLensX = Math.max(1, (stageDims.width || 560) - LENS_SIZE);
  const maxLensY = Math.max(1, (stageDims.height || 560) - LENS_SIZE);
  const maxBgX = Math.max(0, bgWidth - vW);
  const maxBgY = Math.max(0, bgHeight - vH);

  const bgPosX = -(lensPos.x / maxLensX) * maxBgX;
  const bgPosY = -(lensPos.y / maxLensY) * maxBgY;

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4 relative">
      {/* 1. Thumbnails Column */}
      {images.length > 1 && (
        <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:w-20 shrink-0 no-scrollbar select-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              aria-label={`Product Image ${idx + 1}`}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-brand overflow-hidden border transition-all duration-300 bg-white ${
                selectedIndex === idx
                  ? 'border-[#A06A98] scale-105 opacity-100 ring-2 ring-[#A06A98]/40 shadow-xs'
                  : 'border-[#E2E8F0] opacity-80 hover:opacity-100 hover:border-slate-300'
              }`}
            >
              <img
                src={img.src}
                alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* 2. Main Stage Image Area */}
      <div className="flex-1 flex flex-col items-center">
        <div
          ref={stageRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full aspect-square rounded-brand overflow-hidden bg-white border border-[#E2E8F0] relative cursor-crosshair group shadow-xs select-none"
        >
          {/* Main Display Images with Smooth Transition */}
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out ${
                selectedIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={img.src}
                alt={img.alt || productName}
                className="w-full h-full object-cover object-center"
                draggable={false}
              />
            </div>
          ))}

          {/* Amazon-style Blueprint Lens Overlay (Desktop only) */}
          {isHovering && (
            <div
              className="hidden lg:block absolute pointer-events-none z-20"
              style={{
                width: `${LENS_SIZE}px`,
                height: `${LENS_SIZE}px`,
                left: `${lensPos.x}px`,
                top: `${lensPos.y}px`,
                border: '1.5px solid rgba(160, 106, 152, 0.75)',
                backgroundColor: 'rgba(223, 190, 219, 0.28)',
                backgroundImage:
                  'radial-gradient(circle, rgba(160, 106, 152, 0.5) 1px, transparent 1px)',
                backgroundSize: '10px 10px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08), inset 0 0 12px rgba(160, 106, 152, 0.2)',
                borderRadius: '4px',
              }}
            />
          )}
        </div>
      </div>

      {/* 3. Amazon-style Magnified Zoom Viewer Window (Floats centered in the right column area) */}
      {isHovering && currentImage && (
        <div
          ref={onViewerRef}
          className="hidden lg:block absolute left-[calc(100%+2rem)] xl:left-[calc(100%+3.5rem)] top-0 w-[calc(100%*5/7+1.5rem)] min-w-[500px] max-w-[620px] aspect-square z-50 bg-white border border-[#E2E8F0] shadow-2xl rounded-brand overflow-hidden pointer-events-none"
          style={{
            height: stageDims.height ? `${stageDims.height}px` : undefined,
            backgroundImage: `url("${currentImage.src}")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${bgWidth}px ${bgHeight}px`,
            backgroundPosition: `${bgPosX}px ${bgPosY}px`,
          }}
        >
          {/* Subtle Corner watermark */}
          <div className="absolute bottom-2.5 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-brand text-[10px] font-bold text-[#A06A98] uppercase tracking-wider border border-[#E2E8F0] shadow-xs">
            Veloraa HD Zoom
          </div>
        </div>
      )}
    </div>
  );
};
