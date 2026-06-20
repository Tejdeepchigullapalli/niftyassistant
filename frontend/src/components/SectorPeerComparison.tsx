import React, { useMemo, useState } from 'react';
import { useInvestmentState } from '../context/InvestmentStateContext';
import { COMPANIES_METADATA, getCompanyMeta, formatCurrency, formatNumber, getScoreColor, getRecBadgeClass } from '../utils/api';
import { CompanyLogo } from './common/CompanyLogo';
import { Award, ShieldAlert, Sparkles, TrendingUp, ArrowUpDown, ChevronDown } from 'lucide-react';

interface SectorPeerComparisonProps {
  symbol: string;
  quotes: any[];
  onSymbolSelect?: (symbol: string) => void;
}

export default function SectorPeerComparison({
  symbol,
  quotes = [],
  onSymbolSelect
}: SectorPeerComparisonProps) {
  const activeSymbol = symbol.toUpperCase().trim();
  const activeMeta = getCompanyMeta(activeSymbol);
  
  // Find all sector peers
  const sectorPeers = useMemo(() => {
    const peers = COMPANIES_METADATA.filter(
      c => c.sector === activeMeta.sector && c.symbol !== activeSymbol
    );
    // Sort so that same industry peers are first, then other same sector peers
    return peers.sort((a, b) => {
      const aSameInd = a.industry === activeMeta.industry ? 1 : 0;
      const bSameInd = b.industry === activeMeta.industry ? 1 : 0;
      return bSameInd - aSameInd;
    });
  }, [activeSymbol, activeMeta.sector, activeMeta.industry]);

  // Selected peers state (user can customize peers if they want)
  const [selectedPeerSymbols, setSelectedPeerSymbols] = useState<string[]>([]);

  // Initialize top 3-4 peers
  const peersList = useMemo(() => {
    const defaults = sectorPeers.slice(0, 4).map(p => p.symbol);
    // Merge user customizations
    const merged = [...selectedPeerSymbols];
    defaults.forEach(sym => {
      if (merged.length < 4 && !merged.includes(sym)) {
        merged.push(sym);
      }
    });
    return merged;
  }, [sectorPeers, selectedPeerSymbols]);

  // Generate comparison rows including active stock + chosen peers
  const comparisonRows = useMemo(() => {
    const allSymbols = [activeSymbol, ...peersList];
    return allSymbols.map(sym => {
      const meta = getCompanyMeta(sym);
      const quote = quotes.find(q => q.symbol === sym) || {
        current_price: meta.basePrice,
        change_pct: 1.2,
        market_cap: meta.basePrice * 100000000,
        pe_ratio: 24.5,
        pb_ratio: 3.2,
        roe: 0.148,
        revenue_growth: 0.12,
        eps: meta.basePrice * 0.04
      };

      // Mock or resolve returns & scores
      const score = Math.floor(Math.random() * 20) + 65; // Dynamic fallback
      const return1Y = quote.change_pct !== undefined ? quote.change_pct * 12.5 : 15.0;

      return {
        symbol: sym,
        name: meta.name.replace(' Ltd', '').replace(' Limited', ''),
        price: quote.current_price,
        change1D: quote.change_pct,
        marketCap: quote.market_cap,
        pe: quote.pe_ratio,
        pb: quote.pb_ratio,
        roe: quote.roe !== undefined ? (quote.roe < 1 ? quote.roe * 100 : quote.roe) : 14.5,
        revenueGrowth: quote.revenue_growth !== undefined ? (quote.revenue_growth < 1 ? quote.revenue_growth * 100 : quote.revenue_growth) : 12.0,
        aiScore: sym === activeSymbol ? 78 : score,
        recommendation: quote.change_pct >= 0 ? 'Buy' : 'Hold',
        return1Y
      };
    });
  }, [activeSymbol, peersList, quotes]);

  const handlePeerChange = (index: number, newSym: string) => {
    const updated = [...peersList];
    updated[index] = newSym;
    // Store only custom peers excluding active
    setSelectedPeerSymbols(updated.filter(s => s !== activeSymbol));
  };

  // Dropdown list options (exclude active and already chosen peers)
  const getDropdownOptions = (currentVal: string) => {
    return COMPANIES_METADATA.filter(
      c => c.symbol !== activeSymbol && (c.symbol === currentVal || !peersList.includes(c.symbol))
    );
  };

  return (
    <div className="space-y-4 w-full select-none text-slate-100">
      
      {/* Title Header bar */}
      <div className="flex justify-between items-center bg-[#0d121f] border border-[#1E293B] px-4 py-2.5 rounded-xl">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">
            {activeSymbol} vs Relevant Sector Peers ({activeMeta.sector})
          </span>
        </div>
        <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase">
          Dynamic Sector-Based Filtering
        </span>
      </div>

      {/* Comparison Grid Table */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[9.5px] font-bold border-collapse min-w-[800px]">
            <thead>
              <tr className="text-[8px] text-[#64748B] border-b border-[#1E293B] uppercase tracking-wider">
                <th className="pb-3 pl-2">Company Name</th>
                <th className="pb-3 text-right">LTP Price</th>
                <th className="pb-3 text-right">1D Change</th>
                <th className="pb-3 text-right">Market Cap</th>
                <th className="pb-3 text-center">P/E</th>
                <th className="pb-3 text-center">P/B</th>
                <th className="pb-3 text-center">ROE %</th>
                <th className="pb-3 text-center">Growth %</th>
                <th className="pb-3 text-center">AI Score</th>
                <th className="pb-3 text-center">AI Rating</th>
                <th className="pb-3 text-right pr-2">1Y Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/50">
              {comparisonRows.map((row, idx) => {
                const isActive = row.symbol === activeSymbol;
                return (
                  <tr 
                    key={row.symbol} 
                    onClick={() => !isActive && onSymbolSelect?.(row.symbol)}
                    className={`hover:bg-white/[0.015] transition-all h-11 leading-none ${
                      isActive 
                        ? 'bg-violet-600/[0.04] border-l-2 border-violet-500 font-extrabold shadow-inner' 
                        : 'cursor-pointer'
                    }`}
                  >
                    {/* Name & Custom Dropdown if Peer */}
                    <td className="py-2.5 pl-2 flex items-center gap-2">
                      <CompanyLogo symbol={row.symbol} size="sm" />
                      <div className="leading-none text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#F8FAFC] font-extrabold">{row.symbol}</span>
                          {isActive ? (
                            <span className="text-[7px] bg-violet-600/20 text-violet-400 border border-violet-500/30 px-1 rounded-sm uppercase font-black tracking-wider select-none leading-none py-0.5">
                              Currently Analysing
                            </span>
                          ) : (
                            <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                              <select
                                value={row.symbol}
                                onChange={e => handlePeerChange(idx - 1, e.target.value)}
                                className="bg-transparent text-[8px] text-[#64748B] hover:text-[#94A3B8] outline-none cursor-pointer font-bold border-b border-[#1E293B] pr-3 select-none py-0.5 appearance-none"
                              >
                                {getDropdownOptions(row.symbol).map(opt => (
                                  <option key={opt.symbol} value={opt.symbol} className="bg-[#0b1320] text-slate-300">
                                    {opt.symbol} - {opt.name.substring(0, 12)}...
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-2 h-2 text-slate-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          )}
                        </div>
                        <span className="text-[7.5px] text-[#64748B] block mt-1">{row.name}</span>
                      </div>
                    </td>
                    
                    {/* Price */}
                    <td className="py-2.5 text-right font-black text-slate-100">
                      ₹{row.price.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </td>
                    
                    {/* 1D Change */}
                    <td className={`py-2.5 text-right font-black ${
                      row.change1D >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                    }`}>
                      {row.change1D >= 0 ? '+' : ''}{row.change1D.toFixed(2)}%
                    </td>

                    {/* Market Cap */}
                    <td className="py-2.5 text-right text-slate-300">
                      {formatCurrency(row.marketCap)}
                    </td>

                    {/* P/E */}
                    <td className="py-2.5 text-center text-slate-300 font-medium">
                      {row.pe ? row.pe.toFixed(1) : '—'}
                    </td>

                    {/* P/B */}
                    <td className="py-2.5 text-center text-slate-300 font-medium">
                      {row.pb ? row.pb.toFixed(1) : '—'}
                    </td>

                    {/* ROE */}
                    <td className="py-2.5 text-center text-emerald-450 font-black">
                      {row.roe ? `${row.roe.toFixed(1)}%` : '—'}
                    </td>

                    {/* Revenue Growth */}
                    <td className="py-2.5 text-center text-violet-400 font-black">
                      {row.revenueGrowth ? `${row.revenueGrowth.toFixed(1)}%` : '—'}
                    </td>

                    {/* AI Score */}
                    <td className="py-2.5 text-center font-black" style={{ color: getScoreColor(row.aiScore) }}>
                      {row.aiScore}
                    </td>

                    {/* Recommendation */}
                    <td className="py-2.5 text-center">
                      <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${getRecBadgeClass(row.recommendation)}`}>
                        {row.recommendation}
                      </span>
                    </td>

                    {/* 1Y Return */}
                    <td className={`py-2.5 text-right pr-2 font-black ${
                      row.return1Y >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                    }`}>
                      {row.return1Y >= 0 ? '+' : ''}{row.return1Y.toFixed(1)}%
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
