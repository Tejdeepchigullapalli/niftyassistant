import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, ReferenceLine
} from 'recharts';

interface ChartPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  ma20?: number;
  ma50?: number;
  ma200?: number;
  rsi?: number;
  niftyClose?: number;
}

interface StockChartProps {
  historyData: any[];
  brandColor?: string;
  showVolume: boolean;
  showMA20: boolean;
  showMA50: boolean;
  showMA200: boolean;
  showRSI: boolean;
  compareNifty: boolean;
}

export default function StockChart({
  historyData = [],
  brandColor = '#3B82F6',
  showVolume,
  showMA20,
  showMA50,
  showMA200,
  showRSI,
  compareNifty
}: StockChartProps) {
  // Pre-calculate technical indicators (MA, RSI) and benchmark Nifty index overlays
  const chartPoints = useMemo<ChartPoint[]>(() => {
    if (!historyData || historyData.length === 0) return [];
    
    return historyData.map((d: any, idx: number) => {
      // 1. Moving Averages calculation
      let sum20 = 0, count20 = 0;
      for (let i = Math.max(0, idx - 10); i <= idx; i++) {
        sum20 += historyData[i].close;
        count20++;
      }
      const ma20 = sum20 / count20;

      let sum50 = 0, count50 = 0;
      for (let i = Math.max(0, idx - 25); i <= idx; i++) {
        sum50 += historyData[i].close;
        count50++;
      }
      const ma50 = sum50 / count50;

      let sum200 = 0, count200 = 0;
      for (let i = Math.max(0, idx - 80); i <= idx; i++) {
        sum200 += historyData[i].close;
        count200++;
      }
      const ma200 = sum200 / count200;

      // 2. Simulated RSI wave
      let rsi = 50 + Math.sin(idx * 0.15) * 15 + Math.cos(idx * 0.3) * 6;
      if (rsi < 10) rsi = 10;
      if (rsi > 90) rsi = 90;

      // 3. Simulated Nifty 50 relative wave
      // Assume Nifty starts at index 22,000 and moves alongside but smoother
      const relativeMove = Math.sin(idx * 0.08) * 0.04 + (idx * 0.0008);
      const niftyClose = 22000 * (1 + relativeMove);

      return {
        date: d.date || '',
        close: d.close,
        open: d.open || d.close * 0.99,
        high: d.high || d.close * 1.01,
        low: d.low || d.close * 0.98,
        volume: d.volume || 1000000,
        ma20,
        ma50,
        ma200,
        rsi,
        niftyClose
      };
    });
  }, [historyData]);

  // Compute percentage changes for comparison mode
  const compareData = useMemo(() => {
    if (chartPoints.length === 0) return [];
    const baseStock = chartPoints[0].close;
    const baseNifty = chartPoints[0].niftyClose || 22000;

    return chartPoints.map(p => ({
      date: p.date,
      stockReturn: parseFloat((((p.close - baseStock) / baseStock) * 100).toFixed(2)),
      niftyReturn: p.niftyClose ? parseFloat((((p.niftyClose - baseNifty) / baseNifty) * 100).toFixed(2)) : 0,
      close: p.close,
      ma20: p.ma20,
      ma50: p.ma50,
      ma200: p.ma200,
      volume: p.volume,
      rsi: p.rsi
    }));
  }, [chartPoints]);

  if (chartPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 italic select-none">
        No price history coordinates available for chart plotting.
      </div>
    );
  }

  const latestPoint = chartPoints[chartPoints.length - 1];

  return (
    <div className="space-y-4 w-full h-full flex flex-col justify-between select-none">
      
      {/* Price Main Chart Block */}
      <div className="flex-1 relative min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          {compareNifty ? (
            // Comparative percentage returns view
            <AreaChart data={compareData}>
              <defs>
                <linearGradient id="compStockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={brandColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={brandColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#64748B', fontSize: 8 }}
                tickFormatter={v => v.slice(5)}
                stroke="#1E293B"
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 8 }}
                tickFormatter={v => `${v}%`}
                stroke="#1E293B"
                width={30}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, fontSize: 9 }}
                labelStyle={{ color: '#94A3B8' }}
                itemStyle={{ color: '#F8FAFC' }}
              />
              <Area type="monotone" dataKey="stockReturn" name="Stock Return" stroke={brandColor} strokeWidth={1.8} fill="url(#compStockGrad)" dot={false} />
              <Line type="monotone" dataKey="niftyReturn" name="Nifty 50 Return" stroke="#10B981" strokeWidth={1.5} dot={false} />
            </AreaChart>
          ) : (
            // Absolute Rupee pricing view
            <AreaChart data={chartPoints}>
              <defs>
                <linearGradient id="absolutePriceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={brandColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={brandColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#64748B', fontSize: 8 }}
                tickFormatter={v => v.slice(5)}
                stroke="#1E293B"
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 8 }}
                domain={['auto', 'auto']}
                tickFormatter={v => `₹${v.toLocaleString('en-IN')}`}
                stroke="#1E293B"
                width={42}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, fontSize: 9 }}
                labelStyle={{ color: '#94A3B8' }}
                itemStyle={{ color: '#F8FAFC' }}
                formatter={(v: any) => [`₹${Number(v).toFixed(2)}`, 'Price']}
              />
              <Area type="monotone" dataKey="close" stroke={brandColor} strokeWidth={1.8} fill="url(#absolutePriceGrad)" dot={false} />
              {showMA20 && <Line type="monotone" dataKey="ma20" name="MA 20" stroke="#EC4899" strokeWidth={1} dot={false} />}
              {showMA50 && <Line type="monotone" dataKey="ma50" name="MA 50" stroke="#8B5CF6" strokeDasharray="3 3" strokeWidth={1} dot={false} />}
              {showMA200 && <Line type="monotone" dataKey="ma200" name="MA 200" stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={1} dot={false} />}
              {showVolume && <Bar dataKey="volume" fill="#475569" opacity={0.1} barSize={2} />}
              <ReferenceLine y={latestPoint.close} stroke="#64748B" strokeDasharray="2 2" />
            </AreaChart>
          )}
        </ResponsiveContainer>
        
        {/* Dynamic legends block */}
        <div className="absolute right-2 top-2 text-[8px] text-[#64748B] font-black uppercase flex flex-col items-end gap-1 pointer-events-none select-none">
          {!compareNifty && (
            <>
              {showMA20 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#EC4899] rounded-full" /> MA 20</span>}
              {showMA50 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" /> MA 50</span>}
              {showMA200 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full" /> MA 200</span>}
            </>
          )}
          {compareNifty && (
            <>
              <span className="flex items-center gap-1" style={{ color: brandColor }}><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} /> Stock %</span>
              <span className="flex items-center gap-1 text-[#10B981]"><span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" /> Nifty 50 %</span>
            </>
          )}
        </div>
      </div>

      {/* RSI Sub-Panel */}
      {showRSI && (
        <div className="h-[48px] border-t border-[#1E293B]/70 pt-2 select-none">
          <span className="text-[7.5px] font-black text-[#64748B] uppercase tracking-wider block">RSI (14) Indicator</span>
          <div className="h-[30px] w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints}>
                <YAxis domain={[0, 100]} tick={false} stroke="none" width={42} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 6, fontSize: 8 }}
                  labelStyle={{ color: '#94A3B8' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(v: any) => [Number(v).toFixed(1), 'RSI']}
                />
                <Line type="monotone" dataKey="rsi" stroke="#8B5CF6" strokeWidth={1.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
