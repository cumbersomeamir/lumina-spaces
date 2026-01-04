
import React, { useState, useRef, useEffect } from 'react';

interface CompareSliderProps {
  original: string;
  reimagined: string;
}

const CompareSlider: React.FC<CompareSliderProps> = ({ original, reimagined }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl cursor-col-resize select-none"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* Reimagined Image (Base) */}
      <img 
        src={reimagined} 
        alt="Reimagined Space" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Original Image (Top Layer) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white shadow-[2px_0_10px_rgba(0,0,0,0.3)]"
        style={{ width: `${sliderPos}%` }}
      >
        <img 
          src={original} 
          alt="Original Space" 
          className="absolute top-0 left-0 h-full object-cover"
          style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: 'none' }}
        />
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Original
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-md text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
        Reimagined
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l-4 4m0 0l4 4m-4-4h16M16 17l4-4m0 0l-4-4m4 4H4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CompareSlider;
