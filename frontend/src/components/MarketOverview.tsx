import React, { useState, useMemo } from 'react';
import { getRecBadgeClass, getRecColor, getScoreColor, getCompanyMeta } from '../utils/api';
import { CompanyLogo } from './DashboardView';
import {
  AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, YAxis
} from 'recharts';
import {
  Star,
  ChevronUp,
  ChevronDown,
  Info,
  ChevronRight
} from 'lucide-react';

interface Props {
  quotes: any[];
  recs: Record<string, any>;
  onSelect: (symbol: string) => void;
}

type SortKey = 'rank' | 'symbol' | 'sector' | 'score' | 'price' | 'change_1d' | 'change_1w';

// Professional mock fallbacks matching market_overview.png exactly if backend data is absent
const FALLBACK_DATA: Record<string, { price: number; change_pct: number; change_1w: number; sector: string; name: string; score: number; badge: string; reason: string }> = {
  RELIANCE: { price: 3012.80, change_pct: 2.41, change_1w: 3.78, sector: 'Energy', name: 'Reliance Industries', score: 86, badge: 'Buy', reason: 'Retail momentum, strong O2C growth' },
  TCS: { price: 3732.45, change_pct: 3.45, change_1w: 5.18, sector: 'Information Technology', name: 'Tata Consultancy Services', score: 91, badge: 'Strong Buy', reason: 'Strong earnings, cloud growth, AI investments' },
  HDFCBANK: { price: 1682.40, change_pct: -0.42, change_1w: 0.35, sector: 'Banking & Financial', name: 'HDFC Bank Ltd', score: 65, badge: 'Hold', reason: 'Valuations high, growth moderate' },
  INFY: { price: 1468.75, change_pct: 1.23, change_1w: 1.95, sector: 'Information Technology', name: 'Infosys Ltd', score: 76, badge: 'Buy', reason: 'IT spending recovery, digital pipeline' },
  ICICIBANK: { price: 1341.90, change_pct: 2.24, change_1w: 4.12, sector: 'Banking & Financial', name: 'ICICI Bank Ltd', score: 88, badge: 'Buy', reason: 'Strong asset quality, healthy growth' },
  HINDUNILVR: { price: 2465.30, change_pct: -0.65, change_1w: -1.25, sector: 'FMCG', name: 'Hindustan Unilever Ltd', score: 58, badge: 'Hold', reason: 'Weak demand, margin pressure' },
  SBIN: { price: 812.40, change_pct: 2.85, change_1w: 2.85, sector: 'Banking & Financial', name: 'State Bank of India', score: 78, badge: 'Buy', reason: 'Credit growth strong, margin expansion' },
  BHARTIARTL: { price: 1541.35, change_pct: 2.11, change_1w: 2.11, sector: 'Telecom', name: 'Bharti Airtel Ltd', score: 82, badge: 'Buy', reason: 'ARPU growth, strong subscriber base' },
  ITC: { price: 444.75, change_pct: -0.48, change_1w: -0.15, sector: 'FMCG', name: 'ITC Ltd', score: 72, badge: 'Hold', reason: 'Stable margins, cigarette volume steady' },
  TITAN: { price: 3241.60, change_pct: -0.40, change_1w: 0.85, sector: 'FMCG', name: 'Titan Company Ltd', score: 70, badge: 'Hold', reason: 'High gold prices impacting jewelry volumes' },
  ASIANPAINT: { price: 2854.20, change_pct: -1.05, change_1w: -1.80, sector: 'FMCG', name: 'Asian Paints Ltd', score: 62, badge: 'Reduce', reason: 'Raw material cost pressures' }
};

