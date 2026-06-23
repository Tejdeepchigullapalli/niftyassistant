import React, { useState, useMemo } from 'react';
import { QuoteData, RecommendationData, FinancialData } from '../../types/stock';
import { 
  COMPANIES_METADATA, 
  getCompanyMeta, 
  formatCurrency, 
  formatNumber, 
  getScoreColor, 
  getRecBadgeClass,
  getRecColor
} from '../../utils/api';
import { getSectorComparisonUniverse, ComparisonCompany } from '../../utils/sectorComparison';
import { CompanyLogo } from '../common/CompanyLogo';
import CompanyActionMenu from '../common/CompanyActionMenu';
import CompanyStatusBadge from '../common/CompanyStatusBadge';
import { 
  Search, 
  SlidersHorizontal, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  LineChart, 
  TrendingUp, 
  Info, 
  HelpCircle, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

interface SectorComparisonBoardProps {
  selectedSymbol: string;
  quotes: QuoteData[];
  recs: Record<string, RecommendationData>;
  fundamentalsBySymbol?: Record<string, FinancialData>;
  historicalReturnsBySymbol?: Record<string, any>;
  onSymbolSelect: (symbol: string) => void;
  onOpenFullComparison: (symbol: string) => void;
}

export default function SectorComparisonBoard({
  selectedSymbol,
  quotes,
  recs,
  fundamentalsBySymbol = {},
  historicalReturnsBySymbol = {},
  onSymbolSelect,
  onOpenFullComparison
}: SectorComparisonBoardProps) {
  
  // 1. Get the sector comparison universe (retains RELIANCE/BHARTIARTL custom lists)
  const [includeRelated, setIncludeRelated] = useState(false);
  const universe = useMemo(() => {
    return getSectorComparisonUniverse(selectedSymbol, COMPANIES_METADATA, includeRelated);
  }, [selectedSymbol, includeRelated]);

  const { selectedCompany, companies, sector, industry, mode, title, subtitle, notice } = universe;

  // Local Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'industry'>('all');
  const [sortField, setSortField] = useState<'aiScore' | 'marketCap' | 'changePct' | 'peRatio' | 'roe'>('aiScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [performancePeriod, setPerformancePeriod] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [visibleColumns, setVisibleColumns] = useState({
    price: true,
    change: true,
    marketCap: true,
    pe: true,
    pb: true,
    roe: true,
    growth: true,
    aiScore: true,
    rec: true,
    returns: true,
    status: true
  });
  const [showColSelector, setShowColSelector] = useState(false);

  // 2. Fetch/resolve peer metrics batched from local states (quotes, recs)
  const resolvedRows = useMemo(() => {
    return companies.map((c) => {
      // Find quote in quotes prop
      const q = quotes.find(item => item.symbol.toUpperCase() === c.symbol.toUpperCase());
      const rec = recs[c.symbol.toUpperCase()];
      const fund = fundamentalsBySymbol[c.symbol.toUpperCase()];
      const hist = historicalReturnsBySymbol[c.symbol.toUpperCase()];

      // Resolve live quote values
      const currentPrice = q?.current_price ?? c.basePrice;
      const changePct = q?.change_pct ?? 0;
      const change = q?.change ?? 0;
      const marketCap = q?.market_cap ?? 0;
      const peRatio = q?.pe_ratio ?? 0;
      const pbRatio = q?.pb_ratio ?? 0;
      const roe = q?.roe ?? 0;
      const revenueGrowth = q?.revenue_growth ?? 0;

      // Resolve AI scores
      const aiScore = rec?.ai_investment_score ?? 75;
      const recommendation = rec?.recommendation ?? 'Hold';

      // Resolve multi-period returns
      const return1W = hist?.return1W ?? 0;
      const return1M = hist?.return1M ?? 0;
      const return1Y = hist?.return1Y ?? 0;

      return {
        ...c,
        currentPrice,
        change,
        changePct,
        marketCap,
        peRatio,
        pbRatio,
        roe,
        revenueGrowth,
        aiScore,
        recommendation,
        return1W,
        return1M,
        return1Y
      };
    });
  }, [companies, quotes, recs, fundamentalsBySymbol, historicalReturnsBySymbol]);

  // Pinned baseline vs Peers list separation
  const baselineRow = useMemo(() => {
    return resolvedRows.find(r => r.symbol === selectedSymbol) || resolvedRows[0];
  }, [resolvedRows, selectedSymbol]);

  const peersRows = useMemo(() => {
    return resolvedRows.filter(r => r.symbol !== selectedSymbol);
  }, [resolvedRows, selectedSymbol]);

  // Filtering (Search & Industry Subgroup)
  const filteredPeers = useMemo(() => {
    let list = [...peersRows];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.symbol.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
    }

    // Filter by same industry only
    if (viewFilter === 'industry') {
      list = list.filter(r => r.industry === selectedCompany.industry);
    }

    // Sort peers
    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [peersRows, searchQuery, viewFilter, sortField, sortAsc, selectedCompany]);

  // Final ordered list showing baseline first, then filtered peers
  const finalOrderedRows = useMemo(() => {
    if (baselineRow) {
      return [baselineRow, ...filteredPeers];
    }
    return filteredPeers;
  }, [baselineRow, filteredPeers]);

  // 3. Sector Leaders calculations
  const sectorLeaders = useMemo(() => {
    if (resolvedRows.length === 0) return null;

    const highestScoreObj = [...resolvedRows].sort((a, b) => b.aiScore - a.aiScore)[0];
    const lowestPeObj = [...resolvedRows].filter(r => r.peRatio > 0).sort((a, b) => a.peRatio - b.peRatio)[0];
    const highestRoeObj = [...resolvedRows].sort((a, b) => b.roe - a.roe)[0];
    const best1DObj = [...resolvedRows].sort((a, b) => b.changePct - a.changePct)[0];
    const best1YObj = [...resolvedRows].sort((a, b) => b.return1Y - a.return1Y)[0];

    // Selected company sector rank by AI score
    const sortedByScore = [...resolvedRows].sort((a, b) => b.aiScore - a.aiScore);
    const selectedRank = sortedByScore.findIndex(r => r.symbol === selectedSymbol) + 1;

    return {
      highestScore: highestScoreObj,
      lowestPe: lowestPeObj,
      highestRoe: highestRoeObj,
      best1D: best1DObj,
      best1Y: best1YObj,
      rank: selectedRank,
      total: resolvedRows.length
    };
  }, [resolvedRows, selectedSymbol]);

  // Valuation vs Growth Scatter data
  const scatterData = useMemo(() => {
    return resolvedRows.map(r => ({
      symbol: r.symbol,
      pe: r.peRatio || 15,
      growth: (r.revenueGrowth * 100) || 10,
      cap: r.marketCap || 1e11,
      recommendation: r.recommendation,
      isBaseline: r.symbol === selectedSymbol
    }));
  }, [resolvedRows, selectedSymbol]);

  return (
    <div className="w-full bg-[#0d121f]/95 border border-[#1f293d] rounded-2xl p-4 xl:p-5 shadow-2xl space-y-5 select-none text-left leading-normal">
      
      {/* 1. Header Information Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-850 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-violet-600/10 border border-violet-500/20 text-violet-400 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              Peer Comparison
            </span>
            <span className="text-[8px] text-slate-500 font-bold uppercase">
              Universe Mode: {mode === 'sector' ? 'Full Sector' : mode === 'related-sector' ? 'Related Industry Group' : 'Benchmarks'}
            </span>
          </div>
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight mt-1">
            📊 {title}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{subtitle} · {companies.length} Assets Compared</p>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'benchmark-only' && selectedSymbol === 'BHARTIARTL' && (
            <button
              onClick={() => setIncludeRelated(!includeRelated)}
              className="text-[9px] font-black text-violet-400 hover:text-violet-300 border border-violet-500/30 hover:border-violet-400 bg-violet-950/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {includeRelated ? 'Show Benchmark Only' : 'Include Related-Sector Companies'}
            </button>
          )}

          <button
            onClick={() => onOpenFullComparison(selectedSymbol)}
            className="flex items-center gap-1 bg-violet-650 hover:bg-violet-500 text-white text-[9.5px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-violet-500/10 cursor-pointer"
          >
            <span>Open Full Comparison</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Warning notices */}
      {notice && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5 text-[9.5px] text-amber-400">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-extrabold uppercase block mb-0.5">Notice</span>
            {notice}
          </div>
        </div>
      )}

      {/* 2. Controls Menu Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080c14] border border-[#152036] p-2 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Subgroup Toggle Filter */}
          <div className="flex bg-slate-950 border border-slate-850 p-0.5 rounded-lg text-[9px] font-bold">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${viewFilter === 'all' ? 'bg-violet-605 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              All Sector ({resolvedRows.length})
            </button>
            {mode === 'sector' && (
              <button
                onClick={() => setViewFilter('industry')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${viewFilter === 'industry' ? 'bg-violet-605 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Direct Peers ({companies.filter(c => c.industry === selectedCompany.industry).length})
              </button>
            )}
          </div>

          {/* Sort Menu */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="bg-slate-950 border border-slate-850 text-slate-300 text-[9px] font-extrabold rounded-lg px-2.5 py-1 focus:outline-none"
          >
            <option value="aiScore">Sort: AI Score</option>
            <option value="marketCap">Sort: Market Cap</option>
            <option value="changePct">Sort: 1D Change</option>
            <option value="peRatio">Sort: P/E Ratio</option>
            <option value="roe">Sort: ROE</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Search bar */}
          <div className="relative w-full sm:w-40">
            <input
              type="text"
              placeholder="Search peers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-955 border border-slate-855 rounded-lg py-1 pl-7 pr-2.5 text-[9.5px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          </div>

          {/* Column selector */}
          <div className="relative">
            <button
              onClick={() => setShowColSelector(!showColSelector)}
              className="text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 hover:border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-550" />
              Columns
            </button>
            {showColSelector && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-950 border border-slate-850 p-2 shadow-2xl z-40 select-none grid grid-cols-1 gap-1 text-[8.5px] font-bold text-slate-300">
                {Object.keys(visibleColumns).map((col) => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer hover:text-white p-1 rounded hover:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={(visibleColumns as any)[col]}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })}
                      className="accent-violet-500 rounded"
                    />
                    <span className="capitalize">{col.replace('Cap', ' Cap').replace('pe', 'P/E').replace('pb', 'P/B').replace('roe', 'ROE')}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Peers Comparison Table */}
      <div className="overflow-x-auto border border-[#1f293d] rounded-2xl shadow-xl">
        <table className="w-full text-left text-[9.5px] font-bold border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-450 font-bold bg-[#080c14] uppercase tracking-wider text-[7.5px]">
              <th className="py-2.5 px-3 w-8 text-center">Rank</th>
              <th className="py-2.5 px-2.5">Company</th>
              {visibleColumns.price && <th className="py-2.5 px-2 text-right">Price</th>}
              {visibleColumns.change && <th className="py-2.5 px-2 text-right">1D Change</th>}
              {visibleColumns.marketCap && <th className="py-2.5 px-2 text-right">Market Cap</th>}
              {visibleColumns.pe && <th className="py-2.5 px-2 text-center">P/E</th>}
              {visibleColumns.pb && <th className="py-2.5 px-2 text-center">P/B</th>}
              {visibleColumns.roe && <th className="py-2.5 px-2 text-center">ROE</th>}
              {visibleColumns.growth && <th className="py-2.5 px-2 text-center">Revenue Growth</th>}
              {visibleColumns.aiScore && <th className="py-2.5 px-2 text-center">AI Score</th>}
              {visibleColumns.rec && <th className="py-2.5 px-2 text-center">AI Rating</th>}
              {visibleColumns.returns && (
                <>
                  <th className="py-2.5 px-2 text-center">1W Return</th>
                  <th className="py-2.5 px-2 text-center">1M Return</th>
                  <th className="py-2.5 px-2 text-center">1Y Return</th>
                </>
              )}
              {visibleColumns.status && <th className="py-2.5 px-2 text-center">Status</th>}
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {finalOrderedRows.map((item, idx) => {
              const isBaseline = item.symbol === selectedSymbol;
              
              // Colors logic for recommendation badges
              let recColor = 'text-slate-400 border-slate-800 bg-slate-900/40';
              if (item.recommendation.includes('Buy')) recColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
              else if (item.recommendation.includes('Reduce') || item.recommendation.includes('Sell')) recColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
              else if (item.recommendation.includes('Hold')) recColor = 'text-amber-400 border-[#F59E0B]/20 bg-[#F59E0B]/5';

              return (
                <tr 
                  key={item.symbol} 
                  className={`hover:bg-[#131d30]/30 transition-all ${
                    isBaseline 
                      ? 'bg-[#8B5CF6]/5 border-y-2 border-[#8B5CF6]/40 shadow-inner' 
                      : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-2.5 px-3 text-center">
                    {isBaseline ? (
                      <span className="text-[#8B5CF6] text-[10px] font-black">★</span>
                    ) : (
                      <span className="text-slate-500 font-semibold">{idx + (isBaseline ? 0 : 0)}</span>
                    )}
                  </td>

                  {/* Company */}
                  <td className="py-2.5 px-2.5">
                    <div 
                      className="flex items-center gap-1.5 cursor-pointer"
                      onClick={() => onSymbolSelect(item.symbol)}
                    >
                      <CompanyLogo symbol={item.symbol} className="w-5 h-5" size="sm" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-white hover:text-violet-400 transition-colors">{item.symbol}</span>
                          {isBaseline && (
                            <span className="text-[6.5px] font-black bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#a78bfa] px-1 rounded uppercase tracking-wider">
                              Currently Analysing
                            </span>
                          )}
                        </div>
                        <span className="text-[8.5px] text-slate-400 font-medium max-w-[120px] truncate" title={item.name}>{item.name}</span>
                      </div>
                    </div>
                  </td>

                  {/* LTP Price */}
                  {visibleColumns.price && (
                    <td className="py-2.5 px-2 font-bold text-slate-200 text-right">
                      {item.currentPrice ? `₹${item.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>
                  )}

                  {/* Change */}
                  {visibleColumns.change && (
                    <td className={`py-2.5 px-2 font-black text-right ${item.changePct >= 0 ? 'text-emerald-450' : 'text-rose-455'}`}>
                      {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                    </td>
                  )}

                  {/* Market Cap */}
                  {visibleColumns.marketCap && (
                    <td className="py-2.5 px-2 text-slate-350 font-semibold text-right">
                      {item.marketCap ? formatCurrency(item.marketCap) : '—'}
                    </td>
                  )}

                  {/* P/E Ratio */}
                  {visibleColumns.pe && (
                    <td className="py-2.5 px-2 text-center text-slate-300 font-extrabold">
                      {item.peRatio ? item.peRatio.toFixed(1) : '—'}
                    </td>
                  )}

                  {/* P/B Ratio */}
                  {visibleColumns.pb && (
                    <td className="py-2.5 px-2 text-center text-slate-300 font-semibold">
                      {item.pbRatio ? item.pbRatio.toFixed(1) : '—'}
                    </td>
                  )}

                  {/* ROE */}
                  {visibleColumns.roe && (
                    <td className="py-2.5 px-2 text-center text-slate-300 font-bold">
                      {item.roe ? `${(item.roe * 100).toFixed(1)}%` : '—'}
                    </td>
                  )}

                  {/* Revenue Growth */}
                  {visibleColumns.growth && (
                    <td className="py-2.5 px-2 text-center text-slate-305 font-bold">
                      {item.revenueGrowth ? `${(item.revenueGrowth * 100).toFixed(1)}%` : '—'}
                    </td>
                  )}

                  {/* AI Score */}
                  {visibleColumns.aiScore && (
                    <td className="py-2.5 px-2 text-center font-black">
                      <span style={{ color: getScoreColor(item.aiScore) }}>
                        {item.aiScore}/100
                      </span>
                    </td>
                  )}

                  {/* AI Recommendation */}
                  {visibleColumns.rec && (
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[7.5px] font-bold ${recColor}`}>
                        {item.recommendation}
                      </span>
                    </td>
                  )}

                  {/* Returns (1W, 1M, 1Y) */}
                  {visibleColumns.returns && (
                    <>
                      <td className={`py-2.5 px-2 text-center font-bold ${item.return1W >= 0 ? 'text-emerald-450' : 'text-rose-455'}`}>
                        {item.return1W ? `${item.return1W >= 0 ? '+' : ''}${item.return1W.toFixed(1)}%` : '—'}
                      </td>
                      <td className={`py-2.5 px-2 text-center font-bold ${item.return1M >= 0 ? 'text-emerald-450' : 'text-rose-455'}`}>
                        {item.return1M ? `${item.return1M >= 0 ? '+' : ''}${item.return1M.toFixed(1)}%` : '—'}
                      </td>
                      <td className={`py-2.5 px-2 text-center font-bold ${item.return1Y >= 0 ? 'text-emerald-450' : 'text-rose-455'}`}>
                        {item.return1Y ? `${item.return1Y >= 0 ? '+' : ''}${item.return1Y.toFixed(1)}%` : '—'}
                      </td>
                    </>
                  )}

                  {/* Position Status */}
                  {visibleColumns.status && (
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex justify-center scale-90">
                        <CompanyStatusBadge symbol={item.symbol} showLabels={false} />
                      </div>
                    </td>
                  )}

                  {/* Actions Dropdown */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end scale-75 origin-right">
                      <CompanyActionMenu symbol={item.symbol} align="right" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Advanced Visualizations Panel Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
        
        {/* PANEL A: AI Score Ranking */}
        <div className="card p-4 bg-[#080c14]/60 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">🧠 AI Score Peer Ranking</h4>
            <p className="text-[8px] text-slate-550 mb-3">Comparing blending long-term indicators across target sector</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolvedRows} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
                <YAxis dataKey="symbol" type="category" tick={{ fill: '#94a3b8', fontSize: 8 }} width={60} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(v: any) => [`${v}/100`, 'AI Score']}
                />
                <Bar dataKey="aiScore" radius={[0, 4, 4, 0]}>
                  {resolvedRows.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.symbol === selectedSymbol ? '#8B5CF6' : getScoreColor(entry.aiScore)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PANEL B: Valuation vs Growth (P/E vs Rev Growth Scatter Bubble) */}
        <div className="card p-4 bg-[#080c14]/60 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">🎈 Valuation vs Revenue Growth</h4>
            <p className="text-[8px] text-slate-550 mb-3">X: P/E Ratio | Y: YoY Revenue Growth (%) | Bubble Size: Market Cap</p>
          </div>
          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                <XAxis 
                  type="number" 
                  dataKey="pe" 
                  name="P/E Ratio" 
                  tick={{ fill: '#475569', fontSize: 8 }} 
                  label={{ value: 'P/E Ratio', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 8 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="growth" 
                  name="Revenue Growth" 
                  unit="%" 
                  tick={{ fill: '#475569', fontSize: 8 }} 
                  label={{ value: 'Growth YoY', angle: -90, position: 'insideLeft', offset: 0, fill: '#475569', fontSize: 8 }}
                />
                <ZAxis type="number" dataKey="cap" range={[50, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                />
                <Scatter name="Peers" data={scatterData} fill="#10b981">
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isBaseline ? '#8B5CF6' : getRecColor(entry.recommendation)} 
                      stroke={entry.isBaseline ? '#ffffff' : 'none'}
                      strokeWidth={entry.isBaseline ? 1.5 : 0}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PANEL C: Multi-Period Return Performance */}
        <div className="card p-4 bg-[#080c14]/60 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">📈 Multi-Period Performance</h4>
              <p className="text-[8px] text-slate-550">Compare historical price returns across selected timeline</p>
            </div>
            
            {/* Period buttons */}
            <div className="flex bg-slate-950 border border-slate-850 p-0.5 rounded-lg text-[8px] font-black uppercase">
              {(['1D', '1W', '1M', '1Y'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setPerformancePeriod(period)}
                  className={`px-2 py-0.8 rounded cursor-pointer transition-all ${performancePeriod === period ? 'bg-violet-605 text-white' : 'text-slate-500 hover:text-slate-350'}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={resolvedRows.map(r => ({
                  symbol: r.symbol,
                  ret: performancePeriod === '1D' ? r.changePct : 
                       performancePeriod === '1W' ? r.return1W :
                       performancePeriod === '1M' ? r.return1M : r.return1Y
                }))}
                margin={{ left: -10, right: 10 }}
              >
                <XAxis dataKey="symbol" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 8 }} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(v: any) => [`${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`, `${performancePeriod} Return`]}
                />
                <Bar dataKey="ret" radius={[4, 4, 0, 0]}>
                  {resolvedRows.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.symbol === selectedSymbol ? '#8B5CF6' : (entry.changePct >= 0 ? '#10b981' : '#ef4444')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PANEL D: Sector Leaders Matrix */}
        <div className="card p-4 bg-[#080c14]/60 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">🏆 Sector Leaders Summary</h4>
            <p className="text-[8px] text-slate-550 mb-3">Key metrics highlights across compared peer group</p>
          </div>

          {sectorLeaders && (
            <div className="grid grid-cols-2 gap-2.5 flex-1 items-stretch">
              {/* Leader 1 */}
              <div className="bg-slate-950/40 border border-slate-900/60 p-2.5 rounded-xl flex items-center justify-between gap-1">
                <div className="text-left min-w-0">
                  <span className="text-[7.5px] text-slate-500 font-extrabold uppercase block leading-none mb-1">Highest AI Score</span>
                  <span className="text-[9.5px] font-black text-slate-200 block truncate">{sectorLeaders.highestScore.name}</span>
                </div>
                <span className="text-[11px] font-black text-emerald-400 flex-shrink-0">
                  {sectorLeaders.highestScore.aiScore}/100
                </span>
              </div>

              {/* Leader 2 */}
              <div className="bg-slate-950/40 border border-slate-900/60 p-2.5 rounded-xl flex items-center justify-between gap-1">
                <div className="text-left min-w-0">
                  <span className="text-[7.5px] text-slate-500 font-extrabold uppercase block leading-none mb-1">Lowest P/E Multiples</span>
                  <span className="text-[9.5px] font-black text-slate-200 block truncate">{sectorLeaders.lowestPe ? sectorLeaders.lowestPe.name : '—'}</span>
                </div>
                <span className="text-[11px] font-black text-indigo-400 flex-shrink-0">
                  {sectorLeaders.lowestPe ? `${sectorLeaders.lowestPe.peRatio.toFixed(1)}x` : '—'}
                </span>
              </div>

              {/* Leader 3 */}
              <div className="bg-slate-950/40 border border-slate-900/60 p-2.5 rounded-xl flex items-center justify-between gap-1">
                <div className="text-left min-w-0">
                  <span className="text-[7.5px] text-slate-500 font-extrabold uppercase block leading-none mb-1">Highest ROE Efficiency</span>
                  <span className="text-[9.5px] font-black text-slate-200 block truncate">{sectorLeaders.highestRoe.name}</span>
                </div>
                <span className="text-[11px] font-black text-emerald-400 flex-shrink-0">
                  {sectorLeaders.highestRoe.roe ? `${(sectorLeaders.highestRoe.roe * 100).toFixed(1)}%` : '—'}
                </span>
              </div>

              {/* Leader 4 */}
              <div className="bg-slate-950/40 border border-slate-900/60 p-2.5 rounded-xl flex items-center justify-between gap-1">
                <div className="text-left min-w-0">
                  <span className="text-[7.5px] text-slate-500 font-extrabold uppercase block leading-none mb-1">Best 1D Gain</span>
                  <span className="text-[9.5px] font-black text-slate-200 block truncate">{sectorLeaders.best1D.name}</span>
                </div>
                <span className="text-[11px] font-black text-emerald-400 flex-shrink-0">
                  +{sectorLeaders.best1D.changePct.toFixed(1)}%
                </span>
              </div>

              {/* Leader 5 */}
              <div className="bg-slate-950/40 border border-slate-900/60 p-2.5 rounded-xl flex items-center justify-between gap-1">
                <div className="text-left min-w-0">
                  <span className="text-[7.5px] text-slate-500 font-extrabold uppercase block leading-none mb-1">Best 1Y Price Return</span>
                  <span className="text-[9.5px] font-black text-slate-200 block truncate">{sectorLeaders.best1Y.name}</span>
                </div>
                <span className="text-[11px] font-black text-emerald-400 flex-shrink-0">
                  +{sectorLeaders.best1Y.return1Y.toFixed(1)}%
                </span>
              </div>

              {/* Selected company rank */}
              <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 p-2.5 rounded-xl flex items-center justify-between gap-1">
                <div className="text-left min-w-0">
                  <span className="text-[7.5px] text-violet-400 font-extrabold uppercase block leading-none mb-1">Selected Stock Rank</span>
                  <span className="text-[9.5px] font-black text-slate-200 block truncate">{selectedSymbol} Rank in Sector</span>
                </div>
                <span className="text-[11px] font-black text-violet-400 flex-shrink-0">
                  #{sectorLeaders.rank} of {sectorLeaders.total}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
