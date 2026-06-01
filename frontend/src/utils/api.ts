import axios from 'axios';

const BASE = 'http://localhost:8000/api';

const COMPANIES_METADATA = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy & Retail', industry: 'Conglomerate', color: '#e11d48', basePrice: 2936.12 },
  { symbol: 'TCS',      name: 'Tata Consultancy Services', sector: 'Information Technology', industry: 'IT Services', color: '#2563eb', basePrice: 3915.20 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking & Financial', industry: 'Private Bank', color: '#7c3aed', basePrice: 1682.40 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', industry: 'Telecommunications', color: '#ea580c', basePrice: 1541.35 },
  { symbol: 'ICICIBANK',name: 'ICICI Bank Ltd', sector: 'Banking & Financial', industry: 'Private Bank', color: '#d97706', basePrice: 1285.90 },
  { symbol: 'INFY',     name: 'Infosys Ltd', sector: 'Information Technology', industry: 'IT Services', color: '#16a34a', basePrice: 1468.75 },
  { symbol: 'SBIN',     name: 'State Bank of India', sector: 'Banking & Financial', industry: 'Public Sector Bank', color: '#0284c7', basePrice: 812.40 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', industry: 'Consumer Goods', color: '#92400e', basePrice: 2534.65 },
  { symbol: 'ITC',      name: 'ITC Ltd', sector: 'FMCG & Diversified', industry: 'Conglomerate', color: '#374151', basePrice: 444.75 },
  { symbol: 'LT',       name: 'Larsen & Toubro Ltd', sector: 'Infrastructure', industry: 'Engineering', color: '#b45309', basePrice: 3625.80 },
  { symbol: 'HCLTECH',  name: 'HCL Technologies Ltd', sector: 'Information Technology', industry: 'IT Services', color: '#06b6d4', basePrice: 1345.50 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking & Financial', industry: 'Private Bank', color: '#be123c', basePrice: 1042.80 },
  { symbol: 'SUNPHARMA',name: 'Sun Pharmaceutical Ltd', sector: 'Healthcare', industry: 'Pharmaceuticals', color: '#059669', basePrice: 1540.20 },
  { symbol: 'MARUTI',   name: 'Maruti Suzuki India Ltd', sector: 'Automobile', industry: 'Passenger Vehicles', color: '#1e3a8a', basePrice: 12420.50 },
  { symbol: 'KOTAKBANK',name: 'Kotak Mahindra Bank', sector: 'Banking & Financial', industry: 'Private Bank', color: '#b91c1c', basePrice: 1721.40 },
  { symbol: 'ULTRACEMCO',name: 'UltraTech Cement Ltd', sector: 'Materials', industry: 'Cement', color: '#4b5563', basePrice: 9840.50 },
  { symbol: 'NTPC',     name: 'NTPC Ltd', sector: 'Utilities', industry: 'Power Generation', color: '#047857', basePrice: 362.40 },
  { symbol: 'TATAMOTORS',name: 'Tata Motors Ltd', sector: 'Automobile', industry: 'Commercial Vehicles', color: '#1d4ed8', basePrice: 942.30 },
  { symbol: 'ONGC',     name: 'Oil & Natural Gas Corp', sector: 'Utilities', industry: 'Oil exploration', color: '#b45309', basePrice: 275.60 },
  { symbol: 'COALINDIA',name: 'Coal India Ltd', sector: 'Utilities', industry: 'Coal Mining', color: '#111827', basePrice: 462.15 },
  { symbol: 'POWERGRID',name: 'Power Grid Corp', sector: 'Utilities', industry: 'Power Transmission', color: '#0369a1', basePrice: 312.45 },
  { symbol: 'TITAN',    name: 'Titan Company Ltd', sector: 'FMCG', industry: 'Jewellery & Watches', color: '#7c2d12', basePrice: 3241.60 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Diversified', industry: 'Conglomerate', color: '#312e81', basePrice: 3122.50 },
  { symbol: 'ADANIPORTS',name: 'Adani Ports & SEZ', sector: 'Infrastructure', industry: 'Ports & Logistics', color: '#1e1b4b', basePrice: 1284.60 },
  { symbol: 'M&M',      name: 'Mahindra & Mahindra', sector: 'Automobile', industry: 'Diversified Vehicles', color: '#991b1b', basePrice: 2842.10 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Materials', industry: 'Steel Production', color: '#0f172a', basePrice: 875.40 },
  { symbol: 'ASIANPAINT',name: 'Asian Paints Ltd', sector: 'FMCG', industry: 'Paints & Decors', color: '#701a75', basePrice: 2854.20 },
  { symbol: 'HINDALCO', name: 'Hindalco Industries', sector: 'Materials', industry: 'Aluminium', color: '#14532d', basePrice: 642.15 },
  { symbol: 'TATASTEEL',name: 'Tata Steel Ltd', sector: 'Materials', industry: 'Steel Production', color: '#0369a1', basePrice: 165.40 },
  { symbol: 'GRASIM',   name: 'Grasim Industries Ltd', sector: 'Diversified', industry: 'Textiles & Cement', color: '#581c87', basePrice: 2354.20 },
  { symbol: 'WIPRO',    name: 'Wipro Ltd', sector: 'Information Technology', industry: 'IT Services', color: '#1e40af', basePrice: 462.15 },
  { symbol: 'TECHM',    name: 'Tech Mahindra Ltd', sector: 'Information Technology', industry: 'IT Services', color: '#be123c', basePrice: 1242.30 },
  { symbol: 'NESTLEIND',name: 'Nestle India Ltd', sector: 'FMCG', industry: 'Packaged Foods', color: '#4b5563', basePrice: 24500.60 },
  { symbol: 'LTIM',     name: 'LTIMindtree Ltd', sector: 'Information Technology', industry: 'IT Services', color: '#2e1065', basePrice: 4850.25 },
  { symbol: 'INDUSINDBK',name: 'IndusInd Bank Ltd', sector: 'Banking & Financial', industry: 'Private Bank', color: '#c2410c', basePrice: 1421.40 },
  { symbol: 'BAJFINANCE',name: 'Bajaj Finance Ltd', sector: 'Banking & Financial', industry: 'NBFC', color: '#0369a1', basePrice: 6842.10 },
  { symbol: 'BAJAJFINSV',name: 'Bajaj Finserv Ltd', sector: 'Banking & Financial', industry: 'NBFC', color: '#0284c7', basePrice: 1542.30 },
  { symbol: 'CIPLA',    name: 'Cipla Ltd', sector: 'Healthcare', industry: 'Pharmaceuticals', color: '#047857', basePrice: 1425.40 },
  { symbol: 'DRREDDY',  name: 'Dr Reddys Laboratories', sector: 'Healthcare', industry: 'Pharmaceuticals', color: '#065f46', basePrice: 5845.20 },
  { symbol: 'APOLLOHOSP',name: 'Apollo Hospitals', sector: 'Healthcare', industry: 'Hospitals', color: '#991b1b', basePrice: 5940.50 },
  { symbol: 'SBILIFE',  name: 'SBI Life Insurance', sector: 'Banking & Financial', industry: 'Life Insurance', color: '#0369a1', basePrice: 1420.20 },
  { symbol: 'EICHERMOT',name: 'Eicher Motors Ltd', sector: 'Automobile', industry: 'Motorcycles', color: '#854d0e', basePrice: 4540.60 },
  { symbol: 'BPCL',     name: 'Bharat Petroleum', sector: 'Utilities', industry: 'Oil Refining', color: '#0369a1', basePrice: 612.40 },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories', sector: 'Healthcare', industry: 'Biotechnologies', color: '#15803d', basePrice: 3840.50 },
  { symbol: 'HEROCOCO', name: 'Hero MotoCorp Ltd', sector: 'Automobile', industry: 'Motorcycles', color: '#991b1b', basePrice: 4842.10 },
  { symbol: 'BRITANNIA',name: 'Britannia Industries', sector: 'FMCG', industry: 'Packaged Foods', color: '#854d0e', basePrice: 5240.20 },
  { symbol: 'JIOFIN',   name: 'Jio Financial Services', sector: 'Banking & Financial', industry: 'NBFC', color: '#4338ca', basePrice: 362.45 },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd', sector: 'Materials', industry: 'Cement', color: '#374151', basePrice: 24500.20 },
  { symbol: 'BEL',      name: 'Bharat Electronics Ltd', sector: 'Infrastructure', industry: 'Defense Tech', color: '#047857', basePrice: 285.40 },
  { symbol: 'HAL',      name: 'Hindustan Aeronautics', sector: 'Infrastructure', industry: 'Aerospace & Defense', color: '#0369a1', basePrice: 4242.10 }
];

export const getCompanyMeta = (symbol: string) => {
  const sym = symbol.toUpperCase().trim();
  const found = COMPANIES_METADATA.find(c => c.symbol === sym);
  if (found) return found;

  // Dynamically generate reasonable base metrics for custom typed symbols
  let generatedBasePrice = 350.0;
  let hash = 0;
  for (let i = 0; i < sym.length; i++) {
    hash = sym.charCodeAt(i) + ((hash << 5) - hash);
  }
  generatedBasePrice = Math.abs(hash % 4500) + 75;

  const sectors = ['Information Technology', 'Banking & Financial', 'FMCG', 'Materials', 'Healthcare', 'Infrastructure', 'Automobile'];
  const industries = ['Services Provider', 'Commercial Ventures', 'Retail & Consumer Goods', 'Basic Operations', 'Product Manufacturing'];
  
  const sectorIndex = Math.abs(hash) % sectors.length;
  const industryIndex = Math.abs(hash) % industries.length;

  return {
    symbol: sym,
    name: sym.replace(/[^A-Za-z0-9]/g, '') + ' India Ltd',
    sector: sectors[sectorIndex],
    industry: industries[industryIndex],
    color: '#8b5cf6',
    basePrice: parseFloat(generatedBasePrice.toFixed(2))
  };
};

// Offline fallback generators
const generateMockQuote = (symbol: string) => {
  const meta = getCompanyMeta(symbol);
  const price = meta.basePrice;
  const changePct = parseFloat((Math.random() * 4 - 2).toFixed(2));
  const change = parseFloat((price * (changePct / 100)).toFixed(2));
  
  return {
    symbol: meta.symbol,
    name: meta.name,
    sector: meta.sector,
    current_price: parseFloat((price + change).toFixed(2)),
    previous_close: price,
    change: change,
    change_pct: changePct,
    open: parseFloat((price + (Math.random() * 2 - 1)).toFixed(2)),
    high: parseFloat((price + Math.abs(change) + Math.random() * 5).toFixed(2)),
    low: parseFloat((price - Math.abs(change) - Math.random() * 5).toFixed(2)),
    volume: Math.floor(Math.random() * 8000000) + 1000000,
    market_cap: Math.floor(Math.random() * 12000000000000) + 200000000000,
    pe_ratio: parseFloat((Math.random() * 15 + 15).toFixed(2)),
    pb_ratio: parseFloat((Math.random() * 4 + 1.5).toFixed(2)),
    dividend_yield: parseFloat((Math.random() * 0.03 + 0.005).toFixed(4)),
    "52w_high": parseFloat((price * 1.2).toFixed(2)),
    "52w_low": parseFloat((price * 0.85).toFixed(2)),
    avg_volume: Math.floor(Math.random() * 10000000) + 3000000,
    eps: parseFloat((Math.random() * 80 + 30).toFixed(2)),
    roe: parseFloat((Math.random() * 0.15 + 0.1).toFixed(4)),
    debt_equity: parseFloat((Math.random() * 1.2).toFixed(2)),
    revenue_growth: parseFloat((Math.random() * 0.2).toFixed(4)),
    earnings_growth: parseFloat((Math.random() * 0.25).toFixed(4)),
    free_cashflow: Math.floor(Math.random() * 400000000000) + 10000000000,
    timestamp: new Date().toISOString()
  };
};

const generateMockHistory = (symbol: string, period = '1y') => {
  const meta = getCompanyMeta(symbol);
  const price = meta.basePrice;
  let points = 30;
  if (period === '3mo') points = 90;
  if (period === '6mo') points = 180;
  if (period === '1y') points = 250;
  if (period === '2y') points = 500;

  const data = [];
  let currentPrice = price * 0.85;
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      const pct = (Math.random() * 3.2 - 1.5) / 100;
      currentPrice = parseFloat((currentPrice * (1 + pct)).toFixed(2));
      data.push({
        date: date.toISOString().split('T')[0],
        open: parseFloat((currentPrice * (1 - 0.005)).toFixed(2)),
        high: parseFloat((currentPrice * (1 + 0.008)).toFixed(2)),
        low: parseFloat((currentPrice * (1 - 0.008)).toFixed(2)),
        close: currentPrice,
        volume: Math.floor(Math.random() * 5000000) + 1000000
      });
    }
  }

  return { symbol: symbol.toUpperCase(), period, data };
};

const generateMockRecommendation = (symbol: string) => {
  const meta = getCompanyMeta(symbol);
  const score = Math.floor(Math.random() * 35 + 50);
  
  let rec = 'Hold';
  if (score >= 78) rec = 'Strong Buy';
  else if (score >= 65) rec = 'Buy';
  else if (score >= 48) rec = 'Hold';
  else if (score >= 35) rec = 'Reduce';
  else rec = 'Sell';

  const currentPrice = meta.basePrice;
  const upside = rec.includes('Buy') ? 0.15 : 0.03;
  const targetPrice = parseFloat((currentPrice * (1 + upside)).toFixed(2));

  return {
    symbol: meta.symbol,
    name: meta.name,
    sector: meta.sector,
    current_price: currentPrice,
    target_price: targetPrice,
    upside_pct: parseFloat((upside * 100).toFixed(1)),
    recommendation: rec,
    ai_investment_score: score,
    score_components: {
      financial_score: Math.floor(Math.random() * 20 + 65),
      growth_score: Math.floor(Math.random() * 20 + 68),
      sentiment_score: Math.floor(Math.random() * 20 + 60),
      risk_score: Math.floor(Math.random() * 20 + 70)
    },
    supporting_factors: [
      `Market cap leader in ${meta.sector} sector with steady operations`,
      `Attractive core capitalization matching ${meta.industry} standards`,
      `Consistent historical earnings per share and healthy margins`,
      `Strategic expansion initiatives and R&D capability indexing`,
      `Favorable cashflow reserves securing expansion capex`
    ],
    risk_flags: [
      'Raw material pricing pressure matching global indicators',
      'Currency volatility impact on export-oriented revenues'
    ]
  };
};

const generateMockCorporate = (symbol: string) => {
  const meta = getCompanyMeta(symbol);
  return {
    symbol: meta.symbol,
    name: meta.name,
    strategic_goals: [
      `Expand market share in the primary ${meta.sector} industry by 15%`,
      `Transition 30% of energy requirements to eco-friendly resources`,
      `Achieve carbon-neutral operational milestones ahead of regulations`
    ],
    expansion_plans: [
      `Establish secondary smart production lines and regional hubs`,
      `Deploy retail channels in Tier-3 and Tier-4 urban localities`,
      `Boost international joint venture distributions`
    ],
    rd_initiatives: [
      'Integrate AI diagnostics and automated supply chains',
      'Pioneer clean tech materials and packaging light-weighting'
    ],
    ma_activities: [
      'Acquire niche digital startups for asset synergies',
      'Establish strategic partnerships with specialized logistics providers'
    ],
    growth_potential_score: Math.floor(Math.random() * 20 + 70)
  };
};

const generateMockSentiment = (symbol: string) => {
  const meta = getCompanyMeta(symbol);
  const score = parseFloat((Math.random() * 0.6 + 0.2).toFixed(2));
  return {
    symbol: meta.symbol,
    name: meta.name,
    overall_sentiment: score > 0.55 ? 'Very Bullish' : 'Bullish',
    overall_score: score,
    positive_pct: 65,
    negative_pct: 15,
    neutral_pct: 20,
    market_perception_index: Math.floor((score + 1) / 2 * 100),
    articles: [
      {
        headline: `${meta.name} secures mega order boosting revenue pipeline`,
        sentiment: 'positive',
        score: 0.85,
        source: 'Moneycontrol',
        published_at: new Date().toLocaleDateString('en-IN') + ' 10:30'
      },
      {
        headline: `${meta.name} Q3 net profits surpass analyst estimates by 5%`,
        sentiment: 'positive',
        score: 0.76,
        source: 'Economic Times',
        published_at: new Date().toLocaleDateString('en-IN') + ' 08:15'
      },
      {
        headline: `Sector headwinds could impact margins for heavyweights like ${meta.symbol}`,
        sentiment: 'negative',
        score: -0.42,
        source: 'Business Standard',
        published_at: new Date().toLocaleDateString('en-IN') + ' 07:00'
      }
    ]
  };
};

const generateMockFinancial = (symbol: string) => {
  return {
    symbol: symbol.toUpperCase(),
    scores: {
      valuation: Math.floor(Math.random() * 30 + 55),
      profitability: Math.floor(Math.random() * 30 + 60),
      growth: Math.floor(Math.random() * 30 + 58),
      financial_health: Math.floor(Math.random() * 30 + 70),
      cashflow: Math.floor(Math.random() * 30 + 62),
      earnings_quality: Math.floor(Math.random() * 30 + 68)
    }
  };
};

// Safe API Call Wrapper
const safeCall = async (axiosCall: () => Promise<any>, fallbackDataGenerator: () => any) => {
  try {
    return await axiosCall();
  } catch (err) {
    console.warn("FastAPI Backend offline. Seamlessly utilizing client-side mock data fallback.");
    return { data: fallbackDataGenerator() };
  }
};

export const api = {
  getCompanies: () => 
    safeCall(
      () => axios.get(`${BASE}/stocks/`),
      () => ({ companies: COMPANIES_METADATA.map(c => ({ symbol: c.symbol, name: c.name, sector: c.sector })) })
    ),
  getAllQuotes: () => 
    safeCall(
      () => axios.get(`${BASE}/stocks/quotes`),
      () => ({ quotes: COMPANIES_METADATA.map(c => generateMockQuote(c.symbol)) })
    ),
  getQuote: (symbol: string) => 
    safeCall(
      () => axios.get(`${BASE}/stocks/${symbol}/quote`),
      () => generateMockQuote(symbol)
    ),
  getHistory: (symbol: string, period = '1y') => 
    safeCall(
      () => axios.get(`${BASE}/stocks/${symbol}/history?period=${period}`),
      () => generateMockHistory(symbol, period)
    ),
  getFinancial: (symbol: string) => 
    safeCall(
      () => axios.get(`${BASE}/analysis/${symbol}/financial`),
      () => generateMockFinancial(symbol)
    ),
  getRisk: (symbol: string) => 
    safeCall(
      () => axios.get(`${BASE}/analysis/${symbol}/risk`),
      () => ({
        symbol: symbol.toUpperCase(),
        risk_score: Math.floor(Math.random() * 25 + 60),
        risk_factors: [
          { factor: 'Cost Pressures', impact: 'Medium', detail: 'Increased global energy costs could pose minor margin headwinds.' },
          { factor: 'Forex Fluctuations', impact: 'Low', detail: 'Export currency adjustments index minor operational exposure.' }
        ]
      })
    ),
  getSentiment: (symbol: string) => 
    safeCall(
      () => axios.get(`${BASE}/sentiment/${symbol}`),
      () => generateMockSentiment(symbol)
    ),
  getCorporate: (symbol: string) => 
    safeCall(
      () => axios.get(`${BASE}/sentiment/${symbol}/corporate`),
      () => generateMockCorporate(symbol)
    ),
  getRecommendation: (symbol: string) => 
    safeCall(
      () => axios.get(`${BASE}/recommendations/${symbol}`),
      () => generateMockRecommendation(symbol)
    ),
  getPortfolio: () => 
    safeCall(
      () => axios.get(`${BASE}/portfolio/overview`),
      () => {
        const allRecs = COMPANIES_METADATA.map(c => generateMockRecommendation(c.symbol));
        return {
          total_analyzed: allRecs.length,
          top_picks: allRecs.filter(r => r.recommendation.includes('Buy')).slice(0, 3),
          hold_picks: allRecs.filter(r => r.recommendation === 'Hold'),
          avoid: allRecs.filter(r => ['Reduce', 'Sell'].includes(r.recommendation)),
          portfolio_avg_score: 74,
          all_recommendations: allRecs
        };
      }
    ),
};

export function formatCurrency(n: number): string {
  if (!n) return '—';
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `₹${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e7)  return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5)  return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatNumber(n: number): string {
  if (!n) return '—';
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  return n.toLocaleString('en-IN');
}

export function getRecColor(rec: string): string {
  const map: Record<string, string> = {
    'Strong Buy': '#10b981',
    'Buy': '#22c55e',
    'Hold': '#f59e0b',
    'Reduce': '#f97316',
    'Sell': '#ef4444',
  };
  return map[rec] || '#94a3b8';
}

export function getRecBadgeClass(rec: string): string {
  const map: Record<string, string> = {
    'Strong Buy': 'badge-strong-buy',
    'Buy': 'badge-buy',
    'Hold': 'badge-hold',
    'Reduce': 'badge-reduce',
    'Sell': 'badge-sell',
  };
  return map[rec] || '';
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#10b981';
  if (score >= 60) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  if (score >= 35) return '#f97316';
  return '#ef4444';
}

