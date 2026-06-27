import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { CompanyReportData, PortfolioReportData, ReportConfig, ReportSnapshot } from '../types/reportTypes';
import { ReportDataAdapter } from './reportDataAdapter';
import CompanyResearchReport from '../templates/CompanyResearchReport';
import PortfolioIntelligenceReport from '../templates/PortfolioIntelligenceReport';
import { QuoteData, RecommendationData } from '../../types/stock';

export interface ProgressState {
  stage: string;
  percent: number;
}

export type ProgressCallback = (state: ProgressState) => void;

export class ReportPdfService {
  private static triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Pre-export validation pipeline
  static validateReportSnapshot(snapshot?: ReportSnapshot) {
    if (!snapshot) {
      throw new Error("[Validation Failure] ReportSnapshot is missing from data layer.");
    }
    if (!snapshot.snapshotId || !snapshot.snapshotId.startsWith("SNAP_")) {
      throw new Error(`[Validation Failure] Invalid or corrupt snapshotId: ${snapshot.snapshotId}`);
    }
    if (!snapshot.generatedAt) {
      throw new Error("[Validation Failure] Snapshot generatedAt timestamp is missing.");
    }
  }

  static validateMarketCapUnits(marketCap?: number) {
    if (marketCap !== undefined && (isNaN(marketCap) || marketCap < 0)) {
      throw new Error(`[Validation Failure] Invalid market cap value: ${marketCap}`);
    }
  }

  static validateFinancialRatios(ratios: { pe?: number; pb?: number }) {
    if (ratios.pe !== undefined && (isNaN(ratios.pe) || !isFinite(ratios.pe))) {
      throw new Error(`[Validation Failure] Invalid P/E ratio: ${ratios.pe}`);
    }
    if (ratios.pb !== undefined && (isNaN(ratios.pb) || !isFinite(ratios.pb))) {
      throw new Error(`[Validation Failure] Invalid P/B ratio: ${ratios.pb}`);
    }
  }

  static validateNoDuplicateCompanyRows(symbols: string[]) {
    const seen = new Set<string>();
    for (const sym of symbols) {
      if (seen.has(sym)) {
        throw new Error(`[Validation Failure] Duplicate company entry detected in report data: ${sym}`);
      }
      seen.add(sym);
    }
  }

  static validatePortfolioNarratives(data: PortfolioReportData) {
    if (data.holdings && data.holdings.length > 0) {
      const sum = data.holdings.reduce((acc, h) => acc + h.allocationPct, 0);
      if (Math.abs(sum - 100) > 1.0) {
        throw new Error(`[Validation Failure] Portfolio allocations do not sum to 100% (Sum = ${sum.toFixed(2)}%)`);
      }
    }
  }

  static validateTableWidths(headers: string[], widths: string[]) {
    if (headers.length !== widths.length) {
      throw new Error(`[Validation Failure] Column widths count (${widths.length}) does not match headers count (${headers.length}).`);
    }
  }

  static async generateCompanyReport(
    symbol: string,
    quotes: QuoteData[],
    recs: Record<string, RecommendationData>,
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    const notify = (stage: string, percent: number) => {
      if (onProgress) onProgress({ stage, percent });
    };

    notify("Collecting latest quote data", 10);
    await new Promise(r => setTimeout(r, 100));

    notify("Loading financial information", 30);
    await new Promise(r => setTimeout(r, 100));

    notify("Building vector charts", 50);
    await new Promise(r => setTimeout(r, 100));

    notify("Calculating technical indicators", 70);
    
    // Compile data adapter
    const data = await ReportDataAdapter.compileCompanyReportData(symbol, quotes, recs);
    await new Promise(r => setTimeout(r, 100));

    notify("Validating report snapshot and integrity", 80);
    this.validateReportSnapshot(data.snapshot);
    if (data.quote) {
      this.validateMarketCapUnits(data.quote.market_cap);
      this.validateFinancialRatios({ pe: data.quote.pe_ratio, pb: data.quote.pb_ratio });
    }
    if (data.peers) {
      const peerSymbols = data.peers.map(p => p.symbol);
      this.validateNoDuplicateCompanyRows(peerSymbols);
    }
    await new Promise(r => setTimeout(r, 100));

    notify("Building report pages", 85);
    const element = React.createElement(CompanyResearchReport, data);
    
    notify("Compiling vector PDF", 95);
    const doc = pdf(element as any);
    const blob = await doc.toBlob();

    notify("Finalising export", 100);
    const today = new Date().toISOString().split('T')[0];
    const filename = `NiftyAI_${symbol.toUpperCase()}_AI_Equity_Research_Report_${today}.pdf`;
    this.triggerDownload(blob, filename);

    return blob;
  }

  static async generatePortfolioReport(
    config: ReportConfig,
    holdings: any[],
    quotes: QuoteData[],
    recs: Record<string, RecommendationData>,
    watchlistSymbols: string[],
    alertsState: any[],
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    const notify = (stage: string, percent: number) => {
      if (onProgress) onProgress({ stage, percent });
    };

    notify("Collecting latest quote data", 10);
    await new Promise(r => setTimeout(r, 100));

    notify("Loading financial information", 20);
    await new Promise(r => setTimeout(r, 100));

    notify("Calculating portfolio metrics", 40);
    await new Promise(r => setTimeout(r, 100));

    notify("Preparing news and sentiment insights", 60);
    await new Promise(r => setTimeout(r, 100));

    notify("Creating sector peer comparison", 75);
    
    // Compile data adapter
    const data = await ReportDataAdapter.compilePortfolioReportData(
      config,
      holdings,
      quotes,
      recs,
      watchlistSymbols,
      alertsState
    );
    await new Promise(r => setTimeout(r, 100));

    notify("Validating portfolio data integrity", 80);
    this.validateReportSnapshot(data.snapshot);
    this.validatePortfolioNarratives(data);
    
    const holdingSymbols = data.holdings.map(h => h.symbol);
    this.validateNoDuplicateCompanyRows(holdingSymbols);

    if (data.appendices) {
      for (const [sym, compData] of Object.entries(data.appendices)) {
        this.validateReportSnapshot(compData.snapshot);
        if (compData.snapshot?.snapshotId !== data.snapshot?.snapshotId) {
          throw new Error(`[Validation Failure] Appendix ${sym} has snapshot mismatch: ${compData.snapshot?.snapshotId} vs Portfolio: ${data.snapshot?.snapshotId}`);
        }
      }
    }
    await new Promise(r => setTimeout(r, 100));

    notify("Building report pages", 85);
    const element = React.createElement(PortfolioIntelligenceReport, data);

    notify("Compiling vector PDF", 95);
    const doc = pdf(element as any);
    const blob = await doc.toBlob();

    notify("Finalising export", 100);
    const today = new Date().toISOString().split('T')[0];
    const filename = `NiftyAI_Portfolio_Investment_Intelligence_Report_${today}.pdf`;
    this.triggerDownload(blob, filename);

    return blob;
  }
}
