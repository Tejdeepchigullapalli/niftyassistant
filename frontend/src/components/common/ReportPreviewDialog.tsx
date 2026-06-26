import React from 'react';

interface ReportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportName: string;
  sectionsCount: number;
  appendicesCount: number;
  estimatedPages: number;
  dateRange: string;
  onConfirm: () => void;
}

export function ReportPreviewDialog({
  isOpen,
  onClose,
  reportName,
  sectionsCount,
  appendicesCount,
  estimatedPages,
  dateRange,
  onConfirm
}: ReportPreviewDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1220] border border-[#1f293d] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest border-b border-slate-800 pb-2">
          📄 Report Generation Preview
        </h4>
        
        <div className="space-y-2 text-[10px] text-slate-350">
          <div className="flex justify-between">
            <span className="text-slate-500">Report Title:</span>
            <span className="font-bold text-slate-200">{reportName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date Range:</span>
            <span className="font-bold text-slate-250">{dateRange}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Selected Sections:</span>
            <span className="font-bold text-slate-200">{sectionsCount} sections</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Appendix Company Pages:</span>
            <span className="font-bold text-slate-200">{appendicesCount} companies</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated Total Pages:</span>
            <span className="font-bold text-violet-400">{estimatedPages} pages</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 hover:text-white"
          >
            Adjust Configuration
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 bg-violet-650 hover:bg-violet-550 rounded-lg text-[10px] font-bold text-white shadow-md"
          >
            Confirm & Export
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportPreviewDialog;
