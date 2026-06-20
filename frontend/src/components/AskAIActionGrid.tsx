import React from 'react';
import { CompanyMeta, RecommendationData } from '../types/stock';
import { MessageSquare, CornerDownRight, BrainCircuit } from 'lucide-react';

interface AskAIActionGridProps {
  symbol: string;
  meta: CompanyMeta;
  recommendation?: RecommendationData;
  onAskAI?: (prompt: string, symbol: string) => void;
}

export default function AskAIActionGrid({
  symbol,
  meta,
  recommendation,
  onAskAI
}: AskAIActionGridProps) {
  const scoreOverall = recommendation?.ai_investment_score ?? 75;
  const recommendationText = recommendation?.recommendation ?? 'Buy';

  const actionCards = [
    {
      title: 'Explain AI Score',
      prompt: `Explain why ${symbol} has an AI score of ${scoreOverall}/100. Include financial strengths, growth drivers, technical signals, market sentiment, and risk profile.`
    },
    {
      title: 'Why is this a Buy / Hold?',
      prompt: `Explain why the AI model categorizes ${symbol} as a "${recommendationText}". Discuss its target price of ₹${(recommendation?.target_price ?? (meta.basePrice * 1.15)).toLocaleString()}, upside potential, and key supporting catalysts.`
    },
    {
      title: 'Compare With Peers',
      prompt: `Compare ${symbol} with its competitors in the ${meta.sector} industry. Benchmark its P/E ratio, P/B ratio, ROE %, revenue growth, and AI investment rating.`
    },
    {
      title: 'Show Major Risks',
      prompt: `What are the primary near-term risks and red flags for ${symbol}? Address regulatory compliance challenges, commodity pricing volatility, and premium valuation safety margins.`
    },
    {
      title: 'Explain Valuation',
      prompt: `Explain the valuation models used for ${symbol}. Outline intrinsic value projections, DCF base assumptions, historical multiples, and current price margin of safety.`
    },
    {
      title: 'Simulate ₹1,00,000 Investment',
      prompt: `Create a simulated growth projection for a ₹1,00,000 investment in ${symbol}. Model returns over 3 years based on expected growth targets, dividend yields, and market volatility.`
    },
    {
      title: 'Create Portfolio Allocation',
      prompt: `Propose an institutional-grade portfolio allocation incorporating ${symbol}. Suggest optimal weights, sector hedges, risk protection limits, and correlation balances.`
    }
  ];

  return (
    <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-violet-500/20 transition-all select-none">
      <div className="flex items-center gap-2 border-b border-[#1E293B]/70 pb-2 mb-3.5">
        <BrainCircuit className="w-4 h-4 text-violet-400" />
        <div>
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">Ask AI Copilot Action Cards</span>
          <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Trigger neural inference research questions</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        {actionCards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => onAskAI?.(card.prompt, symbol)}
            className="p-2.5 bg-[#0B1220] border border-[#1E293B] hover:border-violet-500/30 rounded-xl text-left hover:bg-violet-950/[0.03] transition-all flex flex-col justify-between group text-[9px] font-bold min-h-[90px]"
          >
            <span className="text-[#94A3B8] group-hover:text-violet-400 transition-colors leading-tight">{card.title}</span>
            <div className="flex items-center justify-between mt-2.5 w-full">
              <span className="text-[7px] text-[#64748B] group-hover:text-slate-400">Query AI</span>
              <CornerDownRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-violet-400 transform group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
