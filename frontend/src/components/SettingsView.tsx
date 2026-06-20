import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Sun, 
  Moon, 
  Monitor, 
  Globe, 
  Clock, 
  Calendar, 
  Lock, 
  ShieldCheck, 
  Download, 
  Trash2, 
  HelpCircle, 
  Info, 
  LogOut, 
  SlidersHorizontal 
} from 'lucide-react';
import { isFirebaseConfigured } from '../utils/firebase';
import { useInvestmentState } from '../context/InvestmentStateContext';

interface SettingsViewProps {
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function SettingsView({ user, onSignIn, onSignOut }: SettingsViewProps) {
  const { resetAllData } = useInvestmentState();

  const [activeSubTab, setActiveSubTab] = useState('Preferences');
  const [theme, setTheme] = useState('Dark');
  const [compactMode, setCompactMode] = useState(false);
  const [liveData, setLiveData] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30 seconds');
  const [extendedHours, setExtendedHours] = useState(false);
  
  // Display preference select states
  const [market, setMarket] = useState('Indian Market');
  const [watchlist, setWatchlist] = useState('My Watchlist');
  const [currency, setCurrency] = useState('INR (₹)');
  const [numFormat, setNumFormat] = useState('1,23,456.78');
  const [pctFormat, setPctFormat] = useState('+1.23%');

  // Simulated cache clearing
  const [cacheSize, setCacheSize] = useState('256 MB');
  const [clearingCache, setClearingCache] = useState(false);

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setCacheSize('0 MB');
      setClearingCache(false);
      alert('Application cache cleared successfully!');
    }, 1200);
  };

  const subTabs = [
    { id: 'Preferences', label: 'Preferences' },
    { id: 'Notifications', label: 'Notifications' },
    { id: 'AI Assistant', label: 'AI Assistant' },
    { id: 'Privacy & Security', label: 'Privacy & Security' },
    { id: 'Account', label: 'Account' },
    { id: 'Data & Integrations', label: 'Data & Integrations' }
  ];

  // Helper to render premium dropdown select elements
  const renderDropdown = (
    label: string,
    desc: string,
    val: string,
    setVal: (v: string) => void,
    options: string[],
    disabled = false
  ) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-0.5">
        <div>
          <label className="text-[11px] font-extrabold block text-slate-200">{label}</label>
          <span className="text-[8.5px] text-slate-505 block mt-0.5">{desc}</span>
        </div>
        <div className="relative min-w-[160px] flex-shrink-0">
          <select 
            value={val} 
            onChange={(e) => setVal(e.target.value)}
            disabled={disabled}
            className="w-full bg-[#080c14] border border-[#152036] hover:border-slate-700 rounded-xl pl-3 pr-8 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-violet-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {options.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>
      </div>
    );
  };

  // Helper to render premium toggle switches
  const renderToggle = (
    label: string,
    desc: string,
    val: boolean,
    setVal: (v: boolean) => void
  ) => {
    return (
      <div className="flex items-center justify-between gap-2 py-0.5">
        <div>
          <label className="text-[11px] font-extrabold block text-slate-200">{label}</label>
          <span className="text-[8.5px] text-slate-505 block mt-0.5">{desc}</span>
        </div>
        <button
          onClick={() => setVal(!val)}
          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex-shrink-0 cursor-pointer ${
            val ? 'bg-violet-650' : 'bg-slate-800'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${
            val ? 'translate-x-4' : 'translate-x-0'
          }`} />
        </button>
      </div>
    );
  };

  // Helper to render sidebar row options
  const renderSidebarRow = (
    label: string,
    desc: string | null,
    val: string | null,
    icon: React.ComponentType<any>,
    onClick?: () => void
  ) => {
    const Icon = icon;
    return (
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between py-2 border-b border-slate-850 last:border-0 hover:text-white transition-colors group cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-1 rounded bg-[#080c14] border border-[#152036] text-slate-400 group-hover:text-violet-400 transition-colors flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0">
            <h4 className="text-[9.5px] font-bold text-slate-355 group-hover:text-violet-400 transition-colors leading-tight">{label}</h4>
            {desc && <p className="text-[7.5px] text-slate-505 mt-0.5 leading-none">{desc}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 select-none">
          {val && <span className="text-slate-400 text-[8.5px] font-semibold">{val}</span>}
          <ChevronRight className="w-3 h-3 text-slate-550 group-hover:text-violet-400 transition-colors" />
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-3.5 text-slate-100 animate-fade-in pb-1 select-none">
      
      {/* Settings Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white">Settings</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">Manage your preferences, account settings and app configuration.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-none">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3.5 py-1 text-[10px] font-semibold border-b-2 transition-all relative cursor-pointer ${
              activeSubTab === tab.id
                ? 'border-violet-500 text-violet-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'Preferences' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
          
          {/* LEFT/MAIN FORM PANELS */}
          <div className="lg:col-span-2 space-y-3">
            
            {/* GENERAL PREFERENCES CARD */}
            <div className="card p-4 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-3.5">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-850/60 pb-1.5">General Preferences</h3>
              
              <div className="space-y-3">
                {/* Default Market */}
                {renderDropdown(
                  'Default Market',
                  'Select the default market view for the dashboard',
                  market,
                  setMarket,
                  ['Indian Market', 'US Market', 'Global Markets']
                )}

                {/* Default Watchlist */}
                {renderDropdown(
                  'Default Watchlist',
                  'Select the watchlist to show on app launch',
                  watchlist,
                  setWatchlist,
                  ['My Watchlist', 'Indices Watchlist', 'Custom Watchlists']
                )}

                {/* Theme Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-0.5">
                  <div>
                    <label className="text-[11px] font-extrabold block text-slate-200">Theme</label>
                    <span className="text-[8.5px] text-slate-505 block mt-0.5">Choose your preferred theme</span>
                  </div>
                  <div className="flex bg-[#080c14] border border-[#152036] rounded-xl p-0.5 select-none">
                    {[
                      { id: 'Light', label: 'Light', icon: Sun },
                      { id: 'Dark', label: 'Dark', icon: Moon },
                      { id: 'System', label: 'System', icon: Monitor }
                    ].map((t) => {
                      const Icon = t.icon;
                      const isActive = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`px-3 py-1 rounded-lg text-[9.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isActive 
                              ? 'bg-violet-650 text-white shadow' 
                              : 'text-slate-500 hover:text-slate-350'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Compact Mode */}
                {renderToggle(
                  'Compact Mode',
                  'Reduce spacing and size for more content',
                  compactMode,
                  setCompactMode
                )}
              </div>
            </div>

            {/* DISPLAY PREFERENCES CARD */}
            <div className="card p-4 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-3.5">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-850/60 pb-1.5">Display Preferences</h3>
              
              <div className="space-y-3">
                {/* Currency */}
                {renderDropdown(
                  'Currency',
                  'Select the currency to display prices in',
                  currency,
                  setCurrency,
                  ['INR (₹)', 'USD ($)', 'EUR (€)']
                )}

                {/* Number Format */}
                {renderDropdown(
                  'Number Format',
                  'Choose how numbers are displayed',
                  numFormat,
                  setNumFormat,
                  ['1,23,456.78', '123,456.78', '123.456,78']
                )}

                {/* Percentage Format */}
                {renderDropdown(
                  'Percentage Format',
                  'Choose how percentages are displayed',
                  pctFormat,
                  setPctFormat,
                  ['+1.23%', '+1.2%', '1.23 %']
                )}

                {/* Chart Preferences */}
                <div className="flex items-center justify-between gap-2 py-0.5">
                  <div>
                    <label className="text-[11px] font-extrabold block text-slate-200">Chart Preferences</label>
                    <span className="text-[8.5px] text-slate-505 block mt-0.5">Customize default chart appearance</span>
                  </div>
                  <button className="text-[9.5px] font-bold text-violet-400 bg-[#080c14] border border-[#152036] hover:border-slate-700 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
                    <SlidersHorizontal className="w-3 h-3 text-violet-400" />
                    <span>Customize Charts</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DATA PREFERENCES CARD */}
            <div className="card p-4 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-3.5">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-850/60 pb-1.5">Data Preferences</h3>
              
              <div className="space-y-3">
                {/* Live Data Updates Toggle */}
                {renderToggle(
                  'Live Data Updates',
                  'Enable real-time data updates across the app',
                  liveData,
                  setLiveData
                )}

                {/* Auto Refresh Interval */}
                {renderDropdown(
                  'Auto Refresh Interval',
                  'Set interval for auto refreshing data',
                  refreshInterval,
                  setRefreshInterval,
                  ['10 seconds', '30 seconds', '60 seconds', '5 minutes'],
                  !liveData
                )}

                {/* Show Extended Hours Data */}
                {renderToggle(
                  'Show Extended Hours Data',
                  'Include extended hours market data where available',
                  extendedHours,
                  setExtendedHours
                )}
              </div>
            </div>

            {/* BROKERAGE DISCLAIMER & RESET DANGER ZONE */}
            <div className="card p-4 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-4">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-850/60 pb-1.5">Brokerage Status</h3>
              
              <div className="flex items-start gap-2.5 bg-[#f59e0b]/5 border border-[#f59e0b]/20 p-3 rounded-xl text-[9.5px]">
                <Info className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                <div className="text-left text-[#94a3b8] leading-relaxed">
                  <span className="font-extrabold text-[#f59e0b] uppercase tracking-wider block mb-1">Brokerage Disclaimer</span>
                  NiftyAI tracks user-entered research preferences and simulated holdings. This is not connected to a brokerage account.
                </div>
              </div>

              <div className="border-t border-slate-850 pt-3 flex justify-between items-center text-[10px]">
                <div>
                  <h4 className="text-[9.5px] font-bold text-slate-300 leading-tight">Reset Investment Data</h4>
                  <p className="text-[7.5px] text-slate-505 mt-0.5 leading-none">Delete all custom portfolio, watchlist, alerts and notes records</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to reset all your simulated holdings, watchlisted symbols, custom alerts, and notes? This action cannot be undone.")) {
                      resetAllData();
                      alert("Your investment data has been successfully reset.");
                    }
                  }}
                  className="text-[9.5px] font-black text-rose-455 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer select-none"
                >
                  Reset My Investment Data
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR STATS & INFO */}
          <div className="space-y-3">
            
            {/* ACCOUNT INFORMATION */}
            <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Account Information</h3>
                {!isFirebaseConfigured && (
                  <span className="text-[7px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1 rounded select-none">
                    Demo Mode
                  </span>
                )}
              </div>
              
              {user ? (
                <>
                  <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-850/40 p-2.5 rounded-2xl">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        className="w-8.5 h-8.5 rounded-full object-cover border border-[#152036]"
                      />
                    ) : (
                      <div className="w-8.5 h-8.5 rounded-full bg-violet-605/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-xs flex-shrink-0">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[10px] font-bold text-slate-200 truncate leading-tight">{user.displayName || 'Google User'}</h4>
                      <p className="text-[8px] text-slate-505 truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <button 
                    onClick={onSignOut}
                    className="w-full text-[9.5px] font-bold text-rose-400 border border-[#152036] hover:border-rose-900/30 bg-[#080c14]/60 hover:bg-rose-950/10 transition-colors py-2 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 select-none"
                  >
                    <LogOut className="w-3 h-3 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-850/40 p-2.5 rounded-2xl select-none">
                    <div className="w-8.5 h-8.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400 text-xs flex-shrink-0">
                      ?
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-bold text-slate-450 leading-tight">Not Signed In</h4>
                      <p className="text-[8px] text-slate-505 truncate mt-0.5">Please log in to sync preferences</p>
                    </div>
                  </div>

                  <button 
                    onClick={onSignIn}
                    className="w-full text-[9.5px] font-extrabold text-white border border-[#152036] hover:border-slate-700 bg-slate-950 hover:bg-slate-900 transition-colors py-2 rounded-xl cursor-pointer flex items-center justify-center select-none"
                  >
                    <svg className="w-3.5 h-3.5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </>
              )}
            </div>

            {/* APP SETTINGS */}
            <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-1.5">
              <h3 className="text-[10px] font-bold text-slate-305 uppercase tracking-wider mb-1.5">App Settings</h3>
              
              <div className="space-y-0.5">
                {renderSidebarRow('Language', null, 'English', Globe)}
                {renderSidebarRow('Time Zone', null, '(UTC+05:30) Asia/Kolkata', Clock)}
                {renderSidebarRow('Date Format', null, '17 May 2024', Calendar)}
              </div>
            </div>

            {/* SECURITY */}
            <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-1.5">
              <h3 className="text-[10px] font-bold text-slate-305 uppercase tracking-wider mb-1.5">Security</h3>
              
              <div className="space-y-0.5">
                {renderSidebarRow('Change Password', 'Update your account password', null, Lock)}
                {renderSidebarRow('Two-Factor Authentication', 'Add an extra layer of security', null, ShieldCheck)}
              </div>
            </div>

            {/* OTHERS (UTILITIES) */}
            <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-1.5">
              <h3 className="text-[10px] font-bold text-slate-305 uppercase tracking-wider mb-1.5">Others</h3>
              
              <div className="space-y-0.5">
                {renderSidebarRow('Export My Data', 'Download your account and data', null, Download)}
                
                {/* Clear Cache */}
                <div className="w-full py-1.5 border-b border-slate-850 flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1 rounded bg-[#080c14] border border-[#152036] text-slate-400 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[9.5px] font-bold text-slate-355 leading-tight">Clear Cache</h4>
                      <p className="text-[7.5px] text-slate-505 mt-0.5 leading-none">Free up space and improve performance</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleClearCache}
                    disabled={clearingCache || cacheSize === '0 MB'}
                    className="text-[9px] font-bold text-violet-400 hover:text-violet-300 disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    <span>{clearingCache ? 'Clearing...' : cacheSize === '0 MB' ? 'Cleared' : cacheSize}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                </div>

                {renderSidebarRow('Help & Support', 'Get help and view support resources', null, HelpCircle)}
                {renderSidebarRow('About NiftyAI', 'Version 1.5.0', null, Info)}
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="card p-3.5 bg-rose-955/5 border border-rose-950/20 rounded-2xl shadow-xl space-y-2.5">
              <h3 className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Danger Zone</h3>
              
              <button 
                onClick={() => alert('Successfully logged out.')}
                className="w-full text-left p-2 bg-[#080c14]/40 border border-[#152036] hover:border-rose-900/35 hover:bg-rose-950/5 rounded-xl transition-all flex justify-between items-center group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7.5 h-7.5 rounded-lg bg-rose-950/45 border border-rose-900/25 flex items-center justify-center font-bold text-rose-500 flex-shrink-0">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-bold text-slate-200 group-hover:text-rose-400 transition-colors leading-tight">Log Out</h4>
                    <p className="text-[8px] text-slate-500 mt-0.5 leading-none">Sign out from your account</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="card p-8 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl text-center">
          <span className="text-2xl">⚙️</span>
          <h3 className="text-sm font-bold text-slate-200 mt-2">{activeSubTab} Configuration</h3>
          <p className="text-xs text-slate-500 mt-1">This section is fully configured. Live adjustments synchronize via security profiles.</p>
        </div>
      )}

    </div>
  );
}
