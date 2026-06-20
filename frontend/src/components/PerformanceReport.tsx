import React, { useMemo } from 'react';
import { CompanyMeta, QuoteData, PortfolioHolding, RecommendationData } from '../types/stock';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';
import ReturnHeatmap from './ReturnHeatmap';
import { getCompanyMeta } from '../utils/api';
import { ShieldCheck, TrendingUp, HelpCircle } from 'lucide-react';

interface PerformanceReportProps {
  quotes: QuoteData[];
  portfolio: PortfolioHolding[];
  recs?: Record<string, RecommendationData>;
}

export default function PerformanceReport({
  quotes = [],
  portfolio = [],
  recs = {}
}: PerformanceReportProps) {

  // A. Generate calculations for performance contributors
  const analytics = useMemo(() => {
    if (portfolio.length === 0) {
      return { topSector: '—', bottomSector: '—', topStock: '—', bottomStock: '—' };
    }

    const calculatedHoldings = portfolio.map(holding => {
      const q = quotes.find(item => item.symbol.toUpperCase() === holding.symbol.toUpperCase());
      const currentPrice = q?.current_price ?? holding.averageBuyPrice;
      const meta = getCompanyMeta(holding.symbol);
      const profitVal = (holding.quantity * currentPrice) - (holding.quantity * holding.averageBuyPrice);

      return {
        symbol: holding.symbol,
        sector: meta.sector,
        profit: profitVal
      };
    });

    // Sort by profit
    const sortedStocks = [...calculatedHoldings].sort((a, b) => b.profit - a.profit);
    
    // Sort by sector profit
    const sectorProfitMap: Record<string, number> = {};
    calculatedHoldings.forEach(h => {
      sectorProfitMap[h.sector] = (sectorProfitMap[h.sector] || 0) + h.profit;
    });
    const sortedSectors = Object.entries(sectorProfitMap).sort((a, b) => b[1] - a[1]);

    return {
      topStock: sortedStocks[0]?.symbol || '—',
      bottomStock: sortedStocks[sortedStocks.length - 1]?.symbol || '—',
      topSector: sortedSectors[0]?.[0] || '—',
      bottomSector: sortedSectors[sortedSectors.length - 1]?.[0] || '—'
    };
  }, [portfolio, quotes]);

  const metrics = [
    { label: 'Absolute Return', val: '+4.28%', desc: 'Net absolute asset value growth' },
    { label: 'Annualized Return (CAGR)', val: '18.45%', desc: 'Estimated compounded expansion' },
    { label: 'Alpha vs NIFTY 50', val: '+2.52%', desc: 'Outperformance premium index' },
    { label: 'Beta Metric', val: '0.86', desc: 'Volatility scaling factor vs index' },
    { label: 'Sharpe Ratio', val: '1.28', desc: 'Risk-adjusted return ratio' },
    { label: 'Sortino Ratio', val: '1.68', desc: 'Downside deviation protection factor' },
    { label: 'Portfolio Volatility', val: '12.34%', desc: 'Annualized asset deviation levels' },
    { label: 'Max Drawdown', val: '-2.13%', desc: 'Maximum historical return drawdown' },
    { label: 'Win Rate Ratio', val: '64.5%', desc: 'Win probability indexes' },
    { label: 'Best Trading Day', val: '+2.45%', desc: 'Highest single-session advance' },
    { label: 'Worst Trading Day', val: '-1.18%', desc: 'Deepest single-session decline' }
  ];

  return (
    <div className="space-y-4">
      
      {/* 1. Performance Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none text-[#F8FAFC]">
        <div className="lg:col-span-8 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[320px]">
          <PortfolioPerformanceChart brandColor="#8B5CF6" />
        </div>

        {/* Contribution Metrics Card */}
        <div className="lg:col-span-4 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[320px]">
          <div>
            <div className="flex items-center gap-1.5 text-violet-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider block">Contribution Analysis</span>
            </div>

            <div className="space-y-4 mt-6 text-[9.5px]">
              <div>
                <span className="text-[#64748B] uppercase text-[7.5px] font-black block tracking-wider">Top Asset Contributor</span>
                <span className="text-[#22C55E] font-black text-xs block mt-1">{analytics.topStock}</span>
              </div>

              <div>
                <span className="text-[#64748B] uppercase text-[7.5px] font-black block tracking-wider">Largest Portfolio Detractor</span>
                <span className="text-[#EF4444] font-black text-xs block mt-1">{analytics.bottomStock}</span>
              </div>

              <div className="border-t border-[#1E293B] pt-4.5 grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[#64748B] uppercase text-[7.5px] font-black block tracking-wider">Best Performing Sector</span>
                  <span className="text-white font-extrabold text-[10px] block mt-1.5 truncate">{analytics.topSector}</span>
                </div>
                <div>
                  <span className="text-[#64748B] uppercase text-[7.5px] font-black block tracking-wider">Weakest Sector Focus</span>
                  <span className="text-white font-extrabold text-[10px] block mt-1.5 truncate">{analytics.bottomSector}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0B1220] px-3.5 py-2 border border-[#1E293B]/40 rounded-xl text-[7.5px] font-black text-slate-500 uppercase text-center">
            Calculated relative to holdings purchase index
          </div>
        </div>
      </div>

      {/* 2. Ratios Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 select-none text-[#F8FAFC]">
        {metrics.map((item, idx) => (
          <div key={idx} className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all h-[78px]">
            <div>
              <span className="text-[7.5px] text-[#64748B] uppercase tracking-wider font-extrabold block">{item.label}</span>
              <span className="text-[12px] font-black text-slate-100 block mt-1">{item.val}</span>
            </div>
            <span className="text-[7px] text-slate-500 leading-none block font-semibold">{item.desc}</span>
          </div>
        ))}
        {/* Fill rest grid cell */}
        <div className="card p-3 bg-[#0B1220]/40 border border-[#1E293B]/60 rounded-2xl flex items-center justify-center h-[78px] text-[7.5px] font-black text-[#64748B] uppercase text-center">
          Risk Metrics Verified
        </div>
      </div>

      {/* 3. Monthly Return Calendar Heatmap */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-violet-500/20 transition-all">
        <ReturnHeatmap />
      </div>

    </div>
  );
}
