import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { api, getRecBadgeClass } from '../utils/api';
import StockDetail from '../components/StockDetail';
import MarketOverview from '../components/MarketOverview';
import PortfolioView from '../components/PortfolioView';
import DashboardView from '../components/DashboardView';
import AIAssistantPage from '../components/AIAssistantPage';
import AIChatbot from '../components/AIChatbot';

const SIDEBAR_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'market-overview', label: 'Market Overview', icon: '🌐' },
  { id: 'stock-analysis', label: 'Stock Analysis', icon: '🔍' },
  { id: 'top-companies', label: 'Top Nifty Companies', icon: '📈', hasDropdown: true },
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖', isNew: true },
  { id: 'watchlist', label: 'Watchlist', icon: '⭐' },
  { id: 'alerts', label: 'Alerts', icon: '🔔' },
  { id: 'reports', label: 'Reports', icon: '📄' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0); // Index of SIDEBAR_TABS
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [recs, setRecs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [backendOnline, setBackendOnline] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Floating chatbot state
  const [isTopNiftyExpanded, setIsTopNiftyExpanded] = useState(true); // Default expanded
  const [niftyFilterLimit, setNiftyFilterLimit] = useState(50); // Default to Nifty 50
  const [chatPreQuery, setChatPreQuery] = useState('');

  const handleNavigateToChat = (query?: string, symbol?: string) => {
    if (symbol) {
      setSelectedSymbol(symbol);
    } else {
      setSelectedSymbol('RELIANCE');
    }
    if (query) {
      setChatPreQuery(query);
    }
    setActiveTab(5); // Switch to AIAssistantPage (index 5)
  };

  const fetchData = useCallback(async () => {
    try {
      // Check if real FastAPI backend is online
      let online = false;
      try {
        const res = await fetch('http://localhost:8000/health');
        online = res.ok;
      } catch {
        online = false;
      }
      setBackendOnline(online);

      const [qRes, pRes] = await Promise.all([
        api.getAllQuotes(),
        api.getPortfolio(),
      ]);
      setQuotes(qRes.data.quotes || []);
      const recMap: Record<string, any> = {};
      for (const r of pRes.data.all_recommendations || []) {
        recMap[r.symbol] = r;
      }
      setRecs(recMap);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      console.error("Error fetching market data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const quoteMap: Record<string, any> = {};
  for (const q of quotes) quoteMap[q.symbol] = q;

  const handleSidebarTabClick = (index: number) => {
    const clickedTab = SIDEBAR_TABS[index];
    if (clickedTab.hasDropdown) {
      setIsTopNiftyExpanded(!isTopNiftyExpanded);
      return;
    }
    // If clicking placeholders (Watchlist, Alerts, Reports, Settings) which are indices 6, 7, 8, 9
    if (index >= 6) {
      alert(`${clickedTab.label} feature is coming soon with live Nifty 50 push notifications!`);
      return;
    }
    setActiveTab(index);
  };

  return (
    <>
      <Head>
        <title>NiftyAI — Your AI Investment Assistant</title>
        <meta name="description" content="AI-powered stock investment assistant for Nifty Top 10" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📈</text></svg>" />
      </Head>

      <div className="min-h-screen flex text-slate-100 bg-[#080c14] relative overflow-x-hidden">
        
        {/* Persistent Left Sidebar */}
        <aside className="w-64 bg-[#0d121f] border-r border-[#1f293d] flex flex-col justify-between p-4 flex-shrink-0 sticky top-0 h-screen z-40 hidden md:flex">
          
          <div className="space-y-6">
            {/* Sidebar Logo */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
                📈
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight">
                  Nifty<span className="text-violet-400">AI</span>
                </h1>
                <p className="text-[9px] text-slate-500">Your AI Investment Assistant</p>
              </div>
            </div>

            {/* Sidebar Nav Tabs */}
            <nav className="space-y-1">
              {SIDEBAR_TABS.map((tab, idx) => {
                const isActive = activeTab === idx;
                const isTopNifty = tab.id === 'top-companies';
                return (
                  <div key={tab.id}>
                    <button
                      onClick={() => handleSidebarTabClick(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive 
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
                          : 'text-slate-400 hover:bg-slate-950/40 hover:text-slate-200'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="flex-1 text-left">{tab.label}</span>
                      {tab.isNew && (
                        <span className="text-[7px] bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-extrabold px-1.5 py-0.5 rounded-full uppercase scale-90">
                          New
                        </span>
                      )}
                      {tab.hasDropdown && (
                        <span className="text-slate-500 text-[8px] ml-auto transition-transform" style={{ transform: isTopNiftyExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          ▼
                        </span>
                      )}
                    </button>
                    {isTopNifty && isTopNiftyExpanded && (
                      <div className="pl-6 space-y-1 mt-1 transition-all">
                        {[10, 20, 30, 40, 50].map((limit) => {
                          const isFilterActive = activeTab === 0 && niftyFilterLimit === limit;
                          return (
                            <button
                              key={limit}
                              onClick={() => {
                                setNiftyFilterLimit(limit);
                                setActiveTab(0); // Switch to Dashboard view
                              }}
                              className={`w-full text-left px-3 py-1 rounded-lg text-[11px] font-medium flex items-center gap-2 transition-colors ${
                                isFilterActive
                                  ? 'bg-violet-600/20 text-violet-300 border-l-2 border-violet-500 pl-2'
                                  : 'text-slate-550 hover:text-slate-300'
                              }`}
                            >
                              <span className="text-[6px]">•</span> Top {limit}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            {/* Market Snapshot in Sidebar */}
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-2xl space-y-2">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Market Snapshot</span>
              {[
                { name: 'NIFTY 50', val: '22,517.60', change: '+0.85%', isUp: true },
                { name: 'SENSEX', val: '74,340.09', change: '+0.73%', isUp: true },
                { name: 'NIFTY BANK', val: '48,153.15', change: '+1.24%', isUp: true },
                { name: 'INDIA VIX', val: '12.45', change: '-0.65%', isUp: false },
              ].map((m) => (
                <div key={m.name} className="flex justify-between items-center text-[9px]">
                  <span className="text-slate-400 font-semibold">{m.name}</span>
                  <div className="text-right">
                    <span className="text-slate-200 font-bold block">{m.val}</span>
                    <span className={`text-[8px] font-bold block ${m.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {m.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </aside>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header */}
          <header className="bg-[#0d121f] border-b border-[#1f293d] sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold md:hidden">
              <span className="text-lg">📈</span>
              <span className="font-extrabold text-slate-100">NiftyAI</span>
            </div>
            
            {/* Search Placeholder */}
            <div className="relative w-72 hidden md:block">
              <input
                type="text"
                placeholder="Search for companies, stocks, or ask anything..."
                className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl py-1.5 pl-4 pr-8 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab(4); // Switch to Chatbot Assistant
                  }
                }}
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500">🔍</span>
            </div>

            {/* Right Header Status indicators */}
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  Last Updated: {lastUpdated}
                </span>
              )}
              <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${
                backendOnline 
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
                  : 'bg-rose-950/20 border-rose-900/40 text-rose-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {backendOnline ? 'Online' : 'Offline'}
              </div>
              <button
                onClick={fetchData}
                className="text-[10px] px-3.5 py-1.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-md shadow-violet-500/10"
              >
                Refresh
              </button>
            </div>
          </header>

          {/* Core App Main */}
          <main className="flex-1 p-6 max-w-screen-2xl w-full mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center space-y-4">
                  <div className="text-5xl animate-spin">⏳</div>
                  <p className="text-slate-400 text-sm">Compiling Nifty analysis layers...</p>
                  <p className="text-xs text-slate-600">Ensure the backend is online at http://localhost:8000</p>
                </div>
              </div>
            ) : (
              <>
                {/* Active Tab Router */}
                {activeTab === 0 && (
                  <DashboardView
                    initialSymbol={selectedSymbol}
                    onSymbolSelect={(s) => setSelectedSymbol(s)}
                    onNavigateToChat={handleNavigateToChat}
                    filterLimit={niftyFilterLimit}
                    quotes={quotes}
                  />
                )}
                {activeTab === 1 && (
                  <MarketOverview
                    quotes={quotes}
                    recs={recs}
                    onSelect={(s) => { setSelectedSymbol(s); setActiveTab(2); }}
                  />
                )}
                {activeTab === 2 && (
                  <StockDetail symbol={selectedSymbol} />
                )}
                {activeTab === 4 && (
                  <PortfolioView
                    recs={recs}
                    quotes={quoteMap}
                  />
                )}
                {activeTab === 5 && (
                  <AIAssistantPage
                    selectedSymbol={selectedSymbol}
                    onCompanySelect={(s) => setSelectedSymbol(s)}
                    initialQuery={chatPreQuery}
                    clearPreQuery={() => setChatPreQuery('')}
                  />
                )}
              </>
            )}
          </main>

          <footer className="py-6 text-center border-t border-[#1f293d] mt-auto">
            <p className="text-[10px] text-slate-500 leading-snug">
              Nifty AI Investment Assistant · Developed for research purposes only · Not financial advice
            </p>
          </footer>

        </div>

      </div>

      {/* Floating FAQ Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Expanded Chat Dialog */}
        {isChatOpen && (
          <div className="w-[360px] h-[480px] bg-slate-950 border border-[#1f293d] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3 slide-in-right">
            {/* Header */}
            <div className="p-3.5 bg-[#0d121f] border-b border-[#1f293d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    NiftyAI FAQ Assistant
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  </h4>
                  <p className="text-[8px] text-slate-400">Ask anything about Nifty Top 10</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300 font-bold bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5"
              >
                ✕ Close
              </button>
            </div>
            {/* Chatbot engine */}
            <div className="flex-1 overflow-hidden">
              <AIChatbot
                selectedSymbol={selectedSymbol}
                onCompanySelect={(s) => setSelectedSymbol(s)}
                embedded={true}
              />
            </div>
          </div>
        )}

        {/* Floating Bubble Circle */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-violet-500/40 hover:scale-105 active:scale-95 transition-all text-xl"
          title="NiftyAI Assistant"
        >
          {isChatOpen ? '✕' : '🤖'}
        </button>

      </div>
    </>
  );
}

