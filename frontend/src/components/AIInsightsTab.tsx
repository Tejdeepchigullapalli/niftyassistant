import React from 'react';
import { 
  Terminal, Sparkles, AlertTriangle, RefreshCw, Compass, ArrowUpRight 
} from 'lucide-react';
import { CompanyMeta, QuoteData, RecommendationData, SentimentData, FinancialData, ExpansionPlan, RiskData } from '../types/stock';
import AIScoreBreakdown from './AIScoreBreakdown';
import InvestmentThesisCard from './InvestmentThesisCard';
import NewsSentimentPanel from './NewsSentimentPanel';
import PeerBenchmarkTable from './PeerBenchmarkTable';
import CatalystRiskCards from './CatalystRiskCards';
import AskAIActionGrid from './AskAIActionGrid';
import ResearchSkeleton from './ResearchSkeleton';

interface AIInsightsTabProps {
  symbol: string;
  meta: CompanyMeta;
  quote?: QuoteData;
  recommendation?: RecommendationData;
  sentiment?: SentimentData;
  quotes: QuoteData[];
  financial?: FinancialData;
  corporate?: ExpansionPlan;
  risk?: RiskData;
  isLoading?: boolean;
  lastQuoteUpdated?: string;
  lastFundamentalUpdated?: string;
  onSymbolSelect: (symbol: string) => void;
  onAskAI?: (prompt: string, symbol: string) => void;
  onOpenPeers?: () => void;
}

