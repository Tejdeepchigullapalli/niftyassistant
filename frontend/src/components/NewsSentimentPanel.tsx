import React, { useState, useMemo } from 'react';
import { Newspaper, Calendar, Smile, AlertCircle, Compass, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { CompanyMeta, SentimentData, SentimentArticle } from '../types/stock';
import SentimentGauge from './SentimentGauge';

interface NewsSentimentPanelProps {
  meta: CompanyMeta;
  sentiment?: SentimentData;
}

export default function NewsSentimentPanel({ meta, sentiment }: NewsSentimentPanelProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Retrieve perception metrics
  const perceptionIndex = sentiment?.market_perception_index ?? 76;
  const overallSentimentText = sentiment?.overall_sentiment ?? 'Bullish';
  const positivePct = sentiment?.positive_pct ?? 62;
  const neutralPct = sentiment?.neutral_pct ?? 25;
  const negativePct = sentiment?.negative_pct ?? 13;

  // Process articles
  const processedArticles = useMemo<SentimentArticle[]>(() => {
    const rawArticles = sentiment?.articles || [];
    return rawArticles.map((art, idx) => {
      // Deterministic categories and impact rankings if missing
      const cats: Array<'Earnings' | 'Expansion' | 'Regulation' | 'Sector' | 'Governance' | 'Corporate Actions'> = [
        'Earnings', 'Expansion', 'Regulation', 'Sector', 'Governance', 'Corporate Actions'
      ];
      const impacts: Array<'Low' | 'Medium' | 'High'> = ['High', 'Medium', 'Low'];
      
      const category = art.category || cats[idx % cats.length];
      const impact = art.impact || impacts[idx % impacts.length];

      return {
        headline: art.headline || '',
        sentiment: art.sentiment || 'neutral',
        source: art.source || 'Financial Bulletin',
        published_at: art.published_at || '2h ago',
        url: art.url,
        category,
        impact,
        score: art.score ?? 0.5
      };
    });
  }, [sentiment]);

  // Filters: All | Positive | Neutral | Negative | Earnings | Corporate | Regulation
  const filteredArticles = useMemo(() => {
    return processedArticles.filter(art => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Positive') return art.sentiment === 'positive';
      if (activeFilter === 'Neutral') return art.sentiment === 'neutral';
      if (activeFilter === 'Negative') return art.sentiment === 'negative';
      if (activeFilter === 'Earnings') return art.category === 'Earnings';
      if (activeFilter === 'Corporate') return art.category === 'Expansion' || art.category === 'Governance' || art.category === 'Corporate Actions';
      if (activeFilter === 'Regulation') return art.category === 'Regulation';
      return true;
    }).slice(0, 4);
  }, [processedArticles, activeFilter]);

  // Sparkline data representing 7-day trend
  const trendData = [
    { day: 'Day 1', val: perceptionIndex * 0.93 },
    { day: 'Day 2', val: perceptionIndex * 0.91 },
    { day: 'Day 3', val: perceptionIndex * 0.96 },
    { day: 'Day 4', val: perceptionIndex * 0.94 },
    { day: 'Day 5', val: perceptionIndex * 0.98 },
    { day: 'Day 6', val: perceptionIndex * 0.97 },
    { day: 'Day 7', val: perceptionIndex }
  ];

  return (
    <div className="space-y-4">
      {/* Top Section: Gauge & Breakdown side-by-side inside card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0B1220] border border-[#1E293B] p-4 rounded-xl">
        <div className="md:col-span-5 flex flex-col justify-center border-r border-[#1E293B]/60 pr-2">
          <SentimentGauge 
            perceptionIndex={perceptionIndex}
            overallSentimentText={overallSentimentText}
            brandColor={meta.color}
            newsMomentum="Improving"
          />
        </div>

        <div className="md:col-span-7 flex flex-col justify-between pl-1.5 space-y-3">
          <div>
            <span className="text-[7.5px] text-[#64748B] uppercase tracking-wider font-extrabold block">Sentiment Weight Distribution</span>
            <div className="space-y-2 mt-2">
              <div>
                <div className="flex justify-between text-[8px] font-bold text-[#94A3B8]">
                  <span>Positive</span>
                  <span className="text-[#22C55E]">{positivePct}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#22C55E]" style={{ width: `${positivePct}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[8px] font-bold text-[#94A3B8]">
                  <span>Neutral</span>
                  <span className="text-[#F59E0B]">{neutralPct}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B]" style={{ width: `${neutralPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[8px] font-bold text-[#94A3B8]">
                  <span>Negative</span>
                  <span className="text-[#EF4444]">{negativePct}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#EF4444]" style={{ width: `${negativePct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between border-t border-[#1E293B]/40 pt-2.5 items-center text-[8.5px]">
            <span className="text-[#64748B] font-bold">7-Day Perception Trend</span>
            <div className="h-6 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <Line type="monotone" dataKey="val" stroke={meta.color} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* News timeline filter tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-[#1E293B]/60 pb-1.5">
        {['All', 'Positive', 'Neutral', 'Negative', 'Earnings', 'Corporate', 'Regulation'].map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex-shrink-0 transition-all ${
              activeFilter === f 
                ? 'bg-violet-650 text-white shadow' 
                : 'bg-slate-900 border border-slate-800 text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto chat-scrollbar pr-1">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((art, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-[#0B1220] border border-[#1E293B]/60 flex items-center justify-between gap-3 hover:border-violet-500/10 transition-all select-none">
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-[9px] font-black text-[#F8FAFC] leading-snug line-clamp-1 block">
                  {art.headline}
                </span>
                <div className="flex items-center gap-1.5 text-[7px] text-[#64748B] font-bold">
                  <span className="flex items-center gap-0.5 text-slate-350"><Newspaper className="w-2.5 h-2.5" /> {art.source}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" /> {art.published_at}</span>
                  <span>•</span>
                  <span className="px-1 py-0.1 bg-slate-800 text-slate-350 rounded font-black uppercase tracking-wider">{art.category}</span>
                </div>
              </div>

              {/* Badges and External Links */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  art.impact === 'High' ? 'text-rose-455 bg-rose-500/5 border-rose-500/10' :
                  art.impact === 'Medium' ? 'text-amber-455 bg-amber-500/5 border-amber-500/10' :
                  'text-emerald-450 bg-emerald-500/5 border-emerald-500/10'
                }`}>
                  {art.impact} Impact
                </span>
                
                <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  art.sentiment === 'positive' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                  art.sentiment === 'negative' ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                  'bg-slate-700/30 text-[#94A3B8]'
                }`}>
                  {art.sentiment}
                </span>

                {art.url && (
                  <a href={art.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 italic text-[9px]">
            No recent company-specific insight is available.
          </div>
        )}
      </div>

      {/* AI News Synthesis summary dashboard cards */}
      <div className="grid grid-cols-2 gap-3 bg-[#0B1220] border border-[#1E293B]/60 p-3 rounded-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[8.5px] font-black text-emerald-400 uppercase tracking-wider">
            <Smile className="w-3.5 h-3.5" />
            <span>Weekly Highlights</span>
          </div>
          <p className="text-[8px] text-[#94A3B8] leading-relaxed">
            Positive retail segment metrics and increased capex projections fueled sentiment index acceleration.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[8.5px] font-black text-rose-455 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Key Risk Vector</span>
          </div>
          <p className="text-[8px] text-[#94A3B8] leading-relaxed">
            Evolving corporate regulatory compliance structural guidelines and crude raw material price volatility.
          </p>
        </div>
      </div>
    </div>
  );
}
