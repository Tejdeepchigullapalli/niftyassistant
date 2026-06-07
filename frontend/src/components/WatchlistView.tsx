import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine } from 'recharts';

// Mock performance data (1W trend line)
const WATCHLIST_PERF_DATA = [
  { date: 'May 11', value: 2.10 },
  { date: 'May 12', value: 2.12 },
  { date: 'May 13', value: 2.08 },
  { date: 'May 14', value: 2.18 },
  { date: 'May 15', value: 2.24 },
  { date: 'May 16', value: 2.29 },
  { date: 'May 17', value: 2.31 }
];

// Sector Allocation data
const SECTOR_ALLOCATION = [
  { name: 'Financial Services', value: 38.5, color: '#8b5cf6' },
  { name: 'IT Services', value: 22.7, color: '#06b6d4' },
  { name: 'Energy', value: 12.8, color: '#f97316' },
  { name: 'Cement', value: 9.6, color: '#ef4444' },
  { name: 'Telecom', value: 7.8, color: '#ec4899' },
  { name: 'Others', value: 8.6, color: '#64748b' }
];

// P&L Trend (Daily bar charts)
const PL_TREND_DATA = [
  { day: 'Apr 25', pl: 1200 },
  { day: 'Apr 28', pl: -3400 },
  { day: 'Apr 29', pl: 4500 },
  { day: 'May 02', pl: 2100 },
  { day: 'May 05', pl: -1200 },
  { day: 'May 09', pl: 6800 },
  { day: 'May 12', pl: -1900 },
  { day: 'May 16', pl: 5800 },
  { day: 'May 17', pl: 12745 }
];

// Watchlist Items
const INITIAL_WATCHLIST = [
  { symbol: 'RELIANCE', name: 'RELIANCE Industries Ltd.', price: 2936.12, change: 45.75, changePct: 1.58, volume: '1.24 Cr', marketCap: '18.45 L Cr', low52w: 2455.88, high52w: 3468.54, lowDay: 2905.00, highDay: 2945.40, isGainer: true, logo: 'relianceindustries.com' },
  { symbol: 'TCS', name: 'TATA Consultancy Services', price: 3915.20, change: 33.10, changePct: 0.85, volume: '56.78 L', marketCap: '14.19 L Cr', low52w: 3297.65, high52w: 4399.00, lowDay: 3885.00, highDay: 3930.00, isGainer: true, logo: 'tcs.com' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1682.40, change: -7.65, changePct: -0.45, volume: '89.32 L', marketCap: '12.89 L Cr', low52w: 1250.10, high52w: 1747.20, lowDay: 1670.50, highDay: 1695.20, isGainer: false, logo: 'hdfcbank.com' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1285.90, change: 14.10, changePct: 1.10, volume: '1.03 Cr', marketCap: '8.79 L Cr', low52w: 944.50, high52w: 1343.55, lowDay: 1270.00, highDay: 1295.80, isGainer: true, logo: 'icicibank.com' },
  { symbol: 'INFY', name: 'Infosys Ltd.', price: 1468.75, change: 13.85, changePct: 0.95, volume: '44.67 L', marketCap: '6.07 L Cr', low52w: 1250.30, high52w: 1589.00, lowDay: 1452.00, highDay: 1475.90, isGainer: true, logo: 'infosys.com' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 812.40, change: 4.98, changePct: 0.62, volume: '2.21 Cr', marketCap: '7.24 L Cr', low52w: 629.35, high52w: 912.45, lowDay: 804.00, highDay: 819.75, isGainer: true, logo: 'sbi.co.in' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', price: 3625.80, change: 62.70, changePct: 1.88, volume: '38.90 L', marketCap: '5.09 L Cr', low52w: 2389.15, high52w: 3742.00, lowDay: 3560.00, highDay: 3640.00, isGainer: true, logo: 'larsentoubro.com' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', price: 1178.95, change: 9.35, changePct: 0.80, volume: '67.81 L', marketCap: '3.67 L Cr', low52w: 909.10, high52w: 1272.00, lowDay: 1166.00, highDay: 1186.50, isGainer: true, logo: 'axisbank.com' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1541.35, change: 32.40, changePct: 2.15, volume: '92.45 L', marketCap: '2.10 L Cr', low52w: 1032.20, high52w: 1612.00, lowDay: 1509.00, highDay: 1553.20, isGainer: true, logo: 'airtel.in' },
  { symbol: 'ITC', name: 'ITC Ltd.', price: 476.80, change: 2.60, changePct: 0.55, volume: '1.12 Cr', marketCap: '5.94 L Cr', low52w: 389.50, high52w: 488.90, lowDay: 471.30, highDay: 479.90, isGainer: true, logo: 'itcportal.com' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', price: 11478.50, change: 156.25, changePct: 1.38, volume: '18.90 L', marketCap: '3.39 L Cr', low52w: 8162.70, high52w: 11965.00, lowDay: 11350.00, highDay: 11560.00, isGainer: true, logo: 'ultratechcement.com' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', price: 1367.20, change: -12.45, changePct: -0.90, volume: '76.21 L', marketCap: '2.97 L Cr', low52w: 1013.35, high52w: 1512.00, lowDay: 1355.00, highDay: 1377.20, isGainer: false, logo: 'adaniports.com' }
];

