import React, { useState } from 'react';
import { CompanyMeta, QuoteData, PortfolioHolding } from '../types/stock';
import { COMPANIES_METADATA } from '../utils/api';
import { 
  SlidersHorizontal, CheckSquare, Square, Eye, Sparkles, 
  Download, Loader2, FileText, AlertCircle, Mail, CheckCircle 
} from 'lucide-react';

interface CustomReportBuilderProps {
  quotes: QuoteData[];
  portfolio: PortfolioHolding[];
}

export default function CustomReportBuilder({
  quotes = [],
  portfolio = []
}: CustomReportBuilderProps) {
  const [reportName, setReportName] = useState('My NiftyAI Report');
  const [reportType, setReportType] = useState('Comprehensive');
  const [timeframe, setTimeframe] = useState('1M');
  const [benchmark, setBenchmark] = useState('NIFTY 50');

  // Selected companies checklists (RELIANCE, TCS, HDFCBANK selected by default)
  const [selectedStocks, setSelectedStocks] = useState<string[]>(['RELIANCE', 'TCS', 'HDFCBANK']);
  
  // Selected report modules
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'Portfolio Summary', 'Holdings Table', 'Performance Chart', 'Sector Allocation', 'AI Recommendation'
  ]);

  // Generation status states
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [generated, setGenerated] = useState(false);

  const steps = [
    'Collecting latest real-time market data',
    'Analysing portfolio performance and tracking alpha',
    'Generating neural explainability metrics & corporate goals',
    'Preparing print-ready analytical document'
  ];

  const modules = [
    'Portfolio Summary',
    'Holdings Table',
    'Performance Chart',
    'Risk Analysis',
    'Sector Allocation',
    'Market Snapshot',
    'Company Fundamentals',
    'Peer Comparison',
    'Technical Analysis',
    'News & Sentiment',
    'AI Recommendation',
    'Investment Simulator',
    'Alerts and Watchlist'
  ];

  const handleToggleStock = (sym: string) => {
    setSelectedStocks(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleToggleModule = (mod: string) => {
    setSelectedModules(prev => 
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setGenStep(0);

    // Simulate progress transition steps
    const interval = setInterval(() => {
      setGenStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setGenerating(false);
          setGenerated(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none text-[#F8FAFC]">
      
      {/* Left Column: Form Settings (8 Cols) */}
      <div className="lg:col-span-8 space-y-4 flex flex-col justify-between">
        
        {/* A. Report Settings */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl space-y-3.5">
          <div className="flex items-center gap-1.5 text-violet-400">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider block">Report Configuration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9.5px] font-bold">
            <div className="space-y-1.5">
              <span className="text-[#64748B] uppercase text-[7.5px] tracking-widest block">Report Title Name</span>
              <input 
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E293B] hover:border-slate-700 focus:border-violet-500 rounded-xl px-3 py-2 outline-none text-white font-extrabold text-[9.5px]"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[#64748B] uppercase text-[7.5px] tracking-widest block">Report Analysis Type</span>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E293B] hover:border-slate-700 focus:border-violet-500 rounded-xl px-3 py-2 outline-none text-white font-extrabold text-[9.5px] cursor-pointer"
              >
                <option value="Comprehensive">Comprehensive Portfolio Intel</option>
                <option value="Fundamentals">Fundamental Ratios Overview</option>
                <option value="Technical">Technical Indicators & Support</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[#64748B] uppercase text-[7.5px] tracking-widest block">Historical Timeframe</span>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E293B] hover:border-slate-700 focus:border-violet-500 rounded-xl px-3 py-2 outline-none text-white font-extrabold text-[9.5px] cursor-pointer"
              >
                <option value="1W">1 Week Trend</option>
                <option value="1M">1 Month Trend</option>
                <option value="3M">3 Months Trend</option>
                <option value="1Y">1 Year Trend</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[#64748B] uppercase text-[7.5px] tracking-widest block">Index Benchmark</span>
              <select 
                value={benchmark}
                onChange={(e) => setBenchmark(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E293B] hover:border-slate-700 focus:border-violet-500 rounded-xl px-3 py-2 outline-none text-white font-extrabold text-[9.5px] cursor-pointer"
              >
                <option value="NIFTY 50">NIFTY 50 (Nifty Top Index)</option>
                <option value="NIFTY BANK">NIFTY Bank (Sector Index)</option>
              </select>
            </div>
          </div>

          {/* Companies checkboxes list */}
          <div className="space-y-1.5 border-t border-[#1E293B]/40 pt-3">
            <span className="text-[#64748B] uppercase text-[7.5px] tracking-widest font-black block">Target Constituents to Include</span>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-[85px] overflow-y-auto chat-scrollbar pr-1 pt-1">
              {COMPANIES_METADATA.slice(0, 18).map(c => {
                const isSelected = selectedStocks.includes(c.symbol);
                return (
                  <button
                    key={c.symbol}
                    onClick={() => handleToggleStock(c.symbol)}
                    className={`px-2.5 py-1 rounded-xl text-[8.5px] font-black border text-left flex justify-between items-center transition-all ${
                      isSelected 
                        ? 'bg-violet-650/15 border-violet-500 text-violet-400' 
                        : 'bg-[#0B1220] border-[#1E293B] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{c.symbol}</span>
                    {isSelected ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <span className="w-3 h-3 border border-slate-650 rounded-full flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* B. Modules Checklist */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl space-y-3">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Include Modules in Report</span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            {modules.map(mod => {
              const isChecked = selectedModules.includes(mod);
              return (
                <button
                  key={mod}
                  onClick={() => handleToggleModule(mod)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    isChecked 
                      ? 'bg-[#8B5CF6]/5 border-[#8B5CF6]/35 text-violet-400' 
                      : 'bg-[#0B1220] border-[#1E293B] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  )}
                  <span className="text-[9px] font-bold">{mod}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column: Preview & Action (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col justify-between gap-4">
        
        {/* C. Preview details card */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex-grow flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center gap-1.5 text-violet-400 border-b border-[#1E293B]/70 pb-2 mb-3.5">
              <Eye className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider block">Document Export Preview</span>
            </div>

            <div className="space-y-3.5 text-[9.5px] font-bold">
              <div className="flex justify-between border-b border-[#1E293B]/30 pb-1.5">
                <span className="text-[#64748B]">Document Name</span>
                <span className="text-white font-extrabold max-w-[120px] truncate">{reportName}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B]/30 pb-1.5">
                <span className="text-[#64748B]">Active Timeframe</span>
                <span className="text-white">{timeframe} Trend</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B]/30 pb-1.5">
                <span className="text-[#64748B]">Selected Companies</span>
                <span className="text-white font-extrabold">{selectedStocks.length} Stocks</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B]/30 pb-1.5">
                <span className="text-[#64748B]">Export Modules</span>
                <span className="text-[#8B5CF6] font-extrabold">{selectedModules.length} Modules</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Estimated Page Length</span>
                <span className="text-white font-black">{Math.ceil(selectedModules.length / 2) + 1} Pages</span>
              </div>
            </div>
          </div>

          {/* Trigger action buttons */}
          <div className="mt-4 pt-4 border-t border-[#1E293B] space-y-2">
            
            {/* Warning alert if PDF download is requested */}
            <div className="p-2.5 bg-[#F59E0B]/5 border border-[#F59E0B]/15 text-[#F59E0B] text-[8.5px] leading-normal rounded-xl flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>PDF generation will be connected to the report service. Download simulation active.</span>
            </div>

            {generating ? (
              <div className="w-full p-3 bg-[#0B1220] border border-[#1E293B] rounded-xl flex flex-col justify-center items-center text-center space-y-2 select-none">
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest">{steps[genStep]}</span>
              </div>
            ) : generated ? (
              <div className="space-y-2">
                <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-[9px] font-black uppercase text-center flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Report Generated successfully!</span>
                </div>
                <button 
                  onClick={() => {
                    alert('PDF Download initiated (Mockup trigger).');
                    setGenerated(false);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-lg font-black uppercase text-[9.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download PDF Report</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGenerate}
                disabled={selectedModules.length === 0}
                className="w-full py-2.5 bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-lg font-black uppercase text-[9.5px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Generate Custom Report</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
