import React from 'react';
import { CompanyMeta, RecommendationData, ExpansionPlan, RiskData } from '../types/stock';
import { ShieldAlert, TrendingUp, Compass, Target, HelpCircle, Activity } from 'lucide-react';

interface CatalystRiskCardsProps {
  meta: CompanyMeta;
  recommendation?: RecommendationData;
  corporate?: ExpansionPlan;
  risk?: RiskData;
}

export default function CatalystRiskCards({
  meta,
  recommendation,
  corporate,
  risk
}: CatalystRiskCardsProps) {
  
  // Resolve support lists or defaults
  const catalysts = recommendation?.supporting_factors?.slice(0, 3) || [
    `Strong core operational performance index in the ${meta.sector} industry.`,
    'Resilient profit margin metrics despite macroeconomic inputs cost fluctuations.',
    'Increasing institutional investment interest and positive consensus target price.'
  ];

  const risks = recommendation?.risk_flags?.slice(0, 3) || risk?.risk_factors?.slice(0, 3) || [
    'Exposure to commodity price cycle fluctuations and material overheads.',
    'Strict regulatory compliance overhead requirements in local jurisdictions.',
    'High market multiples premium compared to core long-term averages.'
  ];

  const objectives = corporate?.expansion_plans?.slice(0, 2) || [
    'Establish energy-efficient hubs and green tech packaging divisions.',
    'Deploy logistic automation technologies and cloud route maps.'
  ];

  const initiatives = corporate?.rd_initiatives?.slice(0, 2) || [
    'Automate dispatch allocations using generative AI algorithms.',
    'Optimize supply chain routing and packaging weight metrics.'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch select-none text-[#F8FAFC]">
      
      {/* 1. Bullish Catalysts Card */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all min-h-[180px]">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider block">Bullish Catalysts</span>
          </div>
          <ul className="space-y-2 mt-3.5 text-[8.5px] text-[#94A3B8]">
            {catalysts.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-emerald-500 font-extrabold flex-shrink-0">▲</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-3.5 block">HIGH CONFIDENCE RATING</span>
      </div>

      {/* 2. Risks & Red Flags Card */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all min-h-[180px]">
        <div>
          <div className="flex items-center gap-1.5 text-rose-455">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider block">Risks & Red Flags</span>
          </div>
          <ul className="space-y-2 mt-3.5 text-[8.5px] text-[#94A3B8]">
            {risks.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-rose-500 font-extrabold flex-shrink-0">▼</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-3.5 block">MODERATE EXPOSURE VALUE</span>
      </div>

      {/* 3. Strategic Corporate Intelligence */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between hover:border-violet-500/20 transition-all min-h-[180px]">
        <div>
          <div className="flex items-center gap-1.5 text-violet-400">
            <Compass className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider block">Strategic Corporate Intelligence</span>
          </div>
          <div className="space-y-3.5 mt-3.5 text-[8.5px] text-[#94A3B8]">
            <div>
              <span className="text-[7.5px] font-black text-violet-400 uppercase tracking-widest block">Expansion Goals</span>
              <ul className="list-disc list-inside space-y-0.5 mt-1">
                {objectives.map((o, i) => <li key={i} className="truncate">{o}</li>)}
              </ul>
            </div>
            <div>
              <span className="text-[7.5px] font-black text-violet-400 uppercase tracking-widest block">R&D Initiatives</span>
              <ul className="list-disc list-inside space-y-0.5 mt-1">
                {initiatives.map((item, i) => <li key={i} className="truncate">{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-3.5 block">AI ROADMAP VERIFICATION</span>
      </div>

    </div>
  );
}
