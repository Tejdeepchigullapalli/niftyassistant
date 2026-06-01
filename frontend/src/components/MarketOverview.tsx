import { formatCurrency, getRecBadgeClass, getRecColor, getScoreColor } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell
} from 'recharts';
import ScoreGauge from './ScoreGauge';

interface Props {
  quotes: any[];
  recs: Record<string, any>;
  onSelect: (symbol: string) => void;
}

export default function MarketOverview({ quotes, recs, onSelect }: Props) {
  const sortedByScore = Object.values(recs).sort((a, b) => b.ai_investment_score - a.ai_investment_score);
  
  const gainers = [...quotes].filter(q => q.change > 0).sort((a, b) => b.change_pct - a.change_pct).slice(0, 5);
  const losers  = [...quotes].filter(q => q.change < 0).sort((a, b) => a.change_pct - b.change_pct).slice(0, 5);

  const recDistribution = Object.values(recs).reduce((acc: Record<string, number>, r: any) => {
    acc[r.recommendation] = (acc[r.recommendation] || 0) + 1;
    return acc;
  }, {});
  const recChartData = Object.entries(recDistribution).map(([name, value]) => ({
    name, value, fill: getRecColor(name)
  }));

  const scoreChartData = sortedByScore.map((r: any) => ({
    symbol: r.symbol,
    score: r.ai_investment_score,
    fill: getScoreColor(r.ai_investment_score)
  }));

  return (
    <div className="space-y-6 fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyzed', value: Object.keys(recs).length, icon: '📊', sub: 'Nifty Top 10' },
          { label: 'Buy / Strong Buy', value: Object.values(recs).filter((r: any) => r.recommendation.includes('Buy')).length, icon: '📈', sub: 'Bullish signals' },
          { label: 'Hold', value: Object.values(recs).filter((r: any) => r.recommendation === 'Hold').length, icon: '⏸️', sub: 'Neutral' },
          { label: 'Reduce / Sell', value: Object.values(recs).filter((r: any) => ['Reduce','Sell'].includes(r.recommendation)).length, icon: '📉', sub: 'Cautious' },
        ].map(card => (
          <div key={card.label} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{card.sub}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Score Rankings */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
          AI INVESTMENT SCORE RANKING
        </h2>
        <div className="space-y-3">
          {sortedByScore.map((r: any, i) => (
            <div
              key={r.symbol}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              style={{ background: 'rgba(255,255,255,0.02)' }}
              onClick={() => onSelect(r.symbol)}
            >
              <span className="text-sm font-bold w-5 text-center" style={{ color: 'var(--text-muted)' }}>
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.symbol}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{r.sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRecBadgeClass(r.recommendation)}`}>
                      {r.recommendation}
                    </span>
                    <span className="text-sm font-bold" style={{ color: getScoreColor(r.ai_investment_score) }}>
                      {r.ai_investment_score}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${r.ai_investment_score}%`, background: getScoreColor(r.ai_investment_score) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Score Bar Chart */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
            AI SCORES COMPARISON
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreChartData} margin={{ top: 0, right: 0, bottom: 20, left: -20 }}>
              <XAxis dataKey="symbol" tick={{ fill: '#64748b', fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1e2d4a', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#0ea5e9' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {scoreChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gainers & Losers */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
            TODAY'S MOVERS
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#10b981' }}>▲ Top Gainers</p>
              {gainers.map(q => (
                <div key={q.symbol} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }} onClick={() => onSelect(q.symbol)}>
                    {q.symbol}
                  </span>
                  <span style={{ color: '#10b981' }}>+{q.change_pct?.toFixed(2)}%</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#ef4444' }}>▼ Top Losers</p>
              {losers.map(q => (
                <div key={q.symbol} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }} onClick={() => onSelect(q.symbol)}>
                    {q.symbol}
                  </span>
                  <span style={{ color: '#ef4444' }}>{q.change_pct?.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
