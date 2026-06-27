import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { api, getRecBadgeClass } from '../utils/api';
import { useInvestmentState } from '../context/InvestmentStateContext';
import StockDetail from '../components/StockDetail';
import HeatmapView from '../components/HeatmapView';
import MarketOverview from '../components/MarketOverview';
import PortfolioView from '../components/PortfolioView';
import DashboardView from '../components/DashboardView';
import AIAssistantPage from '../components/AIAssistantPage';
import AIChatbot from '../components/AIChatbot';
import WatchlistView from '../components/WatchlistView';
import AlertsView from '../components/AlertsView';
import ReportsView from '../components/ReportsView';
import SettingsView from '../components/SettingsView';
import { auth, googleProvider, isFirebaseConfigured } from '../utils/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { 
  BarChart3, 
  Globe2, 
  TrendingUp, 
  CircleDollarSign, 
  Briefcase, 
  Bot, 
  Star, 
  Bell, 
  FileText, 
  Settings, 
  Search, 
  RefreshCw, 
  UserCircle2, 
  ChevronDown,
  LayoutGrid
} from 'lucide-react';

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
  const { state, getWatchlistSymbols } = useInvestmentState();
  const watchlistSymbols = getWatchlistSymbols();
  const watchlistCount = watchlistSymbols.length;
  const activeAlertsCount = Object.values(state.alerts).filter(a => a.enabled).length;

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
  const [user, setUser] = useState<any | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user]);

  // Listen to Firebase authentication state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Do not automatically sign in as demo user; let the user start as guest/unsigned in
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isDemo: false
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    if (!isFirebaseConfigured) {
      alert("Firebase is not configured in this build. To use Google Sign-In, please define the required NEXT_PUBLIC_FIREBASE_* environment variables in your deployment dashboard and re-trigger a production build. Logging in as Demo User for this session.");
      setUser({
        displayName: 'Akash Verma',
        email: 'akash.verma@email.com',
        photoURL: null,
        isDemo: true
      });
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser({
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          isDemo: false
        });
      }
    } catch (error: any) {
      console.error("Firebase Sign-In Error:", error);
      alert(`Failed to sign in with Google: ${error.message || error}`);
    }
  };

  const handleSignOut = async () => {
    if (!isFirebaseConfigured) {
      // Demo simulation logout
      setUser(null);
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Firebase Sign-Out Error:", error);
    }
  };

  const [timeStr, setTimeStr] = useState('');
  const [marketStatus, setMarketStatus] = useState<any>({ status: 'Closed', is_open: false });
  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString('en-IN'));
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('en-IN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, isActive: activeTab === 0 && niftyFilterLimit !== 50 },
    { id: 'market-overview', label: 'Market Overview', icon: Globe2, isActive: activeTab === 1 },
    { id: 'stock-analysis', label: 'Stock Analysis', icon: TrendingUp, isActive: activeTab === 2 },
    { id: 'top-companies', label: 'Top Fifty Nifty', icon: CircleDollarSign, isActive: activeTab === 0 && niftyFilterLimit === 50 },
    { id: 'heatmap', label: 'Heatmap', icon: LayoutGrid, isActive: activeTab === 10 },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase, isActive: activeTab === 4 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'NEW', isActive: activeTab === 5 },
    { id: 'watchlist', label: 'Watchlist', icon: Star, count: watchlistCount > 0 ? watchlistCount : undefined, isActive: activeTab === 6 },
    { id: 'alerts', label: 'Alerts', icon: Bell, count: activeAlertsCount > 0 ? activeAlertsCount : undefined, isActive: activeTab === 7 },
    { id: 'reports', label: 'Reports', icon: FileText, isActive: activeTab === 8 },
    { id: 'settings', label: 'Settings', icon: Settings, isActive: activeTab === 9 }
  ];

  const handleNavClick = (id: string) => {
    if (id === 'top-companies') {
      setNiftyFilterLimit(50);
      setActiveTab(0);
    } else if (id === 'dashboard') {
      setNiftyFilterLimit(10);
      setActiveTab(0);
    } else if (id === 'market-overview') {
      setActiveTab(1);
    } else if (id === 'stock-analysis') {
      setActiveTab(2);
    } else if (id === 'heatmap') {
      setActiveTab(10);
    } else if (id === 'portfolio') {
      setActiveTab(4);
    } else if (id === 'ai-assistant') {
      setActiveTab(5);
    } else if (id === 'watchlist') {
      setActiveTab(6);
    } else if (id === 'alerts') {
      setActiveTab(7);
    } else if (id === 'reports') {
      setActiveTab(8);
    } else if (id === 'settings') {
      setActiveTab(9);
    }
  };

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
      // Check if real FastAPI backend is online dynamically
      const online = await api.checkHealth();
      setBackendOnline(online);

      const [qRes, pRes, mRes] = await Promise.all([
        api.getAllQuotes(),
        api.getPortfolio(),
        api.getMarketStatus(),
      ]);
      setQuotes(qRes.data.quotes || []);
      setMarketStatus(mRes.data);
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
    setActiveTab(index);
  };

  return (
    <>
      <Head>
        <title>NiftyAI — Your AI Investment Assistant</title>
        <meta name="description" content="AI-powered stock investment assistant for Nifty Top 10" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📈</text></svg>" />
      </Head>

      <div className="h-screen overflow-hidden bg-[#020712] text-slate-100 selection:bg-violet-500/30">
        <div className="flex h-full overflow-hidden">
          {/* Left Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-40 hidden w-[205px] border-r border-[#152036] bg-[#07101f] lg:flex lg:flex-col">
            <div className="flex h-[72px] items-center gap-3 border-b border-[#152036] px-4 select-none">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-900/40">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-[20px] font-black tracking-tight text-white leading-none">
                  Nifty<span className="text-cyan-400">AI</span>
                </div>
                <div className="text-[9px] font-medium text-slate-500 mt-1">
                  AI Investment Assistant
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
              {navItems.map(({ id, label, icon: Icon, badge, count, isActive }, idx) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold transition ${
                    isActive 
                      ? "bg-gradient-to-r from-violet-700 to-violet-600 text-white shadow-lg shadow-violet-950/40" 
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-550 group-hover:text-cyan-400"}`}
                  />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[7px] font-black text-white">
                      {badge}
                    </span>
                  )}
                  {count && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="m-3 rounded-2xl border border-[#1d2a43] bg-[#0c1628] p-3 select-none">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300">
                  Market Snapshot
                </span>
                <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              {[
                ["NIFTY 50", "22,517.60", "+0.85%"],
                ["SENSEX", "74,340.09", "+0.73%"],
                ["NIFTY BANK", "48,153.15", "+1.24%"],
                ["INDIA VIX", "12.45", "-0.65%"],
              ].map(([name, value, change]) => (
                <div key={name} className="mb-3 last:mb-0">
                  <div className="text-[7px] font-bold tracking-wide text-slate-500">
                    {name}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-200">
                      {value}
                    </span>
                    <span
                      className={`text-[9px] font-bold ${change.startsWith("-") ? "text-rose-450" : "text-emerald-400"}`}
                    >
                      {change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Market Outlook Card at bottom of sidebar */}
            <div className="mx-3 mb-4 p-3 rounded-2xl border border-[#1e293b]/45 bg-[#0b1220] select-none">
              <div className="flex items-center gap-1.5 text-[8.5px] font-black text-violet-400 uppercase tracking-wider mb-1.5">
                <span>🤖</span>
                <span>AI Market Outlook</span>
              </div>
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[13px] font-black text-[#22C55E] block leading-none">Bullish</span>
                  <p className="text-[7.5px] text-[#94A3B8] font-medium leading-tight mt-1 max-w-[100px]">
                    High probability of positive move in next 5 sessions
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-[#F8FAFC] block leading-none">78%</span>
                  <span className="text-[7px] text-[#94A3B8] font-bold block mt-0.5">Confidence</span>
                </div>
              </div>
              <div className="h-6 w-full mt-2.5">
                <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path 
                    d="M 0 16 Q 15 14 30 18 T 60 8 T 90 4 L 100 2" 
                    fill="none" 
                    stroke="#22C55E" 
                    strokeWidth="1.8"
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 0 16 Q 15 14 30 18 T 60 8 T 90 4 L 100 2 L 100 20 L 0 20 Z" 
                    fill="url(#sidebarOutlookGrad)" 
                    opacity="0.12" 
                  />
                  <defs>
                    <linearGradient id="sidebarOutlookGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </aside>

          {/* Main Content Pane */}
          <div className="min-w-0 flex-1 lg:ml-[205px] flex flex-col h-full overflow-hidden">
            
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-[48px] items-center justify-between border-b border-[#152036] bg-[#06101e]/95 px-4 backdrop-blur-xl">
              <div className="relative w-full max-w-[355px] hidden md:block">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-550" />
                <input
                  className="h-8 w-full rounded-full border border-[#22304a] bg-[#050c17] pl-9 pr-9 text-[10px] text-slate-205 outline-none placeholder:text-slate-600 focus:border-violet-500"
                  placeholder="Search companies, stocks or anything..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setActiveTab(5); // Switch to AI Assistant Chat
                    }
                  }}
                />
                <div className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full border border-[#22304a] cursor-pointer">
                  <Search className="h-2.5 w-2.5 text-slate-500" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold md:hidden">
                <span className="text-lg">📈</span>
                <span className="font-extrabold text-slate-100">NiftyAI</span>
              </div>

              {/* Right Header Status indicators */}
              <div className="ml-4 flex items-center gap-5 whitespace-nowrap">
                <span className="hidden items-center gap-1.5 text-[10px] text-slate-300 md:flex select-none">
                  <span className={`h-2 w-2 rounded-full ${
                    marketStatus.status === 'Open' ? 'bg-emerald-400' :
                    marketStatus.status === 'Pre-Open' ? 'bg-amber-400 animate-pulse' :
                    marketStatus.status === 'Closing' ? 'bg-orange-400 animate-pulse' :
                    'bg-rose-500'
                  }`} />
                  Market: <b className={`${
                    marketStatus.status === 'Open' ? 'text-emerald-400' :
                    marketStatus.status === 'Pre-Open' ? 'text-amber-400' :
                    marketStatus.status === 'Closing' ? 'text-orange-400' :
                    'text-rose-500'
                  } font-extrabold`}>{marketStatus.status || 'Closed'}</b>
                </span>
                <span className="hidden text-[10px] font-semibold text-slate-300 xl:block select-none">
                  {timeStr || '02:38:38 PM'}
                </span>
                
                {/* Green Live Badge in top navbar */}
                <div className="hidden sm:flex items-center gap-1 bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  Live
                </div>

                <button 
                  onClick={fetchData}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-violet-750 px-3 text-[10px] font-bold text-white hover:bg-violet-600 transition-colors shadow shadow-violet-500/10"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
                <button 
                  onClick={() => setActiveTab(7)}
                  className="relative text-slate-400 hover:text-white"
                >
                  <Bell className="h-4 w-4" />
                  {activeAlertsCount > 0 && (
                    <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[7px] font-black text-white">
                      {activeAlertsCount}
                    </span>
                  )}
                </button>
                <button className="flex items-center gap-1.5 group select-none">
                  {user && user.photoURL && !imgError ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="h-7 w-7 rounded-full border border-[#33435f] object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="grid h-7 w-7 place-items-center rounded-full border border-[#33435f] bg-[#132038]">
                      {user && user.displayName ? (
                        <span className="text-[10px] font-black text-violet-400">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <UserCircle2 className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                  )}
                  <ChevronDown className="h-3 w-3 text-slate-550 group-hover:text-slate-300 transition-colors" />
                </button>
              </div>
            </header>

            {/* Core App Main */}
            <main className="flex-1 overflow-y-auto p-3 xl:p-4 pb-16 md:pb-4">
            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center space-y-4">
                  <div className="text-5xl animate-spin">⏳</div>
                  <p className="text-slate-400 text-sm">Compiling Nifty analysis layers...</p>
                  <p className="text-xs text-slate-600">Ensure the backend server is online and accessible</p>
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
                  <StockDetail 
                    symbol={selectedSymbol} 
                    onSymbolSelect={(s) => setSelectedSymbol(s)} 
                    onNavigateToChat={handleNavigateToChat} 
                  />
                )}
                {activeTab === 10 && (
                  <HeatmapView quotes={quotes} onSymbolSelect={(s) => { setSelectedSymbol(s); setActiveTab(2); }} />
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
                    quotes={quotes}
                    recs={recs}
                  />
                )}
                {activeTab === 6 && (
                  <WatchlistView 
                    quotes={quotes} 
                    recs={recs}
                    onSymbolSelect={(s) => { setSelectedSymbol(s); setActiveTab(2); }}
                    onNavigateToTab={(tab) => {
                      if (tab === 'alerts') setActiveTab(7);
                      else if (tab === 'portfolio') setActiveTab(4);
                    }}
                  />
                )}
                {activeTab === 7 && (
                  <AlertsView 
                    quotes={quotes}
                    onSymbolSelect={(s) => { setSelectedSymbol(s); setActiveTab(2); }}
                  />
                )}
                {activeTab === 8 && (
                  <ReportsView
                    quotes={quotes}
                    recs={recs}
                    selectedSymbol={selectedSymbol}
                    lastUpdated={lastUpdated}
                    onSymbolSelect={setSelectedSymbol}
                    onNavigateToStockAnalysis={(s) => { setSelectedSymbol(s); setActiveTab(2); }}
                  />
                )}
                {activeTab === 9 && (
                  <SettingsView 
                    user={user}
                    onSignIn={handleSignIn}
                    onSignOut={handleSignOut}
                  />
                )}
              </>
            )}
            {![1, 6, 7, 8].includes(activeTab) && (
              <footer className="py-4 text-center border-t border-[#152036] mt-6">
                <p className="text-[10px] text-slate-550 leading-snug">
                  Nifty AI Investment Assistant · Developed for research purposes only · Not financial advice
                </p>
              </footer>
            )}
          </main>

        </div>

      </div>

    </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d121f]/95 backdrop-blur-md border-t border-[#1f293d] py-2 px-4 flex justify-around items-center z-50 md:hidden shadow-lg shadow-black/40">
        {[
          { idx: 0, label: 'Home', icon: '🏠' },
          { idx: 1, label: 'Markets', icon: '🌐' },
          { idx: 2, label: 'Analysis', icon: '🔍' },
          { idx: 4, label: 'Portfolio', icon: '💼' },
          { idx: 5, label: 'AI Chat', icon: '🤖' }
        ].map((btn) => {
          const isActive = activeTab === btn.idx;
          return (
            <button
              key={btn.idx}
              onClick={() => setActiveTab(btn.idx)}
              className={`flex flex-col items-center gap-0.5 transition-all active:scale-95 ${
                isActive ? 'text-violet-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              <span className="text-base">{btn.icon}</span>
              <span className="text-[9px] tracking-wider uppercase font-semibold">{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Floating FAQ Chatbot Widget (Desktop only) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end hidden md:flex">
        
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

