import React from 'react';
import { Calendar, Download, RefreshCw, FileSpreadsheet, PlusCircle } from 'lucide-react';

interface ReportsHeaderProps {
  dateRange: string;
  lastUpdated?: string;
  onRefresh?: () => void;
  onDownloadPDF?: () => void;
  onDownloadCSV?: () => void;
  onCreateCustom?: () => void;
}

export default function ReportsHeader({
  dateRange,
  lastUpdated,
  onRefresh,
  onDownloadPDF,
  onDownloadCSV,
  onCreateCustom
}: ReportsHeaderProps) {
  const displayTime = lastUpdated || new Date().toLocaleTimeString('en-IN');

  return (
    <div className="bg-gradient-to-r from-[#0F172A] to-[#0B1220] border border-[#1E293B] p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
      
      {/* Title block */}
      <div>
        <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
          <span>Reports & Investment Intelligence</span>
          <span className="text-[7.5px] bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#c084fc] px-1.5 py-0.5 rounded font-black uppercase">
            Premium Terminal
          </span>
        </h1>
        <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
          Generate, analyse, compare, and export portfolio research reports.
        </p>
        <div className="flex items-center gap-3.5 mt-2.5 text-[7.5px] text-[#64748B] font-extrabold uppercase">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <span>Live Quotes:</span>
            <span className="text-white">Updated at {displayTime}</span>
          </div>
          <div className="flex items-center gap-1 border-l border-[#1E293B] pl-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
            <span>Fundamentals:</span>
            <span className="text-white">Latest Filings Available</span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Selector */}
        <button className="bg-[#0b1320] border border-[#1E293B] hover:border-slate-700 rounded-xl px-3 py-2 text-[9.5px] text-slate-350 font-black focus:outline-none flex items-center gap-1.5 transition-all cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-violet-400" />
          <span>{dateRange}</span>
        </button>

        {/* Refresh button */}
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-2 bg-[#0b1320] border border-[#1E293B] hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Quotes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Export PDF */}
        {onDownloadPDF && (
          <button 
            onClick={onDownloadPDF}
            className="text-[9.5px] font-black px-3 py-2 bg-[#0b1320] border border-[#1E293B] hover:border-slate-700 rounded-xl text-slate-200 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Export PDF</span>
          </button>
        )}

        {/* Export CSV */}
        {onDownloadCSV && (
          <button 
            onClick={onDownloadCSV}
            className="text-[9.5px] font-black px-3 py-2 bg-[#0b1320] border border-[#1E293B] hover:border-slate-700 rounded-xl text-slate-200 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Export CSV</span>
          </button>
        )}

        {/* Create Custom Report */}
        {onCreateCustom && (
          <button 
            onClick={onCreateCustom}
            className="text-[9.5px] font-black px-3 py-2 bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-violet-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Custom Report</span>
          </button>
        )}
      </div>

    </div>
  );
}
