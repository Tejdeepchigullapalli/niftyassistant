import React, { useState } from 'react';

interface HeatmapCell {
  year: number;
  month: string;
  val: number;
}

export default function ReturnHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [2026, 2025, 2024];

  // Realistic monthly return percentages for the portfolio
  const data: Record<number, Record<string, number>> = {
    2026: { Jan: 3.12, Feb: 1.45, Mar: -2.18, Apr: 4.85, May: 2.14, Jun: 3.65 },
    2025: { Jan: 2.15, Feb: -1.24, Mar: 3.45, Apr: 1.12, May: -2.85, Jun: 4.28, Jul: 1.76, Aug: -0.92, Sep: 3.14, Oct: 2.54, Nov: -1.05, Dec: 5.62 },
    2024: { Jan: -1.18, Feb: 2.85, Mar: 4.10, Apr: -2.43, May: 1.88, Jun: 2.95, Jul: 3.14, Aug: -1.12, Sep: 2.84, Oct: 4.15, Nov: 1.25, Dec: -0.85 }
  };

  const getCellBg = (val?: number) => {
    if (val === undefined) return 'bg-slate-900/20 border-slate-900/10';
    if (val > 3) return 'bg-emerald-600 border-emerald-500/50';
    if (val > 0) return 'bg-emerald-700/60 border-emerald-600/30';
    if (val < -2) return 'bg-rose-700/80 border-rose-600/40';
    return 'bg-rose-800/40 border-rose-700/20';
  };

  return (
    <div className="space-y-3.5 select-none text-[#F8FAFC]">
      <div>
        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Monthly Return Calendar Heatmap</span>
        <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Historical monthly performance distributions (%)</span>
      </div>

      <div className="overflow-x-auto w-full border border-[#1E293B] rounded-xl bg-[#090d16]/30 p-4">
        <div className="min-w-[500px]">
          {/* Header Row: Month Names */}
          <div className="grid grid-cols-13 gap-1.5 text-center text-[8.5px] font-black text-[#64748B] uppercase pb-2 border-b border-[#1E293B]/60 mb-2">
            <div className="text-left pl-2">Year</div>
            {months.map(m => <div key={m}>{m}</div>)}
          </div>

          {/* Data Rows */}
          <div className="space-y-1.5">
            {years.map(yr => (
              <div key={yr} className="grid grid-cols-13 gap-1.5 items-center text-[9px] font-bold">
                <div className="text-left pl-2 text-[#94A3B8] font-black border-r border-[#1E293B]/50 pr-2">{yr}</div>
                {months.map(m => {
                  const val = data[yr]?.[m];
                  const cellId = `${yr}-${m}`;
                  
                  return (
                    <div 
                      key={m}
                      onMouseEnter={() => setHoveredCell(cellId)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-7.5 rounded-lg border flex items-center justify-center relative cursor-help transition-all ${getCellBg(val)}`}
                    >
                      {val !== undefined ? (
                        <span className="text-[8px] font-extrabold text-white">
                          {val > 0 ? '+' : ''}{val.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[7.5px] text-slate-700 italic font-medium">—</span>
                      )}

                      {/* Tooltip on cell hover */}
                      {hoveredCell === cellId && val !== undefined && (
                        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-55 w-28 bg-[#090d16] border border-[#1E293B] p-2 rounded-xl text-center shadow-xl leading-normal pointer-events-none">
                          <span className="text-[7px] text-[#64748B] font-black uppercase block leading-none">{m} {yr}</span>
                          <span className={`text-[10px] font-black mt-1 block leading-none ${val >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {val > 0 ? '+' : ''}{val}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
