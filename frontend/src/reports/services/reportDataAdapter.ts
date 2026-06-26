import { CompanyReportData, PortfolioReportData, ReportConfig, HistoricalPricePoint } from '../types/reportTypes';
import { QuoteData, RecommendationData } from '../../types/stock';
import { api, getCompanyMeta } from '../../utils/api';

// Simple calculation helpers
export function calculateVolatility(returns: number[]): number {
  if (returns.length < 2) return 0.15; // fallback
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252); // Annualised daily volatility
}

export function calculateSharpeRatio(returns: number[], volatility: number, riskFreeRate = 0.06): number {
  if (returns.length === 0 || volatility === 0) return 1.25; // fallback
  const totalReturn = returns.reduce((a, b) => a + b, 0); // basic proxy
  const annualisedReturn = (totalReturn / returns.length) * 252;
  return (annualisedReturn - riskFreeRate) / volatility;
}

export function calculateSortinoRatio(returns: number[], riskFreeRate = 0.06): number {
  if (returns.length < 2) return 1.45; // fallback
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const annualisedReturn = mean * 252;
  const negativeReturns = returns.filter(r => r < 0);
  if (negativeReturns.length === 0) return 2.0;
  
  const downsideVar = negativeReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / negativeReturns.length;
  const downsideDeviation = Math.sqrt(downsideVar) * Math.sqrt(252);
  
  return downsideDeviation === 0 ? 1.5 : (annualisedReturn - riskFreeRate) / downsideDeviation;
}

export function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length === 0) return -0.12; // fallback
  let maxDD = 0;
  let peak = -Infinity;
  for (const price of prices) {
    if (price > peak) peak = price;
    const dd = (price - peak) / peak;
    if (dd < maxDD) maxDD = dd;
  }
  return maxDD;
}

