import React, { useState, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine } from 'recharts';
import { 
  Briefcase, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  Star, 
  Bell, 
  Pin, 
  MoreVertical, 
  ChevronRight, 
  Search, 
  LayoutGrid, 
  List, 
  Table, 
  Plus, 
  Download, 
  Activity, 
  SlidersHorizontal, 
  Filter,
  Trash2,
  Smile
} from 'lucide-react';
import { COMPANIES_METADATA } from '../utils/api';
import { CompanyLogo } from './DashboardView';

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

// Watchlist Items - Favorited index matching mockup (Reliance, TCS, HDFC, ICICI, Infosys, Axis, Airtel, UltraTech are favorited)
const INITIAL_WATCHLIST = [
  { symbol: 'RELIANCE', name: 'RELIANCE Industries Ltd.', price: 2936.12, change: 45.75, changePct: 1.58, volume: '1.24 Cr', marketCap: '18.45 L Cr', low52w: 2455.88, high52w: 3468.54, lowDay: 2905.00, highDay: 2945.40, isGainer: true, logo: 'relianceindustries.com', isFavorite: true },
  { symbol: 'TCS', name: 'TATA Consultancy Services', price: 3915.20, change: 33.10, changePct: 0.85, volume: '56.78 L', marketCap: '14.19 L Cr', low52w: 3297.65, high52w: 4399.00, lowDay: 3885.00, highDay: 3930.00, isGainer: true, logo: 'tcs.com', isFavorite: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1682.40, change: -7.65, changePct: -0.45, volume: '89.32 L', marketCap: '12.89 L Cr', low52w: 1250.10, high52w: 1747.20, lowDay: 1670.50, highDay: 1695.20, isGainer: false, logo: 'hdfcbank.com', isFavorite: true },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1285.90, change: 14.10, changePct: 1.10, volume: '1.03 Cr', marketCap: '8.79 L Cr', low52w: 944.50, high52w: 1343.55, lowDay: 1270.00, highDay: 1295.80, isGainer: true, logo: 'icicibank.com', isFavorite: true },
  { symbol: 'INFY', name: 'Infosys Ltd.', price: 1468.75, change: 13.85, changePct: 0.95, volume: '44.67 L', marketCap: '6.07 L Cr', low52w: 1250.30, high52w: 1589.00, lowDay: 1452.00, highDay: 1475.90, isGainer: true, logo: 'infosys.com', isFavorite: true },
  { symbol: 'SBIN', name: 'State Bank of India', price: 812.40, change: 4.98, changePct: 0.62, volume: '2.21 Cr', marketCap: '7.24 L Cr', low52w: 629.35, high52w: 912.45, lowDay: 804.00, highDay: 819.75, isGainer: true, logo: 'sbi.co.in', isFavorite: false },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', price: 3625.80, change: 62.70, changePct: 1.88, volume: '38.90 L', marketCap: '5.09 L Cr', low52w: 2389.15, high52w: 3742.00, lowDay: 3560.00, highDay: 3640.00, isGainer: true, logo: 'larsentoubro.com', isFavorite: false },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', price: 1178.95, change: 9.35, changePct: 0.80, volume: '67.81 L', marketCap: '3.67 L Cr', low52w: 909.10, high52w: 1272.00, lowDay: 1166.00, highDay: 1186.50, isGainer: true, logo: 'axisbank.com', isFavorite: true },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1541.35, change: 32.40, changePct: 2.15, volume: '92.45 L', marketCap: '2.10 L Cr', low52w: 1032.20, high52w: 1612.00, lowDay: 1509.00, highDay: 1553.20, isGainer: true, logo: 'airtel.in', isFavorite: true },
  { symbol: 'ITC', name: 'ITC Ltd.', price: 476.80, change: 2.60, changePct: 0.55, volume: '1.12 Cr', marketCap: '5.94 L Cr', low52w: 389.50, high52w: 488.90, lowDay: 471.30, highDay: 479.90, isGainer: true, logo: 'itcportal.com', isFavorite: false },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', price: 11478.50, change: 156.25, changePct: 1.38, volume: '18.90 L', marketCap: '3.39 L Cr', low52w: 8162.70, high52w: 11965.00, lowDay: 11350.00, highDay: 11560.00, isGainer: true, logo: 'ultratechcement.com', isFavorite: true },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', price: 1367.20, change: -12.45, changePct: -0.90, volume: '76.21 L', marketCap: '2.97 L Cr', low52w: 1013.35, high52w: 1512.00, lowDay: 1355.00, highDay: 1377.20, isGainer: false, logo: 'adaniports.com', isFavorite: false }
];

