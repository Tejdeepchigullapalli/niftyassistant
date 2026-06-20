import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Info, Calendar } from 'lucide-react';

interface PortfolioPerformanceChartProps {
  brandColor?: string;
}

export default function PortfolioPerformanceChart({ brandColor = '#8b5cf6' }: PortfolioPerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<string>('1M');

  // Dynamically generate data points relative to the current local date
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    let numPoints = 30;
    let stepDays = 1;

    if (timeframe === '1D') { numPoints = 8; stepDays = 1; }
    else if (timeframe === '1W') { numPoints = 7; stepDays = 1; }
    else if (timeframe === '1M') { numPoints = 30; stepDays = 1; }
    else if (timeframe === '3M') { numPoints = 12; stepDays = 7; } // Weekly
    else if (timeframe === '1Y') { numPoints = 12; stepDays = 30; } // Monthly
    else { numPoints = 24; stepDays = 30; } // All

    let portfolioVal = 0.0;
    let niftyVal = 0.0;

    for (let i = numPoints; i >= 0; i--) {
      const datePoint = new Date();
      datePoint.setDate(today.getDate() - i * stepDays);

      // Format date labels
      let dateLabel = '';
      if (timeframe === '1D') {
        dateLabel = `${(9 + i) % 12 || 12}:00`;
      } else if (timeframe === '1W' || timeframe === '1M') {
        dateLabel = datePoint.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateLabel = datePoint.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      // Generate realistic cumulative returns
      const pctShift = Math.sin(i * 0.4) * 2 + (i * 0.15); // Dynamic curves
      portfolioVal = parseFloat((pctShift * 1.1 + (Math.sin(i * 1.2) * 0.5) + 2.5).toFixed(2));
      niftyVal = parseFloat((pctShift * 0.8 + 1.2).toFixed(2));

      data.push({
        date: dateLabel,
        Portfolio: portfolioVal,
        Nifty50: niftyVal
      });
    }

    return data;
  }, [timeframe]);

  const stats = useMemo(() => {
    const lastPoint = chartData[chartData.length - 1] || { Portfolio: 4.28, Nifty50: 1.76 };
    const alpha = parseFloat((lastPoint.Portfolio - lastPoint.Nifty50).toFixed(2));
    
    return {
      portfolioReturn: lastPoint.Portfolio,
      niftyReturn: lastPoint.Nifty50,
      alpha: alpha,
      drawdown: -2.13,
      volatility: 12.34,
      sharpe: 1.28
    };
  }, [chartData]);

  return (
    <div className="flex flex-col justify-between h-full w-full select-none text-[#F8FAFC]">
      
      {/* Header filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B]/40 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Performance Chart vs Benchmark</span>
          <Info className="w-3.5 h-3.5 text-slate-650 cursor-pointer" />
        </div>

        {/* Timeframes toggles */}
        <div className="flex bg-[#0B1220] border border-[#1E293B] rounded-lg p-0.5 select-none">
          {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-[8.5px] font-black tracking-wider uppercase transition-all cursor-pointer ${
                timeframe === tf 
                  ? 'bg-violet-650 text-white shadow' 
                  : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main graph */}
      <div className="h-[155px] w-full mt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPort" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={brandColor} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={brandColor} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNifty" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#152036" vertical={false} />
            <XAxis dataKey="date" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={8} tickLine={false} axisLine={false} unit="%" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#090d16', borderColor: '#152036', borderRadius: '10px', padding: '6px' }}
              labelStyle={{ color: '#94a3b8', fontSize: '8px', fontWeight: 'bold' }}
              itemStyle={{ color: '#f8fafc', fontSize: '9px', padding: '1px 0' }}
            />
            <Area type="monotone" dataKey="Portfolio" stroke={brandColor} strokeWidth={2} fillOpacity={1} fill="url(#colorPort)" name="Portfolio" />
            <Area type="monotone" dataKey="Nifty50" stroke="#06B6D4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorNifty)" name="NIFTY 50" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics footnotes */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 border-t border-[#1E293B]/70 pt-2.5 mt-2.5 text-center text-[9px] font-bold">
        <div>
          <span className="text-[#64748B] uppercase block">Portfolio Return</span>
          <span className="text-white font-extrabold text-[9.5px] block mt-0.5">+{stats.portfolioReturn}%</span>
        </div>
        <div>
          <span className="text-[#64748B] uppercase block">Nifty 50 Return</span>
          <span className="text-cyan-400 font-extrabold text-[9.5px] block mt-0.5">+{stats.niftyReturn}%</span>
        </div>
        <div>
          <span className="text-[#64748B] uppercase block">Portfolio Alpha</span>
          <span className="text-emerald-500 font-extrabold text-[9.5px] block mt-0.5">+{stats.alpha}%</span>
        </div>
        <div>
          <span className="text-[#64748B] uppercase block">Max Drawdown</span>
          <span className="text-rose-500 font-extrabold text-[9.5px] block mt-0.5">{stats.drawdown}%</span>
        </div>
        <div>
          <span className="text-[#64748B] uppercase block">Sharpe Ratio</span>
          <span className="text-violet-400 font-extrabold text-[9.5px] block mt-0.5">{stats.sharpe}</span>
        </div>
        <div>
          <span className="text-[#64748B] uppercase block">Volatility</span>
          <span className="text-white font-extrabold text-[9.5px] block mt-0.5">{stats.volatility}%</span>
        </div>
      </div>

    </div>
  );
}
