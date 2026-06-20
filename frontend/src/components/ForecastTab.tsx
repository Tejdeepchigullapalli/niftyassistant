import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar } from 'recharts';
import { Compass, AlertOctagon, Activity, TrendingUp } from 'lucide-react';
import { buildForecastScenarios } from '../utils/analysisUtils';
import MetricCard from './MetricCard';

interface ForecastTabProps {
  symbol: string;
  meta: any;
  quote: any;
  historyData: any[];
}

export default function ForecastTab({
  symbol,
  meta,
  quote,
  historyData = []
}: ForecastTabProps) {
  const currentPrice = quote?.current_price ?? meta.basePrice;

  // B. Build Scenario projections
  const scenarios = useMemo(() => buildForecastScenarios(currentPrice, quote), [currentPrice, quote]);

  const bullTarget = scenarios.find(s => s.type === 'Bull')?.targetPrice ?? currentPrice * 1.18;
  const baseTarget = scenarios.find(s => s.type === 'Base')?.targetPrice ?? currentPrice * 1.10;
  const bearTarget = scenarios.find(s => s.type === 'Bear')?.targetPrice ?? currentPrice * 0.88;

  // A. Forecast Corridor Chart points
  const corridorData = useMemo(() => {
    // 1. Take last 15 historical points
    const histPoints = historyData.slice(-15).map(d => ({
      date: d.date ? d.date.slice(5) : '',
      Price: d.close,
      Base: undefined,
      Bull: undefined,
      Bear: undefined
    }));

    if (histPoints.length === 0) return [];

    // 2. Append future projections
    const lastHist = histPoints[histPoints.length - 1];
    
    const projectionPoints = [
      { date: 'Today', Price: lastHist.Price, Base: lastHist.Price, Bull: lastHist.Price, Bear: lastHist.Price },
      { date: '+3M', Price: undefined, Base: parseFloat((currentPrice + (baseTarget - currentPrice) * 0.25).toFixed(1)), Bull: parseFloat((currentPrice + (bullTarget - currentPrice) * 0.25).toFixed(1)), Bear: parseFloat((currentPrice + (bearTarget - currentPrice) * 0.25).toFixed(1)) },
      { date: '+6M', Price: undefined, Base: parseFloat((currentPrice + (baseTarget - currentPrice) * 0.5).toFixed(1)), Bull: parseFloat((currentPrice + (bullTarget - currentPrice) * 0.5).toFixed(1)), Bear: parseFloat((currentPrice + (bearTarget - currentPrice) * 0.5).toFixed(1)) },
      { date: '+9M', Price: undefined, Base: parseFloat((currentPrice + (baseTarget - currentPrice) * 0.75).toFixed(1)), Bull: parseFloat((currentPrice + (bullTarget - currentPrice) * 0.75).toFixed(1)), Bear: parseFloat((currentPrice + (bearTarget - currentPrice) * 0.75).toFixed(1)) },
      { date: '+12M', Price: undefined, Base: baseTarget, Bull: bullTarget, Bear: bearTarget }
    ];

    return [...histPoints, ...projectionPoints];
  }, [historyData, currentPrice, bullTarget, baseTarget, bearTarget]);

  // D. Probability Distribution data
  const probDistData = [
    { range: 'Under ₹' + Math.round(bearTarget), Prob: 10 },
    { range: '₹' + Math.round(bearTarget) + ' - ₹' + Math.round(currentPrice), Prob: 20 },
    { range: '₹' + Math.round(currentPrice) + ' - ₹' + Math.round(baseTarget), Prob: 45 },
    { range: '₹' + Math.round(baseTarget) + ' - ₹' + Math.round(bullTarget), Prob: 20 },
    { range: 'Over ₹' + Math.round(bullTarget), Prob: 5 }
  ];

  return (
    <div className="space-y-4 w-full select-none text-[#F8FAFC]">
      
      {/* Dynamic Forecast indicator ribbon */}
      <div className="flex justify-between items-center bg-[#0d121f] border border-[#1E293B] px-3.5 py-2 rounded-xl select-none">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">Scenario-Based 12-Month Price Outlook</span>
        </div>
        <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase">
          Dynamic Model
        </span>
      </div>

      {/* Grid containing Forecast Chart and Probability bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Forecast corridor envelope chart */}
        <div className="lg:col-span-8 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between h-[420px] hover:border-violet-500/20 transition-all select-none">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Scenario Forecast Corridor Envelope</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Shaded projection envelope of Base, Bull, and Bear cases</span>
          </div>

          <div className="h-[310px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={corridorData}>
                <defs>
                  <linearGradient id="foreCorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={meta.color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 8 }} stroke="#1E293B" tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748B', fontSize: 8 }} stroke="#1E293B" tickFormatter={v => `₹${v}`} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, fontSize: 8 }} />
                <Legend verticalAlign="top" height={24} iconSize={6} wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                {/* Shaded Area between Bear and Bull projections */}
                <Area type="monotone" dataKey="Bull" name="Bull Envelope" stroke="#22C55E" strokeWidth={1} strokeDasharray="3 3" fill="url(#foreCorGrad)" fillOpacity={0.15} dot={false} />
                <Area type="monotone" dataKey="Bear" name="Bear Envelope" stroke="#EF4444" strokeWidth={1} strokeDasharray="3 3" fill="none" dot={false} />
                <Line type="monotone" dataKey="Price" name="Historical Price" stroke={meta.color} strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="Base" name="Base Scenario" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Probability Distribution Chart & drivers list */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Probability chart card */}
          <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-violet-500/20 transition-all select-none flex-1">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3">Model Probability Distribution</span>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={probDistData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="range" type="category" tick={{ fill: '#64748B', fontSize: 7 }} width={76} stroke="none" />
                  <Tooltip contentStyle={{ background: '#0d121f', borderRadius: 8, fontSize: 8 }} />
                  <Bar dataKey="Prob" fill="#8B5CF6" radius={[0, 3, 3, 0]} barSize={5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <span className="text-[7.5px] text-[#64748B] block mt-1.5 text-center font-bold uppercase">Estimated probability index (%)</span>
          </div>

          {/* Forecast Drivers list */}
          <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-violet-500/20 transition-all select-none">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3">Model Forecast Drivers</span>
            <div className="space-y-1.5 text-[9.5px]">
              <MetricCard label="Earnings Growth Rate" value="Strong" changeType="positive" />
              <MetricCard label="Valuation PE Multiple" value="Stable Expansion" />
              <MetricCard label="Sector Rotation Trend" value="Sustained Lead" changeType="positive" />
              <MetricCard label="Technical Momentum index" value="Bullish Support" changeType="positive" />
              <MetricCard label="Market Volatility index" value="Low Risk" changeType="positive" />
            </div>
          </div>

        </div>

      </div>

      {/* Scenario cards displaying Bull, Base, and Bear cases details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch select-none">
        
        {/* Scenario: Bull */}
        <div className="card p-3.5 bg-[#0d121f] border border-slate-800/80 rounded-xl hover:border-emerald-500/20 transition-all flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9.5px] font-black text-emerald-400 uppercase tracking-wider">Bull Case Scenario</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-black">25% Prob</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2 leading-none">
              <span className="text-sm font-black text-white">₹{bullTarget.toLocaleString()}</span>
              <span className="text-[9.5px] font-bold text-emerald-400">+{scenarios.find(s => s.type === 'Bull')?.expectedReturn}% Return</span>
            </div>
            <p className="text-[8.5px] text-[#94A3B8] mt-2.5 leading-relaxed font-medium">
              Assumption: {scenarios.find(s => s.type === 'Bull')?.assumptions[0]}
            </p>
          </div>
          <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-2">Trigger: Q1 earnings exceed guidance.</span>
        </div>

        {/* Scenario: Base */}
        <div className="card p-3.5 bg-[#0d121f] border border-slate-800/80 rounded-xl hover:border-[#3B82F6]/20 transition-all flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9.5px] font-black text-[#3B82F6] uppercase tracking-wider">Base Case Scenario</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] font-black">55% Prob</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2 leading-none">
              <span className="text-sm font-black text-white">₹{baseTarget.toLocaleString()}</span>
              <span className="text-[9.5px] font-bold text-[#3B82F6]">+{scenarios.find(s => s.type === 'Base')?.expectedReturn}% Return</span>
            </div>
            <p className="text-[8.5px] text-[#94A3B8] mt-2.5 leading-relaxed font-medium">
              Assumption: {scenarios.find(s => s.type === 'Base')?.assumptions[0]}
            </p>
          </div>
          <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-2">Trigger: Metrics align with market expectations.</span>
        </div>

        {/* Scenario: Bear */}
        <div className="card p-3.5 bg-[#0d121f] border border-slate-800/80 rounded-xl hover:border-[#EF4444]/20 transition-all flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9.5px] font-black text-[#EF4444] uppercase tracking-wider">Bear Case Scenario</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#EF4444]/10 text-[#EF4444] font-black">20% Prob</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2 leading-none">
              <span className="text-sm font-black text-white">₹{bearTarget.toLocaleString()}</span>
              <span className="text-[9.5px] font-bold text-[#EF4444]">{scenarios.find(s => s.type === 'Bear')?.expectedReturn}% Return</span>
            </div>
            <p className="text-[8.5px] text-[#94A3B8] mt-2.5 leading-relaxed font-medium">
              Assumption: {scenarios.find(s => s.type === 'Bear')?.assumptions[0]}
            </p>
          </div>
          <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-2">Trigger: Slowdown in sector growth parameters.</span>
        </div>

      </div>

      {/* Model forecasts warning disclaimer */}
      <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center gap-3">
        <AlertOctagon className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <p className="text-[8.5px] text-[#64748B] font-bold uppercase leading-normal">
          Disclaimer: Forecasts are algorithmically simulated based on mathematical scenario models. Under no circumstances should this model-based projection corridor be interpreted as a guarantee of future pricing performance or a specific investment outcome.
        </p>
      </div>

    </div>
  );
}
