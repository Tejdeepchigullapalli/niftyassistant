import React, { useMemo } from 'react';
import { CompanyMeta, QuoteData } from '../types/stock';
import { getSectorPeers } from '../utils/analysisUtils';
import { CompanyLogo } from './common/CompanyLogo';
import { formatCurrency } from '../utils/api';
import { Users, ChevronRight, TrendingUp } from 'lucide-react';

interface PeerBenchmarkTableProps {
  symbol: string;
  meta: CompanyMeta;
  quotes: QuoteData[];
  onSymbolSelect: (symbol: string) => void;
  onOpenPeers?: () => void;
}

export default function PeerBenchmarkTable({
  symbol,
  meta,
  quotes = [],
  onSymbolSelect,
  onOpenPeers
}: PeerBenchmarkTableProps) {
  // A. Dynamic sector peers list calculation
  const peers = useMemo(() => {
    return getSectorPeers(symbol, meta.sector, quotes);
  }, [symbol, meta.sector, quotes]);

  // B. Highlight metrics benchmarks calculation
  const stats = useMemo(() => {
    if (peers.length === 0) {
      return { highestScore: '—', bestRoe: '—', lowestPe: '—', strongestMomentum: '—' };
    }
    const sortedScore = [...peers].sort((a, b) => b.aiScore - a.aiScore);
    const sortedRoe = [...peers].sort((a, b) => b.roe - a.roe);
    const sortedPe = [...peers].filter(p => p.pe > 0).sort((a, b) => a.pe - b.pe);
    const sortedMomentum = [...peers].sort((a, b) => b.return1Y - a.return1Y);

    return {
      highestScore: sortedScore[0]?.symbol || '—',
      bestRoe: sortedRoe[0]?.symbol || '—',
      lowestPe: sortedPe[0]?.symbol || '—',
      strongestMomentum: sortedMomentum[0]?.symbol || '—'
    };
  }, [peers]);

  return (
    <div className="space-y-4">
      {/* Competitors Benchmarking Table */}
      <div className="overflow-x-auto w-full select-none">
        <table className="w-full text-left text-[9px] font-bold border-collapse min-w-[500px]">
          <thead>
            <tr className="text-[7.5px] text-[#64748B] border-b border-[#1E293B] uppercase">
              <th className="pb-1.5 pl-2">Company</th>
              <th className="pb-1.5 text-right">Price</th>
              <th className="pb-1.5 text-right">1D Change</th>
              <th className="pb-1.5 text-right">Market Cap</th>
              <th className="pb-1.5 text-center">P/E</th>
              <th className="pb-1.5 text-center">ROE %</th>
              <th className="pb-1.5 text-center">AI Score</th>
              <th className="pb-1.5 text-right pr-2">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/50 select-none">
            {peers.map((peer) => {
              const isActive = peer.symbol.toUpperCase() === symbol.toUpperCase();
              
              // Resolve 1D Change and price from quote
              const matchingQuote = quotes.find(q => q.symbol.toUpperCase() === peer.symbol.toUpperCase());
              const displayChange = matchingQuote?.change_pct ?? (isActive && matchingQuote?.change_pct !== undefined ? matchingQuote.change_pct : 0.0);
              const changeColorClass = displayChange >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]';

              return (
                <tr 
                  key={peer.symbol}
                  onClick={() => onSymbolSelect(peer.symbol)}
                  className={`hover:bg-white/[0.015] cursor-pointer transition-colors h-8 leading-none relative group ${
                    isActive ? 'bg-[#8B5CF6]/[0.03] border-l-2 border-[#8B5CF6]' : ''
                  }`}
                >
                  <td className="py-2 pl-2 flex items-center gap-1.5">
                    <CompanyLogo symbol={peer.symbol} size="sm" />
                    <div className="leading-none">
                      <div className="flex items-center gap-1">
                        <span className="text-[#F8FAFC] font-extrabold">{peer.symbol}</span>
                        {isActive && (
                          <span className="text-[6.5px] px-1 py-0.2 bg-[#8B5CF6]/20 text-[#c084fc] rounded border border-[#8B5CF6]/30 font-black uppercase scale-90">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-[7px] text-[#64748B] block mt-0.5 max-w-[80px] truncate">{peer.name}</span>
                    </div>
                  </td>
                  <td className="py-2 text-right">₹{peer.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-2 text-right font-black ${changeColorClass}`}>
                    {displayChange >= 0 ? '+' : ''}{displayChange.toFixed(2)}%
                  </td>
                  <td className="py-2 text-right text-[#94A3B8]">{formatCurrency(peer.marketCap)}</td>
                  <td className="py-2 text-center text-[#94A3B8]">{peer.pe > 0 ? peer.pe.toFixed(1) : '—'}</td>
                  <td className="py-2 text-center text-[#22C55E]">{peer.roe}%</td>
                  <td className="py-2 text-center font-black" style={{ color: isActive ? meta.color : '#F8FAFC' }}>
                    {peer.aiScore}
                  </td>
                  <td className="py-2 text-right pr-2">
                    <div className="flex items-center justify-end gap-1">
                      <span className={`text-[6.5px] px-1 py-0.2 rounded font-black uppercase ${
                        peer.recommendation.includes('Buy') ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                      }`}>
                        {peer.recommendation}
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Comparison summaries grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-[#0B1220] border border-[#1E293B]/60 p-2.5 rounded-xl">
        <div className="p-2 border border-[#1E293B]/40 rounded-lg flex items-center justify-between text-[8px] font-bold">
          <div>
            <span className="text-[#64748B] uppercase block">Top AI Score</span>
            <span className="text-white font-extrabold text-[9.5px] block mt-0.5">{stats.highestScore}</span>
          </div>
          <span>🏆</span>
        </div>

        <div className="p-2 border border-[#1E293B]/40 rounded-lg flex items-center justify-between text-[8px] font-bold">
          <div>
            <span className="text-[#64748B] uppercase block">Best ROE %</span>
            <span className="text-white font-extrabold text-[9.5px] block mt-0.5">{stats.bestRoe}</span>
          </div>
          <span>📊</span>
        </div>

        <div className="p-2 border border-[#1E293B]/40 rounded-lg flex items-center justify-between text-[8px] font-bold">
          <div>
            <span className="text-[#64748B] uppercase block">Lowest P/E</span>
            <span className="text-white font-extrabold text-[9.5px] block mt-0.5">{stats.lowestPe}</span>
          </div>
          <span>💎</span>
        </div>

        <div className="p-2 border border-[#1E293B]/40 rounded-lg flex items-center justify-between text-[8px] font-bold">
          <div>
            <span className="text-[#64748B] uppercase block">1Y Momentum</span>
            <span className="text-white font-extrabold text-[9.5px] block mt-0.5">{stats.strongestMomentum}</span>
          </div>
          <span>🚀</span>
        </div>
      </div>

      {onOpenPeers && (
        <button
          onClick={onOpenPeers}
          className="w-full py-2 bg-[#0B1220] border border-[#1E293B] rounded-xl hover:border-violet-500/30 text-[9px] font-black uppercase text-violet-400 hover:text-[#F8FAFC] transition-all flex items-center justify-center gap-1 select-none"
        >
          <span>Open Full Peer Comparison</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
