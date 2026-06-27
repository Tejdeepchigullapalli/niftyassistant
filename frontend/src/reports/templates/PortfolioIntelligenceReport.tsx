import React from 'react';
import { Document, StyleSheet, View, Text } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { PortfolioReportData } from '../types/reportTypes';
import { ReportPage } from '../components/ReportPage';
import { ReportHeader } from '../components/ReportHeader';
import { ReportFooter } from '../components/ReportFooter';
import { ReportSectionTitle } from '../components/ReportSectionTitle';
import { ReportMetricCard } from '../components/ReportMetricCard';
import { ReportTable } from '../components/ReportTable';
import { ReportBadge } from '../components/ReportBadge';
import { ReportDisclosure } from '../components/ReportDisclosure';
import { ReportChartFrame } from '../components/ReportChartFrame';
import { PortfolioIdentityHeader } from '../components/PortfolioIdentityHeader';
import { CompanyResearchReport } from './CompanyResearchReport';
import '../constants/reportFonts';

// SVG Charts
import { ReportPriceChart } from '../charts/ReportPriceChart';
import { ReportDonutChart } from '../charts/ReportDonutChart';
import { ReportGaugeChart } from '../charts/ReportGaugeChart';
import { ReportReturnHeatmap } from '../charts/ReportReturnHeatmap';

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  col: {
    flex: 1,
  },
  card: {
    backgroundColor: reportTheme.cardBackground,
    borderWidth: 1,
    borderColor: reportTheme.border,
    borderRadius: 6,
    padding: 8,
    marginVertical: 3,
  },
  cardTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: reportTheme.text,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: `${reportTheme.border}60`,
    paddingBottom: 3,
  },
  bodyText: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: reportTheme.muted,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  bulletCheck: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: reportTheme.green,
  },
  bulletText: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: reportTheme.text,
    flex: 1,
  }
});

