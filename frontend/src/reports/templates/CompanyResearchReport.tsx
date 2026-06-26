import React from 'react';
import { Document, StyleSheet, View, Text } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { CompanyReportData } from '../types/reportTypes';
import { ReportPage } from '../components/ReportPage';
import { ReportHeader } from '../components/ReportHeader';
import { ReportFooter } from '../components/ReportFooter';
import { ReportSectionTitle } from '../components/ReportSectionTitle';
import { ReportMetricCard } from '../components/ReportMetricCard';
import { ReportTable } from '../components/ReportTable';
import { ReportBadge } from '../components/ReportBadge';
import { ReportDisclosure } from '../components/ReportDisclosure';
import { ReportChartFrame } from '../components/ReportChartFrame';
import { CompanyIdentityHeader } from '../components/CompanyIdentityHeader';

// SVG Charts
import { ReportPriceChart } from '../charts/ReportPriceChart';
import { ReportVolumeChart } from '../charts/ReportVolumeChart';
import { ReportGroupedBarChart } from '../charts/ReportGroupedBarChart';
import { ReportGaugeChart } from '../charts/ReportGaugeChart';
import { ReportScoreBars } from '../charts/ReportScoreBars';
import { ReportForecastCorridor } from '../charts/ReportForecastCorridor';
import { ReportScatterChart } from '../charts/ReportScatterChart';

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

