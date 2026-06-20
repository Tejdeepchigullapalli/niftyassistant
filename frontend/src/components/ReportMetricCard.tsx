import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface ReportMetricCardProps {
  label: string;
  value: string | number;
  change?: string | number;
  changePct?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'live' | 'estimated';
  sparklineData?: { val: number }[];
  tooltip?: string;
}

export default function ReportMetricCard({
  label,
  value,
  change,
  changePct,
  trend = 'neutral',
  status = 'live',
  sparklineData,
  tooltip
}: ReportMetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const trendColorClass = 
    trend === 'up' ? 'text-[#22C55E]' :
    trend === 'down' ? 'text-[#EF4444]' :
    'text-slate-400';

  return (
    <div className="bg-[#0d121f] border border-[#152036] p-3 rounded-2xl flex flex-col justify-between h-[85px] transition-all hover:border-slate-800 relative select-none">
      
      {/* Header Label and Status/Tooltip */}
      <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider relative">
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {tooltip && (
            <div className="relative">
              <HelpCircle 
                className="w-3 h-3 text-slate-600 hover:text-slate-400 cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className="absolute z-55 left-0 top-4 w-40 bg-[#090d16] border border-[#152036] p-2 rounded-lg text-[7px] text-[#94A3B8] font-bold normal-case leading-normal shadow-xl pointer-events-none">
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>
        
        {status && (
          <span className={`text-[6.5px] px-1 py-0.2 rounded font-black uppercase ${
            status === 'live' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
          }`}>
            {status}
          </span>
        )}
      </div>

      {/* Main Metric Value and Sparkline */}
      <div className="flex items-center justify-between mt-1 flex-grow">
        <div>
          <span className="text-[14px] font-black text-slate-100 block leading-none">{value}</span>
          {(change || changePct) && (
            <div className="flex items-baseline gap-1 mt-1 text-[8.5px] font-bold leading-none">
              <span className={trendColorClass}>
                {trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''}
                {change}
              </span>
              {changePct && <span className="text-slate-500 font-medium">({changePct})</span>}
            </div>
          )}
        </div>

        {/* Small sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-6 w-14 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke={trend === 'up' ? '#22C55E' : trend === 'down' ? '#EF4444' : '#64748b'} 
                  strokeWidth={1.2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
