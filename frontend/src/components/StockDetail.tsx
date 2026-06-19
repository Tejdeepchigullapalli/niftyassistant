import React, { useState, useEffect, useMemo } from 'react';
import { api, formatCurrency, getRecBadgeClass, getRecColor, getScoreColor, getCompanyMeta } from '../utils/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar
} from 'recharts';
import {
  Star,
  ChevronDown,
  Info,
  ExternalLink,
  Award,
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Rocket,
  Eye,
  RefreshCw
} from 'lucide-react';
import { CompanyLogo } from './DashboardView';

interface StockDetailProps {
  symbol: string;
  onSymbolSelect?: (symbol: string) => void;
}

// PERIOD selectors mapping
const PERIODS = ['1D', '1W', '1M', '6M', '1Y', '5Y'];
const PERIOD_MAPPING: Record<string, string> = {
  '1D': '1d',
  '1W': '5d',
  '1M': '1mo',
  '6M': '6mo',
  '1Y': '1y',
  '5Y': '5y'
};

// Peer benchmark list matching peer comparison table mockup
const PEER_COMPANIES = [
  { symbol: 'RELIANCE', name: 'Reliance Ind.', score: 78, pe: 22.28, roe: '9.10%', rec: 'Strong Buy', isPositive: true },
  { symbol: 'TCS',      name: 'TCS',           score: 72, pe: 25.40, roe: '50.30%', rec: 'Buy', isPositive: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank',     score: 75, pe: 18.92, roe: '13.80%', rec: 'Buy', isPositive: true },
  { symbol: 'ICICIBANK',name: 'ICICI Bank',    score: 73, pe: 16.75, roe: '16.20%', rec: 'Buy', isPositive: true },
  { symbol: 'INFY',     name: 'Infosys',       score: 70, pe: 23.15, roe: '30.40%', rec: 'Hold', isPositive: false },
];

export default function StockDetail({ symbol, onSymbolSelect }: StockDetailProps) {
  const [quote, setQuote] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [sentiment, setSentiment] = useState<any>(null);
  const [corporate, setCorporate] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [period, setPeriod] = useState('1Y');
  const [activeSubTab, setActiveSubTab] = useState(0); // 0: Overview, etc.
  const [loading, setLoading] = useState(true);

  // Toggle buttons state next to Price History
  const [showVolume, setShowVolume] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  // Watchlist favorite simulation
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const meta = getCompanyMeta(symbol);

  // Load details
  const fetchStockDetails = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const apiPeriod = PERIOD_MAPPING[period] || '1y';
      const [q, h, f, r, s, c, rec] = await Promise.all([
        api.getQuote(symbol),
        api.getHistory(symbol, apiPeriod),
        api.getFinancial(symbol),
        api.getRisk(symbol),
        api.getSentiment(symbol),
        api.getCorporate(symbol),
        api.getRecommendation(symbol),
      ]);
      setQuote(q.data);
      setHistory(h.data);
      setFinancial(f.data);
      setRisk(r.data);
      setSentiment(s.data);
      setCorporate(c.data);
      setRecommendation(rec.data);
    } catch (err) {
      console.error("[NiftyAI Error] Loading details failed:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockDetails(false);
  }, [symbol]);

  // Refetch history when period selector updates
  useEffect(() => {
    const apiPeriod = PERIOD_MAPPING[period] || '1y';
    api.getHistory(symbol, apiPeriod).then(res => setHistory(res.data)).catch(console.error);
  }, [period, symbol]);

  // Fallbacks corresponding to mockup RELIANCE details if backend returns empty
  const livePrice = quote?.current_price ?? (symbol === 'RELIANCE' ? 1329.30 : meta.basePrice);
  const liveChange = quote?.change ?? (symbol === 'RELIANCE' ? 21.20 : meta.basePrice * 0.015);
  const liveChangePct = quote?.change_pct ?? (symbol === 'RELIANCE' ? 0.09 : 1.50);

  const scoreOverall = recommendation?.ai_investment_score ?? (symbol === 'RELIANCE' ? 78 : 72);
  const scoreFinancial = recommendation?.score_components?.financial_score ?? (symbol === 'RELIANCE' ? 82 : 75);
  const scoreGrowth = recommendation?.score_components?.growth_score ?? (symbol === 'RELIANCE' ? 76 : 70);
  const scoreSentiment = recommendation?.score_components?.sentiment_score ?? (symbol === 'RELIANCE' ? 74 : 68);
  const scoreTechnical = recommendation?.score_components?.technical_score ?? (symbol === 'RELIANCE' ? 71 : 65);
  const scoreRisk = recommendation?.score_components?.risk_score ?? (symbol === 'RELIANCE' ? 62 : 55);

  const targetPrice = recommendation?.target_price ?? (symbol === 'RELIANCE' ? 1515.00 : livePrice * 1.15);
  const upsidePct = recommendation?.upside_pct ?? (symbol === 'RELIANCE' ? 13.98 : 15.00);

  // Compute MA 50, MA 200, Volume, and RSI waves dynamically
  const chartData = history?.data?.map((d: any) => ({ ...d, close: d.close })) || [];
  const computedChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    
    return chartData.map((d: any, idx: number) => {
      // MA 50 SMA calculation (proportional)
      let sum50 = 0;
      let count50 = 0;
      for (let i = Math.max(0, idx - 15); i <= idx; i++) {
        sum50 += chartData[i].close;
        count50++;
      }
      const ma50 = sum50 / count50;

      // MA 200 SMA calculation (proportional)
      let sum200 = 0;
      let count200 = 0;
      for (let i = Math.max(0, idx - 40); i <= idx; i++) {
        sum200 += chartData[i].close;
        count200++;
      }
      const ma200 = sum200 / count200;

      // Relative RSI simulation wave
      let rsi = 52 + Math.sin(idx * 0.2) * 12 + Math.cos(idx * 0.45) * 4;
      if (rsi < 0) rsi = 10;
      if (rsi > 100) rsi = 90;

      return {
        ...d,
        ma50,
        ma200,
        volume: d.volume || (Math.round((Math.sin(idx * 0.3) * 1.5 + 4.5) * 1000000)),
        rsi
      };
    });
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[550px] bg-[#060B17] text-[#94A3B8]">
        <div className="text-4xl animate-spin mb-4">⏳</div>
        <p className="text-sm font-semibold tracking-wider">LOADING STOCK INTELLIGENCE...</p>
      </div>
    );
  }

  // Stacked analyst recommendation percentages
  const recommData = [
    { name: 'Strong Buy', count: 12, pct: 48, fill: '#8B5CF6' },
    { name: 'Buy', count: 8, pct: 32, fill: '#22C55E' },
    { name: 'Hold', count: 4, pct: 16, fill: '#F59E0B' },
    { name: 'Sell', count: 1, pct: 4, fill: '#EF4444' }
  ];

  const pieData = [
    { name: 'Buy Consensus', value: 20, fill: '#8B5CF6' },
    { name: 'Other', value: 5, fill: '#1E293B' }
  ];

  // News sentiment fallbacks matching news grid mockup
  const newsItems = sentiment?.articles?.slice(0, 4) || [
    { headline: "Reliance Jio adds 5G subscribers, strengthens market leadership", sentiment: "positive", source: "Telecom Monitor", published_at: "2h ago" },
    { headline: "Reliance Retail expands into tier-2 cities, boosts Q1 growth", sentiment: "positive", source: "FinTech Wire", published_at: "5h ago" },
    { headline: "Crude oil price volatility may impact refining margins in Q2", sentiment: "neutral", source: "Global Energy Index", published_at: "1d ago" },
    { headline: "Reliance to invest in green energy and hydrogen projects", sentiment: "positive", source: "Green Tech Journal", published_at: "2d ago" },
  ];

  // Financial performance bar chart stats (Revenue, Profit, EBITDA)
  const financialPerfData = [
    { year: 'FY21', Revenue: 130, Profit: 38, EBITDA: 55 },
    { year: 'FY22', Revenue: 160, Profit: 45, EBITDA: 68 },
    { year: 'FY23', Revenue: 175, Profit: 49, EBITDA: 74 },
    { year: 'FY24', Revenue: 198, Profit: 56, EBITDA: 88 },
    { year: 'FY25(E)', Revenue: 220, Profit: 62, EBITDA: 96 }
  ];

  return (
    <div className="space-y-4 w-full text-[#F8FAFC] pb-10 bg-[#060B17] font-sans">
      
      {/* 3. STOCK HEADER CARD */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col md:flex-row items-stretch justify-between gap-4 max-h-[190px] overflow-hidden hover:border-[#8B5CF6]/20 transition-all duration-300">
        
        {/* Left Side stock identification & Score rings row */}
        <div className="flex flex-col justify-between flex-1 pr-4 border-r border-[#1E293B]/70">
          <div className="flex items-start justify-between select-none">
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-black tracking-tight text-[#F8FAFC]">{symbol}</h1>
                <span className="text-xs text-[#94A3B8] font-bold">{meta.name}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 leading-none">
                <span className="text-[9.5px] text-[#64748B] font-bold uppercase tracking-wider">{meta.sector}</span>
                <span className="text-[#1E293B] text-[8px] font-black">|</span>
                <a 
                  href={`https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[9.5px] text-[#8B5CF6] hover:text-[#8B5CF6]/85 font-black uppercase tracking-wider flex items-center gap-0.5 leading-none"
                >
                  NSE: {symbol}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* 4. AI SCORE RINGS INLINE ROW */}
          <div className="flex items-center gap-4 mt-2.5 select-none overflow-x-auto scrollbar-none pb-1.5">
            {[
              { score: scoreOverall, label: 'Overall', fill: '#8B5CF6' },
              { score: scoreFinancial, label: 'Financial', fill: '#22C55E' },
              { score: scoreGrowth, label: 'Growth', fill: '#22C55E' },
              { score: scoreSentiment, label: 'Sentiment', fill: '#22C55E' },
              { score: scoreTechnical, label: 'Technical', fill: '#3B82F6' },
              { score: scoreRisk, label: 'Risk', fill: '#F59E0B' }
            ].map((ring, idx) => (
              <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" stroke="#1E293B" strokeWidth="2.5" fill="none" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      stroke={ring.fill} 
                      strokeWidth="2.5" 
                      strokeDasharray={`${ring.score}, 100`} 
                      strokeLinecap="round" 
                      fill="none" 
                      transform="rotate(-90 18 18)" 
                    />
                  </svg>
                  <span className="absolute text-[8.5px] font-black text-[#F8FAFC]">{ring.score}</span>
                </div>
                <div className="leading-none">
                  <span className="text-[7.5px] text-[#64748B] uppercase font-bold block">{ring.label}</span>
                  <span className="text-[7.5px] text-[#94A3B8] font-black block mt-0.5">Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side price target stats & Recommendation badges */}
        <div className="flex items-center gap-5 md:pl-2">
          
          {/* Price Metrics */}
          <div className="text-right select-none pr-4 border-r border-[#1E293B]/70 py-1">
            <span className="text-[7.5px] text-[#64748B] uppercase tracking-widest block font-black">CURRENT PRICE</span>
            <span className="text-lg font-black text-[#F8FAFC] block mt-0.5 leading-none">
              ₹{livePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[9.5px] font-black flex items-center justify-end gap-0.5 leading-none mt-1 ${liveChange >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {liveChange >= 0 ? '▲' : '▼'} {Math.abs(liveChange).toFixed(2)} ({liveChangePct.toFixed(2)}%) <span className="text-[#64748B] font-bold">Today</span>
            </span>
          </div>

          {/* Upside Target */}
          <div className="text-right select-none pr-4 border-r border-[#1E293B]/70 py-1">
            <span className="text-[7.5px] text-[#64748B] uppercase tracking-widest block font-black">TARGET PRICE</span>
            <span className="text-base font-black text-[#F8FAFC] block mt-0.5 leading-none">
              ₹{targetPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[9.5px] font-black text-[#22C55E] block mt-1 leading-none">
              +{upsidePct.toFixed(2)}% Upside
            </span>
          </div>

          {/* AI Recommendation & Actions */}
          <div className="flex flex-col justify-between py-1 h-full min-w-[150px]">
            <div className="flex items-center justify-end gap-2 leading-none select-none">
              <span className="text-[7.5px] text-[#94A3B8] font-black uppercase">AI Rating:</span>
              <span className="px-2.5 py-1 rounded bg-[#8B5CF6]/15 border border-[#8B5CF6]/35 text-[#8B5CF6] text-[8.5px] font-black uppercase tracking-wider leading-none">
                STRONG BUY
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-1.5 items-center mt-3">
              <button className="px-3 py-1.5 bg-[#060B17] border border-[#1E293B] hover:border-violet-500/40 text-[9px] font-black text-[#94A3B8] hover:text-[#F8FAFC] uppercase tracking-wider rounded-xl transition-all">
                Compare
              </button>
              <button 
                onClick={() => setIsWatchlisted(!isWatchlisted)}
                className={`px-3 py-1.5 border text-[9px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 ${
                  isWatchlisted 
                    ? 'bg-amber-600/10 border-amber-500/40 text-amber-400' 
                    : 'bg-[#060B17] border-[#1E293B] hover:border-violet-500/40 text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Star className={`w-3 h-3 ${isWatchlisted ? 'fill-current' : ''}`} />
                Watch
              </button>
              <button className="px-3.5 py-1.5 bg-[#8B5CF6] hover:bg-violet-600 text-[#F8FAFC] text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-violet-500/15">
                AI Report
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 5. TAB BAR */}
      <div className="flex border-b border-[#1E293B] gap-4 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5 select-none">
        {['Overview', 'Financials', 'Technicals', 'News & Sentiment', 'Peer Comparison', 'Forecast', 'AI Insights'].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(idx)}
            className={`pb-2 text-[9.5px] font-black uppercase transition-all relative ${
              activeSubTab === idx 
                ? 'text-violet-400 border-b-2 border-violet-500' 
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 6. MAIN CONTENT GRID (Split 58/42) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* 7. LEFT COLUMN — PRICE HISTORY CARD (58% width / span 7) */}
        <div className="lg:col-span-7 card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[460px] hover:border-[#8B5CF6]/15 hover:shadow-[0_0_20px_rgba(139,92,246,0.01)] transition-all duration-300">
          <div>
            <div className="flex items-center justify-between border-b border-[#1E293B]/70 pb-2 select-none flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider">Price History & Indicators</span>
                <span className="text-[8px] bg-violet-600/10 border border-violet-500/20 text-violet-400 px-1 rounded font-black">LOGSCALE</span>
              </div>
              
              {/* iOS style switches */}
              <div className="flex gap-3 items-center flex-wrap">
                
                {/* Volume toggle */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showVolume} 
                    onChange={() => setShowVolume(!showVolume)} 
                    className="sr-only peer" 
                  />
                  <div className="w-6 h-3 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                  <span className="ml-1 text-[7.5px] font-black uppercase text-[#64748B] peer-checked:text-[#94A3B8]">Volume</span>
                </label>

                {/* MA 50 toggle */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showMA50} 
                    onChange={() => setShowMA50(!showMA50)} 
                    className="sr-only peer" 
                  />
                  <div className="w-6 h-3 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                  <span className="ml-1 text-[7.5px] font-black uppercase text-[#64748B] peer-checked:text-[#94A3B8]">MA 50</span>
                </label>

                {/* MA 200 toggle */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showMA200} 
                    onChange={() => setShowMA200(!showMA200)} 
                    className="sr-only peer" 
                  />
                  <div className="w-6 h-3 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                  <span className="ml-1 text-[7.5px] font-black uppercase text-[#64748B] peer-checked:text-[#94A3B8]">MA 200</span>
                </label>

                {/* RSI toggle */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showRSI} 
                    onChange={() => setShowRSI(!showRSI)} 
                    className="sr-only peer" 
                  />
                  <div className="w-6 h-3 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                  <span className="ml-1 text-[7.5px] font-black uppercase text-[#64748B] peer-checked:text-[#94A3B8]">RSI</span>
                </label>

                <span className="text-[#1E293B] text-[8px] font-black">|</span>

                {/* Time filter selectors */}
                <div className="flex gap-1 bg-[#060B17] border border-[#1E293B] rounded-full p-0.5 text-[8px] font-black leading-none">
                  {PERIODS.map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-1.5 py-1 rounded-full cursor-pointer leading-none uppercase ${
                        period === p ? 'bg-[#8B5CF6] text-white shadow-sm' : 'text-[#64748B] hover:text-[#94A3B8]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* Price Chart Container */}
            <div className="h-[210px] w-full mt-3 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={computedChartData}>
                  <defs>
                    <linearGradient id="priceLineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#475569', fontSize: 8 }}
                    tickFormatter={v => v ? v.slice(5) : ''} 
                    interval={Math.floor(computedChartData.length / 6) || 1} 
                    stroke="#1E293B"
                  />
                  <YAxis 
                    tick={{ fill: '#475569', fontSize: 8 }} 
                    domain={['auto', 'auto']}
                    tickFormatter={v => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} 
                    width={42} 
                    stroke="#1E293B"
                    orientation="left"
                  />
                  <Tooltip
                    contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, fontSize: 9 }}
                    labelStyle={{ color: '#94A3B8' }}
                    itemStyle={{ color: '#F8FAFC' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Close']}
                  />
                  <Area type="monotone" dataKey="close" stroke="#3B82F6" strokeWidth={1.8} fill="url(#priceLineGrad)" dot={false} />
                  {showMA50 && (
                    <Line type="monotone" dataKey="ma50" stroke="#8B5CF6" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                  )}
                  {showMA200 && (
                    <Line type="monotone" dataKey="ma200" stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                  )}
                  {showVolume && (
                    <Bar dataKey="volume" fill="#475569" opacity={0.12} yAxisId={0} barSize={2} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
              <div className="absolute right-2 top-2 text-[8px] text-[#64748B] font-black uppercase flex flex-col items-end gap-0.5 select-none pointer-events-none">
                {showMA50 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" /> MA 50</span>}
                {showMA200 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full" /> MA 200</span>}
              </div>
            </div>

            {/* RSI Sub-Panel */}
            {showRSI && (
              <div className="h-[52px] w-full border-t border-[#1E293B]/70 pt-2 mt-2 select-none">
                <span className="text-[7.5px] font-black text-[#64748B] uppercase tracking-wider block">RSI (14) Indicator</span>
                <div className="h-[36px] w-full mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={computedChartData}>
                      <YAxis domain={[0, 100]} tick={false} stroke="none" width={42} />
                      <Tooltip
                        contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 6, fontSize: 8 }}
                        labelStyle={{ color: '#94A3B8' }}
                        itemStyle={{ color: '#F8FAFC' }}
                        formatter={(v: any) => [Number(v).toFixed(1), 'RSI']}
                      />
                      <Line type="monotone" dataKey="rsi" stroke="#8B5CF6" strokeWidth={1} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>

          {/* Consensus Analyst recommendation section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-[#1E293B]/70 pt-3.5 mt-2">
            
            {/* Analyst recommendations stacked bar */}
            <div className="flex flex-col justify-between min-h-[60px] pr-3 border-r border-[#1E293B]/70 select-none">
              <div>
                <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block">Analyst Recommendation</span>
                <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Based on 25 ratings</span>
              </div>
              <div className="space-y-1.5 mt-2">
                <div className="h-2 w-full rounded-full overflow-hidden flex bg-[#1E293B]">
                  {recommData.map((bar, i) => (
                    <div key={i} className="h-full" style={{ width: `${bar.pct}%`, background: bar.fill }} title={`${bar.name}: ${bar.count}`} />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[7.5px] font-bold text-[#94A3B8]">
                  <span>{recommData[0].pct}% Buy</span>
                  <span>{recommData[1].pct}% Hold</span>
                  <span>{recommData[2].pct}% Reduce</span>
                </div>
              </div>
            </div>

            {/* Donut Chart Analyst Consensus */}
            <div className="flex items-center gap-2 pr-3 border-r border-[#1E293B]/70 select-none">
              <div className="w-14 h-14 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={16}
                      outerRadius={24}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center leading-none">
                  <span className="text-[9px] font-black text-[#F8FAFC]">25</span>
                </div>
              </div>
              <div>
                <span className="text-[9px] font-black text-[#94A3B8] uppercase block">Analyst Target</span>
                <span className="text-[8px] text-[#64748B] font-bold block mt-0.5">80% Consensus rating</span>
              </div>
            </div>

            {/* Consensus Target Upside details */}
            <div className="flex flex-col justify-between min-h-[60px] pl-2 select-none">
              <div>
                <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block">Consensus Price Target</span>
                <span className="text-sm font-black text-[#F8FAFC] block mt-1 leading-none">
                  ₹{targetPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9.5px] font-bold text-[#22C55E] block mt-1 leading-none">
                  ▲ {upsidePct.toFixed(2)}% Upside Potential
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* 8. RIGHT COLUMN — METRICS AND AI CARDS (42% width / span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Card 1: Key Metrics */}
          <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[175px] hover:border-[#8B5CF6]/15 transition-all duration-300">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2">Key Metrics</span>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 flex-grow flex flex-col justify-center text-[10px]">
              {[
                { label: 'Market Cap', value: `₹${symbol === 'RELIANCE' ? '17.99' : '13.62'}T` },
                { label: '52W High', value: `₹${symbol === 'RELIANCE' ? '1,611.80' : '4,120.00'}` },
                { label: 'P/E Ratio (TTM)', value: symbol === 'RELIANCE' ? '22.28' : '25.40' },
                { label: '52W Low', value: `₹${symbol === 'RELIANCE' ? '1,253.20' : '3,025.00'}` },
                { label: 'P/B Ratio', value: symbol === 'RELIANCE' ? '2.03' : '3.82' },
                { label: 'Dividend Yield', value: symbol === 'RELIANCE' ? '0.82%' : '2.43%' },
                { label: 'EPS (TTM)', value: `₹${symbol === 'RELIANCE' ? '59.66' : '74.50'}` },
                { label: 'Beta (5Y)', value: symbol === 'RELIANCE' ? '0.82' : '0.68' },
                { label: 'ROE', value: symbol === 'RELIANCE' ? '9.1%' : '14.8%' },
                { label: 'Volume Avg.', value: symbol === 'RELIANCE' ? '7.1M' : '4.2M' }
              ].map((metric, idx) => (
                <div key={idx} className="flex justify-between border-b border-[#1E293B]/40 pb-1 font-semibold leading-none">
                  <span className="text-[#64748B] font-bold">{metric.label}</span>
                  <span className="text-[#F8FAFC] font-black">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Technical Signals */}
          <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[135px] hover:border-[#8B5CF6]/15 transition-all duration-300">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2">Technical Signals</span>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] select-none">
              <div className="flex justify-between items-center border-b border-[#1E293B]/40 pb-1.5">
                <span className="text-[#64748B] font-bold">RSI (14)</span>
                <span className="text-[#F8FAFC] font-black">57.3</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1E293B]/40 pb-1.5">
                <span className="text-[#64748B] font-bold">SMA 200</span>
                <span className="text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-1 py-0.2 rounded font-black text-[8px] uppercase">
                  Above
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1E293B]/40 pb-1.5">
                <span className="text-[#64748B] font-bold">MACD (12,26,9)</span>
                <span className="text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-1 py-0.2 rounded font-black text-[8px] uppercase">
                  Bullish
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1E293B]/40 pb-1.5">
                <span className="text-[#64748B] font-bold">Support</span>
                <span className="text-[#EF4444] font-black">₹1,280.00</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1E293B]/40 pb-1.5">
                <span className="text-[#64748B] font-bold">SMA 50</span>
                <span className="text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-1 py-0.2 rounded font-black text-[8px] uppercase">
                  Above
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1E293B]/40 pb-1.5">
                <span className="text-[#64748B] font-bold">Resistance</span>
                <span className="text-[#EF4444] font-black">₹1,410.00</span>
              </div>
            </div>
          </div>

          {/* Card 3: AI Recommendation Confidence Gauge */}
          <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-between min-h-[125px] hover:border-[#8B5CF6]/15 transition-all duration-300">
            <div className="flex flex-col justify-between h-full py-0.5 select-none">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">AI Recommendation</span>
              <div>
                <span className="px-2.5 py-1 rounded bg-[#8B5CF6]/15 border border-[#8B5CF6]/35 text-[#8B5CF6] text-[10px] font-black uppercase tracking-wider block mt-2 w-max">
                  STRONG BUY
                </span>
              </div>
              <div className="flex justify-start gap-1 flex-wrap mt-2.5">
                {['Strong Fundamentals', 'Good Growth', 'Moderate Risk'].map((tag, i) => (
                  <span 
                    key={i} 
                    className={`text-[6.5px] px-1 py-0.5 rounded font-black uppercase tracking-wide border ${
                      i === 2 
                        ? 'bg-amber-600/10 border-amber-500/20 text-amber-400' 
                        : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Semicircle indicator */}
            <div className="relative w-[110px] h-[65px] flex items-end justify-center overflow-hidden self-center pr-2 select-none">
              <svg className="w-[110px] h-[65px]" viewBox="0 0 100 55">
                <defs>
                  <linearGradient id="aiGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#22C55E" />
                  </linearGradient>
                </defs>
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                <path 
                  d="M 10 50 A 40 40 0 0 1 90 50" 
                  fill="none" 
                  stroke="url(#aiGaugeGrad)" 
                  strokeWidth="6" 
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 * (1 - 78 / 100)}
                  strokeLinecap="round" 
                />
                {(() => {
                  const angle = (78 / 100) * 180 - 180;
                  const rad = (angle * Math.PI) / 180;
                  const length = 32;
                  const nx = 50 + length * Math.cos(rad);
                  const ny = 50 + length * Math.sin(rad);
                  return (
                    <>
                      <line x1="50" y1="50" x2={nx} y2={ny} stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="3.5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute text-center pt-8">
                <span className="text-[14px] font-black text-[#F8FAFC] block leading-none">78%</span>
                <span className="text-[7px] text-[#64748B] uppercase block tracking-wider font-extrabold mt-0.5">Confidence</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 9. LOWER GRID (4 Cards in One Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch select-none">
        
        {/* Card 1: Financial Performance */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px] hover:border-[#8B5CF6]/15 transition-all duration-300">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Financial Performance</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Revenue & Profits in ₹ Cr</span>
          </div>
          <div className="h-[120px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialPerfData}>
                <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 8 }} stroke="none" />
                <YAxis tick={false} stroke="none" width={0} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, fontSize: 8 }}
                  labelStyle={{ color: '#94A3B8' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="Revenue" fill="#3B82F6" barSize={4} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Profit" fill="#22C55E" barSize={4} radius={[2, 2, 0, 0]} />
                <Bar dataKey="EBITDA" fill="#8B5CF6" barSize={4} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center text-[7.5px] text-[#94A3B8] font-bold uppercase tracking-wider mt-2 select-none border-t border-[#1E293B]/70 pt-2">
            <span className="leading-tight line-clamp-1 max-w-[200px]">Consistent growth in Revenue and EBITDA.</span>
          </div>
        </div>

        {/* Card 2: News & Sentiment */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px] hover:border-[#8B5CF6]/15 transition-all duration-300">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-1.5">News & Sentiment</span>
          <div className="space-y-1.5 flex-grow overflow-y-auto chat-scrollbar pr-1 max-h-[140px]">
            {newsItems.map((news: any, idx: number) => (
              <div key={idx} className="p-1.5 rounded-xl bg-[#0B1220] border border-[#1E293B]/60 flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black text-[#F8FAFC] leading-snug line-clamp-1 block hover:text-violet-400 cursor-pointer">{news.headline}</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[7px] text-[#64748B] font-bold">
                    <span>{news.source}</span>
                    <span>•</span>
                    <span>{news.published_at}</span>
                  </div>
                </div>
                <span className={`text-[7px] px-1 py-0.2 rounded font-black uppercase tracking-wider flex-shrink-0 ${
                  news.sentiment === 'positive' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-slate-700/30 text-[#94A3B8]'
                }`}>
                  {news.sentiment}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center pt-2.5 mt-2 border-t border-[#1E293B]/70">
            <span className="text-[8.5px] font-black text-[#8B5CF6] hover:text-[#8B5CF6]/85 cursor-pointer uppercase tracking-wider">
              View all news →
            </span>
          </div>
        </div>

        {/* Card 3: Peer Comparison */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px] hover:border-[#8B5CF6]/15 transition-all duration-300">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-1.5">Peer Comparison</span>
          <div className="overflow-x-auto w-full flex-grow">
            <table className="w-full text-left text-[9px] font-bold border-collapse">
              <thead>
                <tr className="text-[7.5px] text-[#64748B] border-b border-[#1E293B]/60 uppercase">
                  <th className="pb-1">Company</th>
                  <th className="pb-1 text-center">Score</th>
                  <th className="pb-1 text-center">P/E</th>
                  <th className="pb-1 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/30">
                {PEER_COMPANIES.map((peer) => (
                  <tr 
                    key={peer.symbol} 
                    onClick={() => onSymbolSelect?.(peer.symbol)}
                    className="hover:bg-white/[0.015] cursor-pointer transition-colors leading-none h-6"
                  >
                    <td className="py-1 flex items-center gap-1.5">
                      <CompanyLogo symbol={peer.symbol} size="sm" />
                      <span className="text-[#F8FAFC] font-extrabold truncate w-14 block">{peer.name}</span>
                    </td>
                    <td className="py-1 text-center text-[#22C55E]">{peer.score}</td>
                    <td className="py-1 text-center text-[#94A3B8]">{peer.pe}</td>
                    <td className="py-1 text-right">
                      <span className={`text-[7px] px-1 py-0.2 rounded font-black uppercase ${
                        peer.isPositive ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                      }`}>
                        {peer.rec}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center pt-2.5 mt-2 border-t border-[#1E293B]/70">
            <span className="text-[8.5px] font-black text-[#8B5CF6] hover:text-[#8B5CF6]/85 cursor-pointer uppercase tracking-wider">
              View detailed comparison →
            </span>
          </div>
        </div>

        {/* Card 4: Risk & Opportunity */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px] hover:border-[#8B5CF6]/15 transition-all duration-300">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-1.5">Risk & Opportunity</span>
          <div className="space-y-2 flex-grow overflow-y-auto chat-scrollbar pr-1 max-h-[145px] text-[9.5px]">
            
            {/* Strengths */}
            <div className="flex gap-2 items-start leading-tight">
              <CheckCircle className="w-3.5 h-3.5 text-[#22C55E] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[#22C55E] font-black uppercase text-[8px] block">Strengths</span>
                <p className="text-[#94A3B8] mt-0.5 text-[8.5px]">Diversified business portfolio; Strong cash flows.</p>
              </div>
            </div>

            {/* Concerns */}
            <div className="flex gap-2 items-start leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[#EF4444] font-black uppercase text-[8px] block">Concerns</span>
                <p className="text-[#94A3B8] mt-0.5 text-[8.5px]">Regulatory risks in telecom; refining margins.</p>
              </div>
            </div>

            {/* Catalysts */}
            <div className="flex gap-2 items-start leading-tight">
              <Rocket className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[#3B82F6] font-black uppercase text-[8px] block">Catalysts</span>
                <p className="text-[#94A3B8] mt-0.5 text-[8.5px]">Digital retail expansion; New Energy projects.</p>
              </div>
            </div>

            {/* Outlook */}
            <div className="flex gap-2 items-start leading-tight">
              <Eye className="w-3.5 h-3.5 text-[#8B5CF6] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8B5CF6] font-black uppercase text-[8px] block">Outlook</span>
                <p className="text-[#94A3B8] mt-0.5 text-[8.5px]">Strong growth expected; Positive long-term bias.</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
