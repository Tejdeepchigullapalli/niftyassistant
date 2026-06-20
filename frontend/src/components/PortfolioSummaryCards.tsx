import React, { useMemo } from 'react';
import { Holding } from '../context/InvestmentStateContext';
import { getCompanyMeta } from '../utils/api';

interface PortfolioSummaryCardsProps {
  holdings: Holding[];
  quotes: Record<string, any>;
  recs: Record<string, any>;
}

export default function PortfolioSummaryCards({
  holdings,
  quotes,
  recs
}: PortfolioSummaryCardsProps) {
  
  // 1. Compute financial metrics
  const totals = useMemo(() => {
    let investedVal = 0;
    let currentVal = 0;
    let todayPnLSum = 0;

    holdings.forEach(h => {
      const q = quotes[h.symbol];
      const currentPrice = q?.current_price ?? getCompanyMeta(h.symbol).basePrice;
      const todayChange = q?.change ?? 0;

      investedVal += h.quantity * h.averageBuyPrice;
      currentVal += h.quantity * currentPrice;
      todayPnLSum += h.quantity * todayChange;
    });

    const unrealisedPnL = currentVal - investedVal;
    const returnPct = investedVal > 0 ? (unrealisedPnL / investedVal) * 100 : 0;
    const todayChangePct = currentVal > 0 ? (todayPnLSum / currentVal) * 100 : 0;

    return {
      investedVal,
      currentVal,
      unrealisedPnL,
      returnPct,
      todayPnLSum,
      todayChangePct
    };
  }, [holdings, quotes]);

  // 2. Compute dynamic Portfolio Health Score
  const healthScore = useMemo(() => {
    if (holdings.length === 0) return 0;
    const sum = holdings.reduce((acc, h) => {
      const rec = recs[h.symbol] || { ai_investment_score: 75 };
      return acc + (rec.ai_investment_score || 75);
    }, 0);
    return Math.round(sum / holdings.length);
  }, [holdings, recs]);

  // 3. Compute dynamic Diversification Score
  const diversificationScore = useMemo(() => {
    if (holdings.length === 0) return 0;
    const sectors = new Set(holdings.map(h => getCompanyMeta(h.symbol).sector));
    const count = sectors.size;
    if (count >= 5) return 96;
    if (count === 4) return 85;
    if (count === 3) return 72;
    if (count === 2) return 50;
    return 30;
  }, [holdings]);

  const getHealthRatingLabel = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-emerald-400' };
    if (score >= 70) return { text: 'Good', color: 'text-emerald-400' };
    if (score >= 55) return { text: 'Average', color: 'text-amber-500' };
    return { text: 'Weak', color: 'text-rose-500' };
  };

  const healthMeta = getHealthRatingLabel(healthScore);
  const divMeta = getHealthRatingLabel(diversificationScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 select-none">
      
      {/* circular health gauge */}
      <div className="card p-4 flex items-center justify-between min-h-[120px] bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-xl hover:border-violet-500/20 transition-all">
        <div className="flex flex-col justify-between h-full py-1 text-left">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Portfolio Health</span>
          <div className="mt-4">
            <div className={`text-xs font-black ${healthMeta.color}`}>{healthMeta.text}</div>
            <div className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">Average AI Score</div>
          </div>
        </div>
        <div className="relative flex items-center justify-center mr-2">
          <svg width="80" height="80" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="36" fill="none" stroke="#0a0f1d" strokeWidth="6" />
            <circle 
              cx="42" cy="42" r="36" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="6" 
              strokeDasharray={226.2} 
              strokeDashoffset={226.2 - (healthScore / 100) * 226.2} 
              strokeLinecap="round"
              transform="rotate(-90 42 42)"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center leading-none">
            <span className="text-lg font-black text-white">{healthScore}</span>
            <span className="text-[8px] text-slate-500 font-bold">/100</span>
          </div>
        </div>
      </div>

      {/* circular diversification gauge */}
      <div className="card p-4 flex items-center justify-between min-h-[120px] bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-xl hover:border-violet-500/20 transition-all">
        <div className="flex flex-col justify-between h-full py-1 text-left">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Diversification</span>
          <div className="mt-4">
            <div className={`text-xs font-black ${divMeta.color}`}>{divMeta.text}</div>
            <div className="text-[7.5px] text-slate-500 font-bold uppercase mt-0.5">Sector Allocation</div>
          </div>
        </div>
        <div className="relative flex items-center justify-center mr-2">
          <svg width="80" height="80" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="36" fill="none" stroke="#0a0f1d" strokeWidth="6" />
            <circle 
              cx="42" cy="42" r="36" 
              fill="none" 
              stroke="#8B5CF6" 
              strokeWidth="6" 
              strokeDasharray={226.2} 
              strokeDashoffset={226.2 - (diversificationScore / 100) * 226.2} 
              strokeLinecap="round"
              transform="rotate(-90 42 42)"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center leading-none">
            <span className="text-lg font-black text-white">{diversificationScore}</span>
            <span className="text-[8px] text-slate-500 font-bold">/100</span>
          </div>
        </div>
      </div>

      {/* Total Invested vs Current */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-xl flex flex-col justify-between min-h-[120px] text-left hover:border-violet-500/20 transition-all">
        <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Portfolio Valuation</span>
        <div className="mt-1">
          <span className="text-xl font-black text-white leading-none block">₹{totals.currentVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span className="text-[8px] text-slate-500 font-bold uppercase block mt-1">
            Invested: ₹{totals.investedVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden mt-1 select-none">
          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min((totals.currentVal / (totals.investedVal || 1)) * 50, 100)}%` }} />
        </div>
      </div>

      {/* Total P&L Return Card */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-xl flex flex-col justify-between min-h-[120px] text-left hover:border-violet-500/20 transition-all">
        <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Unrealised Returns</span>
        <div className="mt-1">
          <span className={`text-xl font-black block leading-none ${totals.unrealisedPnL >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {totals.unrealisedPnL >= 0 ? '+' : ''}₹{totals.unrealisedPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className={`text-[8.5px] font-black block mt-1 leading-none ${totals.returnPct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {totals.returnPct >= 0 ? '▲' : '▼'} {totals.returnPct.toFixed(2)}% Return
          </span>
        </div>
        <div className="flex justify-between items-center text-[7.5px] font-bold text-slate-500 select-none uppercase pt-1 border-t border-slate-850/50 mt-1">
          <span>Today's Move:</span>
          <span className={totals.todayPnLSum >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
            {totals.todayPnLSum >= 0 ? '+' : ''}₹{totals.todayPnLSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({totals.todayChangePct.toFixed(2)}%)
          </span>
        </div>
      </div>

    </div>
  );
}