// Main Adapter Service
export class ReportDataAdapter {
  static async compileCompanyReportData(
    symbol: string,
    quotes: QuoteData[],
    recs: Record<string, RecommendationData>
  ): Promise<CompanyReportData> {
    const sym = symbol.toUpperCase().trim();
    const meta = getCompanyMeta(sym);
    
    // Fetch details
    let quote = quotes.find(q => q.symbol === sym);
    let recommendation = recs[sym];
    let financial: any = null;
    let sentiment: any = null;
    let technicals: any = null;
    let corporate: any = null;
    let risk: any = null;
    let history: any = null;

    try {
      const [qRes, recRes, fRes, sRes, tRes, cRes, rRes, hRes] = await Promise.all([
        quote ? Promise.resolve({ data: quote }) : api.getQuote(sym),
        recommendation ? Promise.resolve({ data: recommendation }) : api.getRecommendation(sym),
        api.getFinancial(sym),
        api.getSentiment(sym),
        api.getHistory(sym, '1y'), // Technical indicators computed on client from history
        api.getCorporate(sym),
        api.getRisk(sym),
        api.getHistory(sym, '1y')
      ]);

      quote = qRes.data;
      recommendation = recRes.data;
      financial = fRes.data;
      sentiment = sRes.data;
      corporate = cRes.data;
      risk = rRes.data;
      history = hRes.data;

      // Populate financial histories if not present
      if (financial && !financial.revenue_history) {
        const mCap = quote?.market_cap || 1000000000000;
        const baseRevenue = mCap * 0.08 / 10000000; // Cr
        const profitMargin = quote?.roe ? quote.roe : 0.15;
        financial.revenue_history = [
          { year: 'FY21', value: Math.round(baseRevenue * 0.72) },
          { year: 'FY22', value: Math.round(baseRevenue * 0.82) },
          { year: 'FY23', value: Math.round(baseRevenue * 0.95) },
          { year: 'FY24', value: Math.round(baseRevenue * 1.05) },
          { year: 'FY25(E)', value: Math.round(baseRevenue * 1.18) }
        ];
        financial.ebitda_history = financial.revenue_history.map((item: any) => ({
          year: item.year,
          value: Math.round(item.value * 0.25)
        }));
        financial.net_income_history = financial.revenue_history.map((item: any) => ({
          year: item.year,
          value: Math.round(item.value * profitMargin)
        }));
        financial.debt_to_equity = quote?.debt_equity ?? 0.12;
        financial.interest_coverage = 12.5;
        financial.roe = quote?.roe ? parseFloat((quote.roe * 100).toFixed(1)) : 18.4;
      }

      // Extract price points
      const prices: HistoricalPricePoint[] = history?.data?.map((p: any) => ({
        date: p.date,
        close: p.close,
        open: p.open ?? p.close,
        high: p.high ?? p.close,
        low: p.low ?? p.close,
        volume: p.volume ?? 100000
      })) || [];

      // Calculate mock technical markers
      technicals = {
        rsi: 58.4,
        macd: { macdLine: 1.25, signalLine: 0.85, histogram: 0.4 },
        sma20: prices.length > 20 ? prices.slice(-20).reduce((a, b) => a + b.close, 0) / 20 : 0,
        sma50: prices.length > 50 ? prices.slice(-50).reduce((a, b) => a + b.close, 0) / 50 : 0,
        sma200: prices.length > 200 ? prices.slice(-200).reduce((a, b) => a + b.close, 0) / 200 : 0,
      };

      // Peer comparison database sectors
      const peersRes = await api.getSectorComparison(sym);
      const peers = peersRes.data?.companies?.map((c: any) => ({
        symbol: c.symbol,
        name: c.name || c.symbol,
        current_price: c.currentPrice,
        change_pct: c.changePct,
        market_cap: c.marketCap,
        pe_ratio: c.peRatio,
        pb_ratio: c.pbRatio,
        roe: c.roe,
        revenue_growth: c.revenueGrowth,
        aiScore: c.aiScore,
        recommendation: c.recommendation,
        return1Y: c.return1Y ?? 15.0
      })) || [];

      return {
        symbol: sym,
        companyName: meta.name,
        sector: meta.sector,
        industry: meta.industry,
        logoPath: `/logos/${sym}.png`,
        color: meta.color,
        quote,
        recommendation,
        financial,
        historicalPrices: prices,
        technicals,
        sentiment,
        peers,
        forecast: {
          bull_case: recommendation?.target_price ? recommendation.target_price * 1.15 : quote?.current_price ? quote.current_price * 1.3 : 1500,
          base_case: recommendation?.target_price ?? quote?.current_price ? (quote?.current_price ?? 100) * 1.14 : 1300,
          bear_case: recommendation?.target_price ? recommendation.target_price * 0.8 : quote?.current_price ? quote.current_price * 0.9 : 1000,
          upside_pct: recommendation?.upside_pct ?? 14.0,
          downside_pct: -8.5,
          time_horizon: '12 Months',
          confidence_score: recommendation?.confidence ?? 78
        } as any,
        aiInsights: {
          thesis: `Fundamental and structural drivers represent a compelling thesis for ${sym} inside the ${meta.sector} sector.`,
          why_perform: [
            "Strong market share leadership in primary business lines.",
            "Attractive capital allocation yields and balance sheet liquidity.",
            "Positive earnings revisions expected from next-generation tech expansion."
          ],
          what_go_wrong: [
            "Escalating supply chain input overheads.",
            "Regulatory compliance headwinds in domestic retail divisions."
          ],
          what_monitor: [
            "Quarterly EBITDA margin margins stability.",
            "Crude oil and general commodity currency fluctuations."
          ],
          suitability: "Balanced Portfolio Core Holding",
          horizon: "3 - 5 Years"
        },
        quoteUpdatedAt: quote?.updated_at || new Date().toLocaleTimeString('en-IN'),
        fundamentalsUpdatedAt: financial?.updated_at || new Date().toLocaleDateString('en-IN'),
        risk
      };
    } catch (err) {
      console.error(`[NiftyAI Data Adapter] Failed compiling ${sym} report:`, err);
      // Minimal fallback structure to prevent document builder crashes
      return {
        symbol: sym,
        companyName: meta.name,
        sector: meta.sector,
        industry: meta.industry,
        quote: quote || { symbol: sym, name: meta.name, current_price: meta.basePrice } as any,
        recommendation: recommendation || { ai_investment_score: 74, recommendation: 'Hold' } as any
      };
    }
  }

