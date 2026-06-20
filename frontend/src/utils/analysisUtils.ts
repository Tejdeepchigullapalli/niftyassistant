import { COMPANIES_METADATA } from './api';

export interface TechnicalLevels {
  pivotPoint: number;
  immediateSupport: number;
  strongSupport: number;
  immediateResistance: number;
  strongResistance: number;
  high52w: number;
  low52w: number;
}

export interface ForecastScenario {
  type: 'Bull' | 'Base' | 'Bear';
  targetPrice: number;
  expectedReturn: number;
  probability: number;
  assumptions: string[];
  trigger: string;
}

export interface PeerComparisonRow {
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

export interface NormalizedFinancials {
  totalDebt: number;
  cashEquivalents: number;
  netDebt: number;
  debtToEquity: number;
  currentRatio: number;
  interestCoverage: number;
  freeCashFlow: number;
  isDemo: boolean;
}

export function calculateSupportResistance(currentPrice: number, historyData?: any[]): TechnicalLevels {
  let high52w = currentPrice * 1.25;
  let low52w = currentPrice * 0.75;
  let atr = currentPrice * 0.06; // Estimated volatility metric

  if (historyData && historyData.length > 0) {
    const closes = historyData.map(d => d.close);
    const highestClose = Math.max(...closes);
    const lowestClose = Math.min(...closes);
    high52w = highestClose;
    low52w = lowestClose;
    atr = (highestClose - lowestClose) * 0.15;
    if (atr <= 0) atr = currentPrice * 0.05;
  }

  const pivotPoint = currentPrice;
  const immediateSupport = parseFloat((currentPrice - atr * 0.5).toFixed(2));
  const strongSupport = parseFloat((currentPrice - atr * 1.2).toFixed(2));
  const immediateResistance = parseFloat((currentPrice + atr * 0.5).toFixed(2));
  const strongResistance = parseFloat((currentPrice + atr * 1.2).toFixed(2));

  return {
    pivotPoint,
    immediateSupport,
    strongSupport,
    immediateResistance,
    strongResistance,
    high52w,
    low52w
  };
}

export function buildForecastScenarios(currentPrice: number, quote?: any): ForecastScenario[] {
  const revGrowth = quote?.revenue_growth !== undefined ? quote.revenue_growth : 0.12;
  const debtEquity = quote?.debt_equity !== undefined ? quote.debt_equity : 0.5;

  const bullTarget = currentPrice * (1 + revGrowth * 1.5 + 0.08);
  const baseTarget = currentPrice * (1 + revGrowth * 0.8 + 0.02);
  const bearTarget = currentPrice * Math.max(0.4, (1 - (debtEquity * 0.1 + 0.06)));

  return [
    {
      type: 'Bull',
      targetPrice: parseFloat(bullTarget.toFixed(2)),
      expectedReturn: parseFloat((((bullTarget - currentPrice) / currentPrice) * 100).toFixed(1)),
      probability: 25,
      assumptions: ['Aggressive adoption of new initiatives', 'Strong margins from lower operating leverage', 'Favorable credit environment'],
      trigger: 'Strong earnings beats and positive regulatory announcements'
    },
    {
      type: 'Base',
      targetPrice: parseFloat(baseTarget.toFixed(2)),
      expectedReturn: parseFloat((((baseTarget - currentPrice) / currentPrice) * 100).toFixed(1)),
      probability: 55,
      assumptions: ['Stable demand in core business units', 'Consistent capital expenditure roll-outs', 'Steady interest rates'],
      trigger: 'Performance metrics matching guidance'
    },
    {
      type: 'Bear',
      targetPrice: parseFloat(bearTarget.toFixed(2)),
      expectedReturn: parseFloat((((bearTarget - currentPrice) / currentPrice) * 100).toFixed(1)),
      probability: 20,
      assumptions: ['Margin pressures from raw materials', 'Increase in finance costs', 'Slowdown in primary markets'],
      trigger: 'Earnings misses or sector-wide downgrades'
    }
  ];
}

export function getSectorPeers(
  symbol: string,
  sector: string,
  quotes: any[] = []
): PeerComparisonRow[] {
  // Find all metadata peers in the same sector
  const peersMeta = COMPANIES_METADATA.filter(
    c => c.sector === sector && c.symbol.toUpperCase() !== symbol.toUpperCase()
  ).slice(0, 4);

  const list: PeerComparisonRow[] = [];

  // Add the active stock itself first
  const activeMeta = COMPANIES_METADATA.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
  if (activeMeta) {
    const activeQuote = quotes.find(q => q.symbol.toUpperCase() === symbol.toUpperCase());
    list.push({
      symbol: activeMeta.symbol,
      name: activeMeta.name.split(' ')[0],
      price: activeQuote?.current_price || activeMeta.basePrice,
      marketCap: activeQuote?.market_cap || activeMeta.basePrice * 100000000,
      pe: activeQuote?.pe_ratio || 24.5,
      pb: activeQuote?.pb_ratio || 3.2,
      roe: activeQuote?.roe !== undefined ? parseFloat((activeQuote.roe * 100).toFixed(1)) : 14.8,
      revenueGrowth: activeQuote?.revenue_growth !== undefined ? parseFloat((activeQuote.revenue_growth * 100).toFixed(1)) : 12.0,
      return1Y: activeQuote?.change_pct !== undefined ? parseFloat((activeQuote.change_pct * 12).toFixed(1)) : 15.2, // Simulated annual return
      recommendation: activeQuote?.change_pct >= 0 ? 'Buy' : 'Hold',
      aiScore: 78
    });
  }

  // Add the metadata peers
  peersMeta.forEach(peer => {
    const peerQuote = quotes.find(q => q.symbol.toUpperCase() === peer.symbol.toUpperCase());
    list.push({
      symbol: peer.symbol,
      name: peer.name.split(' ')[0],
      price: peerQuote?.current_price || peer.basePrice,
      marketCap: peerQuote?.market_cap || peer.basePrice * 100000000,
      pe: peerQuote?.pe_ratio || 21.0,
      pb: peerQuote?.pb_ratio || 2.8,
      roe: peerQuote?.roe !== undefined ? parseFloat((peerQuote.roe * 100).toFixed(1)) : 12.5,
      revenueGrowth: peerQuote?.revenue_growth !== undefined ? parseFloat((peerQuote.revenue_growth * 100).toFixed(1)) : 10.5,
      return1Y: peerQuote?.change_pct !== undefined ? parseFloat((peerQuote.change_pct * 12).toFixed(1)) : 11.2,
      recommendation: peerQuote?.change_pct >= 0 ? 'Buy' : 'Hold',
      aiScore: 72
    });
  });

  return list;
}

export function normaliseFinancials(financialData: any, quote: any): NormalizedFinancials {
  const isDemo = !financialData || Object.keys(financialData).length === 0;

  const totalDebt = quote?.market_cap 
    ? parseFloat((quote.market_cap * (quote.debt_equity || 0.4) * 0.15 / 10000000).toFixed(1)) 
    : 4500.0; // In Cr
  const cashEquivalents = quote?.market_cap 
    ? parseFloat((quote.market_cap * 0.05 / 10000000).toFixed(1)) 
    : 1800.0; // In Cr
  const netDebt = parseFloat((totalDebt - cashEquivalents).toFixed(1));
  const debtToEquity = quote?.debt_equity !== undefined ? quote.debt_equity : 0.45;
  const currentRatio = parseFloat((1.5 + (quote?.revenue_growth || 0.12) * 2).toFixed(2));
  const interestCoverage = parseFloat((4.5 + (quote?.pe_ratio || 22) * 0.2).toFixed(2));
  const freeCashFlow = quote?.free_cashflow 
    ? parseFloat((quote.free_cashflow / 10000000).toFixed(1)) 
    : parseFloat((cashEquivalents * 0.4).toFixed(1));

  return {
    totalDebt,
    cashEquivalents,
    netDebt,
    debtToEquity,
    currentRatio,
    interestCoverage,
    freeCashFlow,
    isDemo
  };
}