export default function MarketOverview({ quotes, recs, onSelect }: Props) {
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers'>('gainers');

  // Sorting configuration for the Ranking Table
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({
    key: 'score',
    direction: 'desc'
  });

  // Local state for watchlist favorites in the table
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    TCS: true,
    ICICIBANK: true,
    RELIANCE: true,
    HDFCBANK: false,
    HINDUNILVR: false,
    SBIN: false,
    INFY: false
  });

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  // Helper: Find quote in live data array
  const getQuoteForSymbol = (symbol: string) => {
    return quotes.find(q => q.symbol.toUpperCase() === symbol.toUpperCase());
  };

  // Helper: Resolve price with fallback
  const getPrice = (symbol: string, defaultPrice?: number) => {
    const q = getQuoteForSymbol(symbol);
    if (q) return q.current_price;
    if (FALLBACK_DATA[symbol.toUpperCase()]) return FALLBACK_DATA[symbol.toUpperCase()].price;
    return defaultPrice ?? getCompanyMeta(symbol).basePrice ?? 100.0;
  };

  // Helper: Resolve 1D change percentage with fallback
  const getChangePct = (symbol: string, defaultChange?: number) => {
    const q = getQuoteForSymbol(symbol);
    if (q) return q.change_pct;
    if (FALLBACK_DATA[symbol.toUpperCase()]) return FALLBACK_DATA[symbol.toUpperCase()].change_pct;
    return defaultChange ?? 0.0;
  };

  // Calculate Index Stats dynamically based on actual constituent prices (centered around mockup positive bases)
  const avgNifty50Change = useMemo(() => {
    return quotes.length > 0
      ? quotes.reduce((acc, q) => acc + q.change_pct, 0) / quotes.length
      : 0.85;
  }, [quotes]);

  const avgBankNiftyChange = useMemo(() => {
    const banking = quotes.filter(q => getCompanyMeta(q.symbol).sector === 'Banking & Financial');
    return banking.length > 0
      ? banking.reduce((acc, q) => acc + q.change_pct, 0) / banking.length
      : 1.24;
  }, [quotes]);

  // Derived Index values corresponding to mockup starting bases
  const niftyPrice = 22517.60 * (1 + (avgNifty50Change - 0.85) / 100);
  const niftyChangePct = avgNifty50Change;
  const niftyChange = niftyPrice - (22517.60 / (1 + 0.85 / 100));

  const bankNiftyPrice = 48153.15 * (1 + (avgBankNiftyChange - 1.24) / 100);
  const bankNiftyChangePct = avgBankNiftyChange;
  const bankNiftyChange = bankNiftyPrice - (48153.15 / (1 + 1.24 / 100));

  // Dynamic movers lists sorted from current session data
  const dynamicGainers = useMemo(() => {
    return [...quotes]
      .sort((a, b) => b.change_pct - a.change_pct)
      .slice(0, 5);
  }, [quotes]);

  const dynamicLosers = useMemo(() => {
    return [...quotes]
      .sort((a, b) => a.change_pct - b.change_pct)
      .slice(0, 5);
  }, [quotes]);

  // Fallback movers list matching image values exactly if no dynamic data loaded
  const fallbackGainers = [
    { symbol: 'TCS', price: 3732.45, change_pct: 3.45 },
    { symbol: 'SBIN', price: 812.40, change_pct: 2.85 },
    { symbol: 'ICICIBANK', price: 1341.90, change_pct: 2.42 },
    { symbol: 'RELIANCE', price: 3012.80, change_pct: 2.41 },
    { symbol: 'BHARTIARTL', price: 1541.35, change_pct: 2.11 },
  ];

  const fallbackLosers = [
    { symbol: 'HDFCBANK', price: 1682.40, change_pct: -0.42 },
    { symbol: 'HINDUNILVR', price: 2465.30, change_pct: -0.65 },
    { symbol: 'ITC', price: 444.75, change_pct: -0.48 },
    { symbol: 'TITAN', price: 3241.60, change_pct: -0.40 },
    { symbol: 'ASIANPAINT', price: 2854.20, change_pct: -1.05 },
  ];

  const currentMovers = moversTab === 'gainers'
    ? (dynamicGainers.length > 0 ? dynamicGainers : fallbackGainers)
    : (dynamicLosers.length > 0 ? dynamicLosers : fallbackLosers);

  // Sparkline generator helper
  const generateSparklineData = (changePct: number, seed: number) => {
    const data = [];
    let base = 100;
    const step = changePct / 10;
    for (let i = 0; i < 12; i++) {
      base = base + step + Math.sin(i * 1.5 + seed) * 0.45;
      data.push({ value: base });
    }
    return data;
  };

  // Sparkline data
  const niftySpark = useMemo(() => generateSparklineData(niftyChangePct, 1), [niftyChangePct]);
  const bankNiftySpark = useMemo(() => generateSparklineData(bankNiftyChangePct, 2), [bankNiftyChangePct]);

  // Sector Performance List mapping constituents dynamically
  const sectorPerformanceData = useMemo(() => {
    const map = [
      { id: 'IT', name: 'IT', defaultChange: 2.43, symbols: ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM'] },
      { id: 'BANKING', name: 'Banking', defaultChange: 1.89, symbols: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK'] },
      { id: 'AUTO', name: 'Auto', defaultChange: 3.12, symbols: ['MARUTI', 'TMPV', 'M&M', 'BAJAJ-AUTO', 'EICHERMOT'] },
      { id: 'FINANCIAL', name: 'Financial', defaultChange: 1.45, symbols: ['BAJFINANCE', 'BAJAJFINSV', 'JIOFIN', 'SHRIRAMFIN', 'HDFCLIFE', 'SBILIFE'] },
      { id: 'OIL_GAS', name: 'Oil & Gas', defaultChange: 2.81, symbols: ['RELIANCE', 'ONGC', 'COALINDIA'] },
      { id: 'PHARMA', name: 'Pharma', defaultChange: 0.62, symbols: ['SUNPHARMA', 'CIPLA', 'DRREDDY', 'APOLLOHOSP', 'MAXHEALTH'] },
      { id: 'FMCG', name: 'FMCG', defaultChange: -0.62, symbols: ['HINDUNILVR', 'ITC', 'TITAN', 'ASIANPAINT', 'NESTLEIND', 'TATACONSUM'] },
      { id: 'METAL', name: 'Metal', defaultChange: 1.08, symbols: ['TATASTEEL', 'JSWSTEEL', 'HINDALCO'] },
      { id: 'REALTY', name: 'Realty', defaultChange: 0.35, symbols: ['ULTRACEMCO', 'GRASIM', 'ADANIENT', 'ADANIPORTS', 'BEL', 'LT'] },
      { id: 'POWER', name: 'Power', defaultChange: 0.91, symbols: ['NTPC', 'POWERGRID'] },
      { id: 'TELECOM', name: 'Telecom', defaultChange: 1.66, symbols: ['BHARTIARTL'] },
      { id: 'CONSUMER_DUR', name: 'Consumer Durable', defaultChange: 0.23, symbols: ['TRENT', 'INDIGO', 'ETERNAL'] },
    ];

    return map.map(sec => {
      const relatedQuotes = quotes.filter(q => sec.symbols.includes(q.symbol));
      const change = relatedQuotes.length > 0
        ? relatedQuotes.reduce((acc, q) => acc + q.change_pct, 0) / relatedQuotes.length
        : sec.defaultChange;
      return { ...sec, change };
    });
  }, [quotes]);

  const getSectorStyle = (val: number) => {
    if (val > 2.0) return { background: '#092518', color: '#22C55E', borderColor: 'rgba(34, 197, 94, 0.25)' };
    if (val >= 0.5) return { background: '#0a1d15', color: '#22C55E', borderColor: 'rgba(34, 197, 94, 0.2)' };
    if (val >= -0.5) return { background: '#22180c', color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.2)' };
    return { background: '#2d0f12', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.25)' };
  };

  const getHeatmapStyle = (val: number) => {
    if (val >= 2.5) return { backgroundColor: '#14532d', color: '#F8FAFC' };
    if (val >= 1.5) return { backgroundColor: '#166534', color: '#F8FAFC' };
    if (val >= 0.5) return { backgroundColor: '#15803d', color: '#F8FAFC' };
    if (val >= 0) return { backgroundColor: '#22C55E', color: '#060B17' };
    if (val >= -0.5) return { backgroundColor: '#7f1d1d', color: '#F8FAFC' };
    if (val >= -1.5) return { backgroundColor: '#991b1b', color: '#F8FAFC' };
    return { backgroundColor: '#b91c1c', color: '#F8FAFC' };
  };

  // Ranking data sorting logic
  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRankingData = useMemo(() => {
    const rawData = [
      { rank: 1, symbol: 'TCS', sector: 'Information Technology', score: 91, price: 3732.45, change_1d: 3.45, change_1w: 5.18, badge: 'Strong Buy', reason: 'Strong earnings, cloud growth, AI investments' },
      { rank: 2, symbol: 'ICICIBANK', sector: 'Banking & Financial', score: 88, price: 1341.90, change_1d: 2.42, change_1w: 4.12, badge: 'Buy', reason: 'Strong asset quality, healthy growth' },
      { rank: 3, symbol: 'RELIANCE', sector: 'Energy', score: 86, price: 3012.80, change_1d: 2.41, change_1w: 3.78, badge: 'Buy', reason: 'Retail momentum, strong O2C growth' },
      { rank: 4, symbol: 'HDFCBANK', sector: 'Banking & Financial', score: 65, price: 1682.40, change_1d: -0.42, change_1w: 0.35, badge: 'Hold', reason: 'Valuations high, growth moderate' },
      { rank: 5, symbol: 'HINDUNILVR', sector: 'FMCG', score: 58, price: 2465.30, change_1d: -0.65, change_1w: -1.25, badge: 'Hold', reason: 'Weak demand, margin pressure' }
    ].map(row => {
      const price = getPrice(row.symbol, row.price);
      const change_1d = getChangePct(row.symbol, row.change_1d);
      return { ...row, price, change_1d };
    });

    if (sortConfig !== null) {
      rawData.sort((a: any, b: any) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return sortConfig.direction === 'asc'
            ? aVal - bVal
            : bVal - aVal;
        }
      });
    }
    return rawData;
  }, [quotes, sortConfig]);

  const renderSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="text-[#94A3B8] ml-0.5 select-none">⇅</span>;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-2.5 h-2.5 inline text-violet-400" />
      : <ChevronDown className="w-2.5 h-2.5 inline text-violet-400" />;
  };

  const getBadgeClass = (badge: string) => {
    switch (badge) {
      case 'Strong Buy':
        return 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20';
      case 'Buy':
        return 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20';
      case 'Hold':
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20';
      default:
        return 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20';
    }
  };

  // Institutional Activity mini bar chart data
  const institutionalChartData = [
    { name: 'FII Cash', value: 4200.35 },
    { name: 'DII Cash', value: 2100.75 },
    { name: 'FII Deriv', value: 1350.20 },
    { name: 'DII Deriv', value: -320.15 }
  ];

  return (
    <div className="flex flex-col gap-6 w-full text-[#F8FAFC] pb-10 bg-[#060B17] font-sans">

      {/* Dynamic Slide CSS arrow animations */}
      <style>{`
        @keyframes slideArrowRight {
          0% { transform: translateX(-2px); opacity: 0.3; }
          50% { opacity: 1; }
          100% { transform: translateX(2px); opacity: 0.3; }
        }
        @keyframes slideArrowLeft {
          0% { transform: translateX(2px); opacity: 0.3; }
          50% { opacity: 1; }
          100% { transform: translateX(-2px); opacity: 0.3; }
        }
        @keyframes slideArrowDown {
          0% { transform: translateY(-2px); opacity: 0.3; }
          50% { opacity: 1; }
          100% { transform: translateY(2px); opacity: 0.3; }
        }
        .arrow-right-anim {
          display: inline-block;
          animation: slideArrowRight 1.2s infinite ease-in-out;
        }
        .arrow-left-anim {
          display: inline-block;
          animation: slideArrowLeft 1.2s infinite ease-in-out;
        }
        .arrow-down-anim {
          display: inline-block;
          animation: slideArrowDown 1.2s infinite ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#F8FAFC]">Market Overview</h1>
        <p className="text-xs text-[#94A3B8] font-medium mt-1">AI-powered real-time market intelligence & insights</p>
      </div>

      {/* Row 1: Index Cards & Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* NIFTY 50 */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-between min-h-[110px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-1">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">NIFTY 50</span>
            <span className="text-lg font-black text-[#F8FAFC] leading-none mt-1">
              {niftyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`text-[10px] font-extrabold mt-1.5 flex items-center gap-1 ${niftyChangePct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              <span>{niftyChangePct >= 0 ? '+' : ''}{niftyChange.toFixed(2)}</span>
              <span>({niftyChangePct >= 0 ? '+' : ''}{niftyChangePct.toFixed(2)}%)</span>
            </div>
          </div>
          <div className="h-10 w-[45%] flex-shrink-0 self-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={niftySpark}>
                <defs>
                  <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={niftyChangePct >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={niftyChangePct >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} hide />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={niftyChangePct >= 0 ? '#22C55E' : '#EF4444'}
                  fill="url(#niftyGrad)"
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BANK NIFTY */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-between min-h-[110px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-1">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">BANK NIFTY</span>
            <span className="text-lg font-black text-[#F8FAFC] leading-none mt-1">
              {bankNiftyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`text-[10px] font-extrabold mt-1.5 flex items-center gap-1 ${bankNiftyChangePct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              <span>{bankNiftyChangePct >= 0 ? '+' : ''}{bankNiftyChange.toFixed(2)}</span>
              <span>({bankNiftyChangePct >= 0 ? '+' : ''}{bankNiftyChangePct.toFixed(2)}%)</span>
            </div>
          </div>
          <div className="h-10 w-[45%] flex-shrink-0 self-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bankNiftySpark}>
                <defs>
                  <linearGradient id="bankGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={bankNiftyChangePct >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={bankNiftyChangePct >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} hide />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={bankNiftyChangePct >= 0 ? '#22C55E' : '#EF4444'}
                  fill="url(#bankGrad)"
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI MARKET SCORE */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-between min-h-[110px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-1">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">AI MARKET SCORE</span>
            <div className="flex items-baseline mt-1 leading-none">
              <span className="text-2xl font-black text-[#F8FAFC]">76</span>
              <span className="text-xs text-[#94A3B8] font-bold ml-0.5">/100</span>
            </div>
            <span className="text-xs font-black text-[#22C55E] mt-1 block">Bullish</span>
            <span className="text-[9px] text-[#94A3B8] font-bold mt-1.5 flex items-center gap-0.5">
              <span className="text-[#22C55E]">▲</span> 4 pts vs yesterday
            </span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0 self-center">
            <svg className="w-12 h-12" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="16"
                stroke="#1E293B"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="18" cy="18" r="16"
                stroke="#22C55E"
                strokeWidth="3.5"
                strokeDasharray="76, 100"
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 18 18)"
              />
            </svg>
          </div>
        </div>

        {/* MARKET SENTIMENT */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[110px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col h-full py-0.5 justify-between">
            <div>
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Market Sentiment</span>
              <div className="text-lg font-black text-[#22C55E] mt-0.5 leading-none">Bullish</div>
            </div>
            <div className="space-y-1 w-full mt-3">
              <div className="relative h-1.5 bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#22C55E] rounded-full">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#F8FAFC] border border-slate-950 shadow-[0_0_8px_#ffffff]"
                  style={{ left: '76%' }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-[#94A3B8] font-black uppercase tracking-wider">
                <span>Bearish</span>
                <span>Bullish</span>
              </div>
            </div>
          </div>
        </div>

        {/* FEAR & GREED INDEX */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-between min-h-[110px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-1">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Fear & Greed Index</span>
            <span className="text-2xl font-black text-[#F8FAFC] mt-1 block leading-none">72</span>
            <span className="text-xs font-black text-[#22C55E] mt-1 block">Greed</span>
          </div>
          <div className="relative w-16 h-10 flex items-end justify-center overflow-hidden self-center flex-shrink-0">
            <svg className="w-16 h-10" viewBox="0 0 100 50">
              <defs>
                <linearGradient id="fearGreedGGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#1E293B"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="url(#fearGreedGGrad)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {(() => {
                const value = 72;
                const angle = (value / 100) * 180 - 180;
                const rad = (angle * Math.PI) / 180;
                const length = 32;
                const nx = 50 + length * Math.cos(rad);
                const ny = 50 + length * Math.sin(rad);
                return (
                  <>
                    <line x1="50" y1="50" x2={nx} y2={ny} stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="4" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
                  </>
                );
              })()}
            </svg>
            <span className="absolute bottom-0 left-0.5 text-[7px] text-[#94A3B8] font-black">0</span>
            <span className="absolute bottom-0 right-0.5 text-[7px] text-[#94A3B8] font-black">100</span>
          </div>
        </div>

      </div>

      {/* Row 2: Sector Performance, Heatmap, AI Insights, Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">

        {/* Sector Performance (Col span 3) */}
        <div className="card p-4 xl:col-span-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[280px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer hover:text-white mb-3">
              Sector Performance
              <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {sectorPerformanceData.slice(0, 12).map(sec => (
                <div
                  key={sec.id}
                  className="p-1.5 rounded border flex flex-col justify-between h-[45px] hover:opacity-90 transition-opacity"
                  style={getSectorStyle(sec.change)}
                >
                  <span className="text-[7.5px] font-black uppercase tracking-wide leading-tight line-clamp-2">{sec.name}</span>
                  <span className="text-[9px] font-extrabold leading-none mt-1">
                    {sec.change >= 0 ? '+' : ''}{sec.change.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="mt-3 flex justify-between items-center text-[7.5px] text-[#94A3B8] border-t border-[#1E293B] pt-2.5 font-bold uppercase tracking-wider select-none">
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#092518] border border-[#22C55E50]" />
              <span>&gt; +2%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#0a1d15] border border-[#22C55E40]" />
              <span>+0.5% to +2%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#22180c] border border-[#EAB30840]" />
              <span>-0.5% to +0.5%</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#2d0f12] border border-[#EF444450]" />
              <span>&lt; -0.5%</span>
            </div>
          </div>
        </div>

        {/* NIFTY 50 HEATMAP (Col span 4) */}
        <div className="card p-4 xl:col-span-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[280px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer hover:text-white mb-3">
              Nifty 50 Heatmap
              <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
            </span>

            {/* Custom Flex Treemap matching mockup column layout */}
            <div className="flex gap-1.5 h-[180px] w-full text-[9px] font-black">
              {/* Column 1: Reliance (35% width, takes full height) */}
              <div
                className="w-[35%] rounded-lg p-2.5 flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border border-black/10 shadow"
                style={getHeatmapStyle(getChangePct('RELIANCE', 2.41))}
                onClick={() => onSelect('RELIANCE')}
              >
                <span className="font-extrabold text-[10px]">RELIANCE</span>
                <span className="text-[11px] font-black">{getChangePct('RELIANCE', 2.41) >= 0 ? '+' : ''}{getChangePct('RELIANCE', 2.41).toFixed(2)}%</span>
              </div>

              {/* Column 2: TCS (top), INFY & ICICIBANK (middle side-by-side), SBIN & BHARTIARTL (bottom side-by-side) */}
              <div className="w-[35%] flex flex-col gap-1.5">
                {/* TCS (Top, spans full width of Column 2) */}
                <div
                  className="h-[48%] rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border border-black/10 shadow"
                  style={getHeatmapStyle(getChangePct('TCS', 1.89))}
                  onClick={() => onSelect('TCS')}
                >
                  <span className="font-extrabold text-[10px]">TCS</span>
                  <span className="text-[11px] font-black">{getChangePct('TCS', 1.89) >= 0 ? '+' : ''}{getChangePct('TCS', 1.89).toFixed(2)}%</span>
                </div>

                {/* INFY & ICICIBANK (Middle, side-by-side) */}
                <div className="h-[24%] flex gap-1.5">
                  <div
                    className="w-1/2 rounded-lg p-1.5 flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border border-black/10 text-[8.5px] shadow"
                    style={getHeatmapStyle(getChangePct('INFY', 1.23))}
                    onClick={() => onSelect('INFY')}
                  >
                    <span className="truncate font-extrabold">INFY</span>
                    <span className="font-bold">{getChangePct('INFY', 1.23) >= 0 ? '+' : ''}{getChangePct('INFY', 1.23).toFixed(1)}%</span>
                  </div>
                  <div
                    className="w-1/2 rounded-lg p-1.5 flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border border-black/10 text-[8.5px] shadow"
                    style={getHeatmapStyle(getChangePct('ICICIBANK', 2.24))}
                    onClick={() => onSelect('ICICIBANK')}
                  >
                    <span className="truncate font-extrabold">ICICI</span>
                    <span className="font-bold">{getChangePct('ICICIBANK', 2.24) >= 0 ? '+' : ''}{getChangePct('ICICIBANK', 2.24).toFixed(1)}%</span>
                  </div>
                </div>

                {/* SBIN & BHARTIARTL (Bottom, side-by-side) */}
                <div className="h-[24%] flex gap-1.5">
                  <div
                    className="w-1/2 rounded-lg p-1.5 flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border border-black/10 text-[8.5px] shadow"
                    style={getHeatmapStyle(getChangePct('SBIN', 1.94))}
                    onClick={() => onSelect('SBIN')}
                  >
                    <span className="truncate font-extrabold">SBIN</span>
                    <span className="font-bold">{getChangePct('SBIN', 1.94) >= 0 ? '+' : ''}{getChangePct('SBIN', 1.94).toFixed(1)}%</span>
                  </div>
                  <div
                    className="w-1/2 rounded-lg p-1.5 flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border border-black/10 text-[8.5px] shadow"
                    style={getHeatmapStyle(getChangePct('BHARTIARTL', 0.73))}
                    onClick={() => onSelect('BHARTIARTL')}
                  >
                    <span className="truncate font-extrabold">ARTL</span>
                    <span className="font-bold">{getChangePct('BHARTIARTL', 0.73) >= 0 ? '+' : ''}{getChangePct('BHARTIARTL', 0.73).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Column 3: HDFCBANK (top), HINDUNILVR (middle), ITC (bottom) */}
              <div className="w-[30%] flex flex-col gap-1.5">
                {/* HDFCBANK */}
                <div
                  className="h-[48%] rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border border-black/10 shadow"
                  style={getHeatmapStyle(getChangePct('HDFCBANK', -0.42))}
                  onClick={() => onSelect('HDFCBANK')}
                >
                  <span className="font-extrabold text-[10px] truncate">HDFCBANK</span>
                  <span className="text-[11px] font-black">{getChangePct('HDFCBANK', -0.42) >= 0 ? '+' : ''}{getChangePct('HDFCBANK', -0.42).toFixed(2)}%</span>
                </div>

                {/* HINDUNILVR */}
                <div
                  className="h-[24%] rounded-lg p-1.5 flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border border-black/10 text-[8.5px] shadow"
                  style={getHeatmapStyle(getChangePct('HINDUNILVR', -0.65))}
                  onClick={() => onSelect('HINDUNILVR')}
                >
                  <span className="truncate font-extrabold">HINDUNILVR</span>
                  <span className="font-bold">{getChangePct('HINDUNILVR', -0.65) >= 0 ? '+' : ''}{getChangePct('HINDUNILVR', -0.65).toFixed(1)}%</span>
                </div>

                {/* ITC */}
                <div
                  className="h-[24%] rounded-lg p-1.5 flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border border-black/10 text-[8.5px] shadow"
                  style={getHeatmapStyle(getChangePct('ITC', -0.48))}
                  onClick={() => onSelect('ITC')}
                >
                  <span className="truncate font-extrabold">ITC</span>
                  <span className="font-bold">{getChangePct('ITC', -0.48) >= 0 ? '+' : ''}{getChangePct('ITC', -0.48).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-2.5 flex justify-between items-center text-[7px] text-[#94A3B8] border-t border-[#1E293B] pt-2 font-bold select-none">
            <span className="uppercase tracking-wider">Price Change % (Cap-weighted)</span>
            <div className="flex gap-0.5 items-center">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#991b1b]" />
              <span>-3%</span>
              <span className="w-1.5 h-1.5 rounded-sm bg-[#dc2626]" />
              <span>-1%</span>
              <span className="w-1.5 h-1.5 rounded-sm bg-[#22C55E]" />
              <span>0%</span>
              <span className="w-1.5 h-1.5 rounded-sm bg-[#166534]" />
              <span>+1%</span>
              <span className="w-1.5 h-1.5 rounded-sm bg-[#14532d]" />
              <span>+3%</span>
            </div>
          </div>
        </div>

        {/* AI MARKET INSIGHTS (Col span 3) */}
        <div className="card p-4 xl:col-span-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[280px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer hover:text-white">
                AI Market Insights
                <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
              </span>

              {/* Bot Avatar Icon matching mockup */}
              <div className="w-6 h-6 rounded-full bg-indigo-950/40 border border-[#8B5CF6]/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#8B5CF6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                  <rect x="4" y="8" width="16" height="12" rx="4" />
                  <circle cx="9" cy="13" r="1.5" fill="currentColor" />
                  <circle cx="15" cy="13" r="1.5" fill="currentColor" />
                  <path d="M9 17h6" />
                </svg>
              </div>
            </div>

            {/* Insights bullets */}
            <div className="space-y-2 flex-grow">
              {[
                "IT sector is outperforming the market",
                "Banking stocks showing strong momentum",
                "Auto sector gaining buying interest",
                "FMCG & Consumer stocks under pressure",
                "FIIs are net buyers for the 4th consecutive day"
              ].map((text, idx) => (
                <div key={idx} className="flex gap-2 items-start text-[10px] text-[#F8FAFC] font-medium leading-tight">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#060B17] border border-[#8B5CF6]/35 text-[#8B5CF6] font-extrabold text-[8px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Market Outlook panel matching mockup */}
            <div className="mt-3 p-2.5 rounded-lg border border-[#1E293B] bg-[#0B1220] flex justify-between items-center h-[52px] overflow-hidden">
              <div className="space-y-0.5 leading-none">
                <span className="text-[8px] font-black text-[#94A3B8] uppercase tracking-wider block">Market Outlook</span>
                <span className="text-xs font-black text-[#22C55E] block mt-0.5">Bullish</span>
                <p className="text-[7.5px] text-[#94A3B8] font-medium leading-normal mt-0.5 block truncate w-[130px]">
                  High probability of positive move in next 5 trading sessions
                </p>
              </div>
              {/* Green Outlook Mini Sparkline */}
              <div className="w-16 h-8 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={niftySpark.slice(-7)}>
                    <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* MARKET MOVERS (Col span 2) */}
        <div className="card p-4 xl:col-span-2 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[280px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div className="h-full flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
              Market Movers
            </span>

            {/* Toggle tabs */}
            <div className="flex border border-[#1E293B] rounded-lg p-0.5 bg-[#060B17] my-2 text-[9px] font-bold leading-none">
              <button
                onClick={() => setMoversTab('gainers')}
                className={`flex-1 text-center py-1.5 rounded-md transition-colors leading-none ${moversTab === 'gainers' ? 'bg-[#1E293B] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
              >
                Gainers
              </button>
              <button
                onClick={() => setMoversTab('losers')}
                className={`flex-1 text-center py-1.5 rounded-md transition-colors leading-none ${moversTab === 'losers' ? 'bg-[#1E293B] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
              >
                Losers
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 mt-1 flex-grow">
              {currentMovers.slice(0, 5).map((mover) => (
                <div
                  key={mover.symbol}
                  className="flex items-center justify-between cursor-pointer hover:bg-white/[0.015] p-1 rounded-lg transition-colors"
                  onClick={() => onSelect(mover.symbol)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CompanyLogo symbol={mover.symbol} size="sm" />
                    <span className="text-[9.5px] font-extrabold text-[#F8FAFC] truncate">{mover.symbol}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-extrabold text-[#F8FAFC] block">
                      {(mover.current_price || mover.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                    <span className={`text-[8.5px] font-bold block mt-0.5 ${mover.change_pct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {mover.change_pct >= 0 ? '+' : ''}{(mover.change_pct ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-2 border-t border-[#1E293B] mt-2">
              <span
                className="text-[9px] font-bold text-[#8B5CF6] hover:text-[#8B5CF6]/85 cursor-pointer uppercase tracking-wider"
                onClick={() => onSelect(currentMovers[0]?.symbol || 'RELIANCE')}
              >
                View All {moversTab === 'gainers' ? 'Gainers' : 'Losers'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Flows & Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Institutional Activity */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[250px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                Institutional Activity
              </span>
              <span className="text-[7.5px] text-[#94A3B8] font-bold tracking-wider uppercase">(₹ in Crores)</span>
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center text-[10px] border-b border-[#1E293B] pb-1.5">
                <div>
                  <span className="text-[#94A3B8] font-semibold">FII / FPI Net Buy</span>
                </div>
                <span className="font-extrabold text-[#22C55E]">+4,200.35</span>
              </div>
              <div className="flex justify-between items-center text-[10px] border-b border-[#1E293B] pb-1.5">
                <div>
                  <span className="text-[#94A3B8] font-semibold">DII Net Buy</span>
                </div>
                <span className="font-extrabold text-[#22C55E]">+2,100.75</span>
              </div>
              <div className="flex justify-between items-center text-[10px] border-b border-[#1E293B] pb-1.5">
                <div>
                  <span className="text-[#94A3B8] font-semibold">FII Derivatives Net Buy</span>
                </div>
                <span className="font-extrabold text-[#22C55E]">+1,350.20</span>
              </div>
              <div className="flex justify-between items-center text-[10px] pb-1">
                <div>
                  <span className="text-[#94A3B8] font-semibold">DII Derivatives Net Sell</span>
                </div>
                <span className="font-extrabold text-[#EF4444]">-320.15</span>
              </div>
            </div>

            {/* Institutional activity mini bar chart */}
            <div className="h-[45px] w-full mt-2 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={institutionalChartData} barSize={14}>
                  <Bar dataKey="value">
                    {institutionalChartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.value >= 0 ? '#22C55E' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center pt-2 border-t border-[#1E293B] mt-2">
              <span className="text-[9px] font-bold text-[#8B5CF6] hover:text-[#8B5CF6]/85 cursor-pointer uppercase tracking-wider">
                View Detailed Report →
              </span>
            </div>
          </div>
        </div>

        {/* Sector Rotation / Money Flow */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[250px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div className="h-full flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block leading-none mb-3">
              Sector Rotation (Money Flow)
            </span>
            <div className="space-y-2 text-[10px] font-bold flex-grow flex flex-col justify-center">
              {[
                { sector: 'IT', arrows: ['#22C55E', '#22C55E', '#22C55E'], type: 'right' },
                { sector: 'BANKING', arrows: ['#22C55E', '#22C55E', '#22C55E', '#22C55E'], type: 'right' },
                { sector: 'AUTO', arrows: ['#22C55E', '#22C55E'], type: 'right' },
                { sector: 'METALS', arrows: ['#F59E0B', '#F59E0B'], type: 'right' },
                { sector: 'PHARMA', arrows: ['#F59E0B', '#F59E0B'], type: 'left' },
                { sector: 'FMCG', arrows: ['#EF4444', '#EF4444', '#EF4444'], type: 'down' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-[#94A3B8] font-semibold">{item.sector}</span>
                  <div className="flex gap-0.5 select-none">
                    {item.arrows.map((color, i) => (
                      <span
                        key={i}
                        className={`text-[9.5px] font-black ${item.type === 'right' ? 'arrow-right-anim' :
                          item.type === 'left' ? 'arrow-left-anim' :
                            'arrow-down-anim'
                          }`}
                        style={{ color }}
                      >
                        {item.type === 'right' ? '▶' : item.type === 'left' ? '◀' : '▼'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Top Picks */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[250px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                AI Top Picks
              </span>
              <span className="text-[9px] font-bold text-[#8B5CF6] hover:text-[#8B5CF6]/85 cursor-pointer uppercase tracking-wider">
                View All
              </span>
            </div>

            {/* Top Picks List */}
            <div className="space-y-1.5 flex-grow flex flex-col justify-center">
              {[
                { rank: 1, symbol: 'TCS', score: 91, badge: 'Strong Buy' },
                { rank: 2, symbol: 'ICICIBANK', score: 88, badge: 'Buy' },
                { rank: 3, symbol: 'RELIANCE', score: 86, badge: 'Buy' },
                { rank: 4, symbol: 'SBIN', score: 78, badge: 'Buy' },
                { rank: 5, symbol: 'INFY', score: 76, badge: 'Buy' }
              ].map((pick) => (
                <div
                  key={pick.symbol}
                  className="flex items-center justify-between hover:bg-white/[0.015] p-1 rounded-lg cursor-pointer transition-colors"
                  onClick={() => onSelect(pick.symbol)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9.5px] font-bold text-[#94A3B8] w-2.5 text-center">{pick.rank}</span>
                    <button
                      onClick={(e) => toggleFavorite(pick.symbol, e)}
                      className="text-slate-600 hover:text-amber-400 transition-colors flex-shrink-0"
                    >
                      <Star
                        className={`w-3 h-3 ${favorites[pick.symbol] ? 'fill-[#fbbf24] text-[#fbbf24]' : 'text-[#475569]'}`}
                      />
                    </button>
                    <CompanyLogo symbol={pick.symbol} size="sm" />
                    <span className="text-[9.5px] font-extrabold text-[#F8FAFC] truncate">{pick.symbol}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black" style={{ color: getScoreColor(pick.score) }}>{pick.score}</span>
                    <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-full ${getBadgeClass(pick.badge)}`}>
                      {pick.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Prediction */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[250px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                Market Prediction
              </span>
              <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
            </div>

            <div className="space-y-3 flex-grow flex flex-col justify-between">
              {/* Tomorrow Prediction */}
              <div className="flex justify-between items-center leading-none">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black uppercase text-[#94A3B8] tracking-wider">Tomorrow Prediction</span>
                  <span className="text-xl font-black text-[#22C55E] block leading-none mt-1">Bullish</span>
                </div>

                {/* Prediction sparkline / Forecast chart */}
                <div className="w-16 h-8 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={niftySpark.slice(-6)}>
                      <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expected Range & Probability */}
              <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                <div className="space-y-0.5">
                  <span className="text-slate-550 font-bold uppercase text-[7.5px] tracking-wider">Probability</span>
                  <span className="text-[11px] font-black text-[#F8FAFC]">78%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-550 font-bold uppercase text-[7.5px] tracking-wider">Expected Range</span>
                  <span className="text-[10.5px] font-black text-[#F8FAFC]">22,400 - 22,750</span>
                </div>
              </div>

              {/* Confidence Meter slider */}
              <div className="space-y-1">
                <div className="relative h-1.5 bg-[#060B17] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: '78%' }} />
                </div>
                <div className="flex justify-between text-[7px] text-slate-550 font-black">
                  <span>LOW</span>
                  <span>HIGH (78%)</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Rankings & Global Indices */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

        {/* AI Investment Score Ranking (Col span 9) */}
        <div className="card p-4 xl:col-span-9 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[300px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-3">
              AI Investment Score Ranking
            </span>

            {/* Scrollable table container */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-[10px] font-medium border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[#94A3B8] text-[8px] uppercase font-black tracking-wider leading-none select-none">
                    <th className="py-2.5 w-8 cursor-pointer" onClick={() => handleSort('rank')}>Rank {renderSortIndicator('rank')}</th>
                    <th className="py-2.5 w-10"></th>
                    <th className="py-2.5 cursor-pointer" onClick={() => handleSort('symbol')}>Company {renderSortIndicator('symbol')}</th>
                    <th className="py-2.5 cursor-pointer" onClick={() => handleSort('sector')}>Sector {renderSortIndicator('sector')}</th>
                    <th className="py-2.5 text-center cursor-pointer" onClick={() => handleSort('score')}>AI Score {renderSortIndicator('score')}</th>
                    <th className="py-2.5 text-right cursor-pointer" onClick={() => handleSort('price')}>Price {renderSortIndicator('price')}</th>
                    <th className="py-2.5 text-right cursor-pointer" onClick={() => handleSort('change_1d')}>1D Change {renderSortIndicator('change_1d')}</th>
                    <th className="py-2.5 text-right cursor-pointer" onClick={() => handleSort('change_1w')}>1W Change {renderSortIndicator('change_1w')}</th>
                    <th className="py-2.5 pl-6">AI Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/40">
                  {sortedRankingData.map((row) => {
                    const companyMeta = getCompanyMeta(row.symbol);
                    const recBadge = row.badge;
                    return (
                      <tr
                        key={row.symbol}
                        className="hover:bg-white/[0.015] cursor-pointer transition-colors leading-none h-[42px]"
                        onClick={() => onSelect(row.symbol)}
                      >
                        <td className="py-2 font-bold text-[#94A3B8]">{row.rank}</td>
                        <td className="py-2 text-center">
                          <button
                            onClick={(e) => toggleFavorite(row.symbol, e)}
                            className="text-[#94A3B8] hover:text-amber-400 transition-colors flex-shrink-0"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${favorites[row.symbol] ? 'fill-[#fbbf24] text-[#fbbf24]' : 'text-[#475569]'}`}
                            />
                          </button>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <CompanyLogo symbol={row.symbol} size="sm" />
                            <div>
                              <span className="font-extrabold text-[#F8FAFC] block text-[9.5px]">{row.symbol}</span>
                              <span className="text-[7.5px] text-[#94A3B8] block uppercase font-bold tracking-wider leading-none mt-1">
                                {companyMeta.name.split(' ')[0]}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 text-[#94A3B8] font-semibold">{row.sector}</td>
                        <td className="py-2 text-center">
                          <span className="font-black text-[10.5px]" style={{ color: getScoreColor(row.score) }}>{row.score}</span>
                        </td>
                        <td className="py-2 text-right font-extrabold text-[#F8FAFC]">
                          ₹{row.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-2 text-right font-extrabold ${row.change_1d >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {row.change_1d >= 0 ? '+' : ''}{row.change_1d.toFixed(2)}%
                        </td>
                        <td className={`py-2 text-right font-extrabold ${row.change_1w >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {row.change_1w >= 0 ? '+' : ''}{row.change_1w.toFixed(2)}%
                        </td>
                        <td className="py-2 pl-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full ${getBadgeClass(recBadge)}`}>
                              {recBadge === 'Strong Buy' ? '🟢 Strong Buy' : recBadge === 'Buy' ? '🟢 Buy' : recBadge === 'Hold' ? '🟠 Hold' : '🔴 Reduce'}
                            </span>
                            <span className="text-[#94A3B8] font-medium italic text-[9px] max-w-[180px] truncate">
                              {row.reason}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center border-t border-[#1E293B]/50 pt-2.5 mt-2">
            <span
              className="text-[9px] font-bold text-[#8B5CF6] hover:text-[#8B5CF6]/80 cursor-pointer uppercase tracking-wider"
              onClick={() => onSelect('TCS')}
            >
              View Full Ranking →
            </span>
          </div>
        </div>

        {/* Global Indices (Col span 3) */}
        <div className="card p-4 xl:col-span-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[300px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div className="h-full flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-4">
              Global Indices
            </span>

            <div className="space-y-3 flex-grow flex flex-col justify-between">
              {[
                { name: 'NASDAQ', price: 18567.19, changePct: 1.20 },
                { name: 'S&P 500', price: 5375.32, changePct: 0.96 },
                { name: 'DOW JONES', price: 39872.85, changePct: 0.80 },
                { name: 'NIKKEI 225', price: 38920.26, changePct: 1.35 },
                { name: 'HANG SENG', price: 18292.10, changePct: 1.02 }
              ].map((ind, idx) => (
                <div key={ind.name} className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-[#94A3B8]">{ind.name}</span>
                    <span className="text-[11px] font-black text-[#F8FAFC] block">
                      {ind.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Global index mini sparkline */}
                  <div className="w-14 h-6 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={generateSparklineData(ind.changePct, idx + 10)}>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={ind.changePct >= 0 ? '#22C55E' : '#EF4444'}
                          fill="none"
                          strokeWidth={1.2}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <span className={`text-[10px] font-extrabold text-right w-14 ${ind.changePct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {ind.changePct >= 0 ? '+' : ''}{ind.changePct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