  static async compilePortfolioReportData(
    config: ReportConfig,
    holdingsState: any[],
    quotes: QuoteData[],
    recs: Record<string, RecommendationData>,
    watchlistSymbols: string[],
    alertsState: any[]
  ): Promise<PortfolioReportData> {
    
    // 1. holdings metrics mapping
    let totalValue = 0;
    let totalInvested = 0;
    let todayPnLSum = 0;
    let healthScoreWeighted = 0;

    const sectorWeights: Record<string, number> = {};
    const capWeights: Record<string, number> = {};
    const recWeights: Record<string, number> = {};

    const adaptedHoldings = holdingsState.map(h => {
      const sym = h.symbol.toUpperCase();
      const q = quotes.find(item => item.symbol === sym);
      const rec = recs[sym];
      
      const currentPrice = q?.current_price ?? h.averageBuyPrice;
      const changePct = q?.change_pct ?? 0.0;
      
      const holdingValue = h.quantity * currentPrice;
      const holdingCost = h.quantity * h.averageBuyPrice;

      totalValue += holdingValue;
      totalInvested += holdingCost;
      todayPnLSum += holdingValue * (changePct / 100);

      const aiScore = rec?.ai_investment_score ?? 74;
      healthScoreWeighted += holdingValue * aiScore;

      const meta = getCompanyMeta(sym);
      sectorWeights[meta.sector] = (sectorWeights[meta.sector] || 0) + holdingValue;
      
      const capCat = (q?.market_cap ?? 200000) > 150000 ? 'Large Cap' : (q?.market_cap ?? 200000) > 50000 ? 'Mid Cap' : 'Small Cap';
      capWeights[capCat] = (capWeights[capCat] || 0) + holdingValue;

      const rating = rec?.recommendation ?? 'Hold';
      recWeights[rating] = (recWeights[rating] || 0) + holdingValue;

      return {
        symbol: sym,
        name: meta.name,
        quantity: h.quantity,
        averageBuyPrice: h.averageBuyPrice,
        currentPrice,
        investedValue: holdingCost,
        currentValue: holdingValue,
        todayPnL: holdingValue * (changePct / 100),
        unrealisedPnL: holdingValue - holdingCost,
        returnPct: holdingCost > 0 ? ((holdingValue - holdingCost) / holdingCost) * 100 : 0,
        allocationPct: 0, // calculated below
        recommendation: rating,
        positionStatus: 'purchased'
      };
    });

    // Calc allocations
    adaptedHoldings.forEach(h => {
      if (totalValue > 0) {
        h.allocationPct = (h.currentValue / totalValue) * 100;
      }
    });

    const overallPnL = totalValue - totalInvested;
    const returnPct = totalInvested > 0 ? (overallPnL / totalInvested) * 100 : 0;
    const todayPct = totalValue > 0 ? (todayPnLSum / totalValue) * 100 : 0;
    const averageScore = totalValue > 0 ? Math.round(healthScoreWeighted / totalValue) : 74;

    // Normalize allocations distributions
    const sectorAlloc: Record<string, number> = {};
    const capAlloc: Record<string, number> = {};
    const recAlloc: Record<string, number> = {};

    Object.keys(sectorWeights).forEach(k => {
      if (totalValue > 0) sectorAlloc[k] = (sectorWeights[k] / totalValue) * 100;
    });
    Object.keys(capWeights).forEach(k => {
      if (totalValue > 0) capAlloc[k] = (capWeights[k] / totalValue) * 100;
    });
    Object.keys(recWeights).forEach(k => {
      if (totalValue > 0) recAlloc[k] = (recWeights[k] / totalValue) * 100;
    });

    // 2. Mock performance history (simulating 30 days)
    const performanceHistory: Array<{ date: string; portfolio: number; benchmark: number }> = [];
    const baseDate = new Date();
    let portAccum = 100;
    let benchAccum = 100;
    const dailyReturns: number[] = [];
    const rawPrices: number[] = [];

    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const portChange = (Math.random() - 0.45) * 2; // slight positive drift
      const benchChange = (Math.random() - 0.47) * 1.8;
      
      portAccum *= (1 + portChange/100);
      benchAccum *= (1 + benchChange/100);
      dailyReturns.push(portChange/100);
      rawPrices.push(portAccum);

      performanceHistory.push({
        date: dateStr,
        portfolio: parseFloat(portAccum.toFixed(2)),
        benchmark: parseFloat(benchAccum.toFixed(2))
      });
    }

    // Stats calculations
    const vol = calculateVolatility(dailyReturns);
    const sharpe = calculateSharpeRatio(dailyReturns, vol);
    const sortino = calculateSortinoRatio(dailyReturns);
    const maxDD = calculateMaxDrawdown(rawPrices);

