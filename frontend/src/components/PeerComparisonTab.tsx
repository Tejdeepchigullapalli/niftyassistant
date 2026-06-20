import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';
import { Award, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { getSectorPeers } from '../utils/analysisUtils';
import { CompanyLogo } from './DashboardView';
import { formatCurrency } from '../utils/api';
import MetricCard from './MetricCard';

interface PeerComparisonTabProps {
  symbol: string;
  meta: any;
  quote: any;
  quotes: any[];
  onSymbolSelect?: (symbol: string) => void;
}

export default function PeerComparisonTab({
  symbol,
  meta,
  quote,
  quotes = [],
  onSymbolSelect
}: PeerComparisonTabProps) {
  // A. Dynamic peers benchmarking list
  const peerRows = useMemo(() => getSectorPeers(symbol, meta.sector, quotes), [symbol, meta.sector, quotes]);

  // C. Calculate Highlight cards dynamically from peers list
  const highlights = useMemo(() => {
    if (peerRows.length === 0) return { undervalued: '—', growth: '—', roe: '—', rank: '—' };
    
    // Sort logic
    const sortedPe = [...peerRows].sort((a, b) => a.pe - b.pe);
    const sortedGrowth = [...peerRows].sort((a, b) => b.revenueGrowth - a.revenueGrowth);
    const sortedRoe = [...peerRows].sort((a, b) => b.roe - a.roe);
    const sortedScore = [...peerRows].sort((a, b) => b.aiScore - a.aiScore);

    return {
      undervalued: sortedPe[0]?.symbol || '—',
      growth: sortedGrowth[0]?.symbol || '—',
      roe: sortedRoe[0]?.symbol || '—',
      rank: sortedScore[0]?.symbol || '—'
    };
  }, [peerRows]);

  // B. AI Score comparative bar chart
  const barChartData = useMemo(() => {
    return peerRows.map(p => ({
      name: p.symbol,
      Score: p.aiScore,
      PE: p.pe
    }));
  }, [peerRows]);

  // Comparative metrics vs median
  const radarData = useMemo(() => {
    if (peerRows.length === 0) return [];
    
    // Calculate averages of peers excluding selected stock
    const rest = peerRows.filter(p => p.symbol.toUpperCase() !== symbol.toUpperCase());
    const count = rest.length || 1;
    
    const avgPe = rest.reduce((acc, curr) => acc + curr.pe, 0) / count;
    const avgRoe = rest.reduce((acc, curr) => acc + curr.roe, 0) / count;
    const avgGrowth = rest.reduce((acc, curr) => acc + curr.revenueGrowth, 0) / count;
    const avgScore = rest.reduce((acc, curr) => acc + curr.aiScore, 0) / count;

    const activeRow = peerRows.find(p => p.symbol.toUpperCase() === symbol.toUpperCase()) || peerRows[0];

    return [
      { subject: 'AI Score', Stock: activeRow.aiScore, SectorMedian: Math.round(avgScore) },
      { subject: 'ROE %', Stock: Math.min(100, activeRow.roe * 2), SectorMedian: Math.round(avgRoe * 2) },
      { subject: 'Growth %', Stock: Math.min(100, activeRow.revenueGrowth * 3), SectorMedian: Math.round(avgGrowth * 3) },
      { subject: 'Valuation Safety', Stock: Math.min(100, 100 - activeRow.pe * 1.5), SectorMedian: Math.round(100 - avgPe * 1.5) }
    ];
  }, [peerRows, symbol]);

  return (
    <div className="space-y-4 w-full select-none text-[#F8FAFC]">
      
      {/* Dynamic sector label bar */}
      <div className="flex justify-between items-center bg-[#0d121f] border border-[#1E293B] px-3.5 py-2 rounded-xl select-none">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">Competitive Benchmarking Matrix ({meta.sector} Sector)</span>
        </div>
        <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase">
          Dynamic Filter
        </span>
      </div>

      {/* Grid of Highlight cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch select-none">
        <div className="card p-3 bg-[#0d121f] border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-violet-500/20 transition-all">
          <div className="leading-none">
            <span className="text-[7.5px] text-[#64748B] uppercase tracking-widest font-black block">Most Undervalued</span>
            <span className="text-sm font-black text-emerald-400 block mt-1.5">{highlights.undervalued}</span>
          </div>
          <span className="text-xl">💎</span>
        </div>

        <div className="card p-3 bg-[#0d121f] border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-violet-500/20 transition-all">
          <div className="leading-none">
            <span className="text-[7.5px] text-[#64748B] uppercase tracking-widest font-black block">Fastest growth</span>
            <span className="text-sm font-black text-violet-400 block mt-1.5">{highlights.growth}</span>
          </div>
          <span className="text-xl">🚀</span>
        </div>

        <div className="card p-3 bg-[#0d121f] border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-violet-500/20 transition-all">
          <div className="leading-none">
            <span className="text-[7.5px] text-[#64748B] uppercase tracking-widest font-black block">Highest ROE</span>
            <span className="text-sm font-black text-[#3B82F6] block mt-1.5">{highlights.roe}</span>
          </div>
          <span className="text-xl">📊</span>
        </div>

        <div className="card p-3 bg-[#0d121f] border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-violet-500/20 transition-all">
          <div className="leading-none">
            <span className="text-[7.5px] text-[#64748B] uppercase tracking-widest font-black block">Top AI Score Rank</span>
            <span className="text-sm font-black text-white block mt-1.5">{highlights.rank}</span>
          </div>
          <span className="text-xl">🏆</span>
        </div>
      </div>

      {/* Peer Comparison Table */}
      <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-violet-500/20 transition-all">
        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3">Solvency Benchmarking Table</span>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[9.5px] font-bold border-collapse min-w-[700px]">
            <thead>
              <tr className="text-[8px] text-[#64748B] border-b border-[#1E293B] uppercase">
                <th className="pb-2">Company Name</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-right">Market Cap</th>
                <th className="pb-2 text-center">P/E Ratio</th>
                <th className="pb-2 text-center">P/B Ratio</th>
                <th className="pb-2 text-center">ROE %</th>
                <th className="pb-2 text-center">Rev Growth %</th>
                <th className="pb-2 text-center">AI Score</th>
                <th className="pb-2 text-right">AI Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/50 select-none">
              {peerRows.map((peer) => {
                const isActive = peer.symbol.toUpperCase() === symbol.toUpperCase();
                return (
                  <tr 
                    key={peer.symbol} 
                    onClick={() => onSymbolSelect?.(peer.symbol)}
                    className={`hover:bg-white/[0.015] cursor-pointer transition-colors h-9 leading-none ${
                      isActive ? 'border-l-2 border-violet-500 bg-violet-500/[0.02]' : ''
                    }`}
                  >
                    <td className="py-2 pl-2 flex items-center gap-2">
                      <CompanyLogo symbol={peer.symbol} size="sm" />
                      <div className="leading-none">
                        <span className="text-[#F8FAFC] font-extrabold block">{peer.symbol}</span>
                        <span className="text-[7.5px] text-[#64748B] block mt-0.5">{peer.name}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right">₹{peer.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 text-right">{formatCurrency(peer.marketCap)}</td>
                    <td className="py-2 text-center text-[#94A3B8]">{peer.pe.toFixed(2)}</td>
                    <td className="py-2 text-center text-[#94A3B8]">{peer.pb.toFixed(2)}</td>
                    <td className="py-2 text-center text-[#22C55E]">{peer.roe}%</td>
                    <td className="py-2 text-center text-violet-400">{peer.revenueGrowth}%</td>
                    <td className="py-2 text-center font-black" style={{ color: isActive ? meta.color : '#F8FAFC' }}>{peer.aiScore}</td>
                    <td className="py-2 text-right pr-2">
                      <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase ${
                        peer.recommendation.includes('Buy') ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                      }`}>
                        {peer.recommendation}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmarking Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none">
        
        {/* Radar Stock vs Median Chart */}
        <div className="lg:col-span-5 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between h-[320px]">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Stock vs Sector Median Positioning</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Multi-vector analysis vs competitors median</span>
          </div>
          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={7.5} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={6} />
                <Radar name={symbol} dataKey="Stock" stroke={meta.color} fill={meta.color} fillOpacity={0.25} />
                <Radar name="Sector Median" dataKey="SectorMedian" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.1} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Score Comparison chart */}
        <div className="lg:col-span-7 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between h-[320px]">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">AI Investment Score Benchmarks</span>
            <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Comparison of AI Scores across sector peers</span>
          </div>
          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={8} tickLine={false} />
                <YAxis stroke="#475569" fontSize={8} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '10px', fontSize: 9 }} />
                <Bar dataKey="Score" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={8}>
                  {barChartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.name.toUpperCase() === symbol.toUpperCase() ? meta.color : '#475569'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
