import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ReportEmptyStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ReportEmptyState({
  title = 'No reports data found',
  message = 'Insufficient database records for analysis. Refresh metrics or select another constituency.',
  onRetry
}: ReportEmptyStateProps) {
  return (
    <div className="card p-12 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-xl text-center select-none flex flex-col items-center justify-center min-h-[300px]">
      <AlertCircle className="w-12 h-12 text-[#F59E0B] mb-4 animate-pulse" />
      <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider block">{title}</h3>
      <p className="text-[10px] text-slate-500 font-bold max-w-sm leading-normal mt-1.5 uppercase">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-4 py-2 bg-[#0b1320] border border-[#1E293B] hover:border-slate-700 text-violet-400 hover:text-white rounded-xl text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Details</span>
        </button>
      )}
    </div>
  );
}
