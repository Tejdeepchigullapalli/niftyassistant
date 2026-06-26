import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { CompanyReportData, PortfolioReportData, ReportConfig } from '../types/reportTypes';
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
    await new Promise(r => setTimeout(r, 150));

    notify("Loading financial information", 30);
    await new Promise(r => setTimeout(r, 150));

    notify("Building vector charts", 50);
    await new Promise(r => setTimeout(r, 150));

    notify("Calculating technical indicators", 70);
    
    // Compile data adapter
    const data = await ReportDataAdapter.compileCompanyReportData(symbol, quotes, recs);
    await new Promise(r => setTimeout(r, 150));

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