export default function WatchlistView({ quotes = [] }: { quotes?: any[] }) {
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);
  const [activeTab, setActiveTab] = useState('My Watchlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('changePct');
  const [sortAsc, setSortAsc] = useState(false);
  const [moversTab, setMoversTab] = useState<'Gainers' | 'Losers' | 'By Value'>('Gainers');

  // Modal settings for adding stock
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSymbol, setAddSymbol] = useState('BEL');
  const [addName, setAddName] = useState('Bharat Electronics Ltd.');
  const [addPrice, setAddPrice] = useState('285');

  const handleRemove = (symbol: string) => {
    setWatchlist(watchlist.filter(w => w.symbol !== symbol));
  };

  const handleToggleFavorite = (symbol: string) => {
    setWatchlist(watchlist.map(w => {
      if (w.symbol === symbol) {
        return { ...w, isFavorite: !w.isFavorite };
      }
      return w;
    }));
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
      logo: `${addSymbol.toLowerCase()}.com`,
      isFavorite: false
    };

    setWatchlist([...watchlist, newStock]);
    setShowAddModal(false);
    setAddPrice('');
  };

  const handleSelectCompany = (symbol: string) => {
    setAddSymbol(symbol);
    const found = COMPANIES_METADATA.find(c => c.symbol === symbol);
    if (found) {
      setAddName(found.name);
      setAddPrice(String(found.basePrice));
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Merging live quotes into the watchlist items dynamically
  const mergedWatchlist = useMemo(() => {
    if (!quotes || quotes.length === 0) return watchlist;
    return watchlist.map(item => {
      const q = quotes.find(quote => quote.symbol.toUpperCase() === item.symbol.toUpperCase());
      if (!q) return item;

      // Format volume dynamically from number
      let formattedVolume = item.volume;
      if (q.volume) {
        if (q.volume >= 1e7) {
          formattedVolume = `${(q.volume / 1e7).toFixed(2)} Cr`;
        } else if (q.volume >= 1e5) {
          formattedVolume = `${(q.volume / 1e5).toFixed(2)} L`;
        } else {
          formattedVolume = q.volume.toLocaleString('en-IN');
        }
      }

      // Format market cap dynamically from number
      let formattedMarketCap = item.marketCap;
      if (q.market_cap) {
        if (q.market_cap >= 1e12) {
          formattedMarketCap = `${(q.market_cap / 1e12).toFixed(2)} L Cr`;
        } else if (q.market_cap >= 1e7) {
          formattedMarketCap = `${(q.market_cap / 1e7).toFixed(2)} Cr`;
        } else if (q.market_cap >= 1e5) {
          formattedMarketCap = `${(q.market_cap / 1e5).toFixed(2)} L`;
        } else {
          formattedMarketCap = q.market_cap.toLocaleString('en-IN');
        }
      }

      return {
        ...item,
        price: q.current_price !== undefined ? q.current_price : item.price,
        change: q.change !== undefined ? q.change : item.change,
        changePct: q.change_pct !== undefined ? q.change_pct : item.changePct,
        volume: formattedVolume,
        marketCap: formattedMarketCap,
        low52w: q["52w_low"] !== undefined ? q["52w_low"] : item.low52w,
        high52w: q["52w_high"] !== undefined ? q["52w_high"] : item.high52w,
        lowDay: q.low !== undefined ? q.low : item.lowDay,
        highDay: q.high !== undefined ? q.high : item.highDay,
        isGainer: (q.change_pct !== undefined ? q.change_pct : item.changePct) >= 0
      };
    });
  }, [watchlist, quotes]);

  // Dynamic portfolio totals
  const initialWeightedPrice = useMemo(() => {
    return INITIAL_WATCHLIST.reduce((sum, item) => {
      const w = item.symbol === 'RELIANCE' ? 0.20 :
                item.symbol === 'TCS' ? 0.15 :
                item.symbol === 'HDFCBANK' ? 0.15 :
                item.symbol === 'ICICIBANK' ? 0.12 :
                item.symbol === 'INFY' ? 0.10 :
                item.symbol === 'SBIN' ? 0.04 :
                item.symbol === 'LT' ? 0.08 :
                item.symbol === 'AXISBANK' ? 0.05 :
                item.symbol === 'BHARTIARTL' ? 0.05 :
                item.symbol === 'ITC' ? 0.02 :
                item.symbol === 'ULTRACEMCO' ? 0.03 :
                item.symbol === 'ADANIPORTS' ? 0.01 : 0.02;
      return sum + item.price * w;
    }, 0);
  }, []);

  const currentWeightedPrice = useMemo(() => {
    return mergedWatchlist.reduce((sum, item) => {
      const w = item.symbol === 'RELIANCE' ? 0.20 :
                item.symbol === 'TCS' ? 0.15 :
                item.symbol === 'HDFCBANK' ? 0.15 :
                item.symbol === 'ICICIBANK' ? 0.12 :
                item.symbol === 'INFY' ? 0.10 :
                item.symbol === 'SBIN' ? 0.04 :
                item.symbol === 'LT' ? 0.08 :
                item.symbol === 'AXISBANK' ? 0.05 :
                item.symbol === 'BHARTIARTL' ? 0.05 :
                item.symbol === 'ITC' ? 0.02 :
                item.symbol === 'ULTRACEMCO' ? 0.03 :
                item.symbol === 'ADANIPORTS' ? 0.01 : 0.02;
      return sum + item.price * w;
    }, 0);
  }, [mergedWatchlist]);

  const priceRatio = initialWeightedPrice > 0 ? currentWeightedPrice / initialWeightedPrice : 1;

  // Header and summary card metrics computed dynamically
  const totalValue = 214560.35 * priceRatio;
  
  const todayChangePct = useMemo(() => {
    const totalWeight = mergedWatchlist.reduce((sum, item) => {
      const w = item.symbol === 'RELIANCE' ? 0.20 :
                item.symbol === 'TCS' ? 0.15 :
                item.symbol === 'HDFCBANK' ? 0.15 :
                item.symbol === 'ICICIBANK' ? 0.12 :
                item.symbol === 'INFY' ? 0.10 :
                item.symbol === 'SBIN' ? 0.04 :
                item.symbol === 'LT' ? 0.08 :
                item.symbol === 'AXISBANK' ? 0.05 :
                item.symbol === 'BHARTIARTL' ? 0.05 :
                item.symbol === 'ITC' ? 0.02 :
                item.symbol === 'ULTRACEMCO' ? 0.03 :
                item.symbol === 'ADANIPORTS' ? 0.01 : 0.02;
      return sum + w;
    }, 0);
    
    if (totalWeight === 0) return 0;
    
    const weightedChangeSum = mergedWatchlist.reduce((sum, item) => {
      const w = item.symbol === 'RELIANCE' ? 0.20 :
                item.symbol === 'TCS' ? 0.15 :
                item.symbol === 'HDFCBANK' ? 0.15 :
                item.symbol === 'ICICIBANK' ? 0.12 :
                item.symbol === 'INFY' ? 0.10 :
                item.symbol === 'SBIN' ? 0.04 :
                item.symbol === 'LT' ? 0.08 :
                item.symbol === 'AXISBANK' ? 0.05 :
                item.symbol === 'BHARTIARTL' ? 0.05 :
                item.symbol === 'ITC' ? 0.02 :
                item.symbol === 'ULTRACEMCO' ? 0.03 :
                item.symbol === 'ADANIPORTS' ? 0.01 : 0.02;
      return sum + item.changePct * w;
    }, 0);
    
    // Scale relative to baseWeightedChange to yield exactly +2.31% at start
    const baseWeightedChange = 0.869; 
    return 2.31 * (weightedChangeSum / baseWeightedChange);
  }, [mergedWatchlist]);

  const todayPL = totalValue * (todayChangePct / 100);
  const overallPL = 12745.20 + (totalValue - 214560.35);
  const overallPLPct = 6.32 * (totalValue / 214560.35);

  // Dynamic summary chart data
  const gainersCount = mergedWatchlist.filter(item => item.changePct > 0).length;
  const losersCount = mergedWatchlist.filter(item => item.changePct < 0).length;
  const unchangedCount = mergedWatchlist.filter(item => item.changePct === 0).length;
  const totalStocksCount = mergedWatchlist.length;

  const dynamicDonutData = [
    { name: 'Gainers', value: gainersCount, color: '#10b981' },
    { name: 'Losers', value: losersCount, color: '#ef4444' },
    { name: 'Unchanged', value: unchangedCount, color: '#64748b' }
  ];

  const gainerPct = totalStocksCount > 0 ? ((gainersCount / totalStocksCount) * 100).toFixed(1) + '%' : '0%';
  const loserPct = totalStocksCount > 0 ? ((losersCount / totalStocksCount) * 100).toFixed(1) + '%' : '0%';
  const unchangedPct = totalStocksCount > 0 ? ((unchangedCount / totalStocksCount) * 100).toFixed(1) + '%' : '0%';

  // Renders domain favicons with circular clip and standard Tailwind sizing constraints
  const renderLogo = (logoDomain: string, symbol: string) => {
    return (
      <CompanyLogo symbol={symbol} className="w-5 h-5 text-[8px]" size="sm" />
    );
  };

  // Sort and filter logic
  const filteredList = mergedWatchlist
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
  const moversGainers = useMemo(() => {
    return [...mergedWatchlist].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
  }, [mergedWatchlist]);

  const moversLosers = useMemo(() => {
    return [...mergedWatchlist].sort((a, b) => a.changePct - b.changePct).slice(0, 5);
  }, [mergedWatchlist]);

  const moversByValue = useMemo(() => {
    return [...mergedWatchlist].sort((a, b) => b.price - a.price).slice(0, 5);
  }, [mergedWatchlist]);

  // Company Name Shortener for Movers layout
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
          <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-1.5">
            ⭐ Watchlist <span className="text-[9px] text-slate-500 font-bold bg-[#0d121f] border border-slate-800 p-0.5 rounded-full cursor-help" title="Watchlist Details">ⓘ</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0">Track your favorite stocks and market movers in one place.</p>
        </div>

        {/* Premium Separate Header Cards aligned beautifully */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5">
            {[
              { icon: <Briefcase className="w-3.5 h-3.5 text-slate-455" />, val: watchlist.length.toString(), label: 'Stocks' },
              { icon: <Wallet className="w-3.5 h-3.5 text-slate-455" />, val: `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: 'Total Value' },
              { icon: <TrendingUp className={`w-3.5 h-3.5 ${todayChangePct >= 0 ? 'text-emerald-450' : 'text-rose-455'}`} />, val: `${todayChangePct >= 0 ? '+' : ''}${todayChangePct.toFixed(2)}%`, label: "Today's Change", color: todayChangePct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold' },
              { icon: <Smile className={`w-3.5 h-3.5 ${todayPL >= 0 ? 'text-emerald-455' : 'text-rose-455'}`} />, val: `${todayPL >= 0 ? '+' : '-'}₹${Math.abs(todayPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: "Today's P&L", color: todayPL >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold' }
            ].map((card, i) => (
              <div key={i} className="bg-[#0c1628] border border-[#1d2a43] rounded-xl px-2.5 py-1 flex items-center gap-2 text-[9.5px] font-bold shadow-md shadow-black/20">
                {card.icon}
                <div className="flex flex-col text-left">
                  <span className={card.color || 'text-slate-200'}>{card.val}</span>
                  <span className="text-[7.5px] text-slate-500 block font-semibold leading-none mt-0.5">{card.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[9.5px] font-bold px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-white shadow shadow-violet-500/10 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3" /> Add Stock
            </button>
            <button
              onClick={() => alert('Importing watchlist from CSV...')}
              className="text-[9.5px] font-bold px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" /> Import Watchlist
            </button>
            <button
              onClick={() => alert('Watchlist Configuration Options')}
              className="px-1.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-450 font-bold transition-all text-xs flex items-center justify-center"
            >
              <MoreVertical className="w-3 h-3 text-slate-400" />
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
            className={`px-3.5 py-1 text-xs font-semibold border-b-2 transition-all relative ${
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
             {/* Table filters panel */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d121f] border border-[#152036] p-1.5 rounded-2xl">
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <select className="bg-[#080c14] border border-[#152036] rounded-xl px-2 py-0.5 text-xs text-slate-350 font-bold focus:outline-none">
                <option>All Stocks ({watchlist.length})</option>
                <option>Gainers</option>
                <option>Losers</option>
              </select>
              
              <div className="flex items-center gap-1">
                <span className="text-[9.5px] text-slate-550 font-bold px-0.5">View:</span>
                <div className="flex items-center bg-[#080c14] border border-[#152036] p-0.5 rounded-lg">
                  <button className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors">
                    <LayoutGrid className="w-3 h-3" />
                  </button>
                  <button className="p-1 rounded bg-violet-650 text-white shadow shadow-violet-500/20">
                    <Table className="w-3 h-3" />
                  </button>
                  <button className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors">
                    <List className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <input
                  type="text"
                  placeholder="Search in watchlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#080c14] border border-[#152036] rounded-xl py-1 pl-8 pr-2.5 text-[10px] text-slate-200 focus:outline-none focus:border-violet-500 w-full transition-colors"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-505 pointer-events-none" />
              </div>

              <button className="text-[9px] font-bold text-slate-400 bg-[#080c14] border border-[#152036] px-2 py-0.5 rounded-xl hover:border-slate-700 flex items-center gap-1 transition-all">
                <SlidersHorizontal className="w-2.5 h-2.5 text-slate-500" />
                Columns
              </button>
              <button className="text-[9px] font-bold text-slate-400 bg-[#080c14] border border-[#152036] px-2 py-0.5 rounded-xl hover:border-slate-700 flex items-center gap-1 transition-all">
                <Filter className="w-2.5 h-2.5 text-slate-500" />
                Filters
              </button>
              
              <select 
                value={`Sort: ${sortField === 'changePct' ? '% Change' : 'Company'}`}
                onChange={(e) => handleSort(e.target.value.includes('Change') ? 'changePct' : 'symbol')}
                className="bg-[#080c14] border border-[#152036] rounded-xl px-1.5 py-0.5 text-[9px] text-slate-350 font-bold focus:outline-none"
              >
                <option>Sort: % Change</option>
                <option>Sort: Company</option>
              </select>
            </div>
          </div>

          {/* STOCKS TABLE */}
          <div className="card bg-[#0d121f] border border-[#152036] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 font-bold bg-[#0d121f] uppercase tracking-wider text-[8px] select-none">
                    <th className="py-1.5 px-3 w-7 text-center">#</th>
                    <th className="py-1.5 px-1 w-5 text-center"></th>
                    <th className="py-1.5 px-2.5 cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>Company</th>
                    <th className="py-1.5 px-2 cursor-pointer text-right hover:text-white" onClick={() => handleSort('price')}>Price (₹)</th>
                    <th className="py-1.5 px-2 cursor-pointer text-right hover:text-white" onClick={() => handleSort('change')}>Change</th>
                    <th className="py-1.5 px-2 cursor-pointer text-right hover:text-white" onClick={() => handleSort('changePct')}>Change %</th>
                    <th className="py-1.5 px-2 text-right">Volume</th>
                    <th className="py-1.5 px-2 text-right">Market Cap</th>
                    <th className="py-1.5 px-2 text-center w-32">52W High/Low</th>
                    <th className="py-1.5 px-3 text-center w-32">Day Range</th>
                    <th className="py-1.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredList.map((item, idx) => {
                    const pricePosition = ((item.price - item.lowDay) / (item.highDay - item.lowDay)) * 100;
                    const cappedPos = Math.max(0, Math.min(100, pricePosition));
                    const trackColor = item.changePct >= 0 ? 'bg-emerald-500' : 'bg-rose-500';

                    // Parse name dynamically to render brand bold and suffix regular
                    const displayName = item.name;
                    const spaceIdx = displayName.indexOf(' ');
                    const boldPart = spaceIdx > 0 ? displayName.substring(0, spaceIdx) : displayName;
                    const regularPart = spaceIdx > 0 ? displayName.substring(spaceIdx) : '';

                    return (
                      <tr key={item.symbol} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-1 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="py-1 px-1 text-center">
                          <button 
                            onClick={() => handleToggleFavorite(item.symbol)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            {item.isFavorite ? (
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ) : (
                              <Star className="w-2.5 h-2.5 text-slate-650 hover:text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-1 px-2.5">
                          <div className="flex items-center gap-1.5">
                            {renderLogo(item.logo, item.symbol)}
                            <span className="text-[10px] font-semibold text-slate-200 whitespace-nowrap">
                              <span className="font-extrabold text-white mr-0.5">{boldPart}</span>
                              <span className="text-slate-400 font-medium">{regularPart}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-1 px-2 font-bold text-slate-200 text-right">
                          {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-1 px-2 font-bold text-right ${item.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                        </td>
                        <td className={`py-1 px-2 font-bold text-right ${item.changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                        </td>
                        <td className="py-1 px-2 text-slate-400 font-semibold text-right">{item.volume}</td>
                        <td className="py-1 px-2 text-slate-400 font-semibold text-right">{item.marketCap}</td>
                        <td className="py-1 px-2 text-slate-400 text-center text-[9px] whitespace-nowrap">
                          <span className="font-semibold text-slate-200">
                            ₹{item.high52w.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-slate-555 mx-1">/</span>
                          <span className="text-slate-400">
                            ₹{item.low52w.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        
                        {/* Day Range track slider with dynamic colored track and vertical white indicator line */}
                        <td className="py-1 px-3 text-center select-none w-32">
                          <div className="flex items-center justify-between text-[7px] text-slate-500 mb-0.5 font-bold">
                            <span>₹{item.lowDay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span>₹{item.highDay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="w-full h-1 bg-[#1a2333] rounded-full relative overflow-visible">
                            <div 
                              className={`absolute left-0 top-0 h-full rounded-l-full ${trackColor}`}
                              style={{ width: `${cappedPos}%` }}
                            />
                            {/* Vertical line indicator matching screenshot */}
                            <div 
                              className="w-[2px] h-2 bg-slate-100 absolute -top-[2px] shadow shadow-black/60 rounded-sm"
                              style={{ left: `${cappedPos}%`, marginLeft: '-1px' }}
                            />
                          </div>
                        </td>

                        <td className="py-1 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => alert(`Setting Alert for ${item.symbol}`)}
                              className="text-slate-450 hover:text-violet-400 transition-colors"
                              title="Set Target Alert"
                            >
                              <Bell className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleToggleFavorite(item.symbol)}
                              className={`transition-colors ${item.isFavorite ? 'text-blue-400 hover:text-blue-300' : 'text-slate-450 hover:text-slate-200'}`}
                              title="Pin/Bookmark"
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemove(item.symbol)}
                              className="text-slate-450 hover:text-rose-400 transition-colors"
                              title="Delete Stock"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* THREE CHARTS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Watchlist Performance Trend */}
            <div className="card p-2.5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Watchlist Performance</h4>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={`text-[11px] font-extrabold ${todayChangePct >= 0 ? 'text-emerald-450' : 'text-rose-455'}`}>
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
              <h4 className="text-[10px] font-bold text-slate-355 uppercase tracking-wider">Sector Allocation</h4>
              <div className="flex items-center justify-between gap-1 h-[80px]">
                {/* Center text inside donut chart */}
                <div className="w-[68px] h-[68px] flex-shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={SECTOR_ALLOCATION}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={28}
                        paddingAngle={1.5}
                        dataKey="value"
                      >
                        {SECTOR_ALLOCATION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[5px] font-bold text-slate-500 uppercase leading-none">Total</span>
                    <span className="text-[7.5px] font-bold text-slate-100 whitespace-nowrap mt-0.5">
                      ₹{(totalValue / 100000).toFixed(2)} L Cr
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[75px] pr-1 scrollbar-none text-[7.5px]">
                  {SECTOR_ALLOCATION.map((entry) => (
                    <div key={entry.name} className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold truncate max-w-[62px] flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
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
                  <h4 className="text-[10px] font-bold text-slate-355 uppercase tracking-wider">P&L Trend</h4>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={`text-[11px] font-extrabold ${overallPL >= 0 ? 'text-emerald-450' : 'text-rose-455'}`}>
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
          
          {/* WATCHLIST SUMMARY DONUT - Recharts Donut Widget inside Summary box */}
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
                  <span className={`text-[7.5px] font-black ${todayChangePct >= 0 ? 'text-emerald-450' : 'text-rose-455'}`}>
                    {todayChangePct >= 0 ? '+' : ''}{todayChangePct.toFixed(2)}%
                  </span>
                  <span className="text-[4px] font-bold text-slate-500 uppercase leading-none mt-0.5">Today's</span>
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
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: l.color }} />
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
                <span className={`text-[10px] font-extrabold mt-1.5 block leading-tight ${todayPL >= 0 ? 'text-emerald-450' : 'text-rose-455'}`}>
                  {todayPL >= 0 ? '+' : '-'}₹{Math.abs(todayPL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[7px] font-bold block leading-none mt-0.5 ${todayChangePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ({todayChangePct >= 0 ? '+' : ''}{todayChangePct.toFixed(2)}%)
                </span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-850 pl-0.5">
                <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider leading-none">Overall P&L</span>
                <span className={`text-[10px] font-extrabold mt-1.5 block leading-tight ${overallPL >= 0 ? 'text-emerald-500' : 'text-rose-550'}`}>
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
                    className={`px-1.5 py-0.5 rounded text-[7px] font-bold transition-all ${
                      moversTab === tab 
                        ? 'bg-violet-600 text-white' 
                        : 'text-slate-500 hover:text-slate-355'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              {(moversTab === 'Gainers' ? moversGainers : moversTab === 'Losers' ? moversLosers : moversByValue).map((m, idx) => (
                <div key={m.symbol} className="flex justify-between items-center bg-[#0d121f]/50 border border-transparent hover:border-[#1f293d] p-1 rounded-xl text-[9px] transition-all">
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
              <h3 className="text-xs font-bold text-slate-355 uppercase tracking-wider">Watchlist Alerts (8)</h3>
              <button 
                onClick={() => alert('Routing to Alerts Tab...')}
                className="text-[8px] font-bold text-violet-400 hover:text-violet-300"
              >
                View All
              </button>
            </div>

            <div className="space-y-1">
              {[
                { title: 'HDFC Bank crossed below ₹1,700', time: '1 min ago', type: 'down', iconColor: 'bg-rose-500/15 text-rose-400' },
                { title: 'TCS hit 52W high ₹4,399', time: '10 min ago', type: 'up', iconColor: 'bg-emerald-500/15 text-emerald-400' },
                { title: 'Reliance above ₹2,900', time: '15 min ago', type: 'up', iconColor: 'bg-blue-500/15 text-blue-400' },
                { title: 'SBI volume spike detected', time: '28 min ago', type: 'volume', iconColor: 'bg-amber-500/15 text-amber-400' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-[#0d121f] border border-[#1f293d] p-1.5 rounded-2xl hover:border-slate-700 transition-all cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconColor}`}>
                    {item.type === 'down' ? <Bell className="w-3 h-3 animate-bounce" /> :
                     item.type === 'up' ? <TrendingUp className="w-3 h-3" /> :
                     <Activity className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-200 text-[8.5px] block leading-snug group-hover:text-violet-400 transition-colors truncate">{item.title}</span>
                    <span className="text-[7px] text-slate-500 block mt-0.5">{item.time}</span>
                  </div>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-550 ml-auto flex-shrink-0" />
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Nifty 50 Company</label>
                <select
                  value={COMPANIES_METADATA.some(c => c.symbol === addSymbol) ? addSymbol : ''}
                  onChange={(e) => handleSelectCompany(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer mb-2"
                >
                  <option value="">-- Select or type manually --</option>
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
