import React, { useState } from 'react';
import { 
  LineChart,
  Line,
  XAxis,
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  CircleDollarSign, 
  ShieldCheck, 
  Award, 
  SlidersHorizontal, 
  FileText, 
  Download, 
  Sparkles, 
  Calendar, 
  ChevronDown,
  ChevronRight,
  Info,
  Briefcase,
  Wallet,
  FolderOpen
} from 'lucide-react';
import { CompanyLogo } from './DashboardView';

// Portfolio timeline performance chart mock data
const PERFORMANCE_DATA = [
  { date: 'May 11', Portfolio: -1.5, Nifty50: -2.5 },
  { date: 'May 12', Portfolio: 1.0, Nifty50: -0.5 },
  { date: 'May 13', Portfolio: 0.8, Nifty50: -0.8 },
  { date: 'May 14', Portfolio: 1.8, Nifty50: 0.5 },
  { date: 'May 15', Portfolio: 2.2, Nifty50: 0.9 },
  { date: 'May 16', Portfolio: 3.5, Nifty50: 1.2 },
  { date: 'May 17', Portfolio: 4.28, Nifty50: 1.76 }
];

// Allocation Donuts mock data
const ALLOCATION_DATA = [
  { name: 'Equity', value: 68.45, color: '#8b5cf6' }, // Violet
  { name: 'Debt', value: 15.32, color: '#3b82f6' }, // Blue
  { name: 'Mutual Funds', value: 9.45, color: '#10b981' }, // Green
  { name: 'Cash', value: 4.20, color: '#f59e0b' }, // Amber
  { name: 'Gold', value: 2.58, color: '#eab308' } // Yellow
];

const SECTOR_DATA = [
  { name: 'Financial Services', value: 28.5, color: '#8b5cf6' },
  { name: 'IT Services', value: 20.3, color: '#06b6d4' },
  { name: 'Oil & Gas', value: 12.6, color: '#f97316' },
  { name: 'Automobile', value: 8.9, color: '#ef4444' },
  { name: 'Consumer Goods', value: 7.4, color: '#10b981' },
  { name: 'Others', value: 22.3, color: '#64748b' }
];

const COMPANY_LOGOS: Record<string, string> = {
  RELIANCE: 'relianceindustries.com',
  TCS: 'tcs.com',
  HDFCBANK: 'hdfcbank.com',
  ICICIBANK: 'icicibank.com',
  INFY: 'infosys.com',
  AXISBANK: 'axisbank.com',
  SBIN: 'sbi.co.in',
  ITC: 'itcportal.com',
  BHARTIARTL: 'airtel.in',
  LT: 'larsentoubro.com',
};

