import React, { useMemo } from 'react';
import { CompanyMeta, QuoteData } from '../types/stock';
import { CompanyLogo } from './common/CompanyLogo';
import { getCompanyMeta } from '../utils/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ShieldCheck, TrendingUp, Compass, AlertCircle, TrendingDown } from 'lucide-react';

interface MarketIntelligenceReportProps {
  quotes: QuoteData[];
  onNavigateToStockAnalysis: (symbol: string) => void;
}

export default function MarketIntelligenceReport({
  quotes = [],
  onNavigateToStockAnalysis
}: MarketIntelligenceReportProps) {

  // A. Calculate top gainers/losers dynamically from live quotes
  const movers = useMemo(() => {
    const list = [...quotes].map(q => {
      const meta = getCompanyMeta(q.symbol);
      return {
        ...q,
        meta
      };
    });

    const sorted = list.sort((a, b) => b.change_pct - a.change_pct);
    return {
      gainers: sorted.slice(0, 3),
      losers: [...sorted].reverse().slice(0, 3)
    };
  }, [quotes]);

  // B. Sector performance data
  const sectorData = useMemo(() => {
    const sectorsMap: Record<string, number[]> = {};
    quotes.forEach(q => {
      const meta = getCompanyMeta(q.symbol);
      if (!sectorsMap[meta.sector]) sectorsMap[meta.sector] = [];
      sectorsMap[meta.sector].push(q.change_pct);
    });

    return Object.entries(sectorsMap).map(([name, changes]) => {
      const avg = changes.reduce((sum, val) => sum + val, 0) / changes.length;
      return {
        name,
        Performance: parseFloat(avg.toFixed(2))
      };
    }).sort((a, b) => b.Performance - a.Performance);
  }, [quotes]);

  return (
    <div className="space-y-4 text-[#F8FAFC]">
      
      {/* Row 1: Benchmarks Snapshot & AI Outlook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none">
        
        {/* Market snapshot values (7 Cols) */}
        <div className="lg:col-span-7 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[190px]">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3">Broad Market Benchmarks</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[9.5px] font-bold">
              {[
                { name: 'NIFTY 50', val: '22,517.60', change: '+0.85%', isGreen: true },
                { name: 'NIFTY BANK', val: '48,153.15', change: '+1.24%', isGreen: true },
                { name: 'SENSEX', val: '74,340.09', change: '+0.73%', isGreen: true },
                { name: 'INDIA VIX', val: '12.45', change: '-0.65%', isGreen: false },
                { name: 'Fear & Greed Index', val: '64 (Greed)', change: 'Stable', isGreen: true, isVal: true },
                { name: 'Market Breadth', val: '32 Adv / 18 Dec', change: '+14 Net', isGreen: true, isVal: true }
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 bg-[#0B1220] border border-[#1E293B]/60 rounded-xl leading-normal">
                  <span className="text-[#64748B] uppercase text-[7.5px] font-black block tracking-wider">{item.name}</span>
                  <span className="text-[12px] font-black text-slate-100 block mt-1">{item.val}</span>
                  <span className={`text-[8.5px] font-extrabold block mt-0.5 leading-none ${
                    item.isVal ? 'text-[#8B5CF6]' : item.isGreen ? 'text-[#22C55E]' : 'text-[#EF4444]'
                  }`}>{item.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Market Outlook (5 Cols) */}
        <div className="lg:col-span-5 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[190px]">
          <div>
            <div className="flex items-center gap-1.5 text-violet-400">
              <Compass className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider block">AI Market Outlook Forecast</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3 text-[9.5px] font-bold">
              <div>
                <span className="text-[#64748B] uppercase text-[7.5px] font-black block tracking-wider">Broad Trend</span>
                <span className="text-[#22C55E] font-black text-sm block mt-1">Bullish Outlook</span>
              </div>
              <div>
                <span className="text-[#64748B] uppercase text-[7.5px] font-black block tracking-wider">Target Nifty Range</span>
                <span className="text-white font-extrabold text-sm block mt-1">22,300 - 22,700</span>
              </div>
            </div>

            <p className="text-[8.5px] text-[#94A3B8] leading-relaxed mt-3.5 bg-[#0B1220] p-2.5 rounded-xl border border-[#1E293B]/60">
              Domestic earnings performance index supports continuation. Monitor institutional flows and F&O index derivatives for resistance.
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Sector Heatmap & Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none">
        
        {/* Sector Heatmap (7 Cols) */}
        <div className="lg:col-span-7 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between h-[300px]">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Sector Performance Heatmap</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Average performance index across sectors</span>
          </div>

          <div className="h-[210px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={8} tickLine={false} />
                <YAxis stroke="#475569" fontSize={8} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '10px', fontSize: 9 }} />
                <Bar dataKey="Performance" radius={[4, 4, 0, 0]} barSize={10}>
                  {sectorData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.Performance >= 0 ? '#22C55E' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Movers (5 Cols) */}
        <div className="lg:col-span-5 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between h-[300px]">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Top Market Movers</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Dynamic intraday gainer & loser tickers</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-4 flex-grow text-[9.5px]">
            {/* Gainers */}
            <div className="space-y-2">
              <span className="text-[7.5px] font-black text-[#22C55E] uppercase tracking-widest block mb-1">Top Gainers</span>
              {movers.gainers.map((g, i) => (
                <div 
                  key={i}
                  onClick={() => onNavigateToStockAnalysis(g.symbol)}
                  className="p-2 bg-[#0B1220] border border-emerald-500/10 hover:border-emerald-500/35 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <CompanyLogo symbol={g.symbol} size="sm" />
                    <span className="font-extrabold text-slate-200 truncate">{g.symbol}</span>
                  </div>
                  <span className="text-[#22C55E] font-black text-[9px] flex-shrink-0">+{g.change_pct.toFixed(2)}%</span>
                </div>
              ))}
            </div>

            {/* Losers */}
            <div className="space-y-2">
              <span className="text-[7.5px] font-black text-[#EF4444] uppercase tracking-widest block mb-1">Top Losers</span>
              {movers.losers.map((l, i) => (
                <div 
                  key={i}
                  onClick={() => onNavigateToStockAnalysis(l.symbol)}
                  className="p-2 bg-[#0B1220] border border-rose-500/10 hover:border-rose-500/35 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <CompanyLogo symbol={l.symbol} size="sm" />
                    <span className="font-extrabold text-slate-200 truncate">{l.symbol}</span>
                  </div>
                  <span className="text-[#EF4444] font-black text-[9px] flex-shrink-0">{l.change_pct.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
