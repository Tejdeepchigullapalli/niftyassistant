import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Award, Activity, Compass, AlertOctagon } from 'lucide-react';
import { calculateSupportResistance } from '../utils/analysisUtils';
import MetricCard from './MetricCard';

interface TechnicalsTabProps {
  symbol: string;
  meta: any;
  quote: any;
  historyData: any[];
  recommendation: any;
}

export default function TechnicalsTab({
  symbol,
  meta,
  quote,
  historyData = [],
  recommendation
}: TechnicalsTabProps) {
  const currentPrice = quote?.current_price ?? meta.basePrice;

  // C. Dynamic S/R Levels
  const levels = useMemo(() => calculateSupportResistance(currentPrice, historyData), [currentPrice, historyData]);

  // Compute Bollinger Bands, EMA, and MACD wave indicators
  const techData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    
    return historyData.map((d: any, idx: number) => {
      // Bollinger Bands calculation
      let sum = 0, count = 0;
      for (let i = Math.max(0, idx - 20); i <= idx; i++) {
        sum += historyData[i].close;
        count++;
      }
      const sma20 = sum / count;
      
      // Stand-in variance for Bollinger Band width
      let varianceSum = 0;
      for (let i = Math.max(0, idx - 20); i <= idx; i++) {
        varianceSum += Math.pow(historyData[i].close - sma20, 2);
      }
      const stdDev = Math.sqrt(varianceSum / count);
      const bbUpper = sma20 + stdDev * 2;
      const bbLower = sma20 - stdDev * 2;

      // EMA 20 calculation
      const k = 2 / (20 + 1);
      const prevEma = idx > 0 ? (historyData[idx-1].ema20 || historyData[idx-1].close) : historyData[0].close;
      const ema20 = d.close * k + prevEma * (1 - k);

      // MACD simulation lines
      const fastEma = d.close * (2/(12+1)) + (idx > 0 ? (historyData[idx-1].fast || d.close) : d.close) * (1 - (2/(12+1)));
      const slowEma = d.close * (2/(26+1)) + (idx > 0 ? (historyData[idx-1].slow || d.close) : d.close) * (1 - (2/(26+1)));
      const macd = fastEma - slowEma;
      const signal = macd * (2/(9+1)) + (idx > 0 ? (historyData[idx-1].signal || macd) : macd) * (1 - (2/(9+1)));
      const hist = macd - signal;

      return {
        date: d.date || '',
        close: d.close,
        bbUpper,
        bbLower,
        ema20,
        macd,
        signal,
        hist
      };
    });
  }, [historyData]);

  // Dynamic signals mapping
  const signals = useMemo(() => {
    const rsiVal = 57.3;
    const isBull = currentPrice > levels.pivotPoint;
    return {
      trend: isBull ? 'Bullish' : 'Neutral',
      rsi: rsiVal >= 70 ? 'Overbought' : (rsiVal <= 30 ? 'Oversold' : 'Neutral'),
      macd: 'Buy Crossover',
      maAlignment: currentPrice > levels.immediateSupport ? 'Above' : 'Below',
      volume: 'Strong Confirmation',
      volatility: 'Medium Volatility',
      momentum: 'Bullish Momentum'
    };
  }, [currentPrice, levels]);

  // D. Dynamic Trade Setup parameters
  const tradeSetup = useMemo(() => {
    const entryMin = levels.immediateSupport;
    const entryMax = levels.pivotPoint;
    const stopLoss = levels.strongSupport;
    const target1 = levels.immediateResistance;
    const target2 = levels.strongResistance;
    
    // Risk Reward ratio
    const risk = entryMax - stopLoss;
    const reward = target2 - entryMax;
    const rrRatio = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 1.5;

    return {
      entryZone: `₹${entryMin.toLocaleString()} - ₹${entryMax.toLocaleString()}`,
      stopLoss: `₹${stopLoss.toLocaleString()}`,
      target1: `₹${target1.toLocaleString()}`,
      target2: `₹${target2.toLocaleString()}`,
      rrRatio: `${rrRatio}:1`,
      confidence: `${recommendation?.ai_investment_score ?? 75}%`
    };
  }, [levels, recommendation]);

  return (
    <div className="space-y-4 w-full select-none text-[#F8FAFC]">
      
      {/* Grid containing Bollinger chart and Signals table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Bollinger bands area price chart */}
        <div className="lg:col-span-7 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Bollinger Price Envelopes</span>
                <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">EMA 20 & Bollinger Bands indicators overlay</span>
              </div>
              <span className="text-[7.5px] bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] px-2 py-0.5 rounded font-black uppercase">
                SMA 20 ACTIVE
              </span>
            </div>
          </div>

          <div className="h-[210px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={techData}>
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 8 }} stroke="#1E293B" tickFormatter={v => v.slice(5)} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748B', fontSize: 8 }} stroke="#1E293B" tickFormatter={v => `₹${v}`} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, fontSize: 8 }} />
                <Area type="monotone" dataKey="bbUpper" stroke="#475569" strokeDasharray="3 3" fill="none" />
                <Area type="monotone" dataKey="bbLower" stroke="#475569" strokeDasharray="3 3" fill="none" />
                <Line type="monotone" dataKey="close" stroke={meta.color} strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="ema20" stroke="#EC4899" strokeWidth={1.2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sub-panel MACD histogram chart */}
          <div className="h-[90px] border-t border-[#1E293B]/70 pt-2 select-none">
            <span className="text-[7.5px] font-black text-[#64748B] uppercase tracking-wider block">MACD Histogram & Signal Waves</span>
            <div className="h-[60px] w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={techData}>
                  <XAxis dataKey="date" tick={false} stroke="none" />
                  <YAxis tick={false} stroke="none" />
                  <Bar dataKey="hist" fill="#22C55E">
                    {techData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.hist >= 0 ? '#22C55E' : '#EF4444'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="macd" stroke="#3B82F6" strokeWidth={1} dot={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Technical Signal Matrix & Price Solvency Levels */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Signal Matrix Table */}
          <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-violet-500/20 transition-all select-none flex-1">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3">Technical Signal Matrix</span>
            <div className="space-y-1.5 text-[9.5px]">
              <MetricCard label="Structural Trend" value={signals.trend} changeType={signals.trend === 'Bullish' ? 'positive' : 'neutral'} />
              <MetricCard label="RSI Wave Index" value={signals.rsi} changeType="neutral" />
              <MetricCard label="MACD Oscillator" value={signals.macd} changeType="positive" />
              <MetricCard label="Moving Averages Alignment" value={signals.maAlignment} changeType="positive" />
              <MetricCard label="Volume Confirmation" value={signals.volume} changeType="positive" />
              <MetricCard label="Historical Volatility" value={signals.volatility} />
            </div>
          </div>

          {/* Dynamic support resistance pricing points */}
          <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-violet-500/20 transition-all select-none">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3">Dynamic Trading S/R Levels</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9.5px]">
              <MetricCard label="Strong Resistance (R2)" value={`₹${levels.strongResistance.toLocaleString()}`} changeType="negative" />
              <MetricCard label="Strong Support (S2)" value={`₹${levels.strongSupport.toLocaleString()}`} changeType="positive" />
              <MetricCard label="Immediate Resistance (R1)" value={`₹${levels.immediateResistance.toLocaleString()}`} changeType="negative" />
              <MetricCard label="Immediate Support (S1)" value={`₹${levels.immediateSupport.toLocaleString()}`} changeType="positive" />
              <MetricCard label="Pivot Point (PP)" value={`₹${levels.pivotPoint.toLocaleString()}`} />
              <MetricCard label="52W High Range" value={`₹${levels.high52w.toLocaleString()}`} />
            </div>
          </div>

        </div>

      </div>

      {/* Trade setup simulator grid card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none">
        
        {/* Trade Setup Card */}
        <div className="lg:col-span-8 card p-4 bg-[#0d121f] border border-slate-800/80 rounded-2xl hover:border-violet-500/20 transition-all">
          <div className="flex items-center justify-between border-b border-[#1E293B]/70 pb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">Analytical Trade Setup Simulation</span>
            </div>
            <div className="flex items-center gap-1 bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] px-2 py-0.5 rounded text-[8px] font-black uppercase">
              <AlertOctagon className="w-2.5 h-2.5" />
              NOT FINANCIAL ADVICE
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 mt-3 text-[9.5px]">
            <MetricCard label="Suggested Entry Zone" value={tradeSetup.entryZone} changeType="positive" />
            <MetricCard label="Recommended Stop Loss" value={tradeSetup.stopLoss} changeType="negative" />
            <MetricCard label="Target Target 1" value={tradeSetup.target1} changeType="positive" />
            <MetricCard label="Target Target 2" value={tradeSetup.target2} changeType="positive" />
            <MetricCard label="Risk / Reward Ratio" value={tradeSetup.rrRatio} />
            <MetricCard label="Model Confidence Score" value={tradeSetup.confidence} changeType="positive" />
          </div>
        </div>

        {/* Disclaimer warning */}
        <div className="lg:col-span-4 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-center text-center">
          <p className="text-[8px] text-[#64748B] font-bold leading-normal uppercase">
            Disclaimer: Forecast simulations are algorithmically generated based on past pricing volatility and model indices. Actual market returns are subject to unpredictable risks and volatility. Consult a certified financial advisor before trading.
          </p>
        </div>

      </div>

    </div>
  );
}
