import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine } from 'recharts';
import { 
  Briefcase, 
  Wallet, 
  TrendingUp, 
  Star, 
  Bell, 
  ChevronRight, 
  Plus, 
  Download, 
  Activity, 
  SlidersHorizontal, 
  Filter,
  MoreVertical,
  Smile
} from 'lucide-react';
import { COMPANIES_METADATA, getCompanyMeta } from '../utils/api';
import { useInvestmentState } from '../context/InvestmentStateContext';
import DynamicWatchlistTable from './DynamicWatchlistTable';
import AlertManagerDialog from './common/AlertManagerDialog';

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

interface WatchlistViewProps {
  quotes?: any[];
  recs?: Record<string, any>;
  onSymbolSelect?: (symbol: string) => void;
  onNavigateToTab?: (tabName: string) => void;
}

export default function WatchlistView({ quotes = [], recs = {}, onSymbolSelect, onNavigateToTab }: WatchlistViewProps) {
  const { getWatchlistSymbols, getCompanyAlerts, addToWatchlist, state } = useInvestmentState();
  const watchlistSymbols = getWatchlistSymbols();

  const [activeTab, setActiveTab] = useState('My Watchlist');

  const activeSymbols = watchlistSymbols;

  const [moversTab, setMoversTab] = useState<'Gainers' | 'Losers' | 'By Value'>('Gainers');

  // Modal settings for adding stock
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSymbol, setAddSymbol] = useState('BEL');
  const [addName, setAddName] = useState('Bharat Electronics Ltd.');
  const [addPrice, setAddPrice] = useState('285');

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSymbol) return;
    
    addToWatchlist(addSymbol.toUpperCase().trim());
    setShowAddModal(false);
  };

  const handleSelectCompany = (symbol: string) => {
    setAddSymbol(symbol);
    const found = COMPANIES_METADATA.find(c => c.symbol === symbol);
    if (found) {
      setAddName(found.name);
      setAddPrice(String(found.basePrice));
    }
  };

  // Build the watchlist items from active symbols in state
  const watchlistItems = useMemo(() => {
    return activeSymbols.map(symbol => {
      const meta = getCompanyMeta(symbol);
      const q = quotes.find(quote => quote.symbol.toUpperCase() === symbol.toUpperCase());
      const rec = recs[symbol] || { recommendation: 'Hold', ai_investment_score: 75 };

      const price = q?.current_price ?? meta.basePrice;
      const changePct = q?.change_pct ?? 0;
      const change = q?.change ?? 0;

      return {
        symbol,
        name: meta.name,
        price,
        change,
        changePct,
        aiScore: rec.ai_investment_score ?? 75,
        recommendation: rec.recommendation ?? 'Hold'
      };
    });
  }, [activeSymbols, quotes, recs]);

  // Dynamic portfolio totals
  const getWeight = (symbol: string) => {
    const map: Record<string, number> = {
      RELIANCE: 0.20,
      TCS: 0.15,
      HDFCBANK: 0.15,
      ICICIBANK: 0.12,
      INFY: 0.10,
      SBIN: 0.04,
      LT: 0.08,
      AXISBANK: 0.05,
      BHARTIARTL: 0.05,
      ITC: 0.02,
      ULTRACEMCO: 0.03,
      ADANIPORTS: 0.01
    };
    return map[symbol] || 0.02;
  };

  const totals = useMemo(() => {
    if (watchlistItems.length === 0) {
      return {
        totalValue: 0,
        todayChangePct: 0,
        todayPL: 0,
        overallPL: 0,
        overallPLPct: 0
      };
    }

    const totalWeight = watchlistItems.reduce((sum, item) => sum + getWeight(item.symbol), 0);
    const normalizedItems = watchlistItems.map(item => ({
      ...item,
      weight: totalWeight > 0 ? getWeight(item.symbol) / totalWeight : 0
    }));

    const initialWeightedPrice = normalizedItems.reduce((sum, item) => {
      const meta = getCompanyMeta(item.symbol);
      return sum + meta.basePrice * item.weight;
    }, 0);

    const currentWeightedPrice = normalizedItems.reduce((sum, item) => {
      return sum + item.price * item.weight;
    }, 0);

    const priceRatio = initialWeightedPrice > 0 ? currentWeightedPrice / initialWeightedPrice : 1;
    const totalValue = 214560.35 * priceRatio;
    
    const todayChangePct = normalizedItems.reduce((sum, item) => {
      return sum + item.changePct * item.weight;
    }, 0);

    const todayPL = totalValue * (todayChangePct / 100);
    const overallPL = 12745.20 + (totalValue - 214560.35);
    const overallPLPct = 6.32 * (totalValue / 214560.35);

    return {
      totalValue,
      todayChangePct,
      todayPL,
      overallPL,
      overallPLPct
    };
  }, [watchlistItems]);

  const { totalValue, todayChangePct, todayPL, overallPL, overallPLPct } = totals;

  // Sector Allocation dynamic distribution
  const sectorAllocation = useMemo(() => {
    const allocationMap: Record<string, number> = {};
    watchlistItems.forEach(item => {
      const meta = getCompanyMeta(item.symbol);
      const sector = meta.sector || 'Others';
      allocationMap[sector] = (allocationMap[sector] || 0) + item.price;
    });

    const totalPrices = Object.values(allocationMap).reduce((sum, v) => sum + v, 0);
    if (totalPrices === 0) {
      return [
        { name: 'Empty Watchlist', value: 100, color: '#64748b' }
      ];
    }

    const colors = ['#8b5cf6', '#06b6d4', '#f97316', '#ef4444', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#64748b'];

    return Object.keys(allocationMap).map((sector, idx) => ({
      name: sector,
      value: parseFloat(((allocationMap[sector] / totalPrices) * 100).toFixed(1)),
      color: colors[idx % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [watchlistItems]);

  // Donut chart summary counts
  const gainersCount = watchlistItems.filter(item => item.changePct > 0).length;
  const losersCount = watchlistItems.filter(item => item.changePct < 0).length;
  const unchangedCount = watchlistItems.filter(item => item.changePct === 0).length;
  const totalStocksCount = watchlistItems.length;

  const dynamicDonutData = useMemo(() => {
    if (totalStocksCount === 0) {
      return [{ name: 'No Stocks', value: 1, color: '#1e293b' }];
    }
    return [
      { name: 'Gainers', value: gainersCount, color: '#10b981' },
      { name: 'Losers', value: losersCount, color: '#ef4444' },
      { name: 'Unchanged', value: unchangedCount, color: '#64748b' }
    ];
  }, [gainersCount, losersCount, unchangedCount, totalStocksCount]);

  const gainerPct = totalStocksCount > 0 ? ((gainersCount / totalStocksCount) * 100).toFixed(1) + '%' : '0%';
  const loserPct = totalStocksCount > 0 ? ((losersCount / totalStocksCount) * 100).toFixed(1) + '%' : '0%';
  const unchangedPct = totalStocksCount > 0 ? ((unchangedCount / totalStocksCount) * 100).toFixed(1) + '%' : '0%';

  // Top Movers from all Nifty quotes
  const moversList = useMemo(() => {
    const list = quotes.length > 0 ? quotes : COMPANIES_METADATA.map(c => {
      const changePct = parseFloat((Math.random() * 4 - 2).toFixed(2));
      return {
        symbol: c.symbol,
        name: c.name,
        current_price: c.basePrice,
        change_pct: changePct,
        change: c.basePrice * (changePct / 100)
      };
    });

    return list.map(q => ({
      symbol: q.symbol,
      name: q.name || getCompanyMeta(q.symbol).name,
      price: q.current_price || q.price || 100,
      changePct: q.change_pct !== undefined ? q.change_pct : 0
    }));
  }, [quotes]);

  const moversGainers = useMemo(() => {
    return [...moversList].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
  }, [moversList]);

  const moversLosers = useMemo(() => {
    return [...moversList].sort((a, b) => a.changePct - b.changePct).slice(0, 5);
  }, [moversList]);

  const moversByValue = useMemo(() => {
    return [...moversList].sort((a, b) => b.price - a.price).slice(0, 5);
  }, [moversList]);

  // Real active tab alerts
  const activeTabAlerts = useMemo(() => {
    return Object.values(state.alerts).filter(a => a.symbol && activeSymbols.includes(a.symbol));
  }, [state.alerts, activeSymbols]);

  const getShortName = (symbol: string) => {
    const map: Record<string, string> = {
      RELIANCE: 'Reliance',
      TCS: 'TCS',
      HDFCBANK: 'HDFC Bank',
      ICICIBANK: 'ICICI Bank',
      INFY: 'Infosys',
      SBIN: 'SBI',
      LT: 'L&T',
      AXISBANK: 'Axis Bank',
      BHARTIARTL: 'Bharti Airtel',
      ITC: 'ITC',
      ULTRACEMCO: 'UltraTech Cement',
      ADANIPORTS: 'Adani Ports',
    };
    return map[symbol] || symbol;
  };

  return (
    <div className="space-y-2.5 text-slate-100 animate-fade-in relative">
      
      {/* Watchlist Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-1.5 text-white">
            ⭐ Watchlist <span className="text-[9px] text-slate-555 font-bold bg-[#0d121f] border border-slate-800 p-0.5 rounded-full cursor-help" title="Details">ⓘ</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0">Track your favorite stocks and market movers in one place.</p>
        </div>

        {/* Premium Separate Header Cards */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5">
            {[
              { icon: <Briefcase className="w-3.5 h-3.5 text-slate-400" />, val: activeSymbols.length.toString(), label: 'Stocks' },
              { icon: <Wallet className="w-3.5 h-3.5 text-slate-400" />, val: `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: 'Total Value' },
              { icon: <TrendingUp className={`w-3.5 h-3.5 ${todayChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />, val: `${todayChangePct >= 0 ? '+' : ''}${todayChangePct.toFixed(2)}%`, label: "Today's Change", color: todayChangePct >= 0 ? 'text-emerald-450 font-bold' : 'text-rose-455 font-bold' },
              { icon: <Smile className={`w-3.5 h-3.5 ${todayPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />, val: `${todayPL >= 0 ? '+' : '-'}₹${Math.abs(todayPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: "Today's P&L", color: todayPL >= 0 ? 'text-emerald-450 font-bold' : 'text-rose-455 font-bold' }
            ].map((card, i) => (
              <div key={i} className="bg-[#0c1628] border border-[#1d2a43] rounded-xl px-2.5 py-1 flex items-center gap-2 text-[9.5px] font-bold shadow-md shadow-black/20">
                {card.icon}
                <div className="flex flex-col text-left">
                  <span className={card.color || 'text-slate-200'}>{card.val}</span>
                  <span className="text-[7.5px] text-slate-550 block font-semibold leading-none mt-0.5">{card.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[9.5px] font-bold px-2.5 py-1.5 bg-violet-650 hover:bg-violet-500 rounded-xl text-white shadow shadow-violet-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Stock
            </button>
            <button
              onClick={() => alert('Importing watchlist from CSV...')}
              className="text-[9.5px] font-bold px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-305 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Import Watchlist
            </button>
            <button
              onClick={() => alert('Watchlist Configuration Options')}
              className="px-1.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 font-bold transition-all text-xs flex items-center justify-center cursor-pointer"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories sub menu */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto whitespace-nowrap pb-0 select-none scrollbar-none">
        {['My Watchlist', 'Indices Watchlist', 'Custom Watchlists'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1 text-xs font-semibold border-b-2 transition-all relative cursor-pointer ${
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
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start">
        
        {/* LEFT/MAIN WATCHLIST TABLE (Colspan 3) */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-2.5">
          {activeTab === 'My Watchlist' && (
            <DynamicWatchlistTable 
              quotes={quotes} 
              recs={recs} 
              onSymbolSelect={onSymbolSelect} 
            />
          )}

          {activeTab === 'Indices Watchlist' && (
            <div className="card bg-[#0d121f] border border-[#152036] rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                Indices Watchlist updates in real-time. Showing primary index segments.
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {[
                    { name: 'NIFTY 50', price: '22,517.60', change: '+189.40 (+0.85%)', color: 'text-emerald-400' },
                    { name: 'NIFTY BANK', price: '48,153.15', change: '+589.90 (+1.24%)', color: 'text-emerald-400' },
                    { name: 'NIFTY IT', price: '34,812.45', change: '-120.50 (-0.34%)', color: 'text-rose-450' }
                  ].map((ind) => (
                    <div key={ind.name} className="bg-[#080c14] border border-[#1e293b]/50 p-3 rounded-xl text-left">
                      <span className="text-[10px] text-slate-500 block font-bold">{ind.name}</span>
                      <span className="text-sm font-black text-white mt-1 block">{ind.price}</span>
                      <span className={`text-[9px] font-bold mt-0.5 block ${ind.color}`}>{ind.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Custom Watchlists' && (
            <div className="card bg-[#0d121f] border border-[#152036] rounded-2xl overflow-hidden shadow-2xl p-8 text-center text-slate-500 text-xs">
              📂 Create custom portfolios or groups to manage targeted sector watches. Select "Import Watchlist" or configure custom triggers.
            </div>
          )}

          {/* THREE CHARTS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Watchlist Performance Trend */}
            <div className="card p-2.5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Watchlist Performance</h4>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={`text-[11px] font-extrabold ${todayChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {todayChangePct >= 0 ? '+' : ''}{todayChangePct.toFixed(2)}%
                    </span>
                    <span className="text-[7.5px] text-slate-500 font-semibold leading-none">This Week</span>
                  </div>
                </div>
                <select className="bg-[#080c14] border border-[#1f293d] rounded-lg px-1.5 py-0.5 text-[8px] text-slate-400 focus:outline-none">
                  <option>1W</option>
                  <option>1M</option>
                </select>
              </div>
              <div className="h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={WATCHLIST_PERF_DATA} margin={{ top: 5, right: 5, left: -38, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={7} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={7} tickLine={false} domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f293d', borderRadius: '10px', fontSize: '9px' }} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sector Allocation Distribution */}
            <div className="card p-2.5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-2">
              <h4 className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Sector Allocation</h4>
              <div className="flex items-center justify-between gap-1 h-[80px]">
                {/* Center text inside donut chart */}
                <div className="w-[68px] h-[68px] flex-shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={28}
                        paddingAngle={1.5}
                        dataKey="value"
                      >
                        {sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[5px] font-bold text-slate-550 uppercase leading-none">Total</span>
                    <span className="text-[7.5px] font-bold text-slate-100 whitespace-nowrap mt-0.5">
                      ₹{(totalValue / 100000).toFixed(2)} L Cr
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[75px] pr-1 scrollbar-none text-[7.5px]">
                  {sectorAllocation.map((entry) => (
                    <div key={entry.name} className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold truncate max-w-[62px] flex items-center gap-1">
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
            <div className="card p-2.5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">P&L Trend</h4>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={`text-[11px] font-extrabold ${overallPL >= 0 ? 'text-emerald-405' : 'text-rose-455'}`}>
                      {overallPL >= 0 ? '+' : '-'}₹{Math.abs(overallPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[7.5px] text-slate-500 font-semibold leading-none">Overall P&L</span>
                  </div>
                </div>
                <select className="bg-[#080c14] border border-[#1f293d] rounded-lg px-1.5 py-0.5 text-[8px] text-slate-400 focus:outline-none">
                  <option>1M</option>
                  <option>3M</option>
                </select>
              </div>
              <div className="h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PL_TREND_DATA} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={7} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={7} tickLine={false} />
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
        <div className="space-y-3">
          
          {/* WATCHLIST SUMMARY DONUT */}
          <div className="card p-3 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Watchlist Summary</h3>
            
            <div className="flex items-center justify-between gap-1 bg-[#080c14]/30 border border-[#1f293d] p-1.5 rounded-2xl">
              {/* Donut chart */}
              <div className="w-[60px] h-[60px] flex-shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={15}
                      outerRadius={23}
                      paddingAngle={2.5}
                      dataKey="value"
                    >
                      {dynamicDonutData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text today's change */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`text-[7.5px] font-black ${todayChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {todayChangePct >= 0 ? '+' : ''}{todayChangePct.toFixed(2)}%
                  </span>
                  <span className="text-[4px] font-bold text-slate-550 uppercase leading-none mt-0.5">Today's</span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex-1 space-y-0.5 pl-1 text-[7.5px] font-bold">
                {[
                  { label: `Gainers (${gainersCount})`, val: gainerPct, color: '#10b981' },
                  { label: `Losers (${losersCount})`, val: loserPct, color: '#ef4444' },
                  { label: `Unchanged (${unchangedCount})`, val: unchangedPct, color: '#64748b' }
                ].map((l) => (
                  <div key={l.label} className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                      {l.label}
                    </span>
                    <span className="text-slate-350">{l.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center pt-2.5 border-t border-slate-850">
              <div className="flex flex-col items-center">
                <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider leading-none">Total Value</span>
                <span className="text-[10px] font-extrabold text-white mt-1.5 block leading-tight">
                  ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-850 px-0.5">
                <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider leading-none">Today's P&L</span>
                <span className={`text-[10px] font-extrabold mt-1.5 block leading-tight ${todayPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {todayPL >= 0 ? '+' : '-'}₹{Math.abs(todayPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[7px] font-bold block leading-none mt-0.5 ${todayChangePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ({todayChangePct >= 0 ? '+' : ''}{todayChangePct.toFixed(2)}%)
                </span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-850 pl-0.5">
                <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider leading-none">Overall P&L</span>
                <span className={`text-[10px] font-extrabold mt-1.5 block leading-tight ${overallPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {overallPL >= 0 ? '+' : '-'}₹{Math.abs(overallPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[7px] font-bold block leading-none mt-0.5 ${overallPLPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ({overallPLPct >= 0 ? '+' : ''}{overallPLPct.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* TOP MOVERS (TODAY) */}
          <div className="card p-3 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Top Movers (Today)</h3>
              
              <div className="flex bg-[#080c14] border border-[#1f293d] p-0.5 rounded-lg">
                {['Gainers', 'Losers', 'By Value'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMoversTab(tab as any)}
                    className={`px-1.5 py-0.5 rounded text-[7px] font-bold transition-all cursor-pointer ${
                      moversTab === tab 
                        ? 'bg-violet-650 text-white' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              {(moversTab === 'Gainers' ? moversGainers : moversTab === 'Losers' ? moversLosers : moversByValue).map((m, idx) => (
                <div 
                  key={m.symbol} 
                  className="flex justify-between items-center bg-[#0d121f]/50 border border-transparent hover:border-[#1f293d] p-1 rounded-xl text-[9px] transition-all cursor-pointer"
                  onClick={() => onSymbolSelect?.(m.symbol)}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 font-bold w-3">{idx + 1}.</span>
                    <div>
                      <span className="font-bold text-slate-200 block">{getShortName(m.symbol)}</span>
                      <span className="text-[7px] text-slate-500 block truncate max-w-[85px]">{m.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="font-bold text-slate-200">₹{m.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className={`text-[9px] font-bold min-w-[42px] text-right block ${m.changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {m.changePct >= 0 ? '+' : ''}{m.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WATCHLIST ALERTS */}
          <div className="card p-3 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider">
                Watchlist Alerts ({activeTabAlerts.length})
              </h3>
              <button 
                onClick={() => onNavigateToTab?.('alerts')}
                className="text-[8px] font-bold text-violet-400 hover:text-violet-300 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-1">
              {activeTabAlerts.length === 0 ? (
                <div className="text-center py-4 text-[9px] text-slate-550 font-bold">
                  No active alerts for watchlisted stocks.
                </div>
              ) : (
                activeTabAlerts.slice(0, 4).map((alert, idx) => {
                  const itemColor = alert.type.includes('above') || alert.type.includes('earnings') || alert.type.includes('dividend')
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : alert.type.includes('below') 
                    ? 'bg-rose-500/10 text-rose-450' 
                    : 'bg-blue-500/10 text-blue-400';
                  
                  const typeLabel = alert.type.replace('_', ' ').toUpperCase();

                  return (
                    <div 
                      key={alert.id} 
                      className="flex items-center gap-1.5 bg-[#0d121f] border border-[#1f293d] p-1.5 rounded-xl hover:border-slate-700 transition-all cursor-pointer group"
                      onClick={() => onSymbolSelect?.(alert.symbol || '')}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 text-[8px] font-black ${itemColor}`}>
                        🔔
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-200 text-[8.5px] block leading-snug group-hover:text-violet-400 transition-colors truncate">
                          {alert.symbol}: {typeLabel} {alert.targetValue ? `at ₹${alert.targetValue}` : ''}
                        </span>
                        <span className="text-[7px] text-slate-500 block mt-0.5">Active</span>
                      </div>
                      <ChevronRight className="w-2.5 h-2.5 text-slate-500 ml-auto flex-shrink-0" />
                    </div>
                  );
                })
              )}
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
                className="text-slate-500 hover:text-slate-300 text-xs font-bold bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddStockSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Nifty 50 Company</label>
                <select
                  value={COMPANIES_METADATA.some(c => c.symbol === addSymbol) ? addSymbol : ''}
                  onChange={(e) => handleSelectCompany(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer mb-2"
                >
                  <option value="">-- Select --</option>
                  {COMPANIES_METADATA.map((c) => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>
                  ))}
                </select>
              </div>

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

              <div className="flex gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 text-[10px] font-bold py-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-[10px] font-bold py-2 rounded-xl bg-violet-650 hover:bg-violet-500 text-white transition-colors cursor-pointer"
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
