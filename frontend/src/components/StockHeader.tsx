import React from 'react';
import { ExternalLink, Star, Bell, FileText, Share2, Layers } from 'lucide-react';
import ScoreRing from './ScoreRing';

interface StockHeaderProps {
  symbol: string;
  meta: {
    name: string;
    sector: string;
    industry: string;
    color: string;
    basePrice: number;
  };
  quote: any;
  recommendation: any;
  isWatchlisted: boolean;
  onWatchToggle: () => void;
  onCompare: () => void;
  onAIReport: () => void;
  lastUpdated: string;
  onSetAlert?: () => void;
}

export default function StockHeader({
  symbol,
  meta,
  quote,
  recommendation,
  isWatchlisted,
  onWatchToggle,
  onCompare,
  onAIReport,
  lastUpdated,
  onSetAlert
}: StockHeaderProps) {
  // Safe stats values
  const currentPrice = quote?.current_price ?? meta.basePrice;
  const changeVal = quote?.change ?? (currentPrice * 0.012);
  const changePct = quote?.change_pct ?? 1.2;
  const isUp = changeVal >= 0;

  // Retrieve investment scores
  const scoreOverall = recommendation?.ai_investment_score ?? 75;
  const scoreFinancial = recommendation?.score_components?.financial_score ?? 76;
  const scoreGrowth = recommendation?.score_components?.growth_score ?? 78;
  const scoreSentiment = recommendation?.score_components?.sentiment_score ?? 72;
  const scoreTechnical = recommendation?.score_components?.technical_score ?? 70;
  const scoreRisk = recommendation?.score_components?.risk_score ?? 60;

  const targetPrice = recommendation?.target_price ?? (currentPrice * 1.14);
  const upsidePct = recommendation?.upside_pct ?? 14.0;

  return (
    <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col xl:flex-row items-stretch justify-between gap-4 hover:border-[#8B5CF6]/15 transition-all duration-300 shadow-xl relative overflow-hidden select-none">
      {/* Dynamic analysation indicator ribbon */}
      <div 
        className="absolute top-0 left-0 w-1.5 h-full"
        style={{ backgroundColor: meta.color }}
      />
      
      {/* Left side identification + AI scoring rings */}
      <div className="flex flex-col justify-between flex-1 xl:pr-4 xl:border-r border-[#1E293B]/70 gap-2">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: `${meta.color}CC` }}
              >
                Currently Analysing: {symbol}
              </span>
              <span className="text-[8.5px] text-slate-500 font-bold">
                Last Updated: {lastUpdated || 'Live'}
              </span>
            </div>
            
            <div className="flex items-baseline gap-2.5 mt-1.5 flex-wrap">
              <h1 className="text-xl font-black tracking-tight text-[#F8FAFC] leading-none">
                {symbol}
              </h1>
              <span className="text-xs text-[#94A3B8] font-bold leading-none">
                {meta.name}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9.5px] text-[#64748B] font-bold uppercase tracking-wider">
                {meta.sector} • {meta.industry}
              </span>
              <span className="text-[#1E293B] text-[8px] font-black">|</span>
              <a 
                href={`https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`}
                target="_blank" 
                rel="noreferrer"
                className="text-[9.5px] hover:underline font-black uppercase tracking-wider flex items-center gap-0.5 leading-none transition-colors"
                style={{ color: meta.color }}
              >
                NSE Page
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic SVGs for score rings */}
        <div className="flex items-center gap-3.5 mt-1.5 select-none overflow-x-auto scrollbar-none pb-1 select-none">
          <ScoreRing score={scoreOverall} label="AI Overall" size="sm" color={meta.color} />
          <ScoreRing score={scoreFinancial} label="Financial" size="sm" />
          <ScoreRing score={scoreGrowth} label="Growth" size="sm" />
          <ScoreRing score={scoreSentiment} label="Sentiment" size="sm" />
          <ScoreRing score={scoreTechnical} label="Technical" size="sm" />
          <ScoreRing score={scoreRisk} label="Risk Profile" size="sm" />
        </div>
      </div>

      {/* Right side live pricing, consensus recommendations, and actions */}
      <div className="flex items-center gap-4 flex-wrap md:flex-nowrap justify-between xl:justify-end xl:pl-2">
        {/* Pricing metric card */}
        <div className="text-right select-none pr-4 border-r border-[#1E293B]/70 py-1 min-w-[100px]">
          <span className="text-[7.5px] text-[#64748B] uppercase tracking-widest block font-black">CURRENT PRICE</span>
          <span className="text-lg font-black text-[#F8FAFC] block mt-0.5 leading-none">
            ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className={`text-[9.5px] font-black flex items-center justify-end gap-0.5 leading-none mt-1 ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(changeVal).toFixed(2)} ({changePct.toFixed(2)}%)
          </span>
        </div>

        {/* 1Y Target targets */}
        <div className="text-right select-none pr-4 border-r border-[#1E293B]/70 py-1 min-w-[100px]">
          <span className="text-[7.5px] text-[#64748B] uppercase tracking-widest block font-black">AI TARGET PRICE</span>
          <span className="text-base font-black text-[#F8FAFC] block mt-0.5 leading-none">
            ₹{targetPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[9.5px] font-black text-[#22C55E] block mt-1 leading-none">
            +{upsidePct.toFixed(1)}% Upside
          </span>
        </div>

        {/* Recommendation & action block */}
        <div className="flex flex-col justify-between py-1 h-full min-w-[180px] gap-2">
          <div className="flex items-center justify-end gap-2 leading-none">
            <span className="text-[7.5px] text-[#94A3B8] font-black uppercase">Consensus Rating:</span>
            <span 
              className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider leading-none border"
              style={{ 
                color: isUp ? '#22C55E' : '#EF4444', 
                backgroundColor: isUp ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                borderColor: isUp ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'
              }}
            >
              {recommendation?.recommendation || 'Strong Buy'}
            </span>
          </div>

          {/* Persistent header Actions Row */}
          <div className="flex gap-1.5 items-center justify-end flex-wrap">
            <button 
              onClick={onCompare}
              className="p-1.5 bg-[#060B17] border border-[#1E293B] hover:border-violet-500/40 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg transition-all"
              title="Compare Stocks"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            
            <button 
              onClick={onWatchToggle}
              className={`p-1.5 border rounded-lg transition-all ${
                isWatchlisted 
                  ? 'bg-amber-600/10 border-amber-500/40 text-amber-400' 
                  : 'bg-[#060B17] border-[#1E293B] hover:border-violet-500/40 text-[#94A3B8]'
              }`}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>

            {onSetAlert && (
              <button 
                onClick={onSetAlert}
                className="p-1.5 bg-[#060B17] border border-[#1E293B] hover:border-violet-500/40 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg transition-all"
                title="Set Price Alert"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            )}

            <button 
              onClick={onAIReport}
              className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-[#F8FAFC] text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-1"
              title="Generate PDF Report"
            >
              <FileText className="w-3 h-3" />
              AI Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
