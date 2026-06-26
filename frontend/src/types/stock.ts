export interface CompanyMeta {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  color: string;
  basePrice: number;
}

export interface QuoteData {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  previous_close: number;
  change: number;
  change_pct: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  market_cap: number;
  pe_ratio: number;
  pb_ratio: number;
  dividend_yield: number;
  "52w_high": number;
  "52w_low": number;
  avg_volume: number;
  eps: number;
  roe: number;
  debt_equity: number;
  revenue_growth: number;
  earnings_growth: number;
  free_cashflow: number;
  timestamp: string;
  updated_at?: string;
}

export interface ScoreComponents {
  financial_score: number;
  growth_score: number;
  sentiment_score: number;
  technical_score?: number;
  risk_score: number;
  valuation_score?: number;
}

export interface RecommendationData {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  target_price: number;
  upside_pct: number;
  recommendation: string;
  ai_investment_score: number;
  score_components: ScoreComponents;
  supporting_factors: string[];
  risk_flags: string[];
  confidence?: number;
}

export interface SentimentArticle {
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  source: string;
  published_at: string;
  url?: string;
  category?: 'Earnings' | 'Expansion' | 'Regulation' | 'Sector' | 'Governance' | 'Corporate Actions';
  impact?: 'Low' | 'Medium' | 'High';
}

export interface SentimentData {
  symbol: string;
  name: string;
  overall_sentiment: string;
  overall_score: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
  market_perception_index: number;
  articles: SentimentArticle[];
}

export interface ExpansionPlan {
  expansion_plans?: string[];
  strategic_goals?: string[];
  rd_initiatives?: string[];
  ma_activities?: string[];
  growth_potential_score?: number;
}

export interface RiskData {
  risk_score: number;
  risk_factors?: string[];
}

export interface PeerRow {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  pe: number;
  pb: number;
  roe: number;
  revenueGrowth: number;
  return1Y: number;
  recommendation: string;
  aiScore: number;
}

export interface FinancialData {
  symbol: string;
  updated_at?: string;
  revenue?: number[];
  net_income?: number[];
  balance_sheet?: {
    total_assets?: number;
    total_liabilities?: number;
    shareholder_equity?: number;
  };
  cash_flow?: {
    operating_cf?: number;
    investing_cf?: number;
    financing_cf?: number;
  };
  revenue_history?: Array<{ year: string; value: number }>;
  ebitda_history?: Array<{ year: string; value: number }>;
  net_income_history?: Array<{ year: string; value: number }>;
  debt_to_equity?: number;
  interest_coverage?: number;
  roe?: number;
}

export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  purchaseDate?: string;
  investedAmount?: number;
}

export interface TechnicalData {
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
}

export interface ForecastData {
  bull_case: number;
  base_case: number;
  bear_case: number;
  upside_pct: number;
  downside_pct: number;
  time_horizon: string;
  confidence_score: number;
}
