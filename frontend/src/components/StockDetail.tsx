import { useState, useEffect } from 'react';
import { api, formatCurrency, getRecBadgeClass, getRecColor, getScoreColor } from '../utils/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import ScoreGauge from './ScoreGauge';

const PERIODS = ['1mo', '3mo', '6mo', '1y', '2y'];

interface Props { symbol: string; }

export default function StockDetail({ symbol }: Props) {
  const [quote, setQuote] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [sentiment, setSentiment] = useState<any>(null);
  const [corporate, setCorporate] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [period, setPeriod] = useState('1y');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setQuote(null); setFinancial(null); setRisk(null); setSentiment(null);
    setCorporate(null); setRecommendation(null);

    Promise.all([
      api.getQuote(symbol),
      api.getHistory(symbol, period),
      api.getFinancial(symbol),
      api.getRisk(symbol),
      api.getSentiment(symbol),
      api.getCorporate(symbol),
      api.getRecommendation(symbol),
    ]).then(([q, h, f, r, s, c, rec]) => {
      setQuote(q.data);
      setHistory(h.data);
      setFinancial(f.data);
      setRisk(r.data);
      setSentiment(s.data);
      setCorporate(c.data);
      setRecommendation(rec.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [symbol]);

  useEffect(() => {
    api.getHistory(symbol, period).then(r => setHistory(r.data)).catch(console.error);
  }, [period, symbol]);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="text-center">
        <div className="text-3xl mb-3 animate-spin">⏳</div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading {symbol}...</p>
      </div>
    </div>
  );

  const chartData = history?.data?.map((d: any) => ({ ...d, close: d.close })) || [];
  const radarData = financial ? [
    { subject: 'Valuation',    score: financial.scores.valuation },
    { subject: 'Profitability',score: financial.scores.profitability },
    { subject: 'Growth',       score: financial.scores.growth },
    { subject: 'Fin. Health',  score: financial.scores.financial_health },
    { subject: 'Cashflow',     score: financial.scores.cashflow },
    { subject: 'Earnings',     score: financial.scores.earnings_quality },
  ] : [];

  const DETAIL_TABS = ['Overview', 'Financials', 'Sentiment & News', 'Corporate Intel'];

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{symbol}</h2>
              {recommendation && (
                <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getRecBadgeClass(recommendation.recommendation)}`}>
                  {recommendation.recommendation}
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{quote?.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{quote?.sector}</p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              ₹{quote?.current_price?.toLocaleString('en-IN')}
            </div>
            <div className="text-sm font-medium" style={{ color: quote?.change >= 0 ? '#10b981' : '#ef4444' }}>
              {quote?.change >= 0 ? '▲' : '▼'} ₹{Math.abs(quote?.change || 0).toFixed(2)} ({Math.abs(quote?.change_pct || 0).toFixed(2)}%)
            </div>
            {recommendation && (
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Target: ₹{recommendation.target_price?.toLocaleString('en-IN')}
                <span style={{ color: recommendation.upside_pct >= 0 ? '#10b981' : '#ef4444', marginLeft: 4 }}>
                  ({recommendation.upside_pct >= 0 ? '+' : ''}{recommendation.upside_pct}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Score gauges */}
        {recommendation && (
          <div className="flex flex-wrap gap-6 mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <ScoreGauge score={recommendation.ai_investment_score} label="AI Score" size={90} />
            <ScoreGauge score={recommendation.score_components.financial_score} label="Financial" size={75} />
            <ScoreGauge score={recommendation.score_components.growth_score} label="Growth" size={75} />
            <ScoreGauge score={recommendation.score_components.sentiment_score} label="Sentiment" size={75} />
            <ScoreGauge score={recommendation.score_components.risk_score} label="Risk" size={75} />
          </div>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {DETAIL_TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className="flex-shrink-0 px-4 py-2 text-sm rounded-lg font-medium transition-colors"
            style={{
              background: tab === i ? 'var(--accent)' : 'var(--bg-card)',
              color: tab === i ? '#fff' : 'var(--text-secondary)',
              border: '1px solid ' + (tab === i ? 'var(--accent)' : 'var(--border)'),
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: Overview */}
      {tab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Price Chart */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>PRICE HISTORY</h3>
              <div className="flex gap-1">
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: period === p ? 'var(--accent)' : 'transparent',
                      color: period === p ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }}
                  tickFormatter={v => v.slice(5)} interval={Math.floor(chartData.length / 6)} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={['auto', 'auto']}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={50} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Close']}
                />
                <Area type="monotone" dataKey="close" stroke="#0ea5e9" strokeWidth={2}
                  fill="url(#priceGradient)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>KEY METRICS</h3>
            {[
              ['Market Cap', formatCurrency(quote?.market_cap)],
              ['P/E Ratio',  quote?.pe_ratio ? quote.pe_ratio.toFixed(2) : '—'],
              ['P/B Ratio',  quote?.pb_ratio ? quote.pb_ratio.toFixed(2) : '—'],
              ['EPS',        quote?.eps ? `₹${quote.eps.toFixed(2)}` : '—'],
              ['ROE',        quote?.roe ? `${(quote.roe * 100).toFixed(1)}%` : '—'],
              ['52W High',   `₹${quote?.['52w_high']?.toLocaleString('en-IN') || '—'}`],
              ['52W Low',    `₹${quote?.['52w_low']?.toLocaleString('en-IN') || '—'}`],
              ['Div. Yield', quote?.dividend_yield ? `${(quote.dividend_yield * 100).toFixed(2)}%` : '—'],
              ['Volume',     quote?.volume ? `${(quote.volume / 1e6).toFixed(1)}M` : '—'],
              ['D/E Ratio',  quote?.debt_equity ? quote.debt_equity.toFixed(2) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 1: Financials */}
      {tab === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Radar Chart */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>FINANCIAL HEALTH RADAR</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e2d4a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Breakdown */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>SCORE BREAKDOWN</h3>
            <div className="space-y-4">
              {financial && Object.entries(financial.scores).map(([key, score]: [string, any]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>{key.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="font-semibold" style={{ color: getScoreColor(score) }}>{score}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${score}%`, background: getScoreColor(score), transition: 'width 0.5s ease' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Factors */}
            {risk && risk.risk_factors.length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                  ⚠️ RISK FACTORS
                </h4>
                {risk.risk_factors.map((rf: any, i: number) => (
                  <div key={i} className="mb-2 p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium" style={{ color: '#ef4444' }}>{rf.factor}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{
                        background: rf.impact === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                        color: rf.impact === 'High' ? '#ef4444' : '#f59e0b',
                      }}>
                        {rf.impact}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{rf.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Sentiment */}
      {tab === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>MARKET SENTIMENT</h3>
            {sentiment && (
              <>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold mb-1" style={{ color: sentiment.overall_score > 0 ? '#10b981' : '#ef4444' }}>
                    {sentiment.overall_sentiment}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Market Perception Index: <span className="font-semibold" style={{ color: getScoreColor(sentiment.market_perception_index) }}>
                      {sentiment.market_perception_index}/100
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Positive', pct: sentiment.positive_pct, color: '#10b981' },
                    { label: 'Negative', pct: sentiment.negative_pct, color: '#ef4444' },
                    { label: 'Neutral',  pct: sentiment.neutral_pct,  color: '#64748b' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: item.color }}>{item.label}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-2 card p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>LATEST NEWS</h3>
            <div className="space-y-3">
              {sentiment?.articles?.map((article: any, i: number) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {article.headline}
                    </p>
                    <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: article.sentiment === 'positive' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: article.sentiment === 'positive' ? '#10b981' : '#ef4444',
                      }}>
                      {article.sentiment === 'positive' ? '▲' : '▼'} {Math.abs(article.score).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{article.source}</span>
                    <span className="text-xs" style={{ color: 'var(--border)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{article.published_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Corporate Intel */}
      {tab === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {corporate && [
            { title: '🎯 Strategic Goals', items: corporate.strategic_goals, color: '#0ea5e9' },
            { title: '🚀 Expansion Plans', items: corporate.expansion_plans, color: '#10b981' },
            { title: '🔬 R&D Initiatives', items: corporate.rd_initiatives, color: '#8b5cf6' },
            { title: '🤝 M&A Activities', items: corporate.ma_activities, color: '#f59e0b' },
          ].map(section => (
            <div key={section.title} className="card p-5">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: section.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Recommendation Summary */}
          {recommendation && (
            <div className="md:col-span-2 card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
                🤖 AI RECOMMENDATION SUMMARY
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: '#10b981' }}>✅ Supporting Factors</p>
                  <ul className="space-y-1.5">
                    {recommendation.supporting_factors?.map((f: string, i: number) => (
                      <li key={i} className="text-xs flex items-start gap-1.5">
                        <span style={{ color: '#10b981' }}>•</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: '#ef4444' }}>⚠️ Risk Flags</p>
                  {recommendation.risk_flags?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {recommendation.risk_flags?.map((f: string, i: number) => (
                        <li key={i} className="text-xs flex items-start gap-1.5">
                          <span style={{ color: '#ef4444' }}>•</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No major risk flags</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
