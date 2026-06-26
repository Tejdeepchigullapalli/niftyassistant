import { QuoteData, RecommendationData, FinancialData, SentimentData, TechnicalData, ForecastData } from '../../types/stock';

export interface ReportConfig {
  reportName: string;
  dateRange: string;
  benchmark: string;
  includePortfolioOverview: boolean;
  includePerformanceAnalysis: boolean;
  includeHoldingsTable: boolean;
  includeSectorAllocation: boolean;
  includeRiskAnalysis: boolean;
  includeWatchlistSummary: boolean;
  includeInterestedCompanies: boolean;
  includeAlertsSummary: boolean;
  includeMarketIntelligence: boolean;
  includeCompanyResearchAppendices: boolean;
  selectedAppendixSymbols: string[];
}

export interface HistoricalPricePoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface CompanyReportData {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  logoPath?: string;
  color?: string;

  quote?: QuoteData;
  recommendation?: RecommendationData;
  financial?: FinancialData;
  historicalPrices?: HistoricalPricePoint[];
  technicals?: TechnicalData;
  sentiment?: SentimentData;
  peers?: any[];
  forecast?: ForecastData;
  aiInsights?: any;
  risk?: any;

  quoteUpdatedAt?: string;
  fundamentalsUpdatedAt?: string;
}

export interface PortfolioReportData {
  config: ReportConfig;
  value: number;
  invested: number;
  pnl: number;
  pnlPct: number;
  todayPnL: number;
  todayPnLPct: number;
  healthScore: number;
  diversificationScore: number;
  riskScore: number;
  marketOutlook: {
    outlook: string;
    confidence: number;
  };
  holdings: Array<{
    symbol: string;
    name: string;
    quantity: number;
    averageBuyPrice: number;
    currentPrice: number;
    investedValue: number;
    currentValue: number;
    todayPnL: number;
    unrealisedPnL: number;
    returnPct: number;
    allocationPct: number;
    recommendation: string;
    positionStatus: string;
  }>;
  sectorAllocation: Record<string, number>;
  marketCapAllocation: Record<string, number>;
  recAllocation: Record<string, number>;
  
  // Performance Analysis
  performanceHistory: Array<{ date: string; portfolio: number; benchmark: number }>;
  alpha: number;
  beta: number;
  sharpeRatio: number;
  sortinoRatio: number;
  volatility: number;
  maxDrawdown: number;
  bestDay: number;
  worstDay: number;
  monthlyHeatmap: Record<string, number[]>; // Year -> 12 months array
  
  // Watchlist & interested
  watchlist: Array<{
    symbol: string;
    name: string;
    currentPrice: number;
    changePct: number;
    aiScore: number;
    recommendation: string;
    alertsCount: number;
  }>;
  interested: Array<{
    symbol: string;
    name: string;
    currentPrice: number;
    changePct: number;
    aiScore: number;
    recommendation: string;
  }>;
  alerts: Array<{
    symbol: string;
    type: string;
    condition: string;
    value: number;
    status: string;
  }>;
  marketIntel: {
    indices: Array<{ name: string; value: string; change: string; isUp: boolean }>;
    sentiment: { label: string; score: number };
    fearGreed: number;
    institutionalActivity: { fiiNet: number; diiNet: number };
    sectorPerformance: Array<{ sector: string; change: number }>;
    topGainers: Array<{ symbol: string; change: number; price: number }>;
    topLosers: Array<{ symbol: string; change: number; price: number }>;
    outlook: string;
    expectedRange: string;
  };
  
  appendices: Record<string, CompanyReportData>;
  generationTimestamp: string;
}
