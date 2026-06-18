import { useState } from 'react';
import { getRecBadgeClass, getScoreColor } from '../utils/api';
import { CompanyLogo } from './DashboardView';

interface Props {
  recs: Record<string, any>;
  quotes: Record<string, any>;
}

export default function PortfolioView({ recs }: Props) {
  const [activeLimit, setActiveLimit] = useState<10 | 20 | 30 | 40 | 50>(10);
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'upside'>('score');

  const allRecs = Object.values(recs);
  
  // Sorting logic
  const sortedRecs = [...allRecs].sort((a: any, b: any) => {
    if (sortBy === 'price') {
      return (b.current_price || 0) - (a.current_price || 0);
    }
    if (sortBy === 'upside') {
      return (b.upside_pct || 0) - (a.upside_pct || 0);
    }
    return (b.ai_investment_score || 0) - (a.ai_investment_score || 0);
  });

  const topPicks = allRecs.filter((r: any) => ['Strong Buy', 'Buy'].includes(r.recommendation));
  const holdPicks = allRecs.filter((r: any) => r.recommendation === 'Hold');
  const avoidPicks = allRecs.filter((r: any) => ['Reduce', 'Sell'].includes(r.recommendation));

  const totalCount = allRecs.length || 1;
  const topPicksPct = Math.round((topPicks.length / totalCount) * 100);
  const holdPicksPct = Math.round((holdPicks.length / totalCount) * 100);
  const avoidPicksPct = Math.round((avoidPicks.length / totalCount) * 100);

  const avgScore = allRecs.length > 0
    ? Math.round(allRecs.reduce((sum: number, r: any) => sum + r.ai_investment_score, 0) / allRecs.length)
    : 0;

  // Slices for rendering
  const detailedList = sortedRecs.slice(0, activeLimit);
  const nextLimit1 = activeLimit + 10;
  const nextLimit2 = activeLimit + 20;

  const compact1List = nextLimit1 <= 50 ? sortedRecs.slice(activeLimit, nextLimit1) : [];
  const compact2List = nextLimit2 <= 50 ? sortedRecs.slice(nextLimit1, nextLimit2) : [];

  return (
    <div className="space-y-6 fade-in p-1 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Portfolio</h1>
        <p className="text-xs text-slate-500 font-semibold">AI powered portfolio recommendations</p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Portfolio Score circular gauge card */}
        <div className="card p-4 flex items-center justify-between min-h-[120px]">
          <div className="flex flex-col justify-between h-full py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Portfolio Score</span>
            <div className="mt-4">
              <div className="text-sm font-extrabold text-emerald-400">Good</div>
              <div className="text-[10px] text-slate-500 font-medium">Well diversified portfolio</div>
            </div>
          </div>
          <div className="relative flex items-center justify-center mr-2">
            <svg width="84" height="84" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="36" fill="none" stroke="#132238" strokeWidth="6" />
              <circle 
                cx="42" cy="42" r="36" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="6" 
                strokeDasharray={226.2} 
                strokeDashoffset={226.2 - (avgScore / 100) * 226.2} 
                strokeLinecap="round"
                transform="rotate(-90 42 42)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{avgScore}</span>
              <span className="text-[9px] text-slate-400 font-bold">/100</span>
            </div>
          </div>
        </div>

        {/* Strong Buy / Buy Card */}
        <div className="card p-4 flex items-center justify-between min-h-[120px]">
          <div className="flex flex-col justify-between h-full py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Strong Buy / Buy</span>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white">{topPicks.length}</span>
              <div className="text-[11px] mt-1 font-semibold text-slate-200">
                <span className="font-bold text-emerald-400">{topPicksPct}%</span>{' '}
                <span className="text-slate-500 font-medium">of total picks</span>
              </div>
            </div>
          </div>
          <div className="self-end mb-2 mr-2">
            <svg width="70" height="28" viewBox="0 0 70 28" fill="none">
              <path d="M0 24 C 15 24, 25 14, 35 10 C 45 6, 55 18, 70 4" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Hold Card */}
        <div className="card p-4 flex items-center justify-between min-h-[120px]">
          <div className="flex flex-col justify-between h-full py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hold</span>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white">{holdPicks.length}</span>
              <div className="text-[11px] mt-1 font-semibold text-slate-200">
                <span className="font-bold text-amber-500">{holdPicksPct}%</span>{' '}
                <span className="text-slate-500 font-medium">of total picks</span>
              </div>
            </div>
          </div>
          <div className="self-end mb-2 mr-2">
            <svg width="70" height="28" viewBox="0 0 70 28" fill="none">
              <path d="M0 18 C 15 18, 25 22, 35 14 C 45 6, 55 10, 70 12" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Reduce / Sell Card */}
        <div className="card p-4 flex items-center justify-between min-h-[120px]">
          <div className="flex flex-col justify-between h-full py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reduce / Sell</span>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white">{avoidPicks.length}</span>
              <div className="text-[11px] mt-1 font-semibold text-slate-200">
                <span className="font-bold text-rose-500">{avoidPicksPct}%</span>{' '}
                <span className="text-slate-500 font-medium">of total picks</span>
              </div>
            </div>
          </div>
          <div className="self-end mb-2 mr-2">
            <svg width="70" height="28" viewBox="0 0 70 28" fill="none">
              <path d="M0 14 L 70 14" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs & Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#152036] pb-3 gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
          {([10, 20, 30, 40, 50] as const).map((limit) => (
            <button
              key={limit}
              onClick={() => setActiveLimit(limit)}
              className={`pb-2 transition-all relative ${
                activeLimit === limit 
                  ? "text-violet-400 font-extrabold" 
                  : "hover:text-slate-200"
              }`}
            >
              Top {limit}
              {activeLimit === limit && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#050c16]/80 border border-[#18263c] rounded-lg px-3 py-1.5 text-slate-300 text-[11px] font-bold">
          <span className="text-slate-500 font-semibold select-none">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer font-extrabold focus:text-violet-400"
          >
            <option value="score" className="bg-[#0b1320] text-slate-200">AI Score</option>
            <option value="price" className="bg-[#0b1320] text-slate-200">Current Price</option>
            <option value="upside" className="bg-[#0b1320] text-slate-200">Upside</option>
          </select>
        </div>
      </div>

      {/* Main Detailed Row */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="text-emerald-400 text-sm">▲</span> Top {activeLimit} Picks
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 chat-scrollbar">
          {detailedList.map((r: any, index: number) => (
            <div 
              key={r.symbol} 
              className="flex-shrink-0 w-[190px] p-4 rounded-2xl bg-[#070e1b]/70 border border-[#1b2d49]/80 hover:border-violet-500/50 transition-all flex flex-col justify-between h-[360px] shadow-lg relative group"
            >
              {/* Rank */}
              <div className="absolute top-3.5 left-3.5 text-[10px] font-black text-slate-500">
                {index + 1}
              </div>

              {/* Logo & Basic Info */}
              <div className="flex flex-col items-center mt-3 select-none">
                <CompanyLogo symbol={r.symbol} size="lg" className="mb-2.5" />
                <h3 className="font-extrabold text-sm text-slate-100 tracking-tight">{r.symbol}</h3>
                <span className="text-[10px] text-slate-500 font-bold text-center truncate max-w-[160px] mt-0.5">
                  {r.sector}
                </span>
                <div className="mt-2.5">
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRecBadgeClass(r.recommendation)}`}>
                    {r.recommendation}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-1 py-3 border-y border-[#182942]/60 my-3 select-none">
                <div className="text-center border-r border-[#182942]/30">
                  <div className="text-sm font-black" style={{ color: getScoreColor(r.ai_investment_score) }}>
                    {r.ai_investment_score}
                  </div>
                  <div className="text-[7px] text-slate-500 font-bold uppercase mt-0.5">AI Score</div>
                </div>
                <div className="text-center border-r border-[#182942]/30">
                  <div className="text-[11px] font-bold text-slate-200">
                    ₹{r.current_price?.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </div>
                  <div className="text-[7px] text-slate-500 font-bold uppercase mt-0.5">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-bold" style={{ color: r.upside_pct >= 0 ? '#10b981' : '#ef4444' }}>
                    {r.upside_pct >= 0 ? '+' : ''}{r.upside_pct}%
                  </div>
                  <div className="text-[7px] text-slate-500 font-bold uppercase mt-0.5">Upside</div>
                </div>
              </div>

              {/* Supporting Rationale */}
              <div className="flex-1 flex items-center justify-center">
                {r.supporting_factors?.[0] ? (
                  <div 
                    className="w-full text-[9px] leading-snug p-2 rounded-lg text-center font-bold" 
                    style={{ 
                      background: 'rgba(16,185,129,0.06)', 
                      border: '1px solid rgba(16,185,129,0.12)',
                      color: '#34d399'
                    }}
                  >
                    {r.supporting_factors[0]}
                  </div>
                ) : (
                  <div 
                    className="w-full text-[9px] leading-snug p-2 rounded-lg text-center font-bold text-slate-400"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    Stable sector performance outlook
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Row 1 */}
      {compact1List.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between select-none">
            <h2 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="text-emerald-400 text-sm">▲</span> Top {nextLimit1} Picks
            </h2>
            <button 
              onClick={() => setActiveLimit(nextLimit1 as any)}
              className="text-[10px] font-extrabold text-violet-400 bg-violet-950/40 border border-violet-900/60 px-3 py-1 rounded-full hover:bg-violet-900 hover:text-white transition-all shadow-sm"
            >
              View All
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 chat-scrollbar">
            {compact1List.map((r: any, index: number) => {
              const rank = activeLimit + index + 1;
              return (
                <div 
                  key={r.symbol} 
                  className="flex-shrink-0 flex items-center justify-between p-3 rounded-2xl border border-[#18263b] bg-[#070d17]/80 min-w-[210px] max-w-[210px] shadow-sm hover:border-[#223652] transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-[10px] text-slate-500 font-black flex-shrink-0">{rank}</span>
                    <CompanyLogo symbol={r.symbol} size="sm" />
                    <div className="leading-tight truncate pr-1">
                      <div className="text-xs font-extrabold text-slate-200">{r.symbol}</div>
                      <div className="text-[9px] text-slate-500 font-bold truncate mt-0.5">{r.sector}</div>
                      <div className="mt-1.5">
                        <span className={`text-[8px] px-2 py-0.2 rounded font-extrabold ${getRecBadgeClass(r.recommendation)}`}>
                          {r.recommendation}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 pl-1 border-l border-[#1b2f4c]/40">
                    <span className="text-xs font-black" style={{ color: getScoreColor(r.ai_investment_score) }}>
                      {r.ai_investment_score}
                    </span>
                    <span className="text-[7px] text-slate-500 font-bold uppercase">Score</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact Row 2 */}
      {compact2List.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between select-none">
            <h2 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="text-emerald-400 text-sm">▲</span> Top {nextLimit2} Picks
            </h2>
            <button 
              onClick={() => setActiveLimit(nextLimit2 as any)}
              className="text-[10px] font-extrabold text-violet-400 bg-violet-950/40 border border-violet-900/60 px-3 py-1 rounded-full hover:bg-violet-900 hover:text-white transition-all shadow-sm"
            >
              View All
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 chat-scrollbar">
            {compact2List.map((r: any, index: number) => {
              const rank = nextLimit1 + index + 1;
              return (
                <div 
                  key={r.symbol} 
                  className="flex-shrink-0 flex items-center justify-between p-3 rounded-2xl border border-[#18263b] bg-[#070d17]/80 min-w-[210px] max-w-[210px] shadow-sm hover:border-[#223652] transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-[10px] text-slate-500 font-black flex-shrink-0">{rank}</span>
                    <CompanyLogo symbol={r.symbol} size="sm" />
                    <div className="leading-tight truncate pr-1">
                      <div className="text-xs font-extrabold text-slate-200">{r.symbol}</div>
                      <div className="text-[9px] text-slate-500 font-bold truncate mt-0.5">{r.sector}</div>
                      <div className="mt-1.5">
                        <span className={`text-[8px] px-2 py-0.2 rounded font-extrabold ${getRecBadgeClass(r.recommendation)}`}>
                          {r.recommendation}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0 pl-1 border-l border-[#1b2f4c]/40">
                    <span className="text-xs font-black" style={{ color: getScoreColor(r.ai_investment_score) }}>
                      {r.ai_investment_score}
                    </span>
                    <span className="text-[7px] text-slate-500 font-bold uppercase">Score</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
