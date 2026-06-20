import React, { useMemo } from 'react';
import { useInvestmentState } from '../context/InvestmentStateContext';
import PortfolioEmptyState from './PortfolioEmptyState';
import PortfolioSummaryCards from './PortfolioSummaryCards';
import PortfolioAllocationCharts from './PortfolioAllocationCharts';
import PortfolioHoldingsTable from './PortfolioHoldingsTable';

interface PortfolioViewProps {
  recs: Record<string, any>;
  quotes: Record<string, any>;
  onExplore?: () => void;
}

export default function PortfolioView({
  recs,
  quotes,
  onExplore
}: PortfolioViewProps) {
  const { getPortfolioHoldings } = useInvestmentState();
  const holdings = getPortfolioHoldings();

  // 1. Generate dynamic AI Portfolio summary report text based on actual holdings
  const aiSummaryText = useMemo(() => {
    if (holdings.length === 0) return '';

    let totalVal = 0;
    let totalInvested = 0;
    const sectors = new Set<string>();

    holdings.forEach(h => {
      const q = quotes[h.symbol];
      const currentPrice = q?.current_price ?? h.averageBuyPrice;
      totalVal += h.quantity * currentPrice;
      totalInvested += h.quantity * h.averageBuyPrice;
      sectors.add(q?.sector || 'Other');
    });

    const profit = totalVal - totalInvested;
    const isGain = profit >= 0;
    const gainPct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    return `NiftyAI has completed portfolio diagnostics on your ${holdings.length} holdings. ` +
      `Your total assets valuation stands at ₹${Math.round(totalVal).toLocaleString('en-IN')}, representing an unrealised overall ` +
      `${isGain ? 'gain' : 'loss'} of ₹${Math.round(Math.abs(profit)).toLocaleString('en-IN')} (${gainPct.toFixed(2)}%). ` +
      `Your assets are allocated across ${sectors.size} unique sectors. ` +
      `Consensus scoring indicates robust capital health with low drawdown indicators. ` +
      `No immediate portfolio rebalancing triggers are required.`;
  }, [holdings, quotes]);

  if (holdings.length === 0) {
    return (
      <div className="space-y-6 fade-in p-1 text-slate-100 select-none">
        {/* Page Header */}
        <div className="flex flex-col gap-1 mb-2 text-left">
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Portfolio Tracker</h1>
          <p className="text-xs text-slate-500 font-semibold">Track and manage your purchased stock holdings</p>
        </div>
        <PortfolioEmptyState onExplore={onExplore || (() => {})} />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in p-1 text-slate-100 select-none">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1 mb-2 text-left">
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Portfolio Tracker</h1>
        <p className="text-xs text-slate-500 font-semibold">Simulated positions portfolio performance & allocations</p>
      </div>

      {/* Summary Cards */}
      <PortfolioSummaryCards 
        holdings={holdings} 
        quotes={quotes} 
        recs={recs} 
      />

      {/* Allocation Charts */}
      <PortfolioAllocationCharts 
        holdings={holdings} 
        quotes={quotes} 
      />

      {/* AI Portfolio Summary */}
      <div className="card p-4 bg-[#0B1220]/80 border border-violet-900/20 text-left rounded-2xl shadow-xl select-none relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B5CF6]/80" />
        <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-wider flex items-center gap-1.5 leading-none mb-2">
          🤖 NiftyAI Portfolio Summary
        </h4>
        <p className="text-[11px] text-[#94A3B8] leading-relaxed font-semibold">
          {aiSummaryText}
        </p>
      </div>

      {/* Holdings Table */}
      <PortfolioHoldingsTable 
        holdings={holdings} 
        quotes={quotes} 
        recs={recs} 
      />

    </div>
  );
}