export default function WatchlistView() {
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);
  const [activeTab, setActiveTab] = useState('My Watchlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('changePct');
  const [sortAsc, setSortAsc] = useState(false);
  const [moversTab, setMoversTab] = useState<'Gainers' | 'Losers' | 'Value'>('Gainers');

  // Modal settings for adding stock
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSymbol, setAddSymbol] = useState('BEL');
  const [addName, setAddName] = useState('Bharat Electronics Ltd.');
  const [addPrice, setAddPrice] = useState('285');

  const handleRemove = (symbol: string) => {
    setWatchlist(watchlist.filter(w => w.symbol !== symbol));
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSymbol || !addPrice) return;
    
    const pr = parseFloat(addPrice) || 100;
    const newStock = {
      symbol: addSymbol.toUpperCase().trim(),
      name: addName,
      price: pr,
      change: parseFloat((Math.random() * 8 - 4).toFixed(2)),
      changePct: parseFloat((Math.random() * 3 - 1.5).toFixed(2)),
      volume: '45.10 L',
      marketCap: '1.20 L Cr',
      low52w: pr * 0.8,
      high52w: pr * 1.25,
      lowDay: pr * 0.98,
      highDay: pr * 1.02,
      isGainer: Math.random() > 0.4,
      logo: `${addSymbol.toLowerCase()}.com`
    };

    setWatchlist([...watchlist, newStock]);
    setShowAddModal(false);
    setAddPrice('');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Renders domain favicons with fallbacks
  const renderLogo = (logoDomain: string, symbol: string) => {
    const fallbackUrl = `https://www.google.com/s2/favicons?sz=128&domain=${logoDomain}`;
    return (
      <img
        src={`https://logo.clearbit.com/${logoDomain}`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackUrl;
        }}
        className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 object-contain p-0.5"
        alt={symbol}
      />
    );
  };

  // Sort and filter logic
  const filteredList = watchlist
    .filter(w => {
      const term = searchQuery.toLowerCase();
      return w.symbol.toLowerCase().includes(term) || w.name.toLowerCase().includes(term);
    })
    .sort((a: any, b: any) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

  // Movers lists
  const moversGainers = [...watchlist].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
  const moversLosers = [...watchlist].sort((a, b) => a.changePct - b.changePct).slice(0, 5);
  const moversVal = [...watchlist].sort((a, b) => {
    const aCap = parseFloat(a.marketCap.replace(/[^0-9.]/g, '')) || 0;
    const bCap = parseFloat(b.marketCap.replace(/[^0-9.]/g, '')) || 0;
    return bCap - aCap;
  }).slice(0, 5);

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in relative">
      
      {/* Watchlist Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            ⭐ Watchlist <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20">Indian Market</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Track your favorite stocks and market movers in one place.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Header Indicators */}
          <div className="flex gap-4 bg-slate-950/40 border border-slate-850 p-2.5 rounded-2xl text-[10px] hidden sm:flex select-none mr-2">
            <div>
              <span className="text-slate-500 font-semibold block uppercase">Stocks</span>
              <span className="font-extrabold text-slate-200 text-xs mt-0.5">{watchlist.length}</span>
            </div>
            <div className="border-l border-slate-850 pl-3">
              <span className="text-slate-500 font-semibold block uppercase">Total Value</span>
              <span className="font-extrabold text-slate-200 text-xs mt-0.5">₹2,14,560.35</span>
            </div>
            <div className="border-l border-slate-850 pl-3">
              <span className="text-slate-500 font-semibold block uppercase">Today's P&L</span>
              <span className="font-extrabold text-emerald-400 text-xs mt-0.5">+₹4,852.45 (+2.31%)</span>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white shadow shadow-violet-500/10 transition-all"
          >
            ➕ Add Stock
          </button>
          
          <button
            onClick={() => alert('Importing watchlist from CSV...')}
            className="text-xs font-bold px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 transition-all"
          >
            📥 Import Watchlist
          </button>
        </div>
      </div>

      {/* Categories sub menu */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto whitespace-nowrap pb-0.5 select-none scrollbar-none">
        {['My Watchlist', 'Indices Watchlist', 'Custom Watchlists'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all relative ${
              activeTab === tab
                ? 'border-violet-500 text-violet-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        
        {/* LEFT/MAIN WATCHLIST TABLE (Colspan 3) */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-4">
          
          {/* Table filters panel */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d121f] border border-[#1f293d] p-3 rounded-2xl">
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <select className="bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-300 font-bold focus:outline-none">
                <option>All Stocks ({watchlist.length})</option>
                <option>Gainers</option>
                <option>Losers</option>
              </select>
              
              <div className="flex items-center bg-[#080c14] border border-[#1f293d] p-0.5 rounded-xl">
                <button className="px-2 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800">📊</button>
                <button className="px-2 py-1 rounded-lg text-xs text-slate-500">📝</button>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  placeholder="Search in watchlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#080c14] border border-[#1f293d] rounded-xl py-1.5 pl-3 pr-8 text-[11px] text-slate-200 focus:outline-none focus:border-violet-500 w-full"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500">🔍</span>
              </div>

              <button className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-3.5 py-1.5 rounded-xl hover:border-slate-700">Columns</button>
              <button className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-3.5 py-1.5 rounded-xl hover:border-slate-700">Filters</button>
            </div>
          </div>

          {/* STOCKS TABLE */}
          <div className="card bg-[#0d121f] border border-[#1f293d] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 font-bold bg-[#0d121f] uppercase tracking-wider text-[9px] select-none">
                    <th className="py-3 px-4 w-8 text-center">#</th>
                    <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>Company</th>
                    <th className="py-3 px-3 cursor-pointer text-right hover:text-white" onClick={() => handleSort('price')}>Price (₹)</th>
                    <th className="py-3 px-3 cursor-pointer text-right hover:text-white" onClick={() => handleSort('change')}>Change</th>
                    <th className="py-3 px-3 cursor-pointer text-right hover:text-white" onClick={() => handleSort('changePct')}>Change %</th>
                    <th className="py-3 px-3 text-right">Volume</th>
                    <th className="py-3 px-3 text-right">Market Cap</th>
                    <th className="py-3 px-3 text-center w-28">52W High/Low</th>
                    <th className="py-3 px-4 text-center w-36">Day Range</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredList.map((item, idx) => {
                    const pricePosition = ((item.price - item.lowDay) / (item.highDay - item.lowDay)) * 100;
                    return (
                      <tr key={item.symbol} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="py-3.5 px-3 flex items-center gap-2.5">
                          {renderLogo(item.logo, item.symbol)}
                          <div>
                            <span className="font-extrabold text-slate-200 block">{item.symbol}</span>
                            <span className="text-[9px] text-slate-500 block truncate max-w-[110px]">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-200 text-right">
                          {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3.5 px-3 font-bold text-right ${item.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                        </td>
                        <td className={`py-3.5 px-3 font-bold text-right ${item.changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 font-semibold text-right">{item.volume}</td>
                        <td className="py-3.5 px-3 text-slate-400 font-semibold text-right">{item.marketCap}</td>
                        <td className="py-3.5 px-3 text-slate-500 text-center text-[10px] whitespace-nowrap">
                          <span className="text-slate-300 font-bold block">{item.high52w.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          <span className="block text-[9px] mt-0.5">{item.low52w.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </td>
                        
                        {/* Day Range track slider */}
                        <td className="py-3.5 px-4 text-center select-none">
                          <div className="flex items-center justify-between text-[8px] text-slate-500 mb-0.5 font-bold">
                            <span>₹{item.lowDay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            <span>₹{item.highDay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full relative overflow-visible">
                            <div 
                              className="w-1.5 h-1.5 rounded-full bg-violet-400 absolute -top-0.5 border border-slate-900 shadow-md shadow-violet-500/20"
                              style={{ left: `${Math.max(0, Math.min(100, pricePosition))}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => alert(`Setting Alert for ${item.symbol}`)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Set Target Alert"
                          >
                            🔔
                          </button>
                          <button
                            onClick={() => handleRemove(item.symbol)}
                            className="p-1.5 rounded-lg bg-rose-950/15 border border-rose-900/25 hover:border-rose-700 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Remove from Watchlist"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* THREE CHARTS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Watchlist Performance Trend */}
            <div className="card p-4 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Watchlist Performance</h4>
                <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">+2.31% This Week</span>
              </div>
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={WATCHLIST_PERF_DATA} margin={{ top: 5, right: 5, left: -35, bottom: 5 }}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={8} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={8} tickLine={false} domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f293d', borderRadius: '10px', fontSize: '9px' }} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sector Allocation Distribution */}
            <div className="card p-4 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-355 uppercase tracking-wider">Sector Allocation</h4>
              <div className="flex items-center justify-between gap-1 h-[120px]">
                <div className="w-[85px] h-[85px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={SECTOR_ALLOCATION}
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={30}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {SECTOR_ALLOCATION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[110px] pr-1 scrollbar-none text-[8.5px]">
                  {SECTOR_ALLOCATION.map((entry) => (
                    <div key={entry.name} className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold truncate max-w-[65px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        {entry.name}
                      </span>
                      <span className="text-slate-200 font-bold">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* P&L Trend (Bar Chart) */}
            <div className="card p-4 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-355 uppercase tracking-wider">P&L Trend</h4>
                <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">+₹12,745.20 Overall P&L</span>
              </div>
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PL_TREND_DATA} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={8} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={8} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f293d', borderRadius: '10px', fontSize: '9px' }} />
                    <ReferenceLine y={0} stroke="#1f293d" />
                    <Bar dataKey="pl" fill="#8b5cf6">
                      {PL_TREND_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (Colspan 1) */}
        <div className="space-y-6">
          
          {/* WATCHLIST SUMMARY DONUT */}
          <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Watchlist Summary</h3>
            
            <div className="flex items-center justify-around gap-4 bg-slate-950/40 border border-slate-850 p-4 rounded-2xl">
              <div className="text-center">
                <span className="text-[18px] font-black text-emerald-400">75%</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold block mt-0.5">Gainers (9)</span>
              </div>
              <div className="border-l border-slate-850 h-8" />
              <div className="text-center">
                <span className="text-[18px] font-black text-rose-500">16.7%</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold block mt-0.5">Losers (2)</span>
              </div>
              <div className="border-l border-slate-850 h-8" />
              <div className="text-center">
                <span className="text-[18px] font-black text-slate-400">8.3%</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold block mt-0.5">Flat (1)</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                <span className="text-slate-400 font-semibold">Total Value</span>
                <span className="font-bold text-slate-200">₹2,14,560.35</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                <span className="text-slate-400 font-semibold">Today's P&L</span>
                <span className="font-bold text-emerald-400">+₹4,852.45 (+2.31%)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 last:border-0">
                <span className="text-slate-400 font-semibold">Overall P&L</span>
                <span className="font-bold text-emerald-500">+₹12,745.20 (+6.32%)</span>
              </div>
            </div>
          </div>

          {/* TOP MOVERS (TODAY) */}
          <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Movers</h3>
              
              <div className="flex bg-[#080c14] border border-[#1f293d] p-0.5 rounded-lg">
                {['Gainers', 'Losers'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMoversTab(tab as any)}
                    className={`px-2 py-0.5 rounded-md text-[8px] font-bold transition-all ${
                      moversTab === tab 
                        ? 'bg-violet-600 text-white' 
                        : 'text-slate-500 hover:text-slate-350'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {(moversTab === 'Gainers' ? moversGainers : moversLosers).map((m) => (
                <div key={m.symbol} className="flex justify-between items-center bg-slate-950/20 p-2 rounded-xl text-[10px]">
                  <div>
                    <span className="font-bold text-slate-200 block">{m.symbol}</span>
                    <span className="text-[8px] text-slate-500 block truncate max-w-[120px]">{m.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200 block">₹{m.price.toLocaleString('en-IN')}</span>
                    <span className={`text-[8px] font-bold block ${m.changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {m.changePct >= 0 ? '+' : ''}{m.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WATCHLIST ALERTS */}
          <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Watchlist Alerts <span className="text-[9px] text-slate-500 font-semibold">(8)</span></h3>
              <button 
                onClick={() => alert('Routing to Alerts Tab...')}
                className="text-[9px] font-bold text-violet-400 hover:text-violet-300"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {[
                { title: 'HDFC Bank crossed below ₹1,700', time: '1 min ago', desc: 'Alert condition met on value 1,682.40', color: 'border-l-rose-500' },
                { title: 'TCS hit 52W high ₹4,399', time: '10 min ago', desc: 'Alert triggered on daily breakout index', color: 'border-l-emerald-500' },
                { title: 'Reliance above ₹2,900', time: '15 min ago', desc: 'Alert condition met on value 2,936.12', color: 'border-l-emerald-500' },
                { title: 'SBI volume spike detected', time: '28 min ago', desc: 'Volume exceeded moving averages by 2.4x', color: 'border-l-amber-500' }
              ].map((item, idx) => (
                <div key={idx} className={`border-l-2 bg-slate-950/30 p-2.5 rounded-r-xl text-[9px] space-y-0.5 ${item.color}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{item.title}</span>
                    <span className="text-[8px] text-slate-500">{item.time}</span>
                  </div>
                  <p className="text-[8px] text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ADD STOCK DIALOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0d121f] border border-[#1f293d] rounded-2xl p-5 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-xs font-bold text-slate-200">➕ Add Stock to Watchlist</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-300 text-xs font-bold bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddStockSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Stock Code</label>
                <input
                  type="text"
                  placeholder="e.g. BEL"
                  value={addSymbol}
                  onChange={(e) => setAddSymbol(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bharat Electronics Ltd."
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Base Price (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 285"
                  value={addPrice}
                  onChange={(e) => setAddPrice(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="flex gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 text-[10px] font-bold py-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-[10px] font-bold py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