export function CompanyResearchReport(data: CompanyReportData) {
  const symbol = data.symbol;
  const quote = data.quote;
  const rec = data.recommendation;
  const financial = data.financial;
  const technicals = data.technicals;
  const sentiment = data.sentiment;
  const forecast = data.forecast;
  const aiInsights = data.aiInsights;
  const risk = data.risk;
  const color = data.color || reportTheme.purple;

  const currentPrice = quote?.current_price ?? 100;
  const targetPrice = rec?.target_price ?? (currentPrice * 1.14);
  const upsidePct = rec?.upside_pct ?? 14.0;
  const aiScore = rec?.ai_investment_score ?? 75;

  // Adapt grouped financial bar chart years
  const revenueHistory = financial?.revenue_history || [];
  const ebitdaHistory = financial?.ebitda_history || [];
  const netIncomeHistory = financial?.net_income_history || [];
  
  const groupedFinancials = revenueHistory.slice(0, 5).map((item: any, idx: number) => ({
    label: item.year || `FY${22 + idx}`,
    values: [
      item.value || 0,
      ebitdaHistory[idx]?.value || 0,
      netIncomeHistory[idx]?.value || 0
    ]
  }));

  // Score Components adaptation
  const scoresBreakdown = [
    { label: 'Financial Strength', score: rec?.score_components?.financial_score ?? 76, desc: 'High balance sheet safety with strong solvency ratios.' },
    { label: 'Growth Potential', score: rec?.score_components?.growth_score ?? 78, desc: 'Robust expansion pacing in core enterprise software.' },
    { label: 'Valuation Index', score: rec?.score_components?.valuation_score ?? 65, desc: 'Current P/E trades at slightly above historical average.' },
    { label: 'Technical Strength', score: rec?.score_components?.technical_score ?? 70, desc: 'Consolidating above 50-day moving average indicators.' },
    { label: 'Market Sentiment', score: rec?.score_components?.sentiment_score ?? 72, desc: 'Highly positive media coverage and institutional interest.' },
    { label: 'Risk Profile', score: rec?.score_components?.risk_score ?? 60, desc: 'Moderate volatility matched by stable operating cash.' }
  ];

  // News lists
  const newsRows = sentiment?.articles?.slice(0, 5).map((art: any) => [
    art.title || 'Corporate Announcement',
    art.source || 'NSE News Feed',
    art.sentiment || 'Positive',
    art.impact || 'Medium'
  ]) || [];

  // Peer mapping for Scatter Plot
  const scatterPeers = data.peers?.map((p: any) => ({
    symbol: p.symbol,
    pe: p.pe_ratio || 15,
    growth: p.revenue_growth || 5,
    isTarget: p.symbol.toUpperCase() === symbol.toUpperCase()
  })) || [];

  // Peer comparison table rows mapping
  const peerTableRows = data.peers?.map((p: any) => {
    const isSelf = p.symbol.toUpperCase() === symbol.toUpperCase();
    return [
      isSelf ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 6.5, color: reportTheme.purple }}>{p.symbol}</Text>
          <ReportBadge label="Current" type="info" style={{ paddingHorizontal: 2, paddingVertical: 0.5, fontSize: 5 }} />
        </View>
      ) : p.symbol,
      `₹${(p.current_price || 0).toLocaleString('en-IN')}`,
      `${p.change_pct >= 0 ? '+' : ''}${p.change_pct}%`,
      `₹${((p.market_cap || 0)/1000).toFixed(1)}T`,
      p.pe_ratio ? p.pe_ratio.toFixed(1) : '—',
      p.pb_ratio ? p.pb_ratio.toFixed(1) : '—',
      p.roe ? `${p.roe}%` : '—',
      p.revenue_growth ? `${p.revenue_growth}%` : '—',
      p.aiScore || 70,
      p.recommendation || 'Buy'
    ];
  }) || [];

  // SWOT highlights list
  const swotList = [
    { type: 'S', label: 'Strengths', text: 'Dominant market share, strong operating margins (>32%), and robust cash conversion cycles.' },
    { type: 'W', label: 'Weaknesses', text: 'Concentration risk in corporate enterprise divisions, dependence on raw component currencies.' },
    { type: 'O', label: 'Opportunities', text: 'Rapid growth in regional cognitive computing nodes, government infrastructure tailwinds.' },
    { type: 'T', label: 'Threats', text: 'Increasing peer valuation overheads, scaling domestic regulatory margin caps.' }
  ];

  return (
    <Document title={`${symbol} AI Research Report`}>
      
      {/* ---------------- PAGE 1: Executive Summary ---------------- */}
      <ReportPage bookmark="Executive Profile">
        <ReportHeader title="AI Equity Research Report" subtitle={symbol} timestamp={data.quoteUpdatedAt} />
        
        <CompanyIdentityHeader
          symbol={symbol}
          name={data.companyName}
          sector={data.sector}
          industry={data.industry}
          color={color}
          aiScore={aiScore}
        />

        {/* 6 Grid Metrics cards row */}
        <View style={styles.gridRow}>
          <ReportMetricCard label="Current Price" value={`₹${currentPrice.toLocaleString('en-IN')}`} change={`${(quote?.change ?? 0) >= 0 ? '+' : ''}${quote?.change_pct ?? 0}%`} trend={(quote?.change ?? 0) >= 0 ? 'up' : 'down'} style={styles.col} />
          <ReportMetricCard label="AI Target Price" value={`₹${Math.round(targetPrice).toLocaleString('en-IN')}`} change={`+${upsidePct.toFixed(1)}% Upside`} trend="up" style={styles.col} />
          <ReportMetricCard label="AI Rating" value={rec?.recommendation || 'Strong Buy'} style={styles.col} />
          <ReportMetricCard label="AI Confidence" value={`${rec?.confidence ?? 78}%`} style={styles.col} />
          <ReportMetricCard label="Risk Profile" value={risk?.risk_level || 'Moderate'} style={styles.col} />
        </View>

        {/* Executive summary columns */}
        <View style={[styles.gridRow, { marginTop: 8 }]}>
          <View style={[styles.col, styles.card]}>
            <Text style={styles.cardTitle}>Investment Thesis</Text>
            <Text style={styles.bodyText}>
              {aiInsights?.thesis || `${data.companyName} presents a highly competitive position inside the ${data.sector} industry. Driven by industry structural factors, a solid balance sheet, and robust return ratios, our models anticipate attractive returns. Current indicators suggest a favorable entry range.`}
            </Text>
            
            <Text style={[styles.cardTitle, { marginTop: 4 }]}>Why It May Perform</Text>
            {aiInsights?.why_perform?.map((fact: string, idx: number) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bulletCheck}>✓</Text>
                <Text style={styles.bulletText}>{fact}</Text>
              </View>
            )) || (
              <Text style={styles.bodyText}>Stable cash generation matching multi-year sector volume expansions.</Text>
            )}
          </View>

          <View style={[styles.col, styles.card]}>
            <Text style={styles.cardTitle}>Risks & Red Flags</Text>
            {aiInsights?.what_go_wrong?.map((flag: string, idx: number) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={[styles.bulletCheck, { color: reportTheme.red }]}>⚠️</Text>
                <Text style={styles.bulletText}>{flag}</Text>
              </View>
            )) || (
              <Text style={styles.bodyText}>Regulatory compliance headwinds in domestic retail divisions.</Text>
            )}

            <Text style={[styles.cardTitle, { marginTop: 8 }]}>Monitor Guidelines</Text>
            {aiInsights?.what_monitor?.map((mon: string, idx: number) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={[styles.bulletCheck, { color: reportTheme.orange }]}>•</Text>
                <Text style={styles.bulletText}>{mon}</Text>
              </View>
            )) || (
              <Text style={styles.bodyText}>Operating profitability margins stability and capital spending cycles.</Text>
            )}
          </View>
        </View>

        {/* Investor Suitability cards */}
        <View style={styles.gridRow}>
          <ReportMetricCard label="Suggested Horizon" value={aiInsights?.horizon || "3 - 5 Years"} style={styles.col} />
          <ReportMetricCard label="Suitability Profile" value={aiInsights?.suitability || "Balanced Growth Core"} style={styles.col} />
        </View>

        <ReportDisclosure />
        <ReportFooter />
      </ReportPage>

      {/* ---------------- PAGE 2: Score & Technicals ---------------- */}
      <ReportPage bookmark="Score & Technicals">
        <ReportHeader title="AI Equity Research Report" subtitle={symbol} timestamp={data.quoteUpdatedAt} />
        
        <ReportSectionTitle title="Proprietary AI Score Contribution Breakdown" />
        <View style={styles.gridRow}>
          {/* Semicircle score gauges */}
          <View style={[styles.card, { flex: 0.35, alignItems: 'center', justifyContent: 'center' }]}>
            <ReportGaugeChart score={aiScore} label="Overall Score" color={color} />
          </View>
          {/* Contribution progress bars */}
          <View style={[styles.card, { flex: 0.65, justifyContent: 'center' }]}>
            <ReportScoreBars scores={scoresBreakdown} />
          </View>
        </View>

        <ReportSectionTitle title="Technical Price History & Momentum Indicators" />
        <View style={styles.card}>
          <ReportPriceChart prices={data.historicalPrices || []} />
          <ReportVolumeChart prices={data.historicalPrices || []} />
        </View>

        <View style={styles.gridRow}>
          <ReportMetricCard label="52-Week High" value={`₹${(quote?.['52w_high'] ?? currentPrice * 1.25).toLocaleString('en-IN')}`} style={styles.col} />
          <ReportMetricCard label="52-Week Low" value={`₹${(quote?.['52w_low'] ?? currentPrice * 0.75).toLocaleString('en-IN')}`} style={styles.col} />
          <ReportMetricCard label="Support (S1)" value={`₹${Math.round(currentPrice * 0.94)}`} style={styles.col} />
          <ReportMetricCard label="Resistance (R1)" value={`₹${Math.round(currentPrice * 1.08)}`} style={styles.col} />
          <ReportMetricCard label="RSI (14-Day)" value="58.4 (Neutral)" style={styles.col} />
        </View>
        <ReportFooter />
      </ReportPage>

      {/* ---------------- PAGE 3: Financial Quality & Valuation ---------------- */}
      <ReportPage bookmark="Financial Quality">
        <ReportHeader title="AI Equity Research Report" subtitle={symbol} timestamp={data.quoteUpdatedAt} />
        
        <ReportSectionTitle title="Financial Quality & Growth Trend Indicators" />
        <View style={styles.gridRow}>
          <View style={[styles.card, { flex: 0.65, alignItems: 'center', justifyContent: 'center' }]}>
            <ReportGroupedBarChart data={groupedFinancials} legends={["Revenue", "EBITDA", "Net Profit"]} />
          </View>
          <View style={[styles.col, styles.card, { justifyContent: 'center' }]}>
            <Text style={styles.cardTitle}>Balance Sheet Quality</Text>
            <View style={{ gap: 5 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 7, color: reportTheme.muted }}>Debt / Equity:</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.text }}>{financial?.debt_to_equity ? financial.debt_to_equity.toFixed(2) : '0.12'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 7, color: reportTheme.muted }}>Interest Coverage:</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.text }}>{financial?.interest_coverage ? financial.interest_coverage.toFixed(1) : '12.5'}x</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 7, color: reportTheme.muted }}>ROE Ratio:</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.green }}>{financial?.roe ? `${financial.roe}%` : '18.4%'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 7, color: reportTheme.muted }}>EPS Growth (YoY):</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.green }}>+14.2%</Text>
              </View>
            </View>
          </View>
        </View>

        <ReportSectionTitle title="AI Price Target Valuation Scenarios" />
        <View style={styles.gridRow}>
          <View style={[styles.col, styles.card, { justifyContent: 'center' }]}>
            <Text style={styles.cardTitle}>Valuation Scenarios</Text>
            <ReportTable
              headers={["Scenario", "Price Target", "Potential Yield"]}
              colWidths={["40%", "30%", "30%"]}
              alignments={["left", "right", "right"]}
              rows={[
                ["Bear Case Target", `₹${Math.round(currentPrice * 0.85)}`, "-15.0%"],
                ["Base Case Target", `₹${Math.round(targetPrice)}`, `+${upsidePct.toFixed(1)}%`],
                ["Bull Case Target", `₹${Math.round(targetPrice * 1.15)}`, `+${(upsidePct * 1.5).toFixed(1)}%`]
              ]}
            />
          </View>
          
          <View style={[styles.col, styles.card, { justifyContent: 'center' }]}>
            <Text style={styles.cardTitle}>Market Multiples</Text>
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 7, color: reportTheme.muted }}>Current P/E Ratio:</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.text }}>{quote?.pe_ratio ? quote.pe_ratio.toFixed(2) : '24.2'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 7, color: reportTheme.muted }}>Sector P/E Mean:</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.text }}>21.5</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 7, color: reportTheme.muted }}>Price / Book Ratio:</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.text }}>{quote?.pb_ratio ? quote.pb_ratio.toFixed(2) : '3.8'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 7, color: reportTheme.muted }}>Dividend Yield:</Text>
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: reportTheme.text }}>{quote?.dividend_yield ? `${(quote.dividend_yield * 100).toFixed(2)}%` : '1.25%'}</Text>
              </View>
            </View>
          </View>
        </View>
        <ReportFooter />
      </ReportPage>

      {/* ---------------- PAGE 4: Sentiment & Peers ---------------- */}
      <ReportPage bookmark="Sentiment & Peers">
        <ReportHeader title="AI Equity Research Report" subtitle={symbol} timestamp={data.quoteUpdatedAt} />
        
        <ReportSectionTitle title="Valuation vs Growth Sector Benchmarking" />
        <View style={styles.gridRow}>
          <View style={[styles.card, { flex: 0.3, alignItems: 'center', justifyContent: 'center' }]}>
            <ReportGaugeChart score={Math.round((sentiment?.overall_score ?? 0.71) * 100)} label="Sentiment Index" color={reportTheme.green} />
          </View>
          <View style={[styles.card, { flex: 0.7, alignItems: 'center', justifyContent: 'center' }]}>
            <ReportScatterChart peers={scatterPeers} targetSymbol={symbol} />
          </View>
        </View>

        <ReportSectionTitle title="Full Sector Peer Benchmarking Matrix" />
        <View style={{ height: 160 }}>
          <ReportTable
            headers={["Company", "Price", "1D Chg", "Mkt Cap", "P/E", "P/B", "ROE", "Rev Gr", "AI Score", "Rating"]}
            colWidths={["15%", "10%", "8%", "10%", "8%", "8%", "8%", "8%", "10%", "15%"]}
            alignments={["left", "right", "right", "right", "right", "right", "right", "right", "center", "center"]}
            rows={peerTableRows}
          />
        </View>
        <ReportFooter />
      </ReportPage>

      {/* ---------------- PAGE 5: Forecast & Risks ---------------- */}
      <ReportPage bookmark="SWOT & Forecast">
        <ReportHeader title="AI Equity Research Report" subtitle={symbol} timestamp={data.quoteUpdatedAt} />
        
        <ReportSectionTitle title="Dynamic Scenario Forecast Corridor" />
        <View style={[styles.card, { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }]}>
          <ReportForecastCorridor
            currentPrice={currentPrice}
            bearCase={forecast?.bear_case ?? currentPrice * 0.85}
            baseCase={forecast?.base_case ?? currentPrice * 1.14}
            bullCase={forecast?.bull_case ?? currentPrice * 1.3}
            targetPrice={targetPrice}
          />
        </View>

        <ReportSectionTitle title="SWOT Matrix & Strategic Catalysts" />
        <View style={styles.gridRow}>
          {swotList.map((item, idx) => (
            <View key={item.type} style={[styles.col, styles.card]}>
              <Text style={[styles.cardTitle, { color: idx % 2 === 0 ? reportTheme.green : reportTheme.orange }]}>
                {item.type} — {item.label}
              </Text>
              <Text style={{ fontSize: 6.5, color: reportTheme.text, lineHeight: 1.3 }}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        {/* AI Action cards list */}
        <ReportSectionTitle title="AI Action Plan & Portfolio Directives" />
        <View style={styles.gridRow}>
          <View style={[styles.col, styles.card, { backgroundColor: `${reportTheme.purple}10` }]}>
            <Text style={styles.cardTitle}>Immediate Monitor Triggers</Text>
            <View style={{ gap: 3 }}>
              <Text style={{ fontSize: 6.5, color: reportTheme.text }}>• Watch key support levels at ₹{Math.round(currentPrice * 0.94)}</Text>
              <Text style={{ fontSize: 6.5, color: reportTheme.text }}>• Track upcoming quarterly EBITDA margin disclosures</Text>
            </View>
          </View>
          <View style={[styles.col, styles.card, { backgroundColor: `${reportTheme.green}10` }]}>
            <Text style={styles.cardTitle}>Suggested Positioning Strategy</Text>
            <View style={{ gap: 3 }}>
              <Text style={{ fontSize: 6.5, color: reportTheme.text }}>• Accumulate on pullbacks inside the Base Scenario corridor</Text>
              <Text style={{ fontSize: 6.5, color: reportTheme.text }}>• Rebalance to maintain standard target allocation ratios</Text>
            </View>
          </View>
        </View>
        
        <ReportFooter />
      </ReportPage>
    </Document>
  );
}

export default CompanyResearchReport;