export default function ReportsView() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [dateRange] = useState('May 11, 2024 - May 17, 2024');
  const [downloading, setDownloading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [contributorTab, setContributorTab] = useState<'Gain' | 'Loss'>('Gain');
  
  // Date timeframe toggle state
  const [timeframe, setTimeframe] = useState('1W');

  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Report downloaded successfully as PDF!');
    }, 1200);
  };

  const handleGenerateAIReport = () => {
    setGeneratingAI(true);
    setTimeout(() => {
      setGeneratingAI(false);
      alert('AI Portfolio Intel Report compiled successfully!\nAdded to "Recent Reports" below.');
    }, 1500);
  };

  // Renders logo dynamically with Google favicon API fallback
  const renderLogo = (logoDomain: string, symbol: string, sizeClass = 'w-5 h-5') => {
    return (
      <CompanyLogo symbol={symbol} className={sizeClass} size="sm" />
    );
  };

  const getLogoDomain = (symbol: string) => {
    return COMPANY_LOGOS[symbol.toUpperCase()] || 'google.com';
  };

  const tabs = ['Overview', 'Performance Reports', 'Portfolio Reports', 'Stock Reports', 'Market Reports', 'Custom Reports'];

  return (
    <div className="space-y-3.5 text-slate-100 animate-fade-in pb-1 select-none">
      
      {/* Header controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Reports</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Comprehensive reports and analytics to track performance and make informed decisions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Selector */}
          <div className="relative">
            <button className="bg-[#0d121f] border border-[#152036] hover:border-slate-700 rounded-xl px-2.5 py-1 text-[10px] text-slate-300 font-bold focus:outline-none flex items-center gap-1.5 transition-all cursor-pointer">
              <Calendar className="w-3 h-3 text-violet-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          {/* Download button */}
          <button 
            onClick={handleDownloadReport}
            disabled={downloading}
            className="text-[10px] font-bold px-2.5 py-1 bg-[#080c14] border border-[#152036] hover:border-slate-700 rounded-xl text-slate-200 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-65 cursor-pointer"
          >
            <Download className="w-3 h-3 text-slate-400" />
            <span>{downloading ? 'Downloading...' : 'Download Report'}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1 text-[10px] font-semibold border-b-2 transition-all relative ${
              activeTab === t
                ? 'border-violet-500 text-violet-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stats counter row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {[
          { label: 'Total Portfolio Value', val: '₹8.72 L Cr', diff: '+1.28%', changeColor: 'text-emerald-400', iconBg: 'bg-violet-950/40 border-violet-850/50 text-violet-400', icon: Briefcase },
          { label: 'Total Gain / Loss', val: '₹1.09 L Cr', diff: '+2.43%', changeColor: 'text-emerald-400', iconBg: 'bg-cyan-950/40 border-cyan-850/50 text-cyan-400', icon: TrendingUp },
          { label: 'Winning Stocks', val: '32 (64%)', diff: '+8', changeColor: 'text-emerald-400', iconBg: 'bg-emerald-950/40 border-emerald-850/50 text-emerald-400', icon: ShieldCheck },
          { label: 'Benchmark (NIFTY 50)', val: '22,517.60', diff: '+0.85%', changeColor: 'text-emerald-400', iconBg: 'bg-blue-950/40 border-blue-850/50 text-blue-400', icon: Award },
          { label: 'Sharpe Ratio', val: '1.28', diff: '+0.12', changeColor: 'text-emerald-400', iconBg: 'bg-amber-950/40 border-amber-850/50 text-amber-400', icon: SlidersHorizontal }
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#0d121f] border border-[#152036] p-2.5 rounded-2xl flex items-center gap-3 h-[68px] transition-all hover:border-slate-800">
              <span className={`p-2 rounded-xl border ${s.iconBg} flex-shrink-0 flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[7.5px] font-bold text-slate-500 block uppercase tracking-wider leading-none mb-0.5">{s.label}</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-[13px] font-black text-slate-100 leading-none">{s.val}</span>
                  <span className={`text-[8.5px] font-bold ${s.changeColor}`}>{s.diff}</span>
                </div>
                <span className="text-[7.5px] text-slate-500 block mt-0.5 leading-none">vs Apr 27 - May 03</span>
              </div>
            </div>
          );
        })}
      </div>

      {activeTab === 'Overview' ? (
        <>
          {/* 3-COLUMN CORE ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            
            {/* Portfolio Performance (6 Cols) */}
            <div className="lg:col-span-6 card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl flex flex-col justify-between h-[280px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Portfolio Performance</h3>
                  <Info className="w-3 h-3 text-slate-550 cursor-pointer" />
                </div>
                
                {/* Timeframes */}
                <div className="flex bg-[#080c14] border border-[#152036] rounded-lg p-0.5">
                  {['1D', '1W', '1M', '3M', '1Y', 'YTD', 'ALL'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2 py-0.5 rounded-md text-[8.5px] font-extrabold transition-all cursor-pointer ${
                        timeframe === tf 
                          ? 'bg-violet-650 text-white shadow' 
                          : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart container */}
              <div className="h-[185px] w-full relative mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#152036" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={8} tickLine={false} axisLine={false} unit="%" domain={[-5, 5]} ticks={[-5, -3, -1, 1, 3, 5]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#152036', borderRadius: '10px', padding: '6px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '8px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#f8fafc', fontSize: '9px', padding: '1px 0' }}
                    />
                    <Line type="monotone" dataKey="Portfolio" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} name="Portfolio" />
                    <Line type="monotone" dataKey="Nifty50" stroke="#06b6d4" strokeWidth={1.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} name="NIFTY 50" />
                  </LineChart>
                </ResponsiveContainer>

                {/* Floating Date Tooltip Marker matching mockup style */}
                <div className="absolute right-6 bottom-4 bg-[#090d16]/95 border border-[#152036] rounded-xl p-2 text-[8px] pointer-events-none select-none shadow-lg">
                  <span className="font-extrabold text-slate-300 block border-b border-[#152036] pb-1 mb-1 leading-none">May 17, 2024</span>
                  <span className="flex justify-between items-center gap-3">
                    <span className="text-slate-500 font-semibold">Portfolio:</span>
                    <span className="font-black text-violet-400">+4.28%</span>
                  </span>
                  <span className="flex justify-between items-center gap-3 mt-0.5">
                    <span className="text-slate-500 font-semibold">NIFTY 50:</span>
                    <span className="font-black text-cyan-400">+1.76%</span>
                  </span>
                </div>
              </div>

              {/* Legend & Summary values */}
              <div className="flex gap-4 border-t border-slate-850 pt-2 text-[9px] select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Portfolio</span>
                  <span className="font-bold text-violet-400">+4.28%</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-slate-850 pl-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">NIFTY 50</span>
                  <span className="font-bold text-cyan-400">+1.76%</span>
                </div>
              </div>
            </div>

            {/* Performance Summary (3 Cols) */}
            <div className="lg:col-span-3 card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl flex flex-col justify-between h-[280px]">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Performance Summary</h3>
                <Info className="w-3 h-3 text-slate-550 cursor-pointer" />
              </div>
              
              <div className="flex-1 mt-2.5 space-y-1.5 text-[9.5px]">
                {[
                  { label: 'Total Return', val: '+4.28%', isGreen: true },
                  { label: 'Absolute Return', val: '+₹1.09 L Cr', isGreen: true },
                  { label: 'Alpha', val: '+2.52%', isGreen: true },
                  { label: 'Beta', val: '0.86', isGreen: false },
                  { label: 'Max Drawdown', val: '-2.13%', isGreen: false, isRed: true },
                  { label: 'Volatility', val: '12.34%', isGreen: false },
                  { label: 'Sortino Ratio', val: '1.68', isGreen: false },
                  { label: 'Information Ratio', val: '1.32', isGreen: false }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-0.5 border-b border-slate-850/60 last:border-0">
                    <span className="text-slate-400 font-semibold">{item.label}</span>
                    <span className={`font-bold ${item.isGreen ? 'text-emerald-500' : item.isRed ? 'text-rose-500' : 'text-slate-200'}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors (3 Cols) */}
            <div className="lg:col-span-3 card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl flex flex-col justify-between h-[280px]">
              <div className="flex items-center justify-between border-b border-slate-850/80 pb-1.5">
                <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Top Contributors</h3>
                
                {/* Gain/Loss selector */}
                <div className="flex bg-[#080c14] border border-[#152036] p-0.5 rounded-lg">
                  {['Gain', 'Loss'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setContributorTab(type as any)}
                      className={`px-2 py-0.5 rounded-md text-[7.5px] font-extrabold transition-all cursor-pointer ${
                        contributorTab === type 
                          ? 'bg-violet-650 text-white shadow' 
                          : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {type === 'Gain' ? 'By Gain' : 'By Loss'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contributors lists */}
              <div className="flex-1 my-2.5 space-y-1.5 overflow-hidden">
                {contributorTab === 'Gain' ? (
                  [
                    { name: 'RELIANCE', val: '+4.15%', absVal: '₹25,430.50', color: 'bg-emerald-500' },
                    { name: 'TCS', val: '+2.85%', absVal: '₹15,320.75', color: 'bg-emerald-500' },
                    { name: 'HDFCBANK', val: '+2.45%', absVal: '₹12,550.40', color: 'bg-emerald-500' },
                    { name: 'ICICIBANK', val: '+2.15%', absVal: '₹9,875.30', color: 'bg-emerald-500' },
                    { name: 'INFY', val: '+1.85%', absVal: '₹5,540.20', color: 'bg-emerald-500' }
                  ].map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-[9px] bg-[#080c14]/40 p-1 rounded-xl border border-transparent hover:border-[#152036] transition-all">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {renderLogo(getLogoDomain(c.name), c.name, 'w-4 h-4')}
                        <span className="font-extrabold text-slate-300 truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-400 font-semibold text-[8px]">{c.absVal}</span>
                        <div className="w-8 h-1 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                          <div className={`${c.color} h-full`} style={{ width: parseFloat(c.val) * 20 + '%' }} />
                        </div>
                        <span className="font-extrabold text-emerald-500 w-10 text-right text-[8.5px]">{c.val}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  [
                    { name: 'AXISBANK', val: '-1.45%', absVal: '₹8,450.20', color: 'bg-rose-500' },
                    { name: 'SBIN', val: '-1.12%', absVal: '₹6,120.30', color: 'bg-rose-500' },
                    { name: 'ITC', val: '-0.85%', absVal: '₹4,310.45', color: 'bg-rose-500' },
                    { name: 'BHARTIARTL', val: '-0.42%', absVal: '₹2,110.50', color: 'bg-rose-500' },
                    { name: 'LT', val: '-0.21%', absVal: '₹1,540.10', color: 'bg-rose-500' }
                  ].map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-[9px] bg-[#080c14]/40 p-1 rounded-xl border border-transparent hover:border-[#152036] transition-all">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {renderLogo(getLogoDomain(c.name), c.name, 'w-4 h-4')}
                        <span className="font-extrabold text-slate-300 truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-400 font-semibold text-[8px]">{c.absVal}</span>
                        <div className="w-8 h-1 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                          <div className={`${c.color} h-full`} style={{ width: Math.abs(parseFloat(c.val)) * 30 + '%' }} />
                        </div>
                        <span className="font-extrabold text-rose-500 w-10 text-right text-[8.5px]">{c.val}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button className="w-full text-center text-[8.5px] font-bold text-violet-400 hover:text-violet-300 border-t border-slate-850 pt-2 flex items-center justify-center gap-0.5 hover:underline cursor-pointer">
                View All Contributors <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>

          </div>

          {/* DUAL DONUT CHARTS PANEL & DIRECTORIES (Row 2 - 4 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
            
            {/* Asset Allocation Donut */}
            <div className="card p-3 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl flex flex-col justify-between h-[180px]">
              <h4 className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Asset Allocation</h4>
              
              <div className="flex items-center justify-between gap-1 h-[115px]">
                {/* Recharts Pie Chart */}
                <div className="w-[85px] h-[85px] flex-shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ALLOCATION_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={24}
                        outerRadius={36}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {ALLOCATION_DATA.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Centered Total */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="text-[5px] font-bold text-slate-500 uppercase leading-none">Total</span>
                    <span className="text-[8px] font-black text-slate-100 mt-0.5 leading-none">₹8.72L</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 space-y-1 pl-1">
                  {ALLOCATION_DATA.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate max-w-[45px]">{item.name}</span>
                      </span>
                      <span className="text-slate-200 font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full text-center text-[8.5px] font-bold text-violet-400 hover:text-violet-300 border-t border-slate-850 pt-1.5 flex items-center justify-center gap-0.5 hover:underline cursor-pointer">
                View Detailed Allocation <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Sector Distribution Donut */}
            <div className="card p-3 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl flex flex-col justify-between h-[180px]">
              <h4 className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Sector Distribution</h4>
              
              <div className="flex items-center justify-between gap-1 h-[115px]">
                <div className="w-[85px] h-[85px] flex-shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={SECTOR_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={24}
                        outerRadius={36}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {SECTOR_DATA.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="text-[5px] font-bold text-slate-500 uppercase leading-none">Total</span>
                    <span className="text-[8px] font-black text-slate-100 mt-0.5 leading-none">₹8.72L</span>
                  </div>
                </div>

                <div className="flex-1 space-y-0.5 pl-1 overflow-y-auto max-h-[110px] scrollbar-none">
                  {SECTOR_DATA.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-[8.5px]">
                      <span className="text-slate-400 font-semibold flex items-center gap-1 min-w-0">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate max-w-[50px]">{item.name}</span>
                      </span>
                      <span className="text-slate-200 font-bold flex-shrink-0">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full text-center text-[8.5px] font-bold text-violet-400 hover:text-violet-300 border-t border-slate-850 pt-1.5 flex items-center justify-center gap-0.5 hover:underline cursor-pointer">
                View Detailed Analysis <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* REPORTS BREAKDOWN */}
            <div className="card p-3 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl flex flex-col justify-between h-[180px]">
              <h3 className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Reports Breakdown</h3>
              
              <div className="flex-1 my-1.5 space-y-1 text-[9px] overflow-hidden">
                {[
                  { label: 'Performance Reports', count: 12, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
                  { label: 'Portfolio Reports', count: 8, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                  { label: 'Stock Reports', count: 25, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'Market Reports', count: 10, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
                  { label: 'Custom Reports', count: 3, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center justify-between py-0.5 border-b border-slate-850 last:border-0 hover:text-white transition-colors group cursor-pointer">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 truncate">
                      <span className={`p-0.5 rounded ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <FolderOpen className="w-2.5 h-2.5" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="text-slate-300 font-bold bg-[#080c14] border border-[#152036] px-1 py-0.5 rounded-md text-[7.5px] flex-shrink-0">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>

              <button className="w-full text-center text-[8.5px] font-bold text-violet-400 hover:text-violet-300 border-t border-slate-850 pt-1.5 flex items-center justify-center gap-0.5 hover:underline cursor-pointer">
                View All Reports <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* RECENT REPORTS */}
            <div className="card p-3 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl flex flex-col justify-between h-[180px]">
              <h3 className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Recent Reports</h3>
              
              <div className="flex-1 my-1.5 space-y-1 text-[9px] overflow-hidden">
                {[
                  { label: 'Weekly Portfolio Report', date: 'May 17, 2024' },
                  { label: 'Top Gainers & Losers Report', date: 'May 17, 2024' },
                  { label: 'Sector Performance Report', date: 'May 16, 2024' },
                  { label: 'Dividend Stocks Report', date: 'May 15, 2024' },
                  { label: 'Market Overview Report', date: 'May 15, 2024' }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-0.5 border-b border-slate-850 last:border-0">
                    <div className="truncate pr-1">
                      <span className="text-slate-200 font-bold block truncate text-[8.5px]">{item.label}</span>
                      <span className="text-[7px] text-slate-500 block mt-0.5 leading-none">{item.date}</span>
                    </div>
                    <button 
                      onClick={handleDownloadReport}
                      className="p-1 rounded bg-[#080c14] border border-[#152036] hover:border-slate-700 text-violet-400 hover:text-violet-350 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleDownloadReport}
                className="w-full text-center text-[8.5px] font-bold text-violet-400 hover:text-violet-300 border-t border-slate-850 pt-1.5 flex items-center justify-center gap-0.5 hover:underline cursor-pointer"
              >
                View All Reports <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>

          </div>

          {/* AI INSIGHTS SUMMARY FOOTER CARD - FULL WIDTH */}
          <div className="bg-gradient-to-r from-violet-950/20 to-indigo-950/20 border border-violet-900/30 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md shadow-violet-950/10">
            <div className="flex gap-3 items-center min-w-0">
              <span className="text-sm bg-violet-600/10 border border-violet-500/30 p-2 rounded-xl text-violet-400 flex-shrink-0 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              </span>
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold text-slate-200">AI Insights Summary</h4>
                <p className="text-[9px] text-slate-400 leading-normal mt-0.5 truncate max-w-[650px] xl:max-w-[850px]">
                  Your portfolio is outperforming NIFTY 50 by <strong className="text-violet-400 font-bold">2.52%</strong> this week. Financial Services and IT sectors are the top performers.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateAIReport}
              disabled={generatingAI}
              className="text-[9.5px] font-bold px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow shadow-violet-500/15 flex items-center gap-1.5 disabled:opacity-75 flex-shrink-0 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-white" />
              <span>{generatingAI ? 'Compiling AI Intel...' : 'Generate AI Report'}</span>
            </button>
          </div>
        </>
      ) : (
        <div className="card p-12 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl text-center">
          <span className="text-2xl">📄</span>
          <h3 className="text-sm font-bold text-slate-200 mt-2">{activeTab} Ledger</h3>
          <p className="text-xs text-slate-500 mt-1">This sub-report repository is compiled. Trigger data pipelines above for exports.</p>
        </div>
      )}

    </div>
  );
}
