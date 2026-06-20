import React, { useState, useMemo } from 'react';
import { CompanyMeta, QuoteData, PortfolioHolding, RecommendationData } from '../types/stock';
import { CompanyLogo } from './common/CompanyLogo';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { getRecBadgeClass } from '../utils/api';

interface HoldingsTableProps {
  quotes: QuoteData[];
  portfolio: PortfolioHolding[];
  recs?: Record<string, RecommendationData>;
  onNavigateToStockAnalysis: (symbol: string) => void;
}

type SortField = 'symbol' | 'invested' | 'current' | 'pnl' | 'returnPct' | 'dayChange';

export default function HoldingsTable({
  quotes = [],
  portfolio = [],
  recs = {},
  onNavigateToStockAnalysis
}: HoldingsTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('current');
  const [sortAsc, setSortAsc] = useState(false);

  // Compute calculated portfolio rows dynamically
  const computedRows = useMemo(() => {
    const totalCurrentValueSum = portfolio.reduce((sum, holding) => {
      const q = quotes.find(item => item.symbol.toUpperCase() === holding.symbol.toUpperCase());
      const currentPrice = q?.current_price ?? holding.averageBuyPrice;
      return sum + (holding.quantity * currentPrice);
    }, 0) || 1;

    return portfolio.map(holding => {
      const q = quotes.find(item => item.symbol.toUpperCase() === holding.symbol.toUpperCase());
      const currentPrice = q?.current_price ?? holding.averageBuyPrice;
      const dayChange = q?.change_pct ?? 0.0;
      
      const investedValue = holding.quantity * holding.averageBuyPrice;
      const currentValue = holding.quantity * currentPrice;
      const unrealisedPnL = currentValue - investedValue;
      const returnPct = parseFloat(((unrealisedPnL / investedValue) * 100).toFixed(2));
      const allocationPct = parseFloat(((currentValue / totalCurrentValueSum) * 100).toFixed(1));
      
      const rec = recs[holding.symbol]?.recommendation || 'Hold';
      
      // Determine status dynamically
      let status: 'Purchased' | 'Watching' | 'Review Needed' = 'Purchased';
      if (rec.includes('Sell') || rec.includes('Reduce')) {
        status = 'Review Needed';
      }

      return {
        ...holding,
        currentPrice,
        investedValue,
        currentValue,
        unrealisedPnL,
        returnPct,
        allocationPct,
        dayChange,
        recommendation: rec,
        status
      };
    });
  }, [portfolio, quotes, recs]);

  // Search filter
  const filteredRows = useMemo(() => {
    return computedRows.filter(row => 
      row.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [computedRows, search]);

  // Sorting
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      let aVal: any = a.symbol;
      let bVal: any = b.symbol;

      if (sortField === 'invested') {
        aVal = a.investedValue;
        bVal = b.investedValue;
      } else if (sortField === 'current') {
        aVal = a.currentValue;
        bVal = b.currentValue;
      } else if (sortField === 'pnl') {
        aVal = a.unrealisedPnL;
        bVal = b.unrealisedPnL;
      } else if (sortField === 'returnPct') {
        aVal = a.returnPct;
        bVal = b.returnPct;
      } else if (sortField === 'dayChange') {
        aVal = a.dayChange;
        bVal = b.dayChange;
      }

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredRows, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp className="w-3 h-3 inline-block ml-0.5" /> : <ChevronDown className="w-3 h-3 inline-block ml-0.5" />;
  };

  return (
    <div className="space-y-3.5 select-none text-[#F8FAFC]">
      
      {/* Search Input bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-550" />
          <input
            className="h-8 w-full rounded-xl border border-[#1b2d49]/80 bg-[#070e1b]/70 pl-9 pr-4 text-[9.5px] text-slate-205 outline-none placeholder:text-slate-600 focus:border-violet-500 font-bold"
            placeholder="Search holdings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-[7.5px] text-[#64748B] font-extrabold uppercase select-none">
          Showing {sortedRows.length} Constituents
        </span>
      </div>

      {/* Holdings Grid table */}
      <div className="overflow-x-auto w-full border border-[#1E293B] rounded-xl bg-[#090d16]/30">
        <table className="w-full text-left text-[9.5px] font-bold border-collapse min-w-[750px]">
          <thead>
            <tr className="text-[7.5px] text-[#64748B] border-b border-[#1E293B] uppercase h-9 bg-[#0B1220]/50 select-none">
              <th className="pl-3.5 cursor-pointer hover:text-slate-350 transition-colors" onClick={() => handleSort('symbol')}>
                Company <SortIcon field="symbol" />
              </th>
              <th className="text-right">Qty</th>
              <th className="text-right">Avg Price</th>
              <th className="text-right">LTP</th>
              <th className="text-right cursor-pointer hover:text-slate-350 transition-colors" onClick={() => handleSort('invested')}>
                Invested <SortIcon field="invested" />
              </th>
              <th className="text-right cursor-pointer hover:text-slate-350 transition-colors" onClick={() => handleSort('current')}>
                Current Value <SortIcon field="current" />
              </th>
              <th className="text-right cursor-pointer hover:text-slate-350 transition-colors" onClick={() => handleSort('dayChange')}>
                Day Change <SortIcon field="dayChange" />
              </th>
              <th className="text-right cursor-pointer hover:text-slate-350 transition-colors" onClick={() => handleSort('pnl')}>
                Unrealised P&L <SortIcon field="pnl" />
              </th>
              <th className="text-center cursor-pointer hover:text-slate-350 transition-colors" onClick={() => handleSort('returnPct')}>
                Return % <SortIcon field="returnPct" />
              </th>
              <th className="text-center">Allocation</th>
              <th className="text-center">AI recommendation</th>
              <th className="text-right pr-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/50 select-none">
            {sortedRows.map((row) => {
              const pnlColorClass = row.unrealisedPnL >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]';
              const dayChangeColorClass = row.dayChange >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]';

              return (
                <tr 
                  key={row.symbol}
                  onClick={() => onNavigateToStockAnalysis(row.symbol)}
                  className="hover:bg-white/[0.015] cursor-pointer transition-colors h-9.5 leading-none"
                >
                  {/* Company Logo + Symbol */}
                  <td className="py-2.5 pl-3.5 flex items-center gap-1.5">
                    <CompanyLogo symbol={row.symbol} size="sm" />
                    <span className="text-[#F8FAFC] font-extrabold">{row.symbol}</span>
                  </td>
                  
                  <td className="py-2.5 text-right text-slate-300">{row.quantity}</td>
                  <td className="py-2.5 text-right text-slate-400">₹{row.averageBuyPrice.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-slate-100">₹{row.currentPrice.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-slate-300">₹{row.investedValue.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                  <td className="py-2.5 text-right text-slate-100 font-extrabold">₹{row.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                  
                  {/* Day Change */}
                  <td className={`py-2.5 text-right font-black ${dayChangeColorClass}`}>
                    {row.dayChange >= 0 ? '+' : ''}{row.dayChange.toFixed(2)}%
                  </td>

                  {/* P&L absolute */}
                  <td className={`py-2.5 text-right font-black ${pnlColorClass}`}>
                    {row.unrealisedPnL >= 0 ? '+' : ''}₹{row.unrealisedPnL.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </td>

                  {/* Return percent */}
                  <td className={`py-2.5 text-center font-black ${pnlColorClass}`}>
                    {row.unrealisedPnL >= 0 ? '+' : ''}{row.returnPct}%
                  </td>

                  <td className="py-2.5 text-center text-violet-400 font-black">{row.allocationPct}%</td>
                  
                  {/* AI rating */}
                  <td className="py-2.5 text-center">
                    <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase ${getRecBadgeClass(row.recommendation)}`}>
                      {row.recommendation}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-2.5 text-right pr-3.5">
                    <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                      row.status === 'Purchased' ? 'bg-[#06B6D4]/10 text-[#06B6D4]' :
                      'bg-[#EF4444]/10 text-[#EF4444]'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
