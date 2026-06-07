import React, { useState } from 'react';

// Sample initial alert states
const INITIAL_ALERTS = [
  { id: '1', symbol: 'RELIANCE', name: 'RELIANCE Price Alert', company: 'Reliance Industries Ltd.', condition: 'Price above', value: '₹3,000.00', rawValue: 3000, current: '₹2,936.12', change: '+1.58%', isGreen: true, status: 'Active', createdOn: '17 May 2024 02:30 PM', logo: 'relianceindustries.com' },
  { id: '2', symbol: 'TCS', name: 'TCS % Change Alert', company: 'Tata Consultancy Services', condition: 'Change above', value: '5.00%', rawValue: 5, current: '+0.85%', change: '', isGreen: true, status: 'Active', createdOn: '17 May 2024 01:45 PM', logo: 'tcs.com' },
  { id: '3', symbol: 'HDFCBANK', name: 'HDFCBANK Volume Alert', company: 'HDFC Bank Ltd.', condition: 'Volume above', value: '2,00,00,005', rawValue: 20000000, current: '2,46,67,890', change: '', isGreen: true, status: 'Active', createdOn: '17 May 2024 01:20 PM', logo: 'hdfcbank.com' },
  { id: '4', symbol: 'INFY', name: 'INFY RSI Alert', company: 'Infosys Ltd.', condition: 'RSI below (14)', value: '30', rawValue: 30, current: '28.45', change: '', isGreen: false, status: 'Active', createdOn: '17 May 2024 12:50 PM', logo: 'infosys.com' },
  { id: '5', symbol: 'ICICIBANK', name: 'ICICIBANK MA Alert', company: 'ICICI Bank Ltd.', condition: 'Price above MA (50)', value: '₹1,300.00', rawValue: 1300, current: '₹1,285.90', change: '', isGreen: false, status: 'Active', createdOn: '17 May 2024 12:15 PM', logo: 'icicibank.com' },
  { id: '6', symbol: 'SBIN', name: 'SBIN News Alert', company: 'State Bank of India', condition: 'Any News', value: '-', rawValue: 0, current: '-', change: '', isGreen: true, status: 'Active', createdOn: '17 May 2024 11:30 AM', logo: 'sbi.co.in' },
  { id: '7', symbol: 'NIFTY', name: 'NIFTY 50 Change Alert', company: 'NIFTY 50 Index', condition: 'Change below', value: '-1.00%', rawValue: -1, current: '+0.85%', change: '', isGreen: true, status: 'Triggered', createdOn: '17 May 2024 10:05 AM', logo: 'nseindia.com' },
  { id: '8', symbol: 'LT', name: 'LT Price Alert', company: 'Larsen & Toubro Ltd.', condition: 'Price below', value: '₹3,500.00', rawValue: 3500, current: '₹3,625.80', change: '', isGreen: true, status: 'Expired', createdOn: '16 May 2024 03:20 PM', logo: 'larsentoubro.com' }
];