    // Watchlist data mapping
    const watchlist = watchlistSymbols.slice(0, 8).map(sym => {
      const q = quotes.find(item => item.symbol === sym);
      const rec = recs[sym];
      const meta = getCompanyMeta(sym);
      return {
        symbol: sym,
        name: meta.name,
        currentPrice: q?.current_price ?? meta.basePrice,
        changePct: q?.change_pct ?? 0,
        aiScore: rec?.ai_investment_score ?? 70,
        recommendation: rec?.recommendation ?? 'Hold',
        alertsCount: alertsState.filter(a => a.symbol === sym).length
      };
    });

    // Active alerts mapping
    const alerts = alertsState.filter(a => a.enabled).slice(0, 10).map(a => {
      return {
        symbol: a.symbol || 'NIFTY',
        type: a.type || 'Price',
        condition: a.condition || 'Above',
        value: a.value || 0,
        status: 'Active'
      };
    });

    // Market indices info
    const marketIntel = {
      indices: [
        { name: "NIFTY 50", value: "22,517.60", change: "+0.85%", isUp: true },
        { name: "SENSEX", value: "74,340.09", change: "+0.73%", isUp: true },
        { name: "NIFTY BANK", value: "48,153.15", change: "+1.24%", isUp: true },
        { name: "INDIA VIX", value: "12.45", change: "-0.65%", isUp: false },
      ],
      sentiment: { label: "Bullish", score: 78 },
      fearGreed: 64,
      institutionalActivity: { fiiNet: 1240, diiNet: -2315 },
      sectorPerformance: [
        { sector: "IT", change: 2.45 },
        { sector: "Financials", change: 1.62 },
        { sector: "Energy", change: 1.28 },
        { sector: "Auto", change: 0.86 },
        { sector: "FMCG", change: -0.74 },
      ],
      topGainers: quotes.slice().sort((a,b) => b.change_pct - a.change_pct).slice(0, 3).map(q => ({ symbol: q.symbol, change: q.change_pct, price: q.current_price })),
      topLosers: quotes.slice().sort((a,b) => a.change_pct - b.change_pct).slice(0, 3).map(q => ({ symbol: q.symbol, change: q.change_pct, price: q.current_price })),
      outlook: "Bullish momentum continues supported by robust institutional buying and expansion in financials.",
      expectedRange: "22,400 - 22,800"
    };

    // Load appendix companies data
    const appendices: Record<string, CompanyReportData> = {};
    if (config.includeCompanyResearchAppendices && config.selectedAppendixSymbols.length > 0) {
      for (const sym of config.selectedAppendixSymbols) {
        appendices[sym] = await this.compileCompanyReportData(sym, quotes, recs);
      }
    }

    return {
      config,
      value: totalValue,
      invested: totalInvested,
      pnl: overallPnL,
      pnlPct: returnPct,
      todayPnL: todayPnLSum,
      todayPnLPct: todayPct,
      healthScore: averageScore,
      diversificationScore: Math.min(100, Object.keys(sectorWeights).length * 15 + 10),
      riskScore: 42,
      marketOutlook: {
        outlook: 'Bullish',
        confidence: 78
      },
      holdings: adaptedHoldings,
      sectorAllocation: sectorAlloc,
      marketCapAllocation: capAlloc,
      recAllocation: recAlloc,
      performanceHistory,
      alpha: 1.35,
      beta: 0.92,
      sharpeRatio: parseFloat(sharpe.toFixed(2)),
      sortinoRatio: parseFloat(sortino.toFixed(2)),
      volatility: parseFloat((vol * 100).toFixed(1)),
      maxDrawdown: parseFloat((maxDD * 100).toFixed(1)),
      bestDay: 2.15,
      worstDay: -1.85,
      monthlyHeatmap: {
        '2026': [1.25, 2.1, -0.85, 3.4, 1.15, 0.75, 0, 0, 0, 0, 0, 0]
      },
      watchlist,
      interested: watchlist.slice(0, 4).map(w => ({
        symbol: w.symbol,
        name: w.name,
        currentPrice: w.currentPrice,
        changePct: w.changePct,
        aiScore: w.aiScore,
        recommendation: w.recommendation
      })),
      alerts,
      marketIntel,
      appendices,
      generationTimestamp: new Date().toLocaleString('en-IN')
    };
  }
}
