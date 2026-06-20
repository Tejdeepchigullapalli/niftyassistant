import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string | number;
  changeType?: 'positive' | 'negative' | 'neutral';
  isEstimated?: boolean;
}

export default function MetricCard({ 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  isEstimated = false 
}: MetricCardProps) {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-[#22C55E]';
    if (changeType === 'negative') return 'text-[#EF4444]';
    return 'text-[#94A3B8]';
  };

  return (
    <div className="flex justify-between border-b border-[#1E293B]/40 pb-1.5 font-semibold text-[10px] items-center hover:bg-white/[0.015] px-1 rounded transition-colors duration-200">
      <div className="flex items-center gap-1">
        <span className="text-[#64748B] font-bold">{label}</span>
        {isEstimated && (
          <span 
            className="text-[6.5px] px-1 bg-amber-600/10 border border-amber-500/20 text-amber-400 font-extrabold rounded select-none cursor-help"
            title="Estimated or Demo Fallback Data"
          >
            EST.
          </span>
        )}
      </div>
      <div className="text-right leading-none flex items-center gap-1.5">
        <span className="text-[#F8FAFC] font-black">{value}</span>
        {change !== undefined && (
          <span className={`text-[8.5px] font-black ${getChangeColor()}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
