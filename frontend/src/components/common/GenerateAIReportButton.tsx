import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { QuoteData, RecommendationData } from '../../types/stock';
import { ReportPdfService, ProgressState } from '../../reports/services/reportPdfService';

interface GenerateAIReportButtonProps {
  symbol: string;
  quotes: QuoteData[];
  recs: Record<string, RecommendationData>;
  style?: any;
}

export function GenerateAIReportButton({ symbol, quotes, recs, style }: GenerateAIReportButtonProps) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setProgress({ stage: "Connecting to API feed", percent: 0 });

    try {
      await ReportPdfService.generateCompanyReport(
        symbol,
        quotes,
        recs,
        (progressState) => {
          setProgress(progressState);
        }
      );
      // Wait a moment and close dialog
      setTimeout(() => {
        setProgress(null);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate report.");
      setProgress(null);
    }
  };

  return (
    <div style={style}>
      <button 
        onClick={handleGenerate}
        className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-[#F8FAFC] text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-1 cursor-pointer"
        title="Generate AI Report PDF"
      >
        <FileText className="w-3 h-3" />
        AI Report
      </button>

      {/* Progress dialog overlay */}
      {progress && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-[#1f293d] rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center">
            <span className="text-2xl animate-bounce mb-3">🤖</span>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest mb-1">
              Building {symbol} Report
            </h4>
            <p className="text-[10px] text-violet-400 mb-5">{progress.stage}...</p>
            
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden border border-slate-700">
              <div 
                className="bg-violet-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="text-[8px] text-slate-550 font-bold">{progress.percent}% Complete</span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 z-50 bg-rose-950 border border-rose-900 text-rose-200 text-[10px] p-3 rounded-lg shadow-lg flex items-center gap-3">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
}

export default GenerateAIReportButton;