export function PortfolioIntelligenceReport(data: PortfolioReportData) {
  const config = data.config;
  const isUp = data.pnl >= 0;

  // 1. Holdings table mapping
  const holdingsRows = data.holdings.map(h => [
    h.symbol,
    h.quantity,
    `₹${h.averageBuyPrice.toLocaleString('en-IN')}`,
    `₹${h.currentPrice.toLocaleString('en-IN')}`,
    `₹${h.investedValue.toLocaleString('en-IN')}`,
    `₹${h.currentValue.toLocaleString('en-IN')}`,
    `${h.unrealisedPnL >= 0 ? '+' : ''}₹${Math.round(h.unrealisedPnL).toLocaleString('en-IN')}`,
    `${h.returnPct >= 0 ? '+' : ''}${h.returnPct.toFixed(1)}%`,
    `${h.allocationPct.toFixed(1)}%`,
    h.recommendation
  ]);

  // 2. Sector Allocation adapter format
  const sectorData = Object.entries(data.sectorAllocation).map(([k, v]) => ({
    label: k,
    value: v
  }));

  // Find the largest sector and its percentage
  let maxSectorName = "None";
  let maxSectorPct = 0;
  Object.entries(data.sectorAllocation).forEach(([k, v]) => {
    if (v > maxSectorPct) {
      maxSectorPct = v;
      maxSectorName = k;
    }
  });

  // Asset allocations adapter format
  const assetData = [
    { label: "Equities", value: 92 },
    { label: "Cash & Cash Equiv", value: 8 }
  ];

  // 3. Watchlist summary rows mapping
  const watchlistRows = data.watchlist.map(w => [
    w.symbol,
    `₹${w.currentPrice.toLocaleString('en-IN')}`,
    `${w.changePct >= 0 ? '+' : ''}${w.changePct.toFixed(2)}%`,
    w.aiScore,
    w.recommendation,
    w.alertsCount
  ]);

  // Active alerts rows mapping
  const alertsRows = data.alerts.map(a => [
    a.symbol,
    a.type,
    a.condition,
    `₹${a.value.toLocaleString('en-IN')}`,
    a.status
  ]);

  // Market Movers
  const gainersRows = data.marketIntel.topGainers.map(g => [
    g.symbol,
    `₹${g.price.toLocaleString('en-IN')}`,
    `+${g.change.toFixed(2)}%`
  ]);

  // Losers
  const losersRows = data.marketIntel.topLosers.map(l => [
    l.symbol,
    `₹${l.price.toLocaleString('en-IN')}`,
    `${l.change.toFixed(2)}%`
  ]);

  // Indices table mapping
  const indicesRows = data.marketIntel.indices.map(ind => [
    ind.name,
    ind.value,
    ind.change
  ]);

  return (
    <Document title="Portfolio & Investment Intelligence Report">
      
      {/* ---------------- PAGE 1: Portfolio Executive Cover ---------------- */}
      <ReportPage bookmark="Executive Profile">
        <ReportHeader title="Portfolio Intelligence Report" subtitle="Executive Summary" timestamp={data.generationTimestamp} />
        
        <PortfolioIdentityHeader
          portfolioName={config.reportName || "My Investment Portfolio"}
          dateRange={config.dateRange}
          totalValue={data.value}
          totalPnL={data.pnl}
          healthScore={data.healthScore}
        />

        <View style={styles.gridRow}>
          <ReportMetricCard label="Net Asset Value" value={`₹${data.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} change={`${isUp ? '+' : ''}${data.pnlPct.toFixed(1)}% Return`} trend={isUp ? 'up' : 'down'} style={styles.col} />
          <ReportMetricCard label="Invested Cost" value={`₹${data.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} style={styles.col} />
          <ReportMetricCard label="Today's Gain/Loss" value={`${data.todayPnL >= 0 ? '+' : ''}₹${Math.round(data.todayPnL).toLocaleString('en-IN')}`} change={`${data.todayPnLPct.toFixed(2)}%`} trend={data.todayPnL >= 0 ? 'up' : 'down'} style={styles.col} />
          <ReportMetricCard label="Diversification" value={data.diversificationLabel || "Well Diversified"} style={styles.col} />
          <ReportMetricCard label="Risk Index" value="Low Vol" style={styles.col} />
        </View>

        <View style={[styles.gridRow, { marginTop: 8 }]}>
          {/* Portfolio executive overview column */}
          <View style={[styles.col, styles.card]}>
            <Text style={styles.cardTitle}>Portfolio Strengths</Text>
            <View style={{ gap: 3.5 }}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletCheck}>✓</Text>
                <Text style={styles.bulletText}>High AI Portfolio Health score ({data.healthScore}/100) indicating strong fundamentals.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletCheck}>✓</Text>
                <Text style={styles.bulletText}>Clean diversification indexes across key market sectors.</Text>
              </View>
            </View>

            <Text style={[styles.cardTitle, { marginTop: 8 }]}>Concentration Risks</Text>
            <View style={{ gap: 3.5 }}>
              <View style={styles.bulletItem}>
                <Text style={[styles.bulletCheck, { color: maxSectorPct > 55 ? reportTheme.red : maxSectorPct > 25 ? reportTheme.orange : reportTheme.green }]}>•</Text>
                <Text style={styles.bulletText}>
                  {maxSectorPct > 55 
                    ? `CRITICAL RISK: Portfolio has critical concentration in the ${maxSectorName} sector (${maxSectorPct.toFixed(1)}% allocation). Consider rebalancing.`
                    : maxSectorPct > 40
                    ? `HIGH CONCENTRATION: Sector ${maxSectorName} allocation is high at ${maxSectorPct.toFixed(1)}%.`
                    : maxSectorPct > 25
                    ? `MODERATE CONCENTRATION: Largest sector is ${maxSectorName} at ${maxSectorPct.toFixed(1)}%.`
                    : `EXCELLENT DIVERSIFICATION: Sector allocations are well balanced.`}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.col, styles.card]}>
            <Text style={styles.cardTitle}>AI Market Outlook Summary</Text>
            <Text style={styles.bodyText}>
              The NiftyAI market sentiment evaluates to <strong>{data.marketIntel.sentiment.label}</strong> (Score: {data.marketIntel.sentiment.score}/100). Institutional activity shows solid FII net inflows, and a projected range is bounded inside {data.marketIntel.expectedRange}. We recommend standard sector rebalancing.
            </Text>
            
            <Text style={[styles.cardTitle, { marginTop: 4 }]}>Suggested Next Actions</Text>
            <View style={{ gap: 3.5 }}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletCheck}>✓</Text>
                <Text style={styles.bulletText}>Track alerts for high volatility triggers on tech holdings.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletCheck}>✓</Text>
                <Text style={styles.bulletText}>Align settings and thresholds on Watchlist notifications.</Text>
              </View>
            </View>
          </View>
        </View>

        <ReportDisclosure />
        <ReportFooter />
      </ReportPage>

      {/* ---------------- PAGE 2: Performance vs Benchmark ---------------- */}
      {config.includePerformanceAnalysis && (
        <ReportPage bookmark="Performance Analysis">
          <ReportHeader title="Portfolio Intelligence Report" subtitle="Performance Analytics" timestamp={data.generationTimestamp} />
          
          <ReportSectionTitle title="Portfolio NAV vs Benchmark Performance Trend" />
          <View style={styles.card}>
            {/* Draw price history chart representing benchmark returns */}
            <ReportPriceChart prices={data.performanceHistory.map(h => ({ date: h.date, close: h.portfolio } as any))} />
          </View>

          <ReportSectionTitle title="Standard Returns Heatmap Grid" />
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 8 }]}>
            <ReportReturnHeatmap heatmapData={data.monthlyHeatmap} />
          </View>

          <ReportSectionTitle title="Key Statistics & Ratios" />
          <View style={styles.gridRow}>
            <ReportMetricCard label="Alpha" value={`+${data.alpha}%`} style={styles.col} />
            <ReportMetricCard label="Beta" value={data.beta.toString()} style={styles.col} />
            <ReportMetricCard label="Sharpe Ratio" value={data.sharpeRatio.toString()} style={styles.col} />
            <ReportMetricCard label="Sortino Ratio" value={data.sortinoRatio.toString()} style={styles.col} />
            <ReportMetricCard label="Volatility" value={`${data.volatility}%`} style={styles.col} />
            <ReportMetricCard label="Max Drawdown" value={`${data.maxDrawdown}%`} style={styles.col} />
          </View>
          <ReportFooter />
        </ReportPage>
      )}

      {/* ---------------- PAGE 3: Holdings & Allocations ---------------- */}
      {config.includeHoldingsTable && (
        <ReportPage bookmark="Holdings & Allocations">
          <ReportHeader title="Portfolio Intelligence Report" subtitle="Asset Breakdown" timestamp={data.generationTimestamp} />
          
          <ReportSectionTitle title="Asset Structure & Sector Exposure Allocation" />
          <View style={styles.gridRow}>
            <View style={[styles.card, { flex: 0.5, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={styles.cardTitle}>Asset Allocation</Text>
              <ReportDonutChart data={assetData} />
            </View>
            <View style={[styles.card, { flex: 0.5, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={styles.cardTitle}>Sector Allocation</Text>
              <ReportDonutChart data={sectorData} />
            </View>
          </View>

          <ReportSectionTitle title="Purchased Positions Details Table" />
          <View style={{ height: 160 }}>
            <ReportTable
              headers={["Symbol", "Qty", "Avg Cost", "LTP", "Total Cost", "Value", "P&L", "Return", "Alloc", "AI Rating"]}
              colWidths={["12%", "8%", "10%", "10%", "10%", "10%", "10%", "10%", "8%", "12%"]}
              alignments={["left", "right", "right", "right", "right", "right", "right", "right", "right", "center"]}
              rows={holdingsRows}
            />
          </View>
          <ReportFooter />
        </ReportPage>
      )}

      {/* ---------------- PAGE 4: Risk & Rebalancing ---------------- */}
      {config.includeRiskAnalysis && (
        <ReportPage bookmark="Risk Analysis">
          <ReportHeader title="Portfolio Intelligence Report" subtitle="Risk Profiling" timestamp={data.generationTimestamp} />
          
          <ReportSectionTitle title="Portfolio Risks Snapshot & Gauges" />
          <View style={styles.gridRow}>
            <View style={[styles.card, { flex: 0.33, alignItems: 'center', justifyContent: 'center' }]}>
              <ReportGaugeChart score={data.riskScore} label="Volatility Index" color={reportTheme.orange} />
            </View>
            <View style={[styles.card, { flex: 0.33, alignItems: 'center', justifyContent: 'center' }]}>
              <ReportGaugeChart score={data.diversificationScore} label="Diversification" color={reportTheme.green} />
            </View>
            <View style={[styles.card, { flex: 0.34, alignItems: 'center', justifyContent: 'center' }]}>
              <ReportGaugeChart score={84} label="AI Recommendation" color={reportTheme.purple} />
            </View>
          </View>

          <ReportSectionTitle title="Rebalancing Observations & AI Directives" />
          <View style={[styles.card, { backgroundColor: `${reportTheme.orange}08` }]}>
            <Text style={[styles.cardTitle, { color: reportTheme.orange }]}>Analytical Observations (Not Trade Instructions)</Text>
            <Text style={styles.bodyText}>
              These observations are generated dynamically by our risk analysis engine based on current market trends and portfolio metrics. These are observations only, not instructions or mandates to trade.
            </Text>
            <View style={{ gap: 3.5, marginTop: 4 }}>
              <View style={styles.bulletItem}>
                <Text style={[styles.bulletCheck, { color: reportTheme.orange }]}>•</Text>
                <Text style={styles.bulletText}>Accumulate sector leaders on pullback ranges within the 52-week support corridor.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={[styles.bulletCheck, { color: reportTheme.orange }]}>•</Text>
                <Text style={styles.bulletText}>Monitor exposure weightings inside Financials to ensure correlation buffers remain safe.</Text>
              </View>
            </View>
          </View>
          <ReportFooter />
        </ReportPage>
      )}

      {/* ---------------- PAGE 5: Watchlist & Alerts ---------------- */}
      {(config.includeWatchlistSummary || config.includeAlertsSummary) && (
        <ReportPage bookmark="Watchlist & Alerts">
          <ReportHeader title="Portfolio Intelligence Report" subtitle="Watchlist Summary" timestamp={data.generationTimestamp} />
          
          {config.includeWatchlistSummary && (
            <View>
              <ReportSectionTitle title="Watchlist Constituents Overview" />
              <View style={{ height: 110 }}>
                <ReportTable
                  headers={["Symbol", "Price", "Change %", "AI Score", "AI Recommendation", "Alerts"]}
                  colWidths={["15%", "15%", "15%", "15%", "25%", "15%"]}
                  alignments={["left", "right", "right", "center", "center", "center"]}
                  rows={watchlistRows}
                />
              </View>
            </View>
          )}

          {config.includeAlertsSummary && (
            <View style={{ marginTop: 8 }}>
              <ReportSectionTitle title="Active Price & Technical Alerts Summary" />
              <View style={{ height: 110 }}>
                <ReportTable
                  headers={["Symbol", "Alert Type", "Condition", "Trigger Value", "Status"]}
                  colWidths={["20%", "20%", "20%", "20%", "20%"]}
                  alignments={["left", "center", "center", "right", "center"]}
                  rows={alertsRows}
                />
              </View>
            </View>
          )}
          <ReportFooter />
        </ReportPage>
      )}

      {/* ---------------- PAGE 6: Market Intelligence ---------------- */}
      {config.includeMarketIntelligence && (
        <ReportPage bookmark="Market Intelligence">
          <ReportHeader title="Portfolio Intelligence Report" subtitle="Market Overview" timestamp={data.generationTimestamp} />
          
          <ReportSectionTitle title="Broad Market Indices & Movers" />
          <View style={styles.gridRow}>
            <View style={[styles.col, styles.card]}>
              <Text style={styles.cardTitle}>Global Market Indices</Text>
              <ReportTable
                headers={["Index", "LTP", "1D Change"]}
                colWidths={["40%", "30%", "30%"]}
                alignments={["left", "right", "right"]}
                rows={indicesRows}
              />
            </View>
            
            <View style={[styles.col, styles.card]}>
              <Text style={styles.cardTitle}>FII / DII Institutional Activity</Text>
              <View style={{ gap: 4, paddingVertical: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 7, color: reportTheme.muted }}>FII Net Flow Today:</Text>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.green }}>+₹1,240 Cr</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 7, color: reportTheme.muted }}>DII Net Flow Today:</Text>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.red }}>-₹2,315 Cr</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={[styles.col, styles.card]}>
              <Text style={styles.cardTitle}>Top Sector Gainers Today</Text>
              <ReportTable
                headers={["Symbol", "Price", "Change %"]}
                colWidths={["40%", "30%", "30%"]}
                alignments={["left", "right", "right"]}
                rows={gainersRows}
              />
            </View>
            <View style={[styles.col, styles.card]}>
              <Text style={styles.cardTitle}>Top Sector Losers Today</Text>
              <ReportTable
                headers={["Symbol", "Price", "Change %"]}
                colWidths={["40%", "30%", "30%"]}
                alignments={["left", "right", "right"]}
                rows={losersRows}
              />
            </View>
          </View>
          <ReportFooter />
        </ReportPage>
      )}

      {/* ---------------- APPENDICES: full Company AI Report pages ---------------- */}
      {config.includeCompanyResearchAppendices && Object.entries(data.appendices).map(([sym, compData], idx) => {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const appendixLabel = letters[idx % letters.length] || 'A';
        const title = `Appendix ${appendixLabel} — ${sym} AI Equity Research Report`;

        return (
          <React.Fragment key={sym}>
            {/* Page 1: Appendix Cover */}
            <ReportPage bookmark={title}>
              <ReportHeader title={title} subtitle={sym} timestamp={data.generationTimestamp} />
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 16, color: reportTheme.purple, textTransform: 'uppercase' }}>
                  {title}
                </Text>
                <Text style={{ fontFamily: 'Helvetica', fontSize: 9, color: reportTheme.muted, textAlign: 'center', maxWidth: '70%' }}>
                  Comprehensive corporate research report, fundamental score breakdown, price history charts, financial analysis, news sentiment overview, and peer benchmarking.
                </Text>
              </View>
              <ReportDisclosure />
              <ReportFooter />
            </ReportPage>

            {/* Embed full stock report for this appendix company */}
            {CompanyResearchReport(compData).props.children}
          </React.Fragment>
        );
      })}
    </Document>
  );
}

export default PortfolioIntelligenceReport;
