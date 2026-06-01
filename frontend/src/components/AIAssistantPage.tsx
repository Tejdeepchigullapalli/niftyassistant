import React, { useState } from 'react';
import AIChatbot from './AIChatbot';

interface AIAssistantPageProps {
  onCompanySelect?: (symbol: string) => void;
  selectedSymbol?: string;
  initialQuery?: string;
  clearPreQuery?: () => void;
}

export default function AIAssistantPage({ onCompanySelect, selectedSymbol, initialQuery, clearPreQuery }: AIAssistantPageProps) {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [localQuery, setLocalQuery] = useState('');

  return (
    <div className="space-y-6 fade-in">
      
      {/* Time & header strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-900/30 to-indigo-900/20 border border-violet-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xl shadow-lg">
            🤖
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
              AI Investment Assistant
            </h2>
            <p className="text-xs text-slate-400">Your intelligent guide to NIFTY 50 companies and smart investment decisions.</p>
          </div>
        </div>

        {/* Mascot dialog bubble */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 max-w-lg shadow-lg self-stretch md:self-auto">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-base border border-slate-700 animate-bounce">
            🤖
          </div>
          <p className="text-[10px] text-slate-350 leading-snug">
            "Hello! I'm your AI Investment Assistant. I can help you analyze companies, explore data, and make smarter investment decisions."
          </p>
        </div>
      </div>

      {/* Tabs list under header */}
      <div className="flex border-b border-slate-800 gap-3">
        {['Chat Assistant', 'Analysis Tools', 'Market Insights', 'Learning Center'].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(idx)}
            className={`pb-2.5 text-xs font-black uppercase transition-all relative ${
              activeSubTab === idx 
                ? 'text-violet-400 border-b-2 border-violet-500' 
                : 'text-slate-550 hover:text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main split grid */}
      {activeSubTab === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* LEFT 3 COLUMNS: REAL INTERACTIVE CHATFEED SCREEN */}
          <div className="lg:col-span-3 card border-slate-800 bg-[#090d16] overflow-hidden shadow-2xl relative h-[700px]">
            <AIChatbot
              selectedSymbol={selectedSymbol}
              onCompanySelect={onCompanySelect}
              embedded={true}
              initialQuery={localQuery || initialQuery}
              clearPreQuery={() => {
                setLocalQuery('');
                if (clearPreQuery) clearPreQuery();
              }}
            />
          </div>

          {/* RIGHT COLUMN: SHORTCUT CARDS SIDEBAR PANEL (takes 1/4) */}
          <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
            
            {/* AI Assistant Features */}
            <div className="card p-4 bg-[#0d121f] border-slate-800 flex-1 flex flex-col justify-between h-[330px] shadow-2xl">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 border-b border-slate-850 pb-1.5">AI Assistant Features</h3>
              <div className="space-y-2 overflow-y-auto chat-scrollbar pr-1">
                {[
                  { title: 'Company Analysis', desc: 'Get deep insights and detailed analysis of NIFTY stocks', icon: '🏢' },
                  { title: 'Investment Recommendations', desc: 'AI-powered picks matching financials & trends', icon: '🧠' },
                  { title: 'Market Insights', desc: 'Real-time market trends, news, and perceptions', icon: '📊' },
                  { title: 'Portfolio Analysis', desc: 'Evaluate assets and optimize investment weighting', icon: '💼' },
                  { title: 'Investment Simulator', desc: 'Project expected yields and simulated cash paths', icon: '💸' },
                  { title: 'Risk Assessment', desc: 'Evaluate volatility factors and leverage flags', icon: '⚠️' }
                ].map((f, i) => (
                  <div key={i} className="bg-slate-950/40 p-2 rounded-xl border border-slate-900 flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-200 leading-tight">{f.title}</h4>
                      <p className="text-[8px] text-slate-500 mt-0.5 leading-snug">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="card p-4 bg-[#0d121f] border-slate-800 flex-1 flex flex-col justify-between h-[310px] shadow-2xl">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 border-b border-slate-850 pb-1.5">Quick Actions</h3>
              <div className="space-y-1.5 overflow-y-auto chat-scrollbar pr-1">
                {[
                  'Analyze Top Gainers',
                  'Show High Dividend Stocks',
                  'Best Stocks for Long Term',
                  'Compare Two Companies',
                  'Sector Performance',
                  'Market News Today'
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => setLocalQuery(act)}
                    className="w-full bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-950/60 p-2 rounded-xl text-left text-[10.5px] font-semibold text-slate-300 transition-colors flex items-center justify-between shadow"
                  >
                    <span>{act}</span>
                    <span className="text-slate-650 text-xs">›</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Render fallback description for secondary sub-tabs */
        <div className="card p-8 bg-slate-900 border-slate-800 text-center shadow-xl">
          <div className="text-4xl mb-4">🛠️</div>
          <h3 className="text-sm font-bold text-slate-200">Tools coming soon in the next update!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">This tool features interactive charts, risk indicators, and peer comparisons tailored for each company.</p>
        </div>
      )}

    </div>
  );
}
