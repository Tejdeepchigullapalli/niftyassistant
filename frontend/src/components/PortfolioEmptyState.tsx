import React from 'react';
import { Briefcase, TrendingUp } from 'lucide-react';

interface PortfolioEmptyStateProps {
  onExplore: () => void;
}

export default function PortfolioEmptyState({ onExplore }: PortfolioEmptyStateProps) {
  return (
    <div className="card p-10 bg-[#0F172A] border border-dashed border-[#1E293B] rounded-2xl flex flex-col items-center justify-center text-center max-w-xl mx-auto my-12 space-y-5 shadow-2xl select-none">
      <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-md">
        <Briefcase className="w-6 h-6 text-slate-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Your Portfolio is Empty</h3>
        <p className="text-[10.5px] text-slate-450 leading-relaxed max-w-sm mx-auto">
          Mark a company as <b>Purchased</b> under the <i>Manage Position</i> action to start tracking your simulated holdings, average buy prices, and portfolio allocation charts.
        </p>
      </div>

      <button
        onClick={onExplore}
        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-[#F8FAFC] text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-950/20 flex items-center gap-2"
      >
        <TrendingUp className="w-3.5 h-3.5" />
        Explore Top Nifty Companies
      </button>
    </div>
  );
}
