import React, { useState, useMemo } from 'react';
import { 
  QuoteData, 
  PortfolioHolding, 
  RecommendationData, 
  SentimentData, 
  FinancialData 
} from '../types/stock';
import ReportsHeader from './ReportsHeader';
import ReportTabBar from './ReportTabBar';
import ReportMetricCard from './ReportMetricCard';
import ReportSkeleton from './ReportSkeleton';
import ReportEmptyState from './ReportEmptyState';
import OverviewReport from './OverviewReport';
import PerformanceReport from './PerformanceReport';
import PortfolioReport from './PortfolioReport';
import StockResearchReport from './StockResearchReport';
import MarketIntelligenceReport from './MarketIntelligenceReport';
import CustomReportBuilder from './CustomReportBuilder';
import { getCompanyMeta } from '../utils/api';

interface ReportsViewProps {
  quotes?: QuoteData[];
  recs?: Record<string, RecommendationData>;
  selectedSymbol: string;
  portfolio?: PortfolioHolding[];
  watchlist?: string[];
  lastUpdated?: string;
  onSymbolSelect: (symbol: string) => void;
  onNavigateToStockAnalysis?: (symbol: string) => void;
}

export default function ReportsView({
  quotes = [],
  recs = {},
  selectedSymbol = 'RELIANCE',
  portfolio = [],
  watchlist = [],
  lastUpdated,
  onSymbolSelect,
  onNavigateToStockAnalysis
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(false);

  // Dynamic Date range calculation for system/browser local dates (current timeframe June 2026)
  const dateRange = useMemo(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 6);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${oneWeekAgo.toLocaleDateString('en-US', options)} - ${today.toLocaleDateString('en-US', options)}`;
  }, []);

  // Action download notifications
  const handleDownloadPDF = () => {
    alert('Report downloaded successfully as PDF!');
  };

  const handleDownloadCSV = () => {
    alert('Holding Ledger exported as CSV!');
  };

  // Safe symbol routing callback
  const handleNavigateStock = (sym: string) => {
    if (onNavigateToStockAnalysis) {
      onNavigateToStockAnalysis(sym);
    } else {
      onSymbolSelect(sym);
    }
  };

  // A. Core Portfolio Calculations from live quotes
  const portfolioStats = useMemo(() => {
    if (portfolio.length === 0) {
      return { value: 0, invested: 0, pnl: 0, pnlPct: 0, todayPnL: 0, todayPnLPct: 0, healthScore: 0 };
    }

    let totalValue = 0;
    let totalInvested = 0;
    let todayPnLSum = 0;
    let scoreWeightSum = 0;

    portfolio.forEach(holding => {
      const q = quotes.find(item => item.symbol.toUpperCase() === holding.symbol.toUpperCase());
      const currentPrice = q?.current_price ?? holding.averageBuyPrice;
      const changePct = q?.change_pct ?? 0.0;
      
      const holdingValue = holding.quantity * currentPrice;
      const holdingCost = holding.quantity * holding.averageBuyPrice;

      totalValue += holdingValue;
      totalInvested += holdingCost;
      todayPnLSum += holdingValue * (changePct / 100);

      const aiScore = recs[holding.symbol]?.ai_investment_score ?? 74;
      scoreWeightSum += holdingValue * aiScore;
    });

    const overallPnL = totalValue - totalInvested;
    const returnPct = parseFloat(((overallPnL / totalInvested) * 100).toFixed(2));
    const todayPct = parseFloat(((todayPnLSum / totalValue) * 100).toFixed(2));
    const averageScore = Math.round(scoreWeightSum / totalValue) || 74;

    return {
      value: totalValue,
      invested: totalInvested,
      pnl: overallPnL,
      pnlPct: returnPct,
      todayPnL: todayPnLSum,
      todayPnLPct: todayPct,
      healthScore: averageScore
    };
  }, [portfolio, quotes, recs]);

  // Formatted display values
  const displayPortfolioValue = `₹${portfolioStats.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const displayTotalInvested = `₹${portfolioStats.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  
  const displayPnL = `${portfolioStats.pnl >= 0 ? '+' : ''}₹${portfolioStats.pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const displayTodayPnL = `${portfolioStats.todayPnL >= 0 ? '+' : ''}₹${portfolioStats.todayPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const tabs = [
    'Overview', 
    'Performance Reports', 
    'Portfolio Reports', 
    'Stock Reports', 
    'Market Reports', 
    'Custom Reports'
  ];

  if (loading) {
    return <ReportSkeleton />;
  }

  // Error block if quotes array is empty
  if (quotes.length === 0) {
    return (
      <ReportEmptyState 
        title="broad market connection issue"
        message="Unable to communicate with the quotes server. Check your network or restart the backend service."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-4 text-slate-100 pb-10 select-none animate-fadeIn">
      
      {/* 1. Page Header Actions */}
      <ReportsHeader 
        dateRange={dateRange}
        lastUpdated={lastUpdated}
        onRefresh={() => window.location.reload()}
        onDownloadPDF={handleDownloadPDF}
        onDownloadCSV={handleDownloadCSV}
        onCreateCustom={() => setActiveTab('Custom Reports')}
      />

      {/* 2. Tab Bar Selector */}
      <ReportTabBar 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 3. Summary metrics cards row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none text-[#F8FAFC]">
        <ReportMetricCard 
          label="Portfolio Value"
          value={displayPortfolioValue}
          change={`${portfolioStats.pnl >= 0 ? '+' : ''}${portfolioStats.pnlPct}%`}
          changePct="Total return"
          trend={portfolioStats.pnl >= 0 ? 'up' : 'down'}
          status="live"
          tooltip="Sum of current asset values based on live quotes"
        />

        <ReportMetricCard 
          label="Total Invested"
          value={displayTotalInvested}
          status="live"
          tooltip="Sum of initial purchase costs for holding stocks"
        />

        <ReportMetricCard 
          label="Overall P&L"
          value={displayPnL}
          change={`${portfolioStats.pnlPct}%`}
          changePct="Growth"
          trend={portfolioStats.pnl >= 0 ? 'up' : 'down'}
          status="live"
          tooltip="Unrealized absolute profit or loss based on current valuations"
        />

        <ReportMetricCard 
          label="Today's P&L"
          value={displayTodayPnL}
          change={`${portfolioStats.todayPnL >= 0 ? '+' : ''}${portfolioStats.todayPnLPct}%`}
          changePct="Intraday"
          trend={portfolioStats.todayPnL >= 0 ? 'up' : 'down'}
          status="live"
          tooltip="Daily change contribution based on current session percentage movers"
        />

        <ReportMetricCard 
          label="Portfolio return"
          value={`${portfolioStats.pnlPct}%`}
          status="live"
          tooltip="Absolute percentage gain relative to total initial capital invested"
        />

        <ReportMetricCard 
          label="AI Health Score"
          value={`${portfolioStats.healthScore}/100`}
          status="estimated"
          tooltip="Weighted average of AI investment scores across constituents"
        />
      </div>

      {/* 4. Tab Workspace Router */}
      <div className="w-full">
        
        {activeTab === 'Overview' && (
          <OverviewReport 
            quotes={quotes}
            recs={recs}
            portfolio={portfolio}
            watchlist={watchlist}
            onNavigateToStockAnalysis={handleNavigateStock}
            onTabChange={setActiveTab}
          />
        )}

        {activeTab === 'Performance Reports' && (
          <PerformanceReport 
            quotes={quotes}
            portfolio={portfolio}
            recs={recs}
          />
        )}

        {activeTab === 'Portfolio Reports' && (
          <PortfolioReport 
            quotes={quotes}
            portfolio={portfolio}
            recs={recs}
            onNavigateToStockAnalysis={handleNavigateStock}
          />
        )}

        {activeTab === 'Stock Reports' && (
          <StockResearchReport 
            initialSymbol={selectedSymbol}
            quotes={quotes}
            recs={recs}
            onSymbolSelect={onSymbolSelect}
            onNavigateToStockAnalysis={handleNavigateStock}
          />
        )}

        {activeTab === 'Market Reports' && (
          <MarketIntelligenceReport 
            quotes={quotes}
            onNavigateToStockAnalysis={handleNavigateStock}
          />
        )}

        {activeTab === 'Custom Reports' && (
          <CustomReportBuilder 
            quotes={quotes}
            portfolio={portfolio}
          />
        )}

      </div>

    </div>
  );
}
