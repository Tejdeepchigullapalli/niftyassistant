import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { CompanyMeta, RecommendationData } from '../types/stock';

interface AIScoreBreakdownProps {
  meta: CompanyMeta;
  recommendation?: RecommendationData;
  scoreRisk: number;
}

export default function AIScoreBreakdown({ meta, recommendation, scoreRisk }: AIScoreBreakdownProps) {
  const scoreOverall = recommendation?.ai_investment_score ?? 75;
  const scoreFinancial = recommendation?.score_components?.financial_score ?? 76;
  const scoreGrowth = recommendation?.score_components?.growth_score ?? 78;
  const scoreSentiment = recommendation?.score_components?.sentiment_score ?? 72;
  const scoreTechnical = recommendation?.score_components?.technical_score ?? 70;
  const scoreValuation = Math.round(scoreOverall * 0.95);
  
  // Calculate confidence rating: base on recommendation score, or default
  const confidence = recommendation?.confidence ?? Math.round(scoreOverall * 0.92);

  const factors = [
    {
      label: 'Financial Strength',
      score: scoreFinancial,
      desc: 'Robust balance sheet structures and improving operational margins.',
      status: scoreFinancial >= 70 ? 'positive' : 'warning',
      color: meta.color,
    },
    {
      label: 'Growth Potential',
      score: scoreGrowth,
      desc: 'Strong retail expansion, capex plans, and digital sector footprint.',
      status: scoreGrowth >= 70 ? 'positive' : 'warning',
      color: '#8B5CF6',
    },
    {
      label: 'Valuation Safety',
      score: scoreValuation,
      desc: 'Fair trading multiple premium justified by ROE expansion.',
      status: scoreValuation >= 60 ? 'positive' : 'warning',
      color: '#3B82F6',
    },
    {
      label: 'Technical Momentum',
      score: scoreTechnical,
      desc: 'Steady consolidation above major short-term and exponential moving averages.',
      status: scoreTechnical >= 65 ? 'positive' : 'warning',
      color: '#22C55E',
    },
    {
      label: 'Market Sentiment',
      score: scoreSentiment,
      desc: 'Positive institutional buy rates and solid news publication volume.',
      status: scoreSentiment >= 70 ? 'positive' : 'warning',
      color: '#EC4899',
    },
    {
      label: 'Risk Protection Profile',
      score: scoreRisk,
      desc: 'Manageable regulatory risk levels and low leverage exposure.',
      status: scoreRisk >= 60 ? 'positive' : 'warning',
      color: '#F59E0B',
    }
  ];

  return (
    <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all select-none">
      <div>
        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Why AI Recommends This Stock</span>
        <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Multi-factor explainability scoring</span>
      </div>

      {/* Main Overall stats ribbon */}
      <div className="grid grid-cols-3 gap-2 bg-[#0B1220] border border-[#1E293B] p-3 rounded-xl my-4 text-center">
        <div className="border-r border-[#1E293B]">
          <span className="text-[8px] text-[#64748B] font-extrabold uppercase block">Overall AI Score</span>
          <span className="text-lg font-black text-white mt-1 block">{scoreOverall} <span className="text-[10px] text-[#64748B]">/100</span></span>
        </div>
        <div className="border-r border-[#1E293B]">
          <span className="text-[8px] text-[#64748B] font-extrabold uppercase block">Recommendation</span>
          <span className="text-[10px] font-black mt-1.5 block uppercase" style={{ color: meta.color }}>
            {recommendation?.recommendation || 'Strong Buy'}
          </span>
        </div>
        <div>
          <span className="text-[8px] text-[#64748B] font-extrabold uppercase block">AI Confidence</span>
          <span className="text-lg font-black text-violet-400 mt-1 block">{confidence}%</span>
        </div>
      </div>

      {/* Score contribution items */}
      <div className="space-y-3 flex-grow">
        {factors.map((item, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-start text-[9.5px]">
              <div className="flex gap-1.5 items-start">
                {item.status === 'positive' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <span className="font-extrabold text-white block leading-tight">{item.label}</span>
                  <span className="text-[7.5px] text-[#64748B] font-bold block mt-0.5">{item.desc}</span>
                </div>
              </div>
              <span className="font-black text-white pl-2 flex-shrink-0">{item.score}/100</span>
            </div>
            
            <div className="h-1.5 w-full rounded-full bg-[#0B1220] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
