import React, { useState, useMemo } from 'react';
import { useInvestmentState } from '../../context/InvestmentStateContext';
import { QuoteData, RecommendationData } from '../../types/stock';
import { ReportPdfService, ProgressState } from '../../reports/services/reportPdfService';
import { ReportConfig } from '../../reports/types/reportTypes';
import ReportPreviewDialog from './ReportPreviewDialog';
import ReportGenerationProgressDialog from './ReportGenerationProgressDialog';

interface ReportConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: QuoteData[];
  recs: Record<string, RecommendationData>;
  lastUpdated?: string;
}

export function ReportConfigurationDialog({
  isOpen,
  onClose,
  quotes,
  recs,
  lastUpdated
}: ReportConfigurationDialogProps) {
  const { getPortfolioHoldings, getWatchlistSymbols, state } = useInvestmentState();
  const holdings = getPortfolioHoldings();
  const watchlist = getWatchlistSymbols();
  const alertsList = Object.values(state.alerts);

  // Configuration options state
  const [reportName, setReportName] = useState("AI Portfolio & Intelligence Report");
  const [dateRange, setDateRange] = useState("Jun 17, 2026 - Jun 23, 2026");
  const [benchmark, setBenchmark] = useState("NIFTY 50");
  
  // Section boolean states
  const [includePortfolioOverview, setIncludePortfolioOverview] = useState(true);
  const [includePerformanceAnalysis, setIncludePerformanceAnalysis] = useState(true);
  const [includeHoldingsTable, setIncludeHoldingsTable] = useState(true);
  const [includeSectorAllocation, setIncludeSectorAllocation] = useState(true);
  const [includeRiskAnalysis, setIncludeRiskAnalysis] = useState(true);
  const [includeWatchlistSummary, setIncludeWatchlistSummary] = useState(true);
  const [includeInterestedCompanies, setIncludeInterestedCompanies] = useState(true);
  const [includeAlertsSummary, setIncludeAlertsSummary] = useState(true);
  const [includeMarketIntelligence, setIncludeMarketIntelligence] = useState(true);
  const [includeCompanyResearchAppendices, setIncludeCompanyResearchAppendices] = useState(true);

  // Appendices selection
  const allAvailableSymbols = useMemo(() => {
    const list = new Set<string>();
    holdings.forEach(h => list.add(h.symbol));
    watchlist.forEach(s => list.add(s));
    return Array.from(list);
  }, [holdings, watchlist]);

  const [selectedAppendixSymbols, setSelectedAppendixSymbols] = useState<string[]>(
    holdings.map(h => h.symbol)
  );

  // Trigger preview state
  const [showPreview, setShowPreview] = useState(false);

  // Progress modal state
  const [generationProgress, setGenerationProgress] = useState<ProgressState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWarningConfirmed, setIsWarningConfirmed] = useState(false);

  // Estimated page count calculations
  const estimatedPages = useMemo(() => {
    let pages = 1; // Page 1: Cover
    if (includePerformanceAnalysis) pages += 1;
    if (includeHoldingsTable) pages += 1;
    if (includeRiskAnalysis) pages += 1;
    if (includeWatchlistSummary || includeAlertsSummary) pages += 1;
    if (includeMarketIntelligence) pages += 1;
    if (includeCompanyResearchAppendices) {
      pages += selectedAppendixSymbols.length * 6; // Appendix cover (1) + stock report (5)
    }
    return pages;
  }, [
    includePerformanceAnalysis,
    includeHoldingsTable,
    includeRiskAnalysis,
    includeWatchlistSummary,
    includeAlertsSummary,
    includeMarketIntelligence,
    includeCompanyResearchAppendices,
    selectedAppendixSymbols
  ]);

  const isLargeReport = selectedAppendixSymbols.length > 8 || estimatedPages > 25;

  const handleToggleAppendixSymbol = (symbol: string) => {
    setSelectedAppendixSymbols(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const handleTriggerExport = () => {
    setShowPreview(true);
  };

  const handleStartGeneration = async () => {
    setShowPreview(false);
    setErrorMessage(null);
    setGenerationProgress({ stage: "Preparing adapter metadata", percent: 0 });

    const config: ReportConfig = {
      reportName,
      dateRange,
      benchmark,
      includePortfolioOverview,
      includePerformanceAnalysis,
      includeHoldingsTable,
      includeSectorAllocation,
      includeRiskAnalysis,
      includeWatchlistSummary,
      includeInterestedCompanies,
      includeAlertsSummary,
      includeMarketIntelligence,
      includeCompanyResearchAppendices,
      selectedAppendixSymbols
    };

    try {
      await ReportPdfService.generatePortfolioReport(
        config,
        holdings,
        quotes,
        recs,
        watchlist,
        alertsList,
        (progress) => {
          setGenerationProgress(progress);
        }
      );
      setTimeout(() => {
        setGenerationProgress(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to compile the vector PDF report. Please retry.");
      setGenerationProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1220] border border-[#1f293d] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 select-none">
          <div>
            <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <span>📄</span> Report Customization Panel
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Configure layout components and appendices criteria.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white font-bold text-sm">✕</button>
        </div>

        {errorMessage && (
          <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg text-rose-400 text-xs mb-3 flex justify-between items-center">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="font-bold">Dismiss</button>
          </div>
        )}

        {/* Forms scroll area */}
        <div className="max-h-[360px] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Report Display Title</label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Comparative Benchmark</label>
              <select
                value={benchmark}
                onChange={(e) => setBenchmark(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="NIFTY 50">NIFTY 50 Index</option>
                <option value="NIFTY Bank">NIFTY Bank Index</option>
                <option value="SENSEX">SENSEX Index</option>
              </select>
            </div>
          </div>

          {/* Checklist Sections Grid */}
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Include Sections</span>
            <div className="grid grid-cols-2 gap-3 text-xs select-none">
              {[
                { val: includePortfolioOverview, set: setIncludePortfolioOverview, label: "Portfolio Executive Summary" },
                { val: includePerformanceAnalysis, set: setIncludePerformanceAnalysis, label: "Performance vs Benchmark" },
                { val: includeHoldingsTable, set: setIncludeHoldingsTable, label: "Purchased Holdings Ledger" },
                { val: includeSectorAllocation, set: setIncludeSectorAllocation, label: "Sector & Asset Allocation" },
                { val: includeRiskAnalysis, set: setIncludeRiskAnalysis, label: "Portfolio Risk & Rebalance Analysis" },
                { val: includeWatchlistSummary, set: setIncludeWatchlistSummary, label: "Watchlist Symbols Summary" },
                { val: includeInterestedCompanies, set: setIncludeInterestedCompanies, label: "Interested Watchlist Stocks" },
                { val: includeAlertsSummary, set: setIncludeAlertsSummary, label: "Active Alerts Index" },
                { val: includeMarketIntelligence, set: setIncludeMarketIntelligence, label: "Broad Market Intelligence" },
                { val: includeCompanyResearchAppendices, set: setIncludeCompanyResearchAppendices, label: "Company Research Appendices" }
              ].map((sec, i) => (
                <label key={i} className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sec.val}
                    onChange={(e) => sec.set(e.target.checked)}
                    className="accent-violet-600 rounded border-slate-700"
                  />
                  <span>{sec.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Appendix selection list */}
          {includeCompanyResearchAppendices && (
            <div className="border-t border-slate-800 pt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Select Companies for Appendices</span>
              <p className="text-[9px] text-slate-500 mb-2">Each selected symbol adds a complete 5-page research report appendix at the end of your PDF.</p>
              
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                {allAvailableSymbols.map(sym => {
                  const isChecked = selectedAppendixSymbols.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => handleToggleAppendixSymbol(sym)}
                      className={`text-[8.5px] px-2.5 py-1 rounded-lg border font-bold transition-all ${
                        isChecked 
                          ? 'bg-violet-600/10 border-violet-500/50 text-violet-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-350'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* LARGE REPORT THREAD WARNING */}
          {isLargeReport && !isWarningConfirmed && (
            <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-amber-400 text-[10px] space-y-2 leading-relaxed">
              <span className="font-bold uppercase tracking-wider block">⚠️ Performance Thread Lock Warning</span>
              <span>
                You have selected **{selectedAppendixSymbols.length} company reports**. This is estimated to yield a **{estimatedPages} page PDF**. Drawing this many SVG grids client-side can freeze your browser layout engine for several seconds.
              </span>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setSelectedAppendixSymbols(selectedAppendixSymbols.slice(0, 4))}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded"
                >
                  Limit to Top 4
                </button>
                <button
                  onClick={() => setIsWarningConfirmed(true)}
                  className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded"
                >
                  Confirm & Export Anyway
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer buttons */}
        <div className="border-t border-slate-800 pt-4 mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900 rounded-xl text-xs font-bold text-slate-350 transition-all"
          >
            Cancel
          </button>
          
          <button
            onClick={handleTriggerExport}
            disabled={isLargeReport && !isWarningConfirmed}
            className="px-5 py-2 bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-650 rounded-xl text-xs font-black text-white shadow-lg shadow-violet-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>📥</span> Generate & Export PDF
          </button>
        </div>

        {/* Modular Preview Dialog */}
        <ReportPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          reportName={reportName}
          sectionsCount={
            [
              includePortfolioOverview, includePerformanceAnalysis, includeHoldingsTable,
              includeSectorAllocation, includeRiskAnalysis, includeWatchlistSummary,
              includeInterestedCompanies, includeAlertsSummary, includeMarketIntelligence
            ].filter(Boolean).length
          }
          appendicesCount={includeCompanyResearchAppendices ? selectedAppendixSymbols.length : 0}
          estimatedPages={estimatedPages}
          dateRange={dateRange}
          onConfirm={handleStartGeneration}
        />

        {/* Modular Progress Dialog */}
        <ReportGenerationProgressDialog
          isOpen={!!generationProgress}
          progress={generationProgress}
          onCancel={() => setGenerationProgress(null)}
        />

      </div>
    </div>
  );
}

export default ReportConfigurationDialog;
