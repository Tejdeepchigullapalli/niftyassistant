import React from 'react';

interface SentimentGaugeProps {
  perceptionIndex: number;
  overallSentimentText: string;
  brandColor: string;
  newsMomentum?: string;
}

export default function SentimentGauge({
  perceptionIndex,
  overallSentimentText,
  brandColor,
  newsMomentum = 'Improving'
}: SentimentGaugeProps) {
  // Semicircle gauge path logic: strokeDashoffset controls progress around the arc
  const strokeDashoffset = 125.6 * (1 - Math.max(0, Math.min(100, perceptionIndex)) / 100);

  // Dynamic blend of brandColor with positive green / negative red based on score
  const getGaugeColor = () => {
    if (perceptionIndex >= 70) return '#22C55E'; // Strong positive consensus
    if (perceptionIndex <= 45) return '#EF4444'; // Bearish sentiment
    return brandColor; // Neutral or company brand color default
  };

  const activeColor = getGaugeColor();

  return (
    <div className="flex flex-col items-center select-none justify-center">
      
      {/* Semicircle perception meter */}
      <div className="relative w-28 h-[64px] flex items-end justify-center overflow-hidden select-none">
        <svg className="w-28 h-[64px]" viewBox="0 0 100 55">
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="#1E293B" 
            strokeWidth="6" 
            strokeLinecap="round" 
          />
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke={activeColor} 
            strokeWidth="6" 
            strokeDasharray="125.6"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" 
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute text-center pt-5">
          <span className="text-sm font-black text-white leading-none block">{perceptionIndex}%</span>
          <span className="text-[6.5px] text-[#64748B] uppercase tracking-wider block font-extrabold mt-0.5">PERCEPTION</span>
        </div>
      </div>

      {/* Perception & Momentum metadata */}
      <div className="grid grid-cols-2 gap-4 w-full border-t border-[#1E293B]/40 pt-2.5 mt-3 text-center text-[9px] font-bold">
        <div className="border-r border-[#1E293B]/40">
          <span className="text-[7.5px] text-[#64748B] uppercase block">Consensus</span>
          <span className="text-white font-extrabold uppercase text-[8.5px] block mt-0.5" style={{ color: activeColor }}>
            {overallSentimentText}
          </span>
        </div>
        <div>
          <span className="text-[7.5px] text-[#64748B] uppercase block">Momentum</span>
          <span className="text-violet-400 font-extrabold uppercase text-[8.5px] block mt-0.5">
            {newsMomentum}
          </span>
        </div>
      </div>

    </div>
  );
}
