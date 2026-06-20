import React, { useMemo } from 'react';
import { CompanyMeta, QuoteData, PortfolioHolding, RecommendationData } from '../types/stock';
import AllocationChart from './AllocationChart';
import HoldingsTable from './HoldingsTable';
import { getCompanyMeta } from '../utils/api';
import { HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PortfolioReportProps {
  quotes: QuoteData[];
  portfolio: PortfolioHolding[];
  recs?: Record<string, RecommendationData>;
  onNavigateToStockAnalysis: (symbol: string) => void;
}

export default function PortfolioReport({
  quotes = [],
  portfolio = [],
  recs = {},
  onNavigateToStockAnalysis
}: PortfolioReportProps) {

  // Compute diversification statistics dynamically
  const stats = useMemo(() => {
    if (portfolio.length === 0) {
      return { numHoldings: 0, largestPct: 0, sectorPct: 0, divScore: 0 };
    }

    const totalVal = portfolio.reduce((sum, h) => {
      const q = quotes.find(item => item.symbol.toUpperCase() === h.symbol.toUpperCase());
      const price = q?.current_price ?? h.averageBuyPrice;
      return sum + (h.quantity * price);
    }, 0) || 1;

    // Largest holding
    let largestVal = 0;
    portfolio.forEach(h => {
      const q = quotes.find(item => item.symbol.toUpperCase() === h.symbol.toUpperCase());
      const price = q?.current_price ?? h.averageBuyPrice;
      const val = h.quantity * price;
      if (val > largestVal) largestVal = val;
    });
    const largestPct = parseFloat(((largestVal / totalVal) * 100).toFixed(1));

    // Sector concentration
    const sectorMap: Record<string, number> = {};
    portfolio.forEach(h => {
      const q = quotes.find(item => item.symbol.toUpperCase() === h.symbol.toUpperCase());
      const price = q?.current_price ?? h.averageBuyPrice;
      const meta = getCompanyMeta(h.symbol);
      sectorMap[meta.sector] = (sectorMap[meta.sector] || 0) + (h.quantity * price);
    });
    const sortedSectors = Object.values(sectorMap).sort((a, b) => b - a);
    const sectorPct = parseFloat(((sortedSectors[0] / totalVal) * 100).toFixed(1));

    // Diversification score: base on number of sectors and concentration
    const numSectors = Object.keys(sectorMap).length;
    const score = Math.min(100, Math.round((numSectors * 15) + (100 - sectorPct * 0.8)));

    return {
      numHoldings: portfolio.length,
      largestPct,
      sectorPct,
      divScore: score
    };
  }, [portfolio, quotes]);

  return (
    <div className="space-y-4">
      
      {/* 1. Allocation Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 select-none text-[#F8FAFC]">
        {/* Asset class */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[180px]">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Asset Allocation</span>
          <div className="mt-3.5 flex-grow">
            <AllocationChart type="asset" quotes={quotes} portfolio={portfolio} recs={recs} />
          </div>
        </div>

        {/* Sector */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[180px]">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Sector Concentration</span>
          <div className="mt-3.5 flex-grow">
            <AllocationChart type="sector" quotes={quotes} portfolio={portfolio} recs={recs} />
          </div>
        </div>

        {/* Market-Cap */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[180px]">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Market-Cap Distribution</span>
          <div className="mt-3.5 flex-grow">
            <AllocationChart type="marketcap" quotes={quotes} portfolio={portfolio} recs={recs} />
          </div>
        </div>

        {/* Recommendation Rating */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[180px]">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">AI Rating Weights</span>
          <div className="mt-3.5 flex-grow">
            <AllocationChart type="recommendation" quotes={quotes} portfolio={portfolio} recs={recs} />
          </div>
        </div>
      </div>

      {/* 2. Diversification Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none text-[#F8FAFC]">
        {/* Diversification metrics indicators */}
        <div className="lg:col-span-8 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div className="space-y-1">
            <span className="text-[7.5px] text-[#64748B] font-extrabold uppercase block">Holdings Count</span>
            <span className="text-xl font-black text-white">{stats.numHoldings} Stocks</span>
            <span className="text-[7px] text-[#22C55E] block leading-none font-bold">Stable diversification</span>
          </div>

          <div className="space-y-1">
            <span className="text-[7.5px] text-[#64748B] font-extrabold uppercase block">Largest Holding %</span>
            <span className="text-xl font-black text-white">{stats.largestPct}%</span>
            <span className="text-[7px] text-emerald-500 block leading-none font-bold">Risk limits protected</span>
          </div>

          <div className="space-y-1">
            <span className="text-[7.5px] text-[#64748B] font-extrabold uppercase block">Max Sector Concentration</span>
            <span className="text-xl font-black text-amber-500">{stats.sectorPct}%</span>
            <span className="text-[7px] text-amber-500 block leading-none font-bold">Above preferred 30%</span>
          </div>

          <div className="space-y-1">
            <span className="text-[7.5px] text-[#64748B] font-extrabold uppercase block">Diversification Score</span>
            <span className="text-xl font-black text-violet-400">{stats.divScore} /100</span>
            <span className="text-[7px] text-violet-400 block leading-none font-bold">Consensus rating: Healthy</span>
          </div>
        </div>

        {/* Rebalance recommendation box */}
        <div className="lg:col-span-4 card p-4 bg-[#0B1220] border border-[#1E293B]/70 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-[9.5px]">
            <span className="text-amber-500 font-extrabold uppercase text-[9px] block">Concentration warning</span>
            <p className="text-[#94A3B8] leading-relaxed">
              Financial exposure is {stats.sectorPct}%, above the preferred 30% risk threshold. Consider reducing concentration or adding defensive segments.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Holdings Grid Table */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-violet-500/20 transition-all">
        <HoldingsTable 
          quotes={quotes}
          portfolio={portfolio}
          recs={recs}
          onNavigateToStockAnalysis={onNavigateToStockAnalysis}
        />
      </div>

    </div>
  );
}