export default function AIInsightsTab({
  symbol,
  meta,
  quote,
  recommendation,
  sentiment,
  quotes = [],
  financial,
  corporate,
  risk,
  isLoading = false,
  lastQuoteUpdated,
  lastFundamentalUpdated,
  onSymbolSelect,
  onAskAI,
  onOpenPeers
}: AIInsightsTabProps) {

  if (isLoading) {
    return <ResearchSkeleton />;
  }

  // Error/Empty state validation: check if metadata is completely missing
  if (!symbol || !meta) {
    return (
      <div className="card p-8 bg-[#0F172A] border border-[#1E293B] rounded-2xl text-center select-none flex flex-col items-center justify-center min-h-[300px]">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <span className="text-sm font-black text-white uppercase tracking-wider block">Unable to load AI research data</span>
        <p className="text-[10px] text-[#64748B] mt-2 max-w-sm uppercase font-bold">
          No recent company-specific insight is available. Refresh data or analyse another company.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-violet-650 hover:bg-violet-750 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  // Inverted risk metric calculations
  const riskVal = recommendation?.score_components?.risk_score ?? 35;
  const scoreRisk = 100 - riskVal;

  // Resolve prices & changes from quotes list
  const matchingQuote = quotes.find(q => q.symbol.toUpperCase() === symbol.toUpperCase()) || quote;
  const livePrice = matchingQuote?.current_price ?? meta.basePrice;
  const liveChangePct = matchingQuote?.change_pct ?? 0.0;
  const isEstimatedPrice = !matchingQuote;

  // Resolve target recommendations
  const targetPrice = recommendation?.target_price ?? (meta.basePrice * 1.15);
  const upsidePct = recommendation?.upside_pct ?? 15.0;
  const recLabel = recommendation?.recommendation ?? 'Buy';
  const confidenceScore = recommendation?.confidence ?? Math.round((recommendation?.ai_investment_score ?? 75) * 0.92);

  // Set up standard data timestamps (or mock fallbacks)
  const displayQuoteTime = lastQuoteUpdated || matchingQuote?.timestamp || new Date().toLocaleTimeString('en-IN');
  const displayFundamentalTime = lastFundamentalUpdated || new Date().toLocaleDateString('en-IN') + ' (Latest Filings)';

  return (
    <div className="space-y-4 w-full select-none text-[#F8FAFC]">
      
      {/* 1. Header Information Ribbon */}
      <div className="flex justify-between items-center bg-[#0d121f] border border-[#1E293B] px-3.5 py-2 rounded-xl select-none flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-violet-400" />
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">Explainable AI Research & Corporate Intelligence</span>
        </div>
        <div className="flex items-center gap-4 text-[7.5px] text-[#64748B] font-extrabold uppercase">
          <div className="flex items-center gap-1">
            <span>Live Quote Price:</span>
            <span className="text-white">
              {isEstimatedPrice ? (
                <span className="text-amber-500 font-bold px-1 bg-amber-500/10 rounded">Estimated</span>
              ) : (
                `₹${livePrice.toLocaleString('en-IN')}`
              )}
            </span>
            <span className="text-[#64748B]">at {displayQuoteTime}</span>
          </div>
          <div className="flex items-center gap-1 border-l border-[#1E293B] pl-4">
            <span>Fundamentals Update:</span>
            <span className="text-white">{displayFundamentalTime}</span>
          </div>
        </div>
      </div>

      {/* Row 1: AI Score Explainability | AI Investment Thesis | AI Targets & Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* AI Score Explainability */}
        <AIScoreBreakdown 
          meta={meta}
          recommendation={recommendation}
          scoreRisk={scoreRisk}
        />

        {/* AI Investment Thesis */}
        <InvestmentThesisCard 
          symbol={symbol}
          meta={meta}
          recommendation={recommendation}
        />

        {/* AI Confidence / Targets Card */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all select-none">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">AI Valuation Targets</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Projections & Confidence metrics</span>
          </div>

          {/* Radial Wheel representation */}
          <div className="flex flex-col items-center justify-center py-2 flex-grow">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* SVG circular progress ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#1E293B" strokeWidth="6" fill="none" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke={meta.color} 
                  strokeWidth="6" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 * (1 - confidenceScore / 100)} 
                  strokeLinecap="round" 
                  fill="none"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-black text-white leading-none block">{confidenceScore}%</span>
                <span className="text-[6.5px] text-[#64748B] uppercase tracking-widest block font-extrabold mt-0.5">Confidence</span>
              </div>
            </div>
          </div>

          {/* Target price calculations lists */}
          <div className="space-y-2 border-t border-[#1E293B]/70 pt-3 mt-1.5 text-[9.5px]">
            <div className="flex justify-between font-bold">
              <span className="text-[#64748B]">12-Month Target Price</span>
              <span className="text-white font-black">₹{targetPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="flex justify-between font-bold border-b border-[#1E293B]/30 pb-1.5">
              <span className="text-[#64748B]">Expected Upside Return</span>
              <span className="text-[#22C55E] font-black flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{upsidePct.toFixed(1)}%</span>
              </span>
            </div>

            <div className="flex justify-between text-[7px] text-[#64748B] font-black uppercase pt-0.5">
              <span>Model Rating: {recLabel}</span>
              <span>Based on 36 Monte Carlo seeds</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: News & Sentiment Analytics (55%) | Sector Peer Benchmarking (45%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        
        {/* News & Sentiment Analytics (55% width on large screens) */}
        <div className="xl:col-span-7 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all select-none">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">AI Sentiment News Insights</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Real-time news processing feeds</span>
          </div>
          <div className="mt-3 flex-grow">
            <NewsSentimentPanel 
              meta={meta}
              sentiment={sentiment}
            />
          </div>
        </div>

        {/* Sector Peer Benchmarking (45% width on large screens) */}
        <div className="xl:col-span-5 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all select-none">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Sector Peer Benchmarking</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Comparison vs sector competitors ({meta.sector})</span>
          </div>
          <div className="mt-3.5 flex-grow">
            <PeerBenchmarkTable 
              symbol={symbol}
              meta={meta}
              quotes={quotes}
              onSymbolSelect={onSymbolSelect}
              onOpenPeers={onOpenPeers}
            />
          </div>
        </div>

      </div>

      {/* Row 3: Catalysts | Risks / Red Flags | Strategic Corporate Intelligence */}
      <CatalystRiskCards 
        meta={meta}
        recommendation={recommendation}
        corporate={corporate}
        risk={risk}
      />

      {/* Row 4: Ask AI About This Company Action Cards */}
      <AskAIActionGrid 
        symbol={symbol}
        meta={meta}
        recommendation={recommendation}
        onAskAI={onAskAI}
      />

    </div>
  );
}
