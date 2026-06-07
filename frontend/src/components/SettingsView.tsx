import React, { useState } from 'react';

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

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Settings Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Manage your preferences, account settings and app configuration.</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto whitespace-nowrap pb-0.5 select-none scrollbar-none">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all relative ${
              activeSubTab === tab.id
                ? 'border-violet-500 text-violet-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'Preferences' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT/MAIN FORM PANELS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* GENERAL PREFERENCES CARD */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-5">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-850 pb-2">General Preferences</h3>
              
              <div className="space-y-4">
                {/* Default Market */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Default Market</label>
                    <span className="text-[10px] text-slate-400">Select the default market view for the dashboard</span>
                  </div>
                  <select 
                    value={market} 
                    onChange={(e) => setMarket(e.target.value)}
                    className="bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 min-w-[180px]"
                  >
                    <option>Indian Market</option>
                    <option>US Market</option>
                    <option>Global Markets</option>
                  </select>
                </div>

                {/* Default Watchlist */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Default Watchlist</label>
                    <span className="text-[10px] text-slate-400">Select the watchlist to show on app launch</span>
                  </div>
                  <select 
                    value={watchlist}
                    onChange={(e) => setWatchlist(e.target.value)}
                    className="bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 min-w-[180px]"
                  >
                    <option>My Watchlist</option>
                    <option>Indices Watchlist</option>
                    <option>Custom Watchlists</option>
                  </select>
                </div>

                {/* Theme Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Theme</label>
                    <span className="text-[10px] text-slate-400">Choose your preferred theme</span>
                  </div>
                  <div className="flex bg-[#080c14] border border-[#1f293d] rounded-xl p-0.5">
                    {['Light', 'Dark', 'System'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          theme === t 
                            ? 'bg-violet-600 text-white shadow' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t === 'Light' ? '☀️ Light' : t === 'Dark' ? '🌙 Dark' : '💻 System'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Compact Mode</label>
                    <span className="text-[10px] text-slate-400">Reduce spacing and size for more content</span>
                  </div>
                  <button
                    onClick={() => setCompactMode(!compactMode)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      compactMode ? 'bg-violet-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${
                      compactMode ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* DISPLAY PREFERENCES CARD */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-5">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-850 pb-2">Display Preferences</h3>
              
              <div className="space-y-4">
                {/* Currency */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Currency</label>
                    <span className="text-[10px] text-slate-400">Select the currency to display prices in</span>
                  </div>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 min-w-[180px]"
                  >
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>

                {/* Number Format */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Number Format</label>
                    <span className="text-[10px] text-slate-400">Choose how numbers are displayed</span>
                  </div>
                  <select 
                    value={numFormat} 
                    onChange={(e) => setNumFormat(e.target.value)}
                    className="bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 min-w-[180px]"
                  >
                    <option>1,23,456.78</option>
                    <option>123,456.78</option>
                    <option>123.456,78</option>
                  </select>
                </div>

                {/* Percentage Format */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Percentage Format</label>
                    <span className="text-[10px] text-slate-400">Choose how percentages are displayed</span>
                  </div>
                  <select 
                    value={pctFormat} 
                    onChange={(e) => setPctFormat(e.target.value)}
                    className="bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 min-w-[180px]"
                  >
                    <option>+1.23%</option>
                    <option>+1.2%</option>
                    <option>1.23 %</option>
                  </select>
                </div>

                {/* Chart Preferences */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Chart Preferences</label>
                    <span className="text-[10px] text-slate-400">Customize default chart appearance</span>
                  </div>
                  <button className="text-[10px] font-bold text-violet-400 bg-violet-950/20 border border-violet-900/30 px-3.5 py-1.5 rounded-xl hover:bg-violet-950/40">
                    🔧 Customize Charts
                  </button>
                </div>
              </div>
            </div>

            {/* DATA PREFERENCES CARD */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-5">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-850 pb-2">Data Preferences</h3>
              
              <div className="space-y-4">
                {/* Live Data Updates Toggle */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Live Data Updates</label>
                    <span className="text-[10px] text-slate-400">Enable real-time data updates across the app</span>
                  </div>
                  <button
                    onClick={() => setLiveData(!liveData)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      liveData ? 'bg-violet-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${
                      liveData ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Auto Refresh Interval */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Auto Refresh Interval</label>
                    <span className="text-[10px] text-slate-400">Set interval for auto refreshing data</span>
                  </div>
                  <select 
                    value={refreshInterval} 
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    disabled={!liveData}
                    className="bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 min-w-[180px] disabled:opacity-50"
                  >
                    <option>10 seconds</option>
                    <option>30 seconds</option>
                    <option>60 seconds</option>
                    <option>5 minutes</option>
                  </select>
                </div>

                {/* Show Extended Hours Data */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold block text-slate-200">Show Extended Hours Data</label>
                    <span className="text-[10px] text-slate-400">Include extended hours market data where available</span>
                  </div>
                  <button
                    onClick={() => setExtendedHours(!extendedHours)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      extendedHours ? 'bg-violet-600' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${
                      extendedHours ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR STATS & INFO */}
          <div className="space-y-6">
            
            {/* ACCOUNT INFORMATION */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Account Information</h3>
              
              <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-850 p-3 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 text-sm">
                  A
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Akash Verma</h4>
                  <p className="text-[10px] text-slate-500">akash.verma@email.com</p>
                </div>
              </div>

              <button className="w-full text-[10px] font-bold text-violet-400 border border-violet-900/30 bg-violet-950/10 hover:bg-violet-950/35 transition-colors py-2 rounded-xl">
                Manage Account
              </button>
            </div>

            {/* APP SETTINGS */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">App Settings</h3>
              
              <div className="space-y-1">
                {[
                  { label: 'Language', val: 'English' },
                  { label: 'Time Zone', val: '(UTC+05:30) Asia/Kolkata' },
                  { label: 'Date Format', val: '17 May 2024' }
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center justify-between py-2 border-b border-slate-850 text-[10px] hover:text-white transition-colors">
                    <span className="text-slate-400 font-semibold">{item.label}</span>
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      {item.val} <span className="text-slate-500 text-[8px]">▶</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECURITY */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Security</h3>
              
              <div className="space-y-1">
                {[
                  { label: 'Change Password', desc: 'Update your account password' },
                  { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security' }
                ].map((item) => (
                  <button key={item.label} className="w-full text-left py-2 border-b border-slate-850 hover:text-white transition-colors flex justify-between items-center group">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-300 group-hover:text-violet-400">{item.label}</h4>
                      <p className="text-[8px] text-slate-500">{item.desc}</p>
                    </div>
                    <span className="text-slate-500 text-[8px]">▶</span>
                  </button>
                ))}
              </div>
            </div>

            {/* OTHERS (UTILITIES) */}
            <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Others</h3>
              
              <div className="space-y-1">
                {/* Export Data */}
                <button className="w-full text-left py-2 border-b border-slate-850 hover:text-white transition-colors flex justify-between items-center group">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-300 group-hover:text-violet-400">Export My Data</h4>
                    <p className="text-[8px] text-slate-500">Download your account and app data</p>
                  </div>
                  <span className="text-slate-500 text-[8px]">▶</span>
                </button>

                {/* Clear Cache */}
                <div className="w-full py-2 border-b border-slate-850 flex justify-between items-center">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-300">Clear Cache</h4>
                    <p className="text-[8px] text-slate-500">Free up space and improve performance</p>
                  </div>
                  <button 
                    onClick={handleClearCache}
                    disabled={clearingCache || cacheSize === '0 MB'}
                    className="text-[9px] font-bold text-violet-400 hover:text-violet-300 disabled:opacity-40"
                  >
                    {clearingCache ? 'Clearing...' : cacheSize === '0 MB' ? 'Cleared' : cacheSize}
                  </button>
                </div>

                {/* Help & Support */}
                <button className="w-full text-left py-2 border-b border-slate-850 hover:text-white transition-colors flex justify-between items-center group">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-300 group-hover:text-violet-400">Help & Support</h4>
                    <p className="text-[8px] text-slate-500">Get help and view support resources</p>
                  </div>
                  <span className="text-slate-500 text-[8px]">▶</span>
                </button>

                {/* About NiftyAI */}
                <button className="w-full text-left py-2 flex justify-between items-center group">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-300 group-hover:text-violet-400">About NiftyAI</h4>
                    <p className="text-[8px] text-slate-500">Version 1.0.0</p>
                  </div>
                  <span className="text-slate-500 text-[8px]">▶</span>
                </button>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="card p-4 bg-rose-950/10 border border-rose-900/30 rounded-2xl shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Danger Zone</h3>
              <button 
                onClick={() => alert('Successfully logged out.')}
                className="w-full flex items-center justify-between py-2 border-t border-rose-900/10 text-[10px] font-bold text-rose-400 hover:bg-rose-950/20 px-2 rounded-xl transition-all"
              >
                <span>🚪 Log Out</span>
                <span>▶</span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="card p-8 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl text-center">
          <span className="text-3xl">⚙️</span>
          <h3 className="text-sm font-bold text-slate-200 mt-3">{activeSubTab} Configuration</h3>
          <p className="text-xs text-slate-500 mt-1">This section is fully configured. Live adjustments synchronize via security profiles.</p>
        </div>
      )}

    </div>
  );
}
