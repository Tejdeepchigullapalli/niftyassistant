import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { QuoteData, RecommendationData } from '../../types/stock';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { ReportConfigurationDialog } from './ReportConfigurationDialog';

interface GeneratePortfolioReportButtonProps {
  quotes: QuoteData[];
  recs: Record<string, RecommendationData>;
  lastUpdated?: string;
}

export function GeneratePortfolioReportButton({
  quotes,
  recs,
  lastUpdated
}: GeneratePortfolioReportButtonProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { requireAuth } = useRequireAuth();

  return (
    <div>
      <button 
        onClick={() => {
          requireAuth(() => {
            setIsConfigOpen(true);
          }, 'report');
        }}
        className="text-[9.5px] font-black px-3 py-2 bg-[#0b1320] border border-[#1E293B] hover:border-slate-700 rounded-xl text-slate-200 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-[#EF4444]" />
        <span>Export PDF</span>
      </button>

      {/* Render config dialog */}
      <ReportConfigurationDialog
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        quotes={quotes}
        recs={recs}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}

export default GeneratePortfolioReportButton;
