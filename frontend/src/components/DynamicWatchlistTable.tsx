import React, { useState, useMemo } from 'react';
import { Search, Star, Bell, Trash2, ArrowUpRight, ArrowDownRight, Pin, ChevronRight, SlidersHorizontal, Filter, Table, LayoutGrid, List } from 'lucide-react';
import { useInvestmentState } from '../context/InvestmentStateContext';
import { CompanyLogo } from './common/CompanyLogo';
import CompanyActionMenu from './common/CompanyActionMenu';
import CompanyStatusBadge from './common/CompanyStatusBadge';
import { getCompanyMeta, getScoreColor } from '../utils/api';

interface DynamicWatchlistTableProps {
  quotes: any[];
  recs?: Record<string, any>;
  onSymbolSelect?: (symbol: string) => void;
  symbols?: string[];
  mode?: 'watchlist' | 'interested';
}

export default function DynamicWatchlistTable({ quotes = [], recs = {}, onSymbolSelect, symbols, mode = 'watchlist' }: DynamicWatchlistTableProps) {
  const { getWatchlistSymbols, getCompanyRecord, getCompanyAlerts, removeFromWatchlist } = useInvestmentState();
  const defaultSymbols = getWatchlistSymbols();
  const activeSymbols = symbols || defaultSymbols;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('changePct');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Build the watchlist items from active symbols in state
  const watchlistItems = useMemo(() => {
    return activeSymbols.map(symbol => {
      const meta = getCompanyMeta(symbol);
      const q = quotes.find(quote => quote.symbol.toUpperCase() === symbol.toUpperCase());
      const rec = recs[symbol] || { recommendation: 'Hold', ai_investment_score: 75 };
      const alerts = getCompanyAlerts(symbol);

      const price = q?.current_price ?? meta.basePrice;
      const changePct = q?.change_pct ?? 0;
      const change = q?.change ?? 0;
      const volume = q?.volume ?? 0;
      const marketCap = q?.market_cap ?? 0;
      const low52w = q?.["52w_low"] ?? (price * 0.85);
      const high52w = q?.["52w_high"] ?? (price * 1.2);
      const lowDay = q?.low ?? (price * 0.98);
      const highDay = q?.high ?? (price * 1.02);

      let formattedVolume = '0';
      if (volume >= 1e7) {
        formattedVolume = `${(volume / 1e7).toFixed(2)} Cr`;
      } else if (volume >= 1e5) {
        formattedVolume = `${(volume / 1e5).toFixed(2)} L`;
      } else if (volume > 0) {
        formattedVolume = volume.toLocaleString('en-IN');
      }

      let formattedMarketCap = '0';
      if (marketCap >= 1e12) {
        formattedMarketCap = `${(marketCap / 1e12).toFixed(2)} L Cr`;
      } else if (marketCap >= 1e7) {
        formattedMarketCap = `${(marketCap / 1e7).toFixed(2)} Cr`;
      } else if (marketCap > 0) {
        formattedMarketCap = marketCap.toLocaleString('en-IN');
      }

      return {
        symbol,
        name: meta.name,
        price,
        change,
        changePct,
        volume: formattedVolume,
        marketCap: formattedMarketCap,
        low52w,
        high52w,
        lowDay,
        highDay,
        aiScore: rec.ai_investment_score ?? 75,
        recommendation: rec.recommendation ?? 'Hold',
        alertCount: alerts.length,
        isGainer: changePct >= 0
      };
    });
  }, [activeSymbols, quotes, recs, getCompanyAlerts]);

  // Sort and filter logic
  const filteredList = useMemo(() => {
    return watchlistItems
      .filter(item => {
        const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;
        
        if (filterType === 'gainers') return item.changePct > 0;
        if (filterType === 'losers') return item.changePct < 0;
        return true;
      })
      .sort((a: any, b: any) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'string') {
          return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortAsc ? aVal - bVal : bVal - aVal;
      });
  }, [watchlistItems, searchQuery, filterType, sortField, sortAsc]);

  if (activeSymbols.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#0d121f] border border-[#152036] rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
          {mode === 'interested' ? '💜' : '⭐'}
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-200">
            {mode === 'interested' ? 'Interested List is Empty' : 'Watchlist is Empty'}
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
            {mode === 'interested' 
              ? 'Mark companies as interested from the Dashboard or Stock Analysis page to track them here.'
              : 'Add companies to your watchlist from the Dashboard or Stock Analysis page to track them here.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table filters panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d121f] border border-[#152036] p-1.5 rounded-2xl">
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-[#080c14] border border-[#152036] rounded-xl px-2 py-1 text-xs text-slate-300 font-bold focus:outline-none"
          >
            <option value="all">All Stocks ({watchlistItems.length})</option>
            <option value="gainers">Gainers</option>
            <option value="losers">Losers</option>
          </select>
          
          <div className="flex items-center gap-1">
            <span className="text-[9.5px] text-slate-500 font-bold px-0.5">View:</span>
            <div className="flex items-center bg-[#080c14] border border-[#152036] p-0.5 rounded-lg">
              <button className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors">
                <LayoutGrid className="w-3 h-3" />
              </button>
              <button className="p-1 rounded bg-violet-600 text-white shadow shadow-violet-500/20">
                <Table className="w-3 h-3" />
              </button>
              <button className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors">
                <List className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <input
              type="text"
              placeholder="Search in watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#080c14] border border-[#152036] rounded-xl py-1 pl-8 pr-2.5 text-[10px] text-slate-200 focus:outline-none focus:border-violet-500 w-full transition-colors"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          <button className="text-[9px] font-bold text-slate-400 bg-[#080c14] border border-[#152036] px-2 py-1 rounded-xl hover:border-slate-700 flex items-center gap-1 transition-all">
            <SlidersHorizontal className="w-2.5 h-2.5 text-slate-500" />
            Columns
          </button>
          <button className="text-[9px] font-bold text-slate-400 bg-[#080c14] border border-[#152036] px-2 py-1 rounded-xl hover:border-slate-700 flex items-center gap-1 transition-all">
            <Filter className="w-2.5 h-2.5 text-slate-500" />
            Filters
          </button>
          
          <select 
            value={`Sort: ${sortField === 'changePct' ? '% Change' : sortField === 'aiScore' ? 'AI Score' : 'Company'}`}
            onChange={(e) => {
              const val = e.target.value;
              if (val.includes('Change')) handleSort('changePct');
              else if (val.includes('AI')) handleSort('aiScore');
              else handleSort('symbol');
            }}
            className="bg-[#080c14] border border-[#152036] rounded-xl px-1.5 py-1 text-[9px] text-slate-350 font-bold focus:outline-none"
          >
            <option>Sort: % Change</option>
            <option>Sort: AI Score</option>
            <option>Sort: Company</option>
          </select>
        </div>
      </div>

      {/* STOCKS TABLE */}
      <div className="card bg-[#0d121f] border border-[#152036] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-[#0d121f] uppercase tracking-wider text-[8px] select-none">
                <th className="py-2.5 px-3 w-7 text-center">#</th>
                <th className="py-2.5 px-2.5 cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>Company</th>
                <th className="py-2.5 px-2 cursor-pointer text-right hover:text-white" onClick={() => handleSort('price')}>Price (₹)</th>
                <th className="py-2.5 px-2 cursor-pointer text-right hover:text-white" onClick={() => handleSort('change')}>Change</th>
                <th className="py-2.5 px-2 cursor-pointer text-right hover:text-white" onClick={() => handleSort('changePct')}>Change %</th>
                <th className="py-2.5 px-2 text-right">Volume</th>
                <th className="py-2.5 px-2 text-right">Market Cap</th>
                <th className="py-2.5 px-2 text-center cursor-pointer hover:text-white" onClick={() => handleSort('aiScore')}>AI Score</th>
                <th className="py-2.5 px-2 text-center">AI Rec</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-32">Day Range</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredList.map((item, idx) => {
                const pricePosition = item.highDay - item.lowDay > 0 
                  ? ((item.price - item.lowDay) / (item.highDay - item.lowDay)) * 100 
                  : 50;
                const cappedPos = Math.max(0, Math.min(100, pricePosition));
                const trackColor = item.changePct >= 0 ? 'bg-emerald-500' : 'bg-rose-500';

                // Color code for recommendations
                let recColor = 'text-slate-400 border-slate-800 bg-slate-900/40';
                if (item.recommendation.includes('Buy')) recColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
                else if (item.recommendation.includes('Reduce') || item.recommendation.includes('Sell')) recColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
                else if (item.recommendation.includes('Hold')) recColor = 'text-amber-400 border-[#F59E0B]/20 bg-[#F59E0B]/5';

                return (
                  <tr key={item.symbol} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="py-2 px-2.5">
                      <div 
                        className="flex items-center gap-1.5 cursor-pointer"
                        onClick={() => onSymbolSelect?.(item.symbol)}
                      >
                        <CompanyLogo symbol={item.symbol} className="w-5 h-5" size="sm" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white hover:text-violet-400 transition-colors">{item.symbol}</span>
                          <span className="text-[8.5px] text-slate-400 font-medium max-w-[120px] truncate">{item.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-200 text-right">
                      {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2 px-2 font-bold text-right ${item.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                    </td>
                    <td className={`py-2 px-2 font-bold text-right ${item.changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                    </td>
                    <td className="py-2 px-2 text-slate-400 font-semibold text-right">{item.volume}</td>
                    <td className="py-2 px-2 text-slate-400 font-semibold text-right">{item.marketCap}</td>
                    <td className="py-2 px-2 text-center font-black">
                      <span style={{ color: getScoreColor(item.aiScore) }}>
                        {item.aiScore}/100
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-bold ${recColor}`}>
                        {item.recommendation}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex justify-center">
                        <CompanyStatusBadge symbol={item.symbol} showLabels={false} />
                      </div>
                    </td>
                    
                    {/* Day Range track slider */}
                    <td className="py-2 px-3 text-center select-none w-32">
                      <div className="flex items-center justify-between text-[7px] text-slate-500 mb-0.5 font-bold">
                        <span>₹{item.lowDay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span>₹{item.highDay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full h-1 bg-[#1a2333] rounded-full relative overflow-visible">
                        <div 
                          className={`absolute left-0 top-0 h-full rounded-l-full ${trackColor}`}
                          style={{ width: `${cappedPos}%` }}
                        />
                        <div 
                          className="w-[2px] h-2 bg-slate-100 absolute -top-[2px] shadow shadow-black/60 rounded-sm"
                          style={{ left: `${cappedPos}%`, marginLeft: '-1px' }}
                        />
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end">
                        <CompanyActionMenu symbol={item.symbol} align="right" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
