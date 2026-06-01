import { getRecBadgeClass, getRecColor, getScoreColor, formatCurrency } from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ScoreGauge from './ScoreGauge';

interface Props {
  recs: Record<string, any>;
  quotes: Record<string, any>;
}

const SECTOR_COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e'];

export default function PortfolioView({ recs, quotes }: Props) {
  const allRecs = Object.values(recs).sort((a: any, b: any) => b.ai_investment_score - a.ai_investment_score);
  const topPicks = allRecs.filter((r: any) => ['Strong Buy', 'Buy'].includes(r.recommendation));
  const holdPicks = allRecs.filter((r: any) => r.recommendation === 'Hold');
  const avoidPicks = allRecs.filter((r: any) => ['Reduce', 'Sell'].includes(r.recommendation));

  // Sector distribution
  const sectorMap: Record<string, number> = {};
  allRecs.forEach((r: any) => {
    sectorMap[r.sector] = (sectorMap[r.sector] || 0) + 1;
  });
  const pieData = Object.entries(sectorMap).map(([name, value]) => ({ name, value }));

  const avgScore = allRecs.length > 0
    ? Math.round(allRecs.reduce((sum: number, r: any) => sum + r.ai_investment_score, 0) / allRecs.length)
    : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center justify-center">
          <ScoreGauge score={avgScore} label="Portfolio Score" size={100} />
        </div>
        {[
          { label: 'Strong Buy / Buy', count: topPicks.length, color: '#10b981', icon: '📈' },
          { label: 'Hold',              count: holdPicks.length, color: '#f59e0b', icon: '⏸️' },
          { label: 'Reduce / Sell',     count: avoidPicks.length, color: '#ef4444', icon: '📉' },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{c.icon}</span>
              <span className="text-3xl font-bold" style={{ color: c.color }}>{c.count}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Top Picks */}
      {topPicks.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color: '#10b981' }}>▲</span> TOP PICKS — BUY / STRONG BUY
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topPicks.map((r: any) => {
              const q = quotes[r.symbol];
              return (
                <div key={r.symbol} className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{r.symbol}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.sector}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getRecBadgeClass(r.recommendation)}`}>
                      {r.recommendation}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: getScoreColor(r.ai_investment_score) }}>
                        {r.ai_investment_score}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ₹{r.current_price?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold" style={{ color: r.upside_pct >= 0 ? '#10b981' : '#ef4444' }}>
                        {r.upside_pct >= 0 ? '+' : ''}{r.upside_pct}%
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Upside</div>
                    </div>
                  </div>
                  {r.supporting_factors?.[0] && (
                    <p className="text-xs p-2 rounded" style={{ background: 'rgba(16,185,129,0.08)', color: '#6ee7b7' }}>
                      ✓ {r.supporting_factors[0]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hold & Avoid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {holdPicks.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: '#f59e0b' }}>⏸</span> HOLD POSITIONS
            </h2>
            <div className="space-y-2">
              {holdPicks.map((r: any) => (
                <div key={r.symbol} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.symbol}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{r.sector}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: getScoreColor(r.ai_investment_score) }}>{r.ai_investment_score}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRecBadgeClass(r.recommendation)}`}>{r.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {avoidPicks.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: '#ef4444' }}>▼</span> REDUCE / AVOID
            </h2>
            <div className="space-y-2">
              {avoidPicks.map((r: any) => (
                <div key={r.symbol} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.symbol}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{r.sector}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: getScoreColor(r.ai_investment_score) }}>{r.ai_investment_score}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRecBadgeClass(r.recommendation)}`}>{r.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sector Pie */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>SECTOR DISTRIBUTION</h2>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: '#111827', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }} 
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
