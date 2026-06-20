import React, { useMemo } from 'react';
import { CompanyMeta, QuoteData, PortfolioHolding, RecommendationData } from '../types/stock';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';
import AllocationChart from './AllocationChart';
import { CompanyLogo } from './common/CompanyLogo';
import { Sparkles, ShieldCheck, ChevronRight, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import { getCompanyMeta } from '../utils/api';

interface OverviewReportProps {
  quotes: QuoteData[];
  recs: Record<string, RecommendationData>;
  portfolio: PortfolioHolding[];
  watchlist: string[];
  onNavigateToStockAnalysis: (symbol: string) => void;
  onTabChange: (tab: string) => void;
}

export default function OverviewReport({
  quotes = [],
  recs = {},
  portfolio = [],
  watchlist = [],
  onNavigateToStockAnalysis,
  onTabChange
}: OverviewReportProps) {

  // Aggregate contributor statistics
  const contributors = useMemo(() => {
    const list = portfolio.map(holding => {
      const q = quotes.find(item => item.symbol.toUpperCase() === holding.symbol.toUpperCase());
      const currentPrice = q?.current_price ?? holding.averageBuyPrice;
      const changePct = q?.change_pct ?? 0.0;
      const value = holding.quantity * currentPrice;
      const profit = value - (holding.quantity * holding.averageBuyPrice);

      return {
        symbol: holding.symbol,
        changePct,
        profit,
        value
      };
    });

    const sortedByProfit = [...list].sort((a, b) => b.profit - a.profit);
    return {
      topGainers: sortedByProfit.slice(0, 3),
      topLosers: [...sortedByProfit].reverse().slice(0, 3)
    };
  }, [portfolio, quotes]);

  return (
    <div className="space-y-4">
      
      {/* Row 1: Chart & AI Report Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none text-[#F8FAFC]">
        
        {/* Performance Chart (65% width) */}
        <div className="lg:col-span-8 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[320px]">
          <PortfolioPerformanceChart brandColor="#8B5CF6" />
        </div>

        {/* AI Report Summary (35% width) */}
        <div className="lg:col-span-4 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[320px]">
          <div>
            <div className="flex items-center gap-1.5 text-violet-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider block">AI Portfolio Intelligence</span>
            </div>
            
            <div className="mt-4 space-y-3 text-[9.5px]">
              <div className="flex justify-between border-b border-[#1E293B]/40 pb-1.5 font-bold">
                <span className="text-[#64748B]">Diversification Health</span>
                <span className="text-emerald-400 font-extrabold uppercase">Excellent</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B]/40 pb-1.5 font-bold">
                <span className="text-[#64748B]">Risk Score Profile</span>
                <span className="text-amber-500 font-extrabold uppercase">Moderate (38/100)</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B]/40 pb-1.5 font-bold">
                <span className="text-[#64748B]">Growth Potential</span>
                <span className="text-violet-400 font-extrabold uppercase">High (84/100)</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B]/40 pb-1.5 font-bold">
                <span className="text-[#64748B]">Market Outlook Consensus</span>
                <span className="text-[#22C55E] font-extrabold uppercase">Bullish</span>
              </div>
            </div>

            <div className="bg-[#0B1220] border border-[#1E293B]/60 p-3 rounded-xl mt-4 text-[9px] leading-relaxed text-[#94A3B8] font-semibold">
              <span className="text-violet-400 font-black uppercase block mb-1">AI Rebalance Action Trigger</span>
              Your portfolio is currently overweight in Financials and IT. Diversification is healthy, but exposure to these two sectors remains above 55%. Consider adding consumer/defensive classes.
            </div>
          </div>

          <button 
            onClick={() => onTabChange('Portfolio Reports')}
            className="w-full text-center text-[8.5px] font-black text-violet-400 hover:text-violet-300 border-t border-[#1E293B]/70 pt-2 flex items-center justify-center gap-0.5 hover:underline cursor-pointer uppercase"
          >
            <span>Run Detailed Rebalance Model</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Asset Allocation | Sector Allocation | Risk Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch select-none text-[#F8FAFC]">
        
        {/* Asset Allocation */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[180px]">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Asset Allocation</span>
          <div className="mt-3.5 flex-grow">
            <AllocationChart type="asset" quotes={quotes} portfolio={portfolio} recs={recs} />
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[180px]">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Sector Concentration</span>
          <div className="mt-3.5 flex-grow">
            <AllocationChart type="sector" quotes={quotes} portfolio={portfolio} recs={recs} />
          </div>
        </div>

        {/* Risk Snapshot */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[180px]">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Risk Snapshot</span>
          
          <div className="mt-3 flex-grow space-y-2.5 text-[9px] font-bold">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <span>Volatility Index (Beta)</span>
                <HelpCircle className="w-3 h-3 text-slate-600" />
              </span>
              <span className="text-white font-extrabold">0.86 (Low Volatility)</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <span>Max Drawdown Risk</span>
                <HelpCircle className="w-3 h-3 text-slate-600" />
              </span>
              <span className="text-emerald-500 font-extrabold">-2.13% (Protected)</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <span>Concentration Risk</span>
                <HelpCircle className="w-3 h-3 text-slate-600" />
              </span>
              <span className="text-amber-500 font-extrabold">Moderate (38% max sector)</span>
            </div>
          </div>

          <div className="bg-[#0B1220] px-2.5 py-1.5 border border-[#1E293B]/40 rounded-xl text-[7.5px] font-black text-slate-500 uppercase text-center mt-1.5">
            RISK RATING: SAFE TO MODERATE
          </div>
        </div>
      </div>

      {/* Row 3: Top Contributors | Top Detractors | Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch select-none text-[#F8FAFC]">
        
        {/* Top Contributors */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all min-h-[190px]">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3.5">Top Portfolio Contributors</span>
            <div className="space-y-2">
              {contributors.topGainers.map((c, i) => (
                <div 
                  key={c.symbol} 
                  onClick={() => onNavigateToStockAnalysis(c.symbol)}
                  className="flex items-center justify-between text-[9px] bg-[#0B1220] p-2 rounded-xl border border-transparent hover:border-[#1E293B] cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <CompanyLogo symbol={c.symbol} size="sm" />
                    <span className="font-extrabold text-slate-200">{c.symbol}</span>
                  </div>
                  <span className="font-black text-emerald-500">
                    +₹{c.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Detractors */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all min-h-[190px]">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3.5">Top Portfolio Detractors</span>
            <div className="space-y-2">
              {contributors.topLosers.map((c, i) => (
                <div 
                  key={c.symbol} 
                  onClick={() => onNavigateToStockAnalysis(c.symbol)}
                  className="flex items-center justify-between text-[9px] bg-[#0B1220] p-2 rounded-xl border border-transparent hover:border-[#1E293B] cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <CompanyLogo symbol={c.symbol} size="sm" />
                    <span className="font-extrabold text-slate-200">{c.symbol}</span>
                  </div>
                  <span className="font-black text-rose-500">
                    {c.profit >= 0 ? '+' : ''}₹{c.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all min-h-[190px]">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3.5">AI Investment Alerts</span>
            <div className="space-y-2 text-[8.5px] font-bold">
              {[
                { title: 'HDFCBANK Earnings Consensus', desc: 'Earnings beat projects upside valuation correction.', type: 'positive' },
                { title: 'TCS moving average crossing', desc: 'Price crossed 50 DMA indicating bullish momentum.', type: 'positive' },
                { title: 'Financial Overweight threshold', desc: 'Exposure exceeded 35% safety levels.', type: 'warning' }
              ].map((alert, idx) => (
                <div key={idx} className="p-2 bg-[#0B1220] border border-[#1E293B]/60 rounded-xl leading-normal">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-extrabold block">{alert.title}</span>
                    <span className={`text-[6.5px] px-1 rounded font-black uppercase ${
                      alert.type === 'positive' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                    }`}>{alert.type}</span>
                  </div>
                  <p className="text-[#94A3B8] mt-1 font-medium">{alert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
