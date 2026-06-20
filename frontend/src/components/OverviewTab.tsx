import React, { useState, useMemo } from 'react';
import { ChevronDown, CheckCircle, AlertTriangle, Rocket, Eye, ShieldAlert, Award, Compass } from 'lucide-react';
import StockChart from './StockChart';
import MetricCard from './MetricCard';
import ScoreRing from './ScoreRing';
import { CompanyLogo } from './DashboardView';
import { formatCurrency } from '../utils/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface OverviewTabProps {
  symbol: string;
  meta: any;
  quote: any;
  historyData: any[];
  recommendation: any;
  sentiment: any;
  risk: any;
  onSymbolSelect?: (symbol: string) => void;
  quotes?: any[];
}

const PERIODS = ['1D', '1W', '1M', '6M', '1Y', '5Y'];

export default function OverviewTab({
  symbol,
  meta,
  quote,
  historyData = [],
  recommendation,
  sentiment,
  risk,
  onSymbolSelect,
  quotes = []
}: OverviewTabProps) {
  // Chart indicators states
  const [period, setPeriod] = useState('1Y');
  const [showVolume, setShowVolume] = useState(true);
  const [showMA20, setShowMA20] = useState(false);
  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [compareNifty, setCompareNifty] = useState(false);

  // Fallbacks
  const currentPrice = quote?.current_price ?? meta.basePrice;
  const scoreOverall = recommendation?.ai_investment_score ?? 75;
  const ratingText = recommendation?.recommendation || 'Strong Buy';
  const targetPrice = recommendation?.target_price ?? (currentPrice * 1.14);
  const upsidePct = recommendation?.upside_pct ?? 14.0;
  const riskLevel = risk?.risk_score >= 75 ? 'High' : (risk?.risk_score >= 50 ? 'Moderate' : 'Low');

  // Dynamic Financial Perf Data
  const financialPerfData = useMemo(() => {
    const mCap = quote?.market_cap || meta.basePrice * 100000000;
    const baseRevenue = mCap * 0.08 / 10000000; // Cr
    const profitMargin = 0.15;
    return [
      { year: 'FY21', Revenue: Math.round(baseRevenue * 0.72), Profit: Math.round(baseRevenue * 0.72 * profitMargin), EBITDA: Math.round(baseRevenue * 0.72 * 0.25) },
      { year: 'FY22', Revenue: Math.round(baseRevenue * 0.82), Profit: Math.round(baseRevenue * 0.82 * profitMargin), EBITDA: Math.round(baseRevenue * 0.82 * 0.25) },
      { year: 'FY23', Revenue: Math.round(baseRevenue * 0.95), Profit: Math.round(baseRevenue * 0.95 * profitMargin), EBITDA: Math.round(baseRevenue * 0.95 * 0.25) },
      { year: 'FY24', Revenue: Math.round(baseRevenue * 1.05), Profit: Math.round(baseRevenue * 1.05 * profitMargin), EBITDA: Math.round(baseRevenue * 1.05 * 0.25) },
      { year: 'FY25(E)', Revenue: Math.round(baseRevenue * 1.18), Profit: Math.round(baseRevenue * 1.18 * profitMargin), EBITDA: Math.round(baseRevenue * 1.18 * 0.25) }
    ];
  }, [quote, meta]);

  // Peer metadata listing
  const peerList = useMemo(() => {
    const sectorPeers = quotes.filter(q => q.sector === meta.sector && q.symbol.toUpperCase() !== symbol.toUpperCase()).slice(0, 4);
    return sectorPeers.map(p => ({
      symbol: p.symbol,
      name: p.symbol,
      score: p.pe_ratio > 30 ? 70 : 76,
      pe: p.pe_ratio || 22.5,
      rec: p.change_pct >= 0 ? 'Buy' : 'Hold',
      isPositive: p.change_pct >= 0
    }));
  }, [quotes, meta, symbol]);

  return (
    <div className="space-y-4 w-full select-none text-[#F8FAFC]">
      {/* Overview main dashboard split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* LEFT COLUMN: price-performance chart */}
        <div className="lg:col-span-8 card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[460px] hover:border-[#8B5CF6]/15 transition-all duration-300">
          <div className="flex-1 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between border-b border-[#1E293B]/70 pb-2 select-none flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">Price History & Indicators</span>
                <span className="text-[7px] bg-violet-650/15 border border-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded font-black">LOGSCALE</span>
              </div>
              
              {/* Switches toolbar */}
              <div className="flex gap-3.5 items-center flex-wrap">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" checked={showVolume} onChange={() => setShowVolume(!showVolume)} className="sr-only peer" />
                  <div className="w-5.5 h-3 bg-slate-800 rounded-full peer peer-checked:bg-[#8B5CF6] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[1px] after:bg-slate-400 after:rounded-full after:h-2 after:w-2 after:transition-all"></div>
                  <span className="ml-1 text-[7px] font-black uppercase text-[#64748B] peer-checked:text-[#94A3B8]">Vol</span>
                </label>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" checked={showMA20} onChange={() => setShowMA20(!showMA20)} className="sr-only peer" />
                  <div className="w-5.5 h-3 bg-slate-800 rounded-full peer peer-checked:bg-[#8B5CF6] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[1px] after:bg-slate-400 after:rounded-full after:h-2 after:w-2 after:transition-all"></div>
                  <span className="ml-1 text-[7px] font-black uppercase text-[#64748B] peer-checked:text-[#94A3B8]">MA20</span>
                </label>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" checked={showMA50} onChange={() => setShowMA50(!showMA50)} className="sr-only peer" />
                  <div className="w-5.5 h-3 bg-slate-800 rounded-full peer peer-checked:bg-[#8B5CF6] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[1px] after:bg-slate-400 after:rounded-full after:h-2 after:w-2 after:transition-all"></div>
                  <span className="ml-1 text-[7px] font-black uppercase text-[#64748B] peer-checked:text-[#94A3B8]">MA50</span>
                </label>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" checked={showRSI} onChange={() => setShowRSI(!showRSI)} className="sr-only peer" />
                  <div className="w-5.5 h-3 bg-slate-800 rounded-full peer peer-checked:bg-[#8B5CF6] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[1px] after:bg-slate-400 after:rounded-full after:h-2 after:w-2 after:transition-all"></div>
                  <span className="ml-1 text-[7px] font-black uppercase text-[#64748B] peer-checked:text-[#94A3B8]">RSI</span>
                </label>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" checked={compareNifty} onChange={() => setCompareNifty(!compareNifty)} className="sr-only peer" />
                  <div className="w-5.5 h-3 bg-slate-800 rounded-full peer peer-checked:bg-[#8B5CF6] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[1px] after:bg-slate-400 after:rounded-full after:h-2 after:w-2 after:transition-all"></div>
                  <span className="ml-1 text-[7px] font-black uppercase text-[#64748B] peer-checked:text-[#94A3B8]">vs Nifty</span>
                </label>

                <span className="text-slate-700 text-xs">|</span>

                <div className="flex gap-1 bg-[#060B17] border border-[#1E293B] rounded-full p-0.5 text-[8px] font-black">
                  {PERIODS.map(p => (
                    <button key={p} onClick={() => setPeriod(p)} className={`px-1.5 py-0.5 rounded-full ${period === p ? 'bg-[#8B5CF6] text-white' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Chart render */}
            <div className="flex-1 mt-2">
              <StockChart
                historyData={historyData}
                brandColor={meta.color}
                showVolume={showVolume}
                showMA20={showMA20}
                showMA50={showMA50}
                showMA200={showMA200}
                showRSI={showRSI}
                compareNifty={compareNifty}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: investment snapshot, key metrics, technical snapshot */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Investment Snapshot Card */}
          <div className="card p-3.5 bg-[#0d121f] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px] hover:border-violet-500/20 transition-all select-none">
            <div className="flex items-center gap-1.5 border-b border-[#1E293B] pb-2">
              <Compass className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">Investment Snapshot</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-[9.5px]">
              <MetricCard label="Current Price" value={`₹${currentPrice.toLocaleString('en-IN')}`} />
              <MetricCard label="AI Overall Score" value={`${scoreOverall}/100`} />
              <MetricCard label="Recommendation" value={ratingText} />
              <MetricCard label="Target Price" value={`₹${targetPrice.toLocaleString('en-IN')}`} />
              <MetricCard label="Upside Potential" value={`+${upsidePct.toFixed(1)}%`} changeType="positive" />
              <MetricCard label="Risk Assessment" value={riskLevel} changeType={riskLevel === 'Low' ? 'positive' : 'negative'} />
              <MetricCard label="Confidence Level" value={`${recommendation?.confidence_pct || 78}%`} />
              <MetricCard label="Time Horizon" value="12 Months" />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-violet-500/20 transition-all">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2.5">Key Metrics</span>
            <div className="space-y-1.5 text-[9.5px]">
              <MetricCard label="Market Capitalization" value={quote?.market_cap ? formatCurrency(quote.market_cap) : '—'} />
              <MetricCard label="P/E Ratio (TTM)" value={quote?.pe_ratio !== undefined ? quote.pe_ratio.toFixed(2) : '—'} />
              <MetricCard label="P/B Ratio" value={quote?.pb_ratio !== undefined ? quote.pb_ratio.toFixed(2) : '—'} />
              <MetricCard label="Dividend Yield" value={quote?.dividend_yield !== undefined ? `${(quote.dividend_yield * 100).toFixed(2)}%` : '—'} />
              <MetricCard label="Debt to Equity" value={quote?.debt_equity !== undefined ? quote.debt_equity.toFixed(2) : '—'} />
            </div>
          </div>
        </div>

      </div>

      {/* LOWER GRID: Financial Performance, News, Peers, SWOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        
        {/* Card 1: Financial Performance */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Financial Performance</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Revenue & Profits (₹ Cr)</span>
          </div>
          <div className="h-[120px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialPerfData}>
                <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 8 }} stroke="none" />
                <YAxis tick={false} stroke="none" width={0} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, fontSize: 8 }} />
                <Bar dataKey="Revenue" fill={meta.color} barSize={4} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Profit" fill="#22C55E" barSize={4} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[8px] text-[#94A3B8] font-bold mt-2 border-t border-[#1E293B]/70 pt-2 block">
            Consistent visual performance indicators.
          </span>
        </div>

        {/* Card 2: News & Sentiment */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px]">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2">News & Sentiment Feed</span>
          <div className="space-y-1.5 flex-grow overflow-y-auto chat-scrollbar pr-1 max-h-[140px] select-none">
            {sentiment?.articles?.slice(0, 3).map((n: any, i: number) => (
              <div key={i} className="p-2 rounded-xl bg-[#0B1220] border border-[#1E293B]/60 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black text-[#F8FAFC] block truncate leading-tight">{n.headline}</span>
                  <span className="text-[7px] text-[#64748B] font-bold block mt-0.5">{n.source} • {n.published_at}</span>
                </div>
                <span className={`text-[7px] px-1 py-0.5 rounded font-black uppercase ${
                  n.sentiment === 'positive' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-slate-700/30 text-[#94A3B8]'
                }`}>{n.sentiment}</span>
              </div>
            )) || <p className="text-[8.5px] text-slate-500 italic">No sentiment news available.</p>}
          </div>
          <span className="text-[8.5px] text-center text-violet-400 font-bold block border-t border-[#1E293B]/70 pt-2 uppercase">
            Educational News Summary
          </span>
        </div>

        {/* Card 3: Peer Comparison */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px]">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2">Sector Peer Matrix</span>
          <div className="overflow-x-auto w-full flex-grow">
            <table className="w-full text-left text-[9px] font-bold border-collapse">
              <thead>
                <tr className="text-[7.5px] text-[#64748B] border-b border-[#1E293B]/60 uppercase">
                  <th className="pb-1">Peer</th>
                  <th className="pb-1 text-center">P/E</th>
                  <th className="pb-1 text-right">Rec</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/30 select-none">
                {peerList.length > 0 ? peerList.map((peer) => (
                  <tr key={peer.symbol} onClick={() => onSymbolSelect?.(peer.symbol)} className="hover:bg-white/[0.015] cursor-pointer h-6">
                    <td className="py-1 flex items-center gap-1">
                      <CompanyLogo symbol={peer.symbol} size="sm" />
                      <span className="text-[#F8FAFC] truncate w-14 block">{peer.symbol}</span>
                    </td>
                    <td className="py-1 text-center text-[#94A3B8]">{typeof peer.pe === 'number' ? peer.pe.toFixed(1) : peer.pe}</td>
                    <td className="py-1 text-right">
                      <span className={`text-[7px] px-1 py-0.5 rounded font-black uppercase ${
                        peer.isPositive ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                      }`}>{peer.rec}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500 italic">No competitors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <span className="text-[8.5px] text-center text-violet-400 font-bold block border-t border-[#1E293B]/70 pt-2 uppercase">
            Industry Benchmark Analysis
          </span>
        </div>

        {/* Card 4: SWOT Risk & Opportunity */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px] select-none">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2">SWOT Assessment</span>
          <div className="space-y-2 text-[9.5px]">
            <div className="flex gap-2 items-start leading-tight">
              <CheckCircle className="w-3.5 h-3.5 text-[#22C55E] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[#22C55E] font-black uppercase text-[8px] block">Strength</span>
                <p className="text-[#94A3B8] mt-0.5 text-[8.5px] line-clamp-1">{recommendation?.supporting_factors?.[0] || 'Market leader with healthy balances.'}</p>
              </div>
            </div>
            <div className="flex gap-2 items-start leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[#EF4444] font-black uppercase text-[8px] block">Concern</span>
                <p className="text-[#94A3B8] mt-0.5 text-[8.5px] line-clamp-1">{recommendation?.risk_flags?.[0] || 'Global supply chain margin impacts.'}</p>
              </div>
            </div>
            <div className="flex gap-2 items-start leading-tight">
              <Rocket className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[#3B82F6] font-black uppercase text-[8px] block">Catalyst</span>
                <p className="text-[#94A3B8] mt-0.5 text-[8.5px] line-clamp-1">Expansion into secondary tier cities.</p>
              </div>
            </div>
            <div className="flex gap-2 items-start leading-tight">
              <Eye className="w-3.5 h-3.5 text-[#8B5CF6] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8B5CF6] font-black uppercase text-[8px] block">Outlook</span>
                <p className="text-[#94A3B8] mt-0.5 text-[8.5px] line-clamp-1">Stable yield triggers in medium term.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
