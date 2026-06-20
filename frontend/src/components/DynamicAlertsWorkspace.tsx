import React, { useState, useMemo, useEffect } from 'react';
import { Bell, Search, Trash2, SlidersHorizontal, Filter, AlertTriangle, Check, X, ShieldAlert, Zap, Clock, Play, Pause, ChevronRight } from 'lucide-react';
import { useInvestmentState, UserAlert } from '../context/InvestmentStateContext';
import { CompanyLogo } from './common/CompanyLogo';
import { getCompanyMeta, getScoreColor, api } from '../utils/api';
import AlertManagerDialog from './common/AlertManagerDialog';

interface DynamicAlertsWorkspaceProps {
  quotes?: any[];
  onSymbolSelect?: (symbol: string) => void;
}

export default function DynamicAlertsWorkspace({ quotes = [], onSymbolSelect }: DynamicAlertsWorkspaceProps) {
  const { 
    state, 
    getCompanyRecord, 
    getCompanyAlerts, 
    updateAlert, 
    deleteAlert, 
    deleteCompanyAlerts, 
    removeFromWatchlist,
    createAlert
  } = useInvestmentState();

  const [activeTab, setActiveTab] = useState<'All' | 'Watchlist' | 'Interested' | 'Portfolio' | 'Market'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Modal dialog states
  const [managerSymbol, setManagerSymbol] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<{ symbol: string; activeAlertCount: number } | null>(null);

  const watchlistSymbols = useMemo(() => {
    return Object.values(state.companyRecords).filter(r => r.watchlisted).map(r => r.symbol);
  }, [state.companyRecords]);

  const interestedSymbols = useMemo(() => {
    return Object.values(state.companyRecords).filter(r => r.positionStatus === 'interested').map(r => r.symbol);
  }, [state.companyRecords]);

  const targetSymbols = useMemo(() => {
    return Array.from(new Set([...watchlistSymbols, ...interestedSymbols]));
  }, [watchlistSymbols, interestedSymbols]);

  const [companyNews, setCompanyNews] = useState<Record<string, any>>({});
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    if (targetSymbols.length === 0) {
      setCompanyNews({});
      return;
    }

    let active = true;
    const fetchNews = async () => {
      setLoadingNews(true);
      try {
        const results = await Promise.all(
          targetSymbols.map(async (sym) => {
            try {
              const res = await api.getSentiment(sym);
              return { symbol: sym, data: res };
            } catch (err) {
              console.error(`Failed to fetch news for ${sym}`, err);
              return { symbol: sym, data: null };
            }
          })
        );
        if (!active) return;
        const newsMap: Record<string, any> = {};
        results.forEach(r => {
          if (r.data) {
            newsMap[r.symbol] = r.data;
          }
        });
        setCompanyNews(newsMap);
      } catch (err) {
        console.error("Error fetching target symbols news", err);
      } finally {
        if (active) setLoadingNews(false);
      }
    };

    fetchNews();
    return () => {
      active = false;
    };
  }, [targetSymbols]);

  const alertsList = useMemo(() => {
    return Object.values(state.alerts);
  }, [state.alerts]);

  // Categories filtering
  const filteredAlerts = useMemo(() => {
    let list = [...alertsList];

    // Filter by tab
    if (activeTab === 'Watchlist') {
      list = list.filter(a => {
        if (!a.symbol) return false;
        const rec = getCompanyRecord(a.symbol);
        return rec.watchlisted;
      });
    } else if (activeTab === 'Interested') {
      list = list.filter(a => {
        if (!a.symbol) return false;
        const rec = getCompanyRecord(a.symbol);
        return rec.positionStatus === 'interested';
      });
    } else if (activeTab === 'Portfolio') {
      list = list.filter(a => {
        if (!a.symbol) return false;
        const rec = getCompanyRecord(a.symbol);
        return rec.positionStatus === 'purchased';
      });
    } else if (activeTab === 'Market') {
      list = list.filter(a => !a.symbol);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      list = list.filter(a => {
        const symbolMatch = a.symbol?.toLowerCase().includes(term);
        const nameMatch = a.symbol ? getCompanyMeta(a.symbol).name.toLowerCase().includes(term) : false;
        const typeMatch = a.type.toLowerCase().includes(term);
        return symbolMatch || nameMatch || typeMatch;
      });
    }

    // Sort
    return list.sort((a: any, b: any) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

  }, [alertsList, activeTab, searchQuery, sortField, sortAsc, getCompanyRecord]);

  const handleToggleEnable = (alert: UserAlert) => {
    updateAlert(alert.id, { enabled: !alert.enabled });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Safe watchlist removal prompt interception
  const handleWatchlistRemoval = (symbol: string) => {
    const alerts = getCompanyAlerts(symbol);
    const rec = getCompanyRecord(symbol);
    
    // Check if symbol has alerts and has no other active status (Interested / Purchased)
    if (alerts.length > 0 && rec.positionStatus === 'none') {
      setShowExitConfirm({ symbol, activeAlertCount: alerts.length });
    } else {
      removeFromWatchlist(symbol);
    }
  };

  const handleQuickMarketAlert = () => {
    const alertId = `market-${Date.now()}`;
    createAlert({
      id: alertId,
      type: 'volume_spike',
      enabled: true,
      targetValue: 200000
    });
    alert('General Market alert created!');
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs & Filter Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0d121f] border border-[#152036] p-1.5 rounded-2xl select-none">
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto scrollbar-none">
          {(['All', 'Watchlist', 'Interested', 'Portfolio', 'Market'] as const).map((tab) => {
            const count = tab === 'All' 
              ? alertsList.length 
              : tab === 'Market' 
              ? alertsList.filter(a => !a.symbol).length
              : alertsList.filter(a => {
                  if (!a.symbol) return false;
                  const rec = getCompanyRecord(a.symbol);
                  return tab === 'Watchlist' ? rec.watchlisted :
                         tab === 'Interested' ? rec.positionStatus === 'interested' :
                         rec.positionStatus === 'purchased';
                }).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-violet-600 text-white font-bold'
                    : 'text-slate-400 hover:bg-[#080c14] hover:text-slate-200'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-44">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#080c14] border border-[#152036] rounded-xl py-1 pl-8 pr-2.5 text-[10px] text-slate-200 focus:outline-none focus:border-violet-500 w-full transition-colors"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          <button 
            onClick={() => handleSort('createdAt')}
            className="text-[9px] font-bold text-slate-400 bg-[#080c14] border border-[#152036] px-2 py-1 rounded-xl hover:border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
          >
            Sort: Date
          </button>
          
          <button
            onClick={() => {
              setManagerSymbol('RELIANCE');
            }}
            className="text-[9px] font-bold text-white bg-violet-650 hover:bg-violet-500 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
          >
            + New Alert
          </button>
        </div>
      </div>

      {/* Main Workspace Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        
        {/* Left Section: Active Configured Alerts (Colspan 2) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="card bg-[#0d121f] border border-[#152036] rounded-2xl overflow-hidden shadow-2xl">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
                  🔔
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-200">No Alerts Configured</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">
                    Create custom trigger conditions to receive instant price updates or indicator breakouts.
                  </p>
                </div>
                {activeTab === 'Market' && (
                  <button 
                    onClick={handleQuickMarketAlert}
                    className="text-[10px] font-bold text-violet-400 hover:text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-xl cursor-pointer"
                  >
                    Create General Market Alert
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold bg-[#0d121f] uppercase tracking-wider text-[8px] select-none">
                      <th className="py-2.5 px-3.5">Asset</th>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 px-2">Condition</th>
                      <th className="py-2.5 px-2 text-right">Target Value</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                      <th className="py-2.5 px-2">Created On</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredAlerts.map((alert) => {
                      const meta = alert.symbol ? getCompanyMeta(alert.symbol) : null;
                      const typeLabel = alert.type.replace('_', ' ').toUpperCase();
                      
                      return (
                        <tr key={alert.id} className="hover:bg-slate-900/40 transition-colors">
                          {/* Asset */}
                          <td className="py-2 px-3.5">
                            {meta ? (
                              <div 
                                className="flex items-center gap-1.5 cursor-pointer"
                                onClick={() => setManagerSymbol(alert.symbol || null)}
                              >
                                <CompanyLogo symbol={alert.symbol!} className="w-5 h-5" size="sm" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-white hover:text-violet-400 transition-colors">{alert.symbol}</span>
                                  <span className="text-[8.5px] text-slate-400 font-medium max-w-[120px] truncate">{meta.name}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px]">
                                  🌍
                                </div>
                                <span className="font-extrabold text-slate-300">General Market</span>
                              </div>
                            )}
                          </td>

                          {/* Type */}
                          <td className="py-2 px-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-350 text-[8.5px] font-bold">
                              {typeLabel}
                            </span>
                          </td>

                          {/* Condition */}
                          <td className="py-2 px-2 text-slate-400 font-semibold">
                            {alert.type.includes('above') ? 'Price reaches above' : 
                             alert.type.includes('below') ? 'Price drops below' : 
                             'Triggers on parameter update'}
                          </td>

                          {/* Target Value */}
                          <td className="py-2 px-2 font-bold text-violet-400 text-right">
                            {alert.targetValue ? `₹${alert.targetValue.toLocaleString('en-IN')}` : '-'}
                          </td>

                          {/* Status */}
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => handleToggleEnable(alert)}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black border transition-all cursor-pointer ${
                                alert.enabled 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                                  : 'bg-rose-500/10 text-rose-450 border-rose-500/25'
                              }`}
                            >
                              <span className={`h-1 w-1 rounded-full mr-1 ${alert.enabled ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                              {alert.enabled ? 'ACTIVE' : 'PAUSED'}
                            </button>
                          </td>

                          {/* Created On */}
                          <td className="py-2 px-2 text-slate-550 font-semibold text-[8px]">
                            {new Date(alert.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-2 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {alert.symbol && (
                                <button
                                  onClick={() => handleWatchlistRemoval(alert.symbol!)}
                                  className="text-slate-400 hover:text-amber-500 p-1 rounded-md bg-[#080c14] border border-[#152036] hover:border-slate-700 transition-all cursor-pointer"
                                  title="Toggle Watchlist Option"
                                >
                                  ⭐
                                </button>
                              )}
                              <button
                                  onClick={() => deleteAlert(alert.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded-md bg-[#080c14] border border-[#152036] hover:border-rose-500/30 transition-all cursor-pointer"
                                  title="Delete Alert"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Section: News & Stock Feed for Watchlist/Interested Stocks */}
          <div className="space-y-4 text-left">
            <div className="card p-4 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">📰 Stock Updates & News Hub</h3>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-medium">Real-time sentiment feed for watchlist & interested companies</p>
                </div>
                <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-md uppercase">
                  {targetSymbols.length} Assets
                </span>
              </div>

              {loadingNews ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="text-xl animate-spin">⏳</div>
                  <p className="text-[9px] text-slate-550 font-bold">Scanning news frequencies...</p>
                </div>
              ) : targetSymbols.length === 0 ? (
                <div className="text-center py-10 text-slate-550 space-y-2 select-none">
                  <div className="text-2xl">📰</div>
                  <p className="text-[10px] font-bold">No news targets configured</p>
                  <p className="text-[9px] font-semibold text-slate-655 max-w-[220px] mx-auto leading-relaxed text-slate-500">
                    Mark stocks as <span className="text-[#F59E0B] font-bold">Watchlist ⭐</span> or <span className="text-[#8B5CF6] font-bold">Interested 💜</span> to automatically view updates here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 chat-scrollbar">
                  {targetSymbols.map((sym) => {
                    const meta = getCompanyMeta(sym);
                    const q = quotes.find(quote => quote.symbol.toUpperCase() === sym.toUpperCase());
                    const price = q?.current_price ?? meta.basePrice;
                    const changePct = q?.change_pct ?? 0;
                    const isGainer = changePct >= 0;
                    const sentiment = companyNews[sym];

                    return (
                      <div key={sym} className="bg-slate-950/20 border border-slate-850 hover:border-slate-700/80 rounded-xl p-3 space-y-2.5 transition-all">
                        {/* Logo, symbol and price details */}
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center gap-1.5 cursor-pointer"
                            onClick={() => onSymbolSelect?.(sym)}
                          >
                            <CompanyLogo symbol={sym} className="w-5 h-5" size="sm" />
                            <div className="flex flex-col text-left">
                              <span className="text-[10px] font-black text-white hover:text-violet-400 transition-colors">{sym}</span>
                              <span className="text-[8.5px] text-slate-400 font-medium max-w-[100px] truncate">{meta.name}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-200 block">
                              ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-[8.5px] font-bold block ${isGainer ? 'text-emerald-505' : 'text-rose-505'}`}>
                              {isGainer ? '+' : ''}{changePct.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        {/* Overall Sentiment bar info */}
                        {sentiment ? (
                          <div className="flex items-center justify-between text-[8px] bg-slate-900/45 px-2 py-1.2 rounded-lg border border-slate-850">
                            <span className="text-slate-400 font-semibold">Overall Sentiment:</span>
                            <div className="flex items-center gap-1.5">
                              <span 
                                className={`font-black uppercase px-1 py-0.2 rounded-sm text-[7.5px] ${
                                  sentiment.overall_sentiment.includes('Very') 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : sentiment.overall_sentiment.includes('Bullish')
                                    ? 'bg-teal-500/10 text-teal-400'
                                    : 'bg-rose-500/10 text-rose-455'
                                }`}
                              >
                                {sentiment.overall_sentiment}
                              </span>
                              <span className="text-slate-500 font-bold">({Math.round(sentiment.overall_score * 100)}%)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-5 bg-slate-900/10 rounded-lg animate-pulse" />
                        )}

                        {/* Headlines timeline */}
                        <div className="space-y-1.8">
                          {sentiment?.articles && sentiment.articles.length > 0 ? (
                            sentiment.articles.slice(0, 2).map((art: any, i: number) => (
                              <div 
                                key={i} 
                                className="text-left bg-[#080c14]/40 border border-slate-850 p-2 rounded-lg text-[9px] hover:bg-[#0b1220] transition-colors"
                              >
                                <h5 className="font-extrabold text-slate-200 leading-tight">
                                  {art.headline}
                                </h5>
                                <div className="flex items-center justify-between text-[7px] text-slate-550 mt-1 font-bold">
                                  <span>{art.source} · {art.published_at}</span>
                                  <span className={`px-1 rounded-sm text-[6.5px] uppercase ${
                                    art.sentiment === 'positive' 
                                      ? 'bg-emerald-500/15 text-emerald-450' 
                                      : art.sentiment === 'negative'
                                      ? 'bg-rose-500/15 text-rose-455'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {art.sentiment}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[8px] text-slate-500 italic text-center py-1">No news updates available.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Reusable Alert Manager Dialog Overlay */}
      {managerSymbol && (
        <AlertManagerDialog
          symbol={managerSymbol}
          isOpen={true}
          onClose={() => setManagerSymbol(null)}
        />
      )}

      {/* Safety watchlist removal warning prompt dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="w-full max-w-sm bg-[#0d121f] border border-[#1E293B] rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Active Alerts Detected</h3>
            </div>
            
            <p className="text-[10.5px] text-slate-400 leading-relaxed text-left">
              <b>{showExitConfirm.symbol}</b> has {showExitConfirm.activeAlertCount} active trigger alerts configured. How would you like to handle them upon removing the company from your watchlist?
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  removeFromWatchlist(showExitConfirm.symbol);
                  setShowExitConfirm(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-850 border border-[#1E293B] hover:border-slate-700 text-amber-500 text-[9.5px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Keep Alerts & Remove Stock
              </button>
              <button
                onClick={() => {
                  deleteCompanyAlerts(showExitConfirm.symbol);
                  removeFromWatchlist(showExitConfirm.symbol);
                  setShowExitConfirm(null);
                }}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[9.5px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Delete Alerts & Remove Stock
              </button>
              <button
                onClick={() => setShowExitConfirm(null)}
                className="w-full bg-transparent hover:bg-slate-900 border border-[#1E293B] text-slate-450 hover:text-slate-350 text-[9.5px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
