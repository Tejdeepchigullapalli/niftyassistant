import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Portfolio timeline performance chart mock data
const PERFORMANCE_DATA = [
  { date: 'May 11', Portfolio: 1.0, Nifty50: 1.0 },
  { date: 'May 12', Portfolio: 1.5, Nifty50: 1.1 },
  { date: 'May 13', Portfolio: 1.2, Nifty50: 0.95 },
  { date: 'May 14', Portfolio: 2.1, Nifty50: 1.4 },
  { date: 'May 15', Portfolio: 2.8, Nifty50: 1.55 },
  { date: 'May 16', Portfolio: 3.6, Nifty50: 1.65 },
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

export default function ReportsView() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [dateRange, setDateRange] = useState('May 11, 2024 - May 17, 2024');
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
    }, 1500);
  };

  const handleGenerateAIReport = () => {
    setGeneratingAI(true);
    setTimeout(() => {
      setGeneratingAI(false);
      alert('AI Portfolio Intel Report compiled successfully!\nAdded to "Recent Reports" below.');
    }, 2000);
  };

  const tabs = ['Overview', 'Performance Reports', 'Portfolio Reports', 'Stock Reports', 'Market Reports', 'Custom Reports'];

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      
      {/* Header controls row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Reports</h2>
          <p className="text-xs text-slate-400 mt-1">Comprehensive reports and analytics to track performance and make informed decisions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Selector */}
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#0d121f] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none"
          >
            <option>May 11, 2024 - May 17, 2024</option>
            <option>May 04, 2024 - May 10, 2024</option>
            <option>April 2024 (Monthly)</option>
          </select>

          {/* Download button */}
          <button 
            onClick={handleDownloadReport}
            disabled={downloading}
            className="text-xs font-bold px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-200 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-65"
          >
            📥 {downloading ? 'Downloading...' : 'Download Report'}
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto whitespace-nowrap pb-0.5 select-none scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all relative ${
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Portfolio Value', val: '₹8.72 L Cr', diff: '+1.28%', color: 'text-violet-400' },
          { label: 'Total Gain / Loss', val: '₹1.09 L Cr', diff: '+2.43%', color: 'text-emerald-400' },
          { label: 'Winning Stocks', val: '32 (64%)', diff: '+8 stocks', color: 'text-emerald-500' },
          { label: 'Benchmark (NIFTY 50)', val: '22,517.60', diff: '+0.85%', color: 'text-cyan-400' },
          { label: 'Sharpe Ratio', val: '1.28', diff: '+0.12', color: 'text-amber-400' }
        ].map((s) => (
          <div key={s.label} className="bg-[#0d121f] border border-[#1f293d] p-3.5 rounded-2xl">
            <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">{s.label}</span>
            <span className="text-base font-extrabold text-slate-100 block mt-1">{s.val}</span>
            <span className={`text-[8px] font-bold block mt-0.5 ${s.color}`}>
              {s.diff} <span className="text-slate-500 font-medium">vs last week</span>
            </span>
          </div>
        ))}
      </div>

      {activeTab === 'Overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* MAIN GRAPH & CHARTS COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* PORTFOLIO PERFORMANCE CHART */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Portfolio Performance</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Asset returns matched against the market index benchmark</p>
                </div>
                
                {/* Timeframes */}
                <div className="flex bg-[#080c14] border border-[#1f293d] rounded-xl p-0.5">
                  {['1D', '1W', '1M', '3M', '1Y', 'YTD', 'ALL'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2 py-1 rounded-lg text-[9px] font-extrabold transition-all ${
                        timeframe === tf 
                          ? 'bg-violet-600 text-white shadow' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend & Summary values */}
              <div className="flex gap-4 border-t border-slate-850 pt-3 text-[10px] select-none">
                <div>
                  <span className="text-slate-500 font-semibold block uppercase">Portfolio Yield</span>
                  <span className="font-extrabold text-violet-400 text-xs mt-0.5">+4.28%</span>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-slate-500 font-semibold block uppercase">NIFTY 50 Yield</span>
                  <span className="font-extrabold text-cyan-400 text-xs mt-0.5">+1.76%</span>
                </div>
              </div>

              {/* Chart container */}
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorNifty" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} unit="%" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f293d', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#f8fafc', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="Portfolio" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorPortfolio)" name="Portfolio" />
                    <Area type="monotone" dataKey="Nifty50" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorNifty)" name="NIFTY 50" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DUAL DONUT CHARTS PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Asset Allocation Donut */}
              <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Asset Allocation</h4>
                
                <div className="flex items-center justify-between gap-2 h-[130px]">
                  {/* Recharts Pie Chart */}
                  <div className="w-[120px] h-[120px] flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ALLOCATION_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={50}
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[7px] font-bold text-slate-500 uppercase">Total Value</span>
                      <span className="text-[10px] font-bold text-slate-100">₹8.72 L Cr</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 space-y-1.5 pl-3">
                    {ALLOCATION_DATA.map((item) => (
                      <div key={item.name} className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </span>
                        <span className="text-slate-200 font-bold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full text-center text-[9px] font-bold text-violet-400 hover:text-violet-300 border-t border-slate-850 pt-2.5">
                  View Detailed Allocation ➔
                </button>
              </div>

              {/* Sector Distribution Donut */}
              <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sector Distribution</h4>
                
                <div className="flex items-center justify-between gap-2 h-[130px]">
                  <div className="w-[120px] h-[120px] flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={SECTOR_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={50}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {SECTOR_DATA.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[7px] font-bold text-slate-500 uppercase">Sectors</span>
                      <span className="text-[10px] font-bold text-slate-100">12 Covered</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5 pl-3 overflow-y-auto max-h-[125px] scrollbar-none">
                    {SECTOR_DATA.map((item) => (
                      <div key={item.name} className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-semibold flex items-center gap-1.5 truncate max-w-[85px]">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </span>
                        <span className="text-slate-200 font-bold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full text-center text-[9px] font-bold text-violet-400 hover:text-violet-300 border-t border-slate-850 pt-2.5">
                  View Detailed Analysis ➔
                </button>
              </div>

            </div>

            {/* AI INSIGHTS SUMMARY */}
            <div className="bg-gradient-to-r from-violet-950/20 to-indigo-950/20 border border-violet-900/30 p-4 rounded-2xl flex gap-3.5 items-start">
              <span className="text-lg bg-violet-600/10 border border-violet-500/30 p-2 rounded-xl text-violet-400">✨</span>
              <div>
                <h4 className="text-xs font-bold text-slate-200">AI Insights Summary</h4>
                <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                  Your portfolio is outperforming the NIFTY 50 by <strong className="text-violet-400 font-bold">2.52%</strong> this week. Financial Services and IT sectors are your top-performing allocations, driven by strong quarterly results from Reliance Industries and Tata Consultancy Services.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR STATS & DIRECTORIES */}
          <div className="space-y-6">
            
            {/* PERFORMANCE SUMMARY STATS */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Performance Summary</h3>
              
              <div className="space-y-2 text-[10.5px]">
                {[
                  { label: 'Total Return', val: '+4.28%', isGreen: true },
                  { label: 'Absolute Return', val: '+₹1.09 L Cr', isGreen: true },
                  { label: 'Alpha', val: '+2.52%', isGreen: true },
                  { label: 'Beta', val: '0.86', isGreen: false },
                  { label: 'Max Drawdown', val: '-2.13%', isGreen: false },
                  { label: 'Volatility', val: '12.34%', isGreen: false },
                  { label: 'Sortino Ratio', val: '1.68', isGreen: false },
                  { label: 'Information Ratio', val: '1.32', isGreen: false }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-850 last:border-0">
                    <span className="text-slate-400 font-semibold">{item.label}</span>
                    <span className={`font-bold ${item.isGreen ? 'text-emerald-500' : 'text-slate-200'}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP CONTRIBUTORS */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Contributors</h3>
                
                {/* Gain/Loss selector */}
                <div className="flex bg-[#080c14] border border-[#1f293d] p-0.5 rounded-lg">
                  {['Gain', 'Loss'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setContributorTab(type as any)}
                      className={`px-2 py-0.5 rounded-md text-[8px] font-bold transition-all ${
                        contributorTab === type 
                          ? 'bg-violet-600 text-white' 
                          : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {type === 'Gain' ? 'By Gain' : 'By Loss'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contributors lists */}
              <div className="space-y-2">
                {contributorTab === 'Gain' ? (
                  [
                    { name: 'RELIANCE', val: '+4.15%', color: 'bg-emerald-500' },
                    { name: 'TCS', val: '+2.85%', color: 'bg-emerald-500' },
                    { name: 'HDFCBANK', val: '+2.45%', color: 'bg-emerald-500' },
                    { name: 'ICICIBANK', val: '+2.15%', color: 'bg-emerald-500' },
                    { name: 'INFY', val: '+1.85%', color: 'bg-emerald-500' }
                  ].map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-[10px] bg-slate-950/20 p-2 rounded-xl">
                      <span className="font-bold text-slate-300">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className={`${c.color} h-full`} style={{ width: parseFloat(c.val) * 20 + '%' }} />
                        </div>
                        <span className="font-bold text-emerald-500">{c.val}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  [
                    { name: 'AXISBANK', val: '-1.45%', color: 'bg-rose-500' },
                    { name: 'SBIN', val: '-1.12%', color: 'bg-rose-500' },
                    { name: 'ITC', val: '-0.85%', color: 'bg-rose-500' },
                    { name: 'BHARTIARTL', val: '-0.42%', color: 'bg-rose-500' },
                    { name: 'LT', val: '-0.21%', color: 'bg-rose-500' }
                  ].map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-[10px] bg-slate-950/20 p-2 rounded-xl">
                      <span className="font-bold text-slate-300">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className={`${c.color} h-full`} style={{ width: Math.abs(parseFloat(c.val)) * 30 + '%' }} />
                        </div>
                        <span className="font-bold text-rose-500">{c.val}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button className="w-full text-center text-[9px] font-bold text-violet-400 hover:text-violet-300">
                View All Contributors ➔
              </button>
            </div>

            {/* REPORTS BREAKDOWN */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Reports Breakdown</h3>
              
              <div className="space-y-1 text-[10px]">
                {[
                  { label: 'Performance Reports', count: 12 },
                  { label: 'Portfolio Reports', count: 8 },
                  { label: 'Stock Reports', count: 25 },
                  { label: 'Market Reports', count: 10 },
                  { label: 'Custom Reports', count: 3 }
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center justify-between py-2 border-b border-slate-850 hover:text-white transition-colors">
                    <span className="text-slate-400 font-semibold">{item.label}</span>
                    <span className="text-slate-300 font-bold bg-[#080c14] border border-slate-850 px-2 py-0.5 rounded-lg">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>

              <button className="w-full text-center text-[9px] font-bold text-violet-400 hover:text-violet-300 pt-2">
                View All Reports ➔
              </button>
            </div>

            {/* RECENT REPORTS */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Recent Reports</h3>
              
              <div className="space-y-2 text-[10px]">
                {[
                  { label: 'Weekly Portfolio Report', date: 'May 17, 2024' },
                  { label: 'Top Gainers & Losers Report', date: 'May 17, 2024' },
                  { label: 'Sector Performance Report', date: 'May 16, 2024' },
                  { label: 'Dividend Stocks Report', date: 'May 15, 2024' },
                  { label: 'Market Overview Report', date: 'May 15, 2024' }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-850 last:border-0">
                    <div>
                      <span className="text-slate-200 font-bold block">{item.label}</span>
                      <span className="text-[8px] text-slate-500 block">{item.date}</span>
                    </div>
                    <button 
                      onClick={handleDownloadReport}
                      className="p-1 rounded bg-slate-950 border border-slate-850 hover:border-slate-700 text-violet-400 hover:text-violet-350 transition-colors"
                      title="Download PDF"
                    >
                      📥
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleDownloadReport}
                className="w-full text-center text-[9px] font-bold text-violet-400 hover:text-violet-300 pt-1"
              >
                View All Reports ➔
              </button>
            </div>

            {/* GENERATE AI REPORT */}
            <button
              onClick={handleGenerateAIReport}
              disabled={generatingAI}
              className="w-full text-center text-xs font-bold bg-violet-600 hover:bg-violet-500 py-3 rounded-xl shadow shadow-violet-500/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-75"
            >
              ✨ {generatingAI ? 'Compiling AI Analytics...' : 'Generate AI Report'}
            </button>

          </div>

        </div>
      ) : (
        <div className="card p-12 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl text-center">
          <span className="text-3xl">📄</span>
          <h3 className="text-sm font-bold text-slate-200 mt-3">{activeTab} Ledger</h3>
          <p className="text-xs text-slate-500 mt-1">This sub-report repository is compiled. Trigger data pipelines above for exports.</p>
        </div>
      )}

    </div>
  );
}
