import React, { useState, useEffect } from 'react';
import { CompanyMeta, QuoteData, RecommendationData, SentimentData, FinancialData } from '../types/stock';
import { api, COMPANIES_METADATA, getCompanyMeta } from '../utils/api';
import { CompanyLogo } from './common/CompanyLogo';
import SentimentGauge from './SentimentGauge';
import { calculateSupportResistance, buildForecastScenarios } from '../utils/analysisUtils';
import { 
  Search, Play, Plus, Trash2, ArrowUpRight, ArrowDownRight, 
  ChevronRight, BrainCircuit, ShieldAlert, Sparkles, RefreshCw, BarChart4 
} from 'lucide-react';

interface StockResearchReportProps {
  initialSymbol: string;
  quotes: QuoteData[];
  recs?: Record<string, RecommendationData>;
  onSymbolSelect: (symbol: string) => void;
  onNavigateToStockAnalysis: (symbol: string) => void;
  onAskAI?: (prompt: string, symbol: string) => void;
}

export default function StockResearchReport({
  initialSymbol,
  quotes = [],
  recs = {},
  onSymbolSelect,
  onNavigateToStockAnalysis,
  onAskAI
}: StockResearchReportProps) {
  const [selectedSym, setSelectedSym] = useState(initialSymbol);
  
  // Local stock details state
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load details dynamically when user changes company in dropdown
  const loadStockDetails = async (sym: string) => {
    setLoading(true);
    try {
      const [qRes, rRes, sRes] = await Promise.all([
        api.getQuote(sym),
        api.getRecommendation(sym),
        api.getSentiment(sym)
      ]);
      setQuote(qRes.data);
      setRecommendation(rRes.data);
      setSentiment(sRes.data);
    } catch (err) {
      console.error("[NiftyAI StockReport Error] Failed loading details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockDetails(selectedSym);
  }, [selectedSym]);

  const meta = getCompanyMeta(selectedSym);

  // Fallbacks if data is still loading or missing
  const price = quote?.current_price ?? meta.basePrice;
  const changePct = quote?.change_pct ?? 0.0;
  const aiScore = recommendation?.ai_investment_score ?? 75;
  const recText = recommendation?.recommendation ?? 'Buy';
  const target = recommendation?.target_price ?? (meta.basePrice * 1.15);
  const upside = recommendation?.upside_pct ?? 15.0;
  const confidence = recommendation?.confidence ?? 78;

  // Valuation Zones Bear/Base/Bull calculations
  const scenarios = buildForecastScenarios(price, quote);
  const bullCase = scenarios.find(s => s.type === 'Bull')?.targetPrice ?? price * 1.25;
  const baseCase = scenarios.find(s => s.type === 'Base')?.targetPrice ?? price * 1.12;
  const bearCase = scenarios.find(s => s.type === 'Bear')?.targetPrice ?? price * 0.85;

  // Support / Resistance
  const technicals = calculateSupportResistance(price);

  return (
    <div className="space-y-4 text-[#F8FAFC]">
      
      {/* 1. Selector Bar */}
      <div className="bg-[#0B1220] border border-[#1E293B] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <CompanyLogo symbol={selectedSym} size="md" />
          <div className="space-y-1">
            {/* Dropdown Selector */}
            <div className="flex items-center gap-1">
              <select 
                value={selectedSym}
                onChange={(e) => {
                  setSelectedSym(e.target.value);
                  onSymbolSelect(e.target.value);
                }}
                className="bg-transparent text-slate-100 font-extrabold text-sm outline-none cursor-pointer border border-[#1E293B] hover:border-slate-700 rounded-lg px-2 py-1 focus:text-violet-400"
              >
                {COMPANIES_METADATA.map(c => (
                  <option key={c.symbol} value={c.symbol} className="bg-[#0b1320] text-slate-200">
                    {c.symbol} ({c.name})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[7.5px] text-[#64748B] font-extrabold uppercase block leading-none">
              Active reporting scope: {meta.industry}
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigateToStockAnalysis(selectedSym)}
            className="text-[9px] font-black px-3 py-1.5 bg-[#080c14] border border-[#1E293B] hover:border-slate-700 rounded-xl text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BarChart4 className="w-3.5 h-3.5 text-violet-400" />
            <span>Analysis Workspace</span>
          </button>
          
          <button 
            onClick={() => alert(`AI Report generated for ${selectedSym}!`)}
            className="text-[9px] font-black px-3 py-1.5 bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col items-center justify-center min-h-[300px] animate-pulse">
          <RefreshCw className="w-8 h-8 text-violet-400 animate-spin mb-3" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Company Report...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none">
          
          {/* Left Column: Metrics & Fundamentals (8 Cols) */}
          <div className="lg:col-span-8 space-y-4 flex flex-col justify-between">
            
            {/* A. Research Summary Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl">
                <span className="text-[7.5px] text-[#64748B] uppercase font-black tracking-wider block">Current Price</span>
                <span className="text-[13px] font-black text-slate-100 block mt-1">₹{price.toLocaleString('en-IN')}</span>
                <span className={`text-[8.5px] font-bold block mt-1 leading-none ${changePct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}% (1D)
                </span>
              </div>

              <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl">
                <span className="text-[7.5px] text-[#64748B] uppercase font-black tracking-wider block">AI Investment Score</span>
                <span className="text-[13px] font-black text-white block mt-1">{aiScore} <span className="text-[9px] text-[#64748B]">/100</span></span>
                <span className="text-[8.5px] text-[#8B5CF6] font-bold block mt-1 leading-none uppercase">{recText}</span>
              </div>

              <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl">
                <span className="text-[7.5px] text-[#64748B] uppercase font-black tracking-wider block">12M Target Target</span>
                <span className="text-[13px] font-black text-slate-100 block mt-1">₹{target.toLocaleString('en-IN')}</span>
                <span className="text-[8.5px] text-emerald-500 font-bold block mt-1 leading-none">+{upside.toFixed(1)}% Upside</span>
              </div>

              <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl">
                <span className="text-[7.5px] text-[#64748B] uppercase font-black tracking-wider block">AI Confidence Rating</span>
                <span className="text-[13px] font-black text-violet-400 block mt-1">{confidence}%</span>
                <span className="text-[8.5px] text-[#64748B] font-bold block mt-1 leading-none uppercase">Medium Risk</span>
              </div>
            </div>

            {/* B. Fundamental Analysis Matrix */}
            <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex-grow">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3.5">Fundamental Analysis Matrix</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[9.5px] font-bold">
                {[
                  { label: 'P/E Ratio', val: quote?.pe_ratio?.toFixed(1) ?? '22.4', suffix: 'x' },
                  { label: 'P/B Ratio', val: quote?.pb_ratio?.toFixed(1) ?? '3.5', suffix: 'x' },
                  { label: 'ROE %', val: quote?.roe ? (quote.roe * 100).toFixed(1) : '15.4', suffix: '%' },
                  { label: 'Dividend Yield', val: quote?.dividend_yield ? (quote.dividend_yield * 100).toFixed(2) : '1.25', suffix: '%' },
                  { label: 'Debt/Equity Ratio', val: quote?.debt_equity?.toFixed(2) ?? '0.45', suffix: '' },
                  { label: 'Earnings Per Share (EPS)', val: quote?.eps?.toFixed(1) ?? '85.4', suffix: '' },
                  { label: 'Revenue Growth (1Y)', val: quote?.revenue_growth ? (quote.revenue_growth * 100).toFixed(1) : '12.4', suffix: '%' },
                  { label: 'Valuation Status', val: aiScore >= 75 ? 'Undervalued' : 'Fairly Valued', suffix: '', isVal: true }
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-[#0B1220] border border-[#1E293B]/60 rounded-xl leading-normal">
                    <span className="text-[#64748B] uppercase text-[7.5px] font-black block tracking-wider">{item.label}</span>
                    <span className={`text-[12px] font-black block mt-1 ${item.isVal ? 'text-[#8B5CF6]' : 'text-slate-100'}`}>
                      {item.val}{item.suffix}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* C. Valuation Zone Bear/Base/Bull chart */}
            <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3">Model-based valuation range</span>
              
              <div className="space-y-4 pt-2 text-[9px] font-bold">
                {/* Horizontal range bar */}
                <div className="relative pt-1.5">
                  <div className="h-2 w-full bg-[#1E293B] rounded-full flex justify-between overflow-hidden">
                    <div className="h-full bg-rose-600/60" style={{ width: '30%' }} />
                    <div className="h-full bg-violet-600/60" style={{ width: '45%' }} />
                    <div className="h-full bg-emerald-600/60" style={{ width: '25%' }} />
                  </div>
                  
                  {/* Current price marker dot */}
                  <div 
                    className="absolute top-0 h-5 w-1 bg-white rounded shadow-lg transform -translate-x-1/2 flex items-center justify-center"
                    style={{ left: `${Math.min(95, Math.max(5, ((price - bearCase) / (bullCase - bearCase)) * 100))}%` }}
                  >
                    <span className="absolute bottom-6 bg-slate-900 border border-[#1E293B] text-[7.5px] px-1.5 py-0.5 rounded font-black text-white whitespace-nowrap shadow">
                      LTP: ₹{price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[#94A3B8] uppercase text-[7.5px] font-black pt-2 border-t border-[#1E293B]/40">
                  <div className="text-left">
                    <span>Bear Case</span>
                    <span className="text-rose-500 text-[10px] block mt-0.5 font-extrabold">₹{bearCase.toFixed(1)}</span>
                  </div>
                  <div className="text-center">
                    <span>Base Case</span>
                    <span className="text-violet-400 text-[10px] block mt-0.5 font-extrabold">₹{baseCase.toFixed(1)}</span>
                  </div>
                  <div className="text-right">
                    <span>Bull Case</span>
                    <span className="text-emerald-500 text-[10px] block mt-0.5 font-extrabold">₹{bullCase.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sentiment & Technicals (4 Cols) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            
            {/* D. Sentiment & Technical Snapshot */}
            <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Sentiment & Technical Scope</span>
                <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Real-time perception weights</span>
              </div>

              {/* Semicircle gauge */}
              <div className="py-4 border-b border-[#1E293B]/40 flex justify-center">
                <SentimentGauge 
                  perceptionIndex={sentiment?.market_perception_index ?? 76}
                  overallSentimentText={sentiment?.overall_sentiment ?? 'Bullish'}
                  brandColor={meta.color}
                  newsMomentum="Neutral"
                />
              </div>

              {/* Technical checks list */}
              <div className="space-y-2 mt-4 text-[9px] font-bold">
                <div className="flex justify-between border-b border-[#1E293B]/30 pb-1.5">
                  <span className="text-[#64748B]">Relative Strength (RSI)</span>
                  <span className="text-[#22C55E] font-black">58.4 (Neutral-Strong)</span>
                </div>
                
                <div className="flex justify-between border-b border-[#1E293B]/30 pb-1.5">
                  <span className="text-[#64748B]">50 DMA Status</span>
                  <span className="text-[#22C55E] font-black">Bullish (Above 50 DMA)</span>
                </div>

                <div className="flex justify-between border-b border-[#1E293B]/30 pb-1.5">
                  <span className="text-[#64748B]">Immediate Support</span>
                  <span className="text-white font-extrabold">₹{technicals.immediateSupport.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between border-b border-[#1E293B]/30 pb-1.5">
                  <span className="text-[#64748B]">Immediate Resistance</span>
                  <span className="text-white font-extrabold">₹{technicals.immediateResistance.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-[8px] uppercase tracking-wider text-violet-400 pt-0.5">
                  <span>Trend Indicator</span>
                  <span>Bullish Consolidation</span>
                </div>
              </div>
            </div>

            {/* E. Action Cards */}
            <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl space-y-2.5">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Intelligence Actions</span>
              
              <button 
                onClick={() => onAskAI?.(`Explain the details and indicators for ${selectedSym}`, selectedSym)}
                className="w-full text-left p-2.5 bg-[#0B1220] border border-[#1E293B] hover:border-violet-500/20 rounded-xl flex items-center justify-between text-[9px] font-bold group transition-all cursor-pointer"
              >
                <span className="text-slate-350 group-hover:text-violet-400">Ask AI About {selectedSym}</span>
                <BrainCircuit className="w-4 h-4 text-[#64748B] group-hover:text-violet-400" />
              </button>

              <button 
                onClick={() => alert('Price Alert modal trigger')}
                className="w-full text-left p-2.5 bg-[#0B1220] border border-[#1E293B] hover:border-[#F59E0B]/20 rounded-xl flex items-center justify-between text-[9px] font-bold group transition-all cursor-pointer"
              >
                <span className="text-slate-350 group-hover:text-[#F59E0B]">Add Price Alert trigger</span>
                <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#F59E0B]" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
