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

export default function SettingsView() {
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

  // Helper to render premium dropdown select elements matching mockup chevron look
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
          <span className="text-[8.5px] text-slate-500 block mt-0.5">{desc}</span>
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
          <span className="text-[8.5px] text-slate-500 block mt-0.5">{desc}</span>
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

  // Helper to render sidebar row options with Lucide icons
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
            <h4 className="text-[9.5px] font-bold text-slate-300 group-hover:text-violet-400 transition-colors leading-tight">{label}</h4>
            {desc && <p className="text-[7.5px] text-slate-500 mt-0.5 leading-none">{desc}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 select-none">
          {val && <span className="text-slate-400 text-[8.5px] font-semibold">{val}</span>}
          <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-violet-400 transition-colors" />
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-3.5 text-slate-100 animate-fade-in pb-1 select-none">
      
      {/* Settings Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Settings</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">Manage your preferences, account settings and app configuration.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-none">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3.5 py-1 text-[10px] font-semibold border-b-2 transition-all relative ${
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
                    <span className="text-[8.5px] text-slate-500 block mt-0.5">Customize default chart appearance</span>
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

          </div>

          {/* RIGHT SIDEBAR STATS & INFO */}
          <div className="space-y-3">
            
            {/* ACCOUNT INFORMATION */}
            <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-3">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Account Information</h3>
              
              <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-850/40 p-2.5 rounded-2xl">
                <div className="w-8.5 h-8.5 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-xs flex-shrink-0">
                  A
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-bold text-slate-200 truncate leading-tight">Akash Verma</h4>
                  <p className="text-[8px] text-slate-500 truncate mt-0.5">akash.verma@email.com</p>
                </div>
              </div>

              <button className="w-full text-[9.5px] font-bold text-slate-300 border border-[#152036] hover:border-slate-700 bg-[#080c14]/60 hover:bg-[#080c14] transition-colors py-2 rounded-xl cursor-pointer">
                Manage Account
              </button>
            </div>

            {/* APP SETTINGS */}
            <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-1.5">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">App Settings</h3>
              
              <div className="space-y-0.5">
                {renderSidebarRow('Language', null, 'English', Globe)}
                {renderSidebarRow('Time Zone', null, '(UTC+05:30) Asia/Kolkata', Clock)}
                {renderSidebarRow('Date Format', null, '17 May 2024', Calendar)}
              </div>
            </div>

            {/* SECURITY */}
            <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-1.5">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Security</h3>
              
              <div className="space-y-0.5">
                {renderSidebarRow('Change Password', 'Update your account password', null, Lock)}
                {renderSidebarRow('Two-Factor Authentication', 'Add an extra layer of security', null, ShieldCheck)}
              </div>
            </div>

            {/* OTHERS (UTILITIES) */}
            <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-1.5">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">Others</h3>
              
              <div className="space-y-0.5">
                {renderSidebarRow('Export My Data', 'Download your account and data', null, Download)}
                
                {/* Clear Cache */}
                <div className="w-full py-1.5 border-b border-slate-850 flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1 rounded bg-[#080c14] border border-[#152036] text-slate-400 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[9.5px] font-bold text-slate-300 leading-tight">Clear Cache</h4>
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
                {renderSidebarRow('About NiftyAI', 'Version 1.0.0', null, Info)}
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