export default function AlertsView() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState('All Alerts');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');

  // Modal input states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('RELIANCE');
  const [newCondition, setNewCondition] = useState('Price above');
  const [newValue, setNewValue] = useState('3000');

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setAlerts(alerts.map(a => {
      if (a.id === id) {
        const newStatus = a.status === 'Active' ? 'Paused' : 'Active';
        return { ...a, status: newStatus };
      }
      return a;
    }));
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newValue) return;

    const sym = newSymbol.toUpperCase();
    const isPrice = newCondition.includes('Price');
    const formattedVal = isPrice ? `₹${parseFloat(newValue).toLocaleString('en-IN')}` : newValue;

    const newAlert = {
      id: String(Date.now()),
      symbol: sym,
      name: `${sym} Alert`,
      company: `${sym} India Ltd.`,
      condition: newCondition,
      value: formattedVal,
      rawValue: parseFloat(newValue) || 0,
      current: isPrice ? '₹' + parseFloat(newValue).toLocaleString('en-IN') : '0.00%',
      change: '',
      isGreen: true,
      status: 'Active',
      createdOn: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      logo: `${sym.toLowerCase()}.com`
    };

    setAlerts([newAlert, ...alerts]);
    setShowCreateModal(false);
    setNewValue('');
  };

  // Renders logo dynamically with Google favicon API fallback
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

  // Counters
  const totalCount = alerts.length;
  const activeCount = alerts.filter(a => a.status === 'Active' || a.status === 'Paused').length;
  const triggeredCount = alerts.filter(a => a.status === 'Triggered').length;
  const expiredCount = alerts.filter(a => a.status === 'Expired').length;

  // Filter & Search & Sort logic
  const filteredAlerts = alerts
    .filter(a => {
      // Tab filter
      if (activeTab === 'Active') return a.status === 'Active' || a.status === 'Paused';
      if (activeTab === 'Triggered') return a.status === 'Triggered';
      if (activeTab === 'Expired') return a.status === 'Expired';
      return true;
    })
    .filter(a => {
      // Search filter
      const term = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(term) || a.symbol.toLowerCase().includes(term) || a.company.toLowerCase().includes(term);
    });

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in relative">
      
      {/* Alerts Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Alerts</h2>
          <p className="text-xs text-slate-400 mt-1">Create, manage and track real-time alerts for smart trading and investments.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-xs font-bold px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white shadow-md shadow-violet-500/10 transition-all w-fit"
        >
          ➕ Create Alert
        </button>
      </div>

      {/* Stats row cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Price Alerts', val: '12 Active', color: 'text-violet-400', icon: '🔔' },
          { label: '% Change Alerts', val: '8 Active', color: 'text-emerald-400', icon: '📈' },
          { label: 'Volume Alerts', val: '6 Active', color: 'text-amber-400', icon: '📊' },
          { label: 'Technical Alerts', val: '10 Active', color: 'text-cyan-400', icon: '📉' },
          { label: 'News Alerts', val: '5 Active', color: 'text-purple-400', icon: '📰' }
        ].map((c) => (
          <div key={c.label} className="bg-[#0d121f] border border-[#1f293d] p-3.5 rounded-2xl flex items-center gap-3">
            <span className="text-lg bg-slate-950 p-2 rounded-xl border border-slate-850">{c.icon}</span>
            <div>
              <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">{c.label}</span>
              <span className={`text-xs font-bold block mt-0.5 ${c.color}`}>{c.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT/MAIN TABLE SECTION */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters and search header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d121f] border border-[#1f293d] p-3 rounded-2xl">
            <div className="flex border-b border-slate-800 gap-3 w-full sm:w-auto">
              {['All Alerts', 'Active', 'Triggered', 'Expired'].map((tab) => {
                const count = tab === 'Active' ? activeCount : tab === 'Triggered' ? triggeredCount : tab === 'Expired' ? expiredCount : totalCount;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-xs font-semibold border-b-2 transition-all ${
                      activeTab === tab
                        ? 'border-violet-500 text-violet-400 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#080c14] border border-[#1f293d] rounded-xl py-1.5 pl-3 pr-8 text-[11px] text-slate-200 focus:outline-none focus:border-violet-500 w-full"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500">🔍</span>
              </div>
              
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-[#080c14] border border-[#1f293d] rounded-xl px-2 py-1.5 text-[10px] text-slate-300 font-bold focus:outline-none"
              >
                <option>Sort by: Newest</option>
                <option>Sort by: Oldest</option>
              </select>
            </div>
          </div>

          {/* ALERTS TABLE */}
          <div className="card bg-[#0d121f] border border-[#1f293d] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 font-bold bg-[#0d121f] uppercase tracking-wider text-[9px]">
                    <th className="py-3.5 px-4">Alert Name</th>
                    <th className="py-3.5 px-3">Condition</th>
                    <th className="py-3.5 px-3">Value</th>
                    <th className="py-3.5 px-3">Current</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-3">Created On</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No alerts match your filter or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-2.5">
                          {renderLogo(alert.logo, alert.symbol)}
                          <div>
                            <span className="font-bold text-slate-200 block">{alert.name}</span>
                            <span className="text-[9px] text-slate-500 block">{alert.company}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-400">{alert.condition}</td>
                        <td className="py-3.5 px-3 font-bold text-violet-400">{alert.value}</td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-200">{alert.current}</span>
                          {alert.change && (
                            <span className={`text-[9px] font-bold ml-1.5 ${alert.isGreen ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {alert.change}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold inline-block border ${
                            alert.status === 'Active' 
                              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
                              : alert.status === 'Paused'
                              ? 'bg-amber-950/20 border-amber-900/40 text-amber-400'
                              : alert.status === 'Triggered'
                              ? 'bg-violet-950/20 border-violet-900/40 text-violet-400'
                              : 'bg-slate-950/20 border-slate-900/40 text-slate-400'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 font-semibold">{alert.createdOn}</td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {alert.status !== 'Triggered' && alert.status !== 'Expired' && (
                            <button
                              onClick={() => handleToggleStatus(alert.id)}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                              title={alert.status === 'Active' ? 'Pause Alert' : 'Resume Alert'}
                            >
                              {alert.status === 'Active' ? '⏸️' : '▶️'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(alert.id)}
                            className="p-1.5 rounded-lg bg-rose-950/10 border border-rose-900/20 hover:border-rose-700 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Delete Alert"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-slate-850 p-4 select-none">
              <span className="text-[10px] text-slate-500">Showing 1 to {filteredAlerts.length} of {filteredAlerts.length} alerts</span>
              <div className="flex gap-1.5">
                <button className="px-2 py-1 bg-slate-950 border border-slate-850 text-[10px] text-slate-500 rounded-lg disabled:opacity-40" disabled>&lt;</button>
                <button className="px-2.5 py-1 bg-violet-600 border border-violet-500 text-[10px] text-white rounded-lg font-bold">1</button>
                <button className="px-2.5 py-1 bg-slate-950 border border-slate-850 text-[10px] text-slate-400 rounded-lg hover:border-slate-700">2</button>
                <button className="px-2 py-1 bg-slate-950 border border-slate-850 text-[10px] text-slate-400 rounded-lg hover:border-slate-700">&gt;</button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR PANEL */}
        <div className="space-y-6">
          
          {/* ALERT SUMMARY */}
          <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Alert Summary</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active Alerts', val: activeCount, color: 'text-violet-400' },
                { label: 'Triggered', val: triggeredCount, color: 'text-emerald-400' },
                { label: 'Expired', val: expiredCount, color: 'text-slate-400' },
                { label: 'Paused', val: alerts.filter(a => a.status === 'Paused').length, color: 'text-amber-400' }
              ].map((s) => (
                <div key={s.label} className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl text-center">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">{s.label}</span>
                  <span className={`text-base font-extrabold block mt-1 ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full text-[10px] font-bold bg-violet-600 hover:bg-violet-500 transition-colors py-2.5 rounded-xl shadow shadow-violet-500/15"
            >
              ⚙️ Create New Alert
            </button>
          </div>

          {/* MARKET MOVERS (ALERTS TRIGGERED) */}
          <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Market Movers <span className="text-[9px] text-slate-500 font-semibold">(Alerts Triggered)</span></h3>
            
            <div className="space-y-2">
              {[
                { sym: 'RELIANCE', desc: 'Price above ₹2,900', val: '₹2,936.12', diff: '+1.58%', isGreen: true },
                { sym: 'TCS', desc: 'Change above 5%', val: '+0.85%', diff: '', isGreen: true },
                { sym: 'HDFCBANK', desc: 'Volume above 2Cr', val: '2.45 Cr', diff: '01:20 PM', isGreen: false },
                { sym: 'INFY', desc: 'RSI below 30', val: '28.45', diff: '12:50 PM', isGreen: false }
              ].map((m) => (
                <div key={m.sym} className="flex justify-between items-center bg-slate-950/30 border border-slate-850/60 p-2.5 rounded-xl text-[10px]">
                  <div>
                    <span className="font-bold text-slate-200 block">{m.sym}</span>
                    <span className="text-[8px] text-slate-500 block">{m.desc}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200 block">{m.val}</span>
                    <span className={`text-[8px] font-bold block ${m.isGreen ? 'text-emerald-500' : 'text-slate-500'}`}>{m.diff}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setActiveTab('Triggered')}
              className="w-full text-center text-[9px] font-bold text-violet-400 hover:text-violet-300"
            >
              View All Triggered Alerts ➔
            </button>
          </div>

          {/* QUICK CREATE ALERTS */}
          <div className="card p-5 bg-[#0d121f] border border-[#1f293d] rounded-2xl shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Quick Create Alerts</h3>
            
            <div className="space-y-1.5">
              {[
                { label: 'Price Alert', desc: 'Set target price for a stock', trigger: 'Price above' },
                { label: 'Change Alert', desc: 'Set alert for % change', trigger: 'Change above' },
                { label: 'Volume Alert', desc: 'Set alert for volume spike', trigger: 'Volume above' },
                { label: 'Technical Alert', desc: 'Set technical indicator alert', trigger: 'RSI below (14)' }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setNewCondition(item.trigger);
                    setShowCreateModal(true);
                  }}
                  className="w-full text-left p-2.5 border border-slate-850/60 hover:border-slate-700 bg-slate-950/10 hover:bg-slate-950/30 rounded-xl transition-all flex justify-between items-center group"
                >
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-300 group-hover:text-violet-400">{item.label}</h4>
                    <p className="text-[8px] text-slate-500">{item.desc}</p>
                  </div>
                  <span className="text-slate-500 text-[12px] font-extrabold">+</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* CREATE ALERT DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0d121f] border border-[#1f293d] rounded-2xl p-5 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-xs font-bold text-slate-200">➕ Create New Alert</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-300 text-xs font-bold bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateAlert} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company Symbol</label>
                <select
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  {['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'SBIN', 'LT', 'BHARTIARTL', 'ITC', 'TATAMOTORS'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alert Condition</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="Price above">Price above (₹)</option>
                  <option value="Price below">Price below (₹)</option>
                  <option value="Change above">Change % above</option>
                  <option value="Volume above">Volume above</option>
                  <option value="RSI below (14)">RSI below (14)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Value</label>
                <input
                  type="text"
                  placeholder="e.g. 3100"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="flex gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 text-[10px] font-bold py-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-[10px] font-bold py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
