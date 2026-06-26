import React from 'react';
import { ProgressState } from '../../reports/services/reportPdfService';

interface ReportGenerationProgressDialogProps {
  isOpen: boolean;
  progress: ProgressState | null;
  onCancel: () => void;
}

export function ReportGenerationProgressDialog({
  isOpen,
  progress,
  onCancel
}: ReportGenerationProgressDialogProps) {
  if (!isOpen || !progress) return null;

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1220] border border-[#1f293d] rounded-2xl max-w-xs w-full p-6 shadow-2xl flex flex-col items-center select-none text-center">
        <span className="text-2xl animate-bounce mb-3">🤖</span>
        <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest mb-1">
          Compiling Report Data
        </h4>
        <p className="text-[10px] text-violet-400 mb-5">{progress.stage}...</p>
        
        {/* Track bar progress */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden border border-slate-700">
          <div 
            className="bg-violet-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <span className="text-[8px] text-slate-550 font-bold">{progress.percent}% Complete</span>

        <button 
          onClick={onCancel}
          className="mt-6 text-[9px] text-slate-400 hover:text-white px-3 py-1.5 border border-slate-800 rounded-lg bg-slate-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ReportGenerationProgressDialog;
