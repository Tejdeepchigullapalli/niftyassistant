import React from 'react';

interface ScoreRingProps {
  score: number;
  label: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function ScoreRing({ 
  score, 
  label, 
  subLabel = 'Score', 
  size = 'sm', 
  color 
}: ScoreRingProps) {
  const scoreVal = score !== undefined ? score : 0;
  
  // Size dimensions
  const dims = {
    sm: { size: 32, stroke: 2.5, text: 'text-[8.5px]', labelText: 'text-[7.5px]' },
    md: { size: 56, stroke: 3.5, text: 'text-xs', labelText: 'text-[8px]' },
    lg: { size: 80, stroke: 4.5, text: 'text-base', labelText: 'text-[9.5px]' }
  }[size];

  // Fallback color selection based on score value if color is not specified
  const strokeColor = color || (() => {
    if (scoreVal >= 75) return '#22C55E'; // green
    if (scoreVal >= 60) return '#3B82F6'; // blue
    if (scoreVal >= 45) return '#F59E0B'; // amber
    return '#EF4444'; // red
  })();

  return (
    <div className="flex items-center gap-2 flex-shrink-0 select-none">
      <div 
        className="relative flex items-center justify-center"
        style={{ width: dims.size, height: dims.size }}
      >
        <svg 
          width={dims.size} 
          height={dims.size} 
          viewBox="0 0 36 36"
        >
          <circle 
            cx="18" 
            cy="18" 
            r="16" 
            stroke="#1E293B" 
            strokeWidth={dims.stroke} 
            fill="none" 
          />
          <circle 
            cx="18" 
            cy="18" 
            r="16" 
            stroke={strokeColor} 
            strokeWidth={dims.stroke} 
            strokeDasharray={`${scoreVal}, 100`} 
            strokeLinecap="round" 
            fill="none" 
            transform="rotate(-90 18 18)" 
          />
        </svg>
        <span className={`absolute font-black text-[#F8FAFC] ${dims.text}`}>
          {scoreVal}
        </span>
      </div>
      <div className="leading-none">
        <span className={`${dims.labelText} text-[#64748B] uppercase font-black block`}>
          {label}
        </span>
        <span className="text-[7.5px] text-[#94A3B8] font-bold block mt-0.5">
          {subLabel}
        </span>
      </div>
    </div>
  );
}
