export type PositionStatus = "none" | "interested" | "purchased";

export interface Holding {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  purchaseDate: string;
  notes?: string;
}

export interface UserAlert {
  id: string;
  symbol?: string; // empty means general market alert
  type: string;
  targetValue?: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyUserRecord {
  symbol: string;
  positionStatus: PositionStatus;
  watchlisted: boolean;
  holding?: Holding;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentState {
  companyRecords: Record<string, CompanyUserRecord>;
  alerts: Record<string, UserAlert>;
}

export interface SavedReport {
  id: string;
  title: string;
  reportType: "company" | "portfolio";
  companySymbol?: string;
  includedSymbols: string[];
  fileName: string;
  pageCount?: number;
  reportSnapshotId: string;
  generatedAt: string;
  expiresAt: string;
}

export interface UserDataRepository {
  getInvestmentState(): Promise<InvestmentState>;

  setInterested(symbol: string): Promise<void>;
  clearInterest(symbol: string): Promise<void>;

  addToWatchlist(symbol: string): Promise<void>;
  removeFromWatchlist(symbol: string): Promise<void>;

  markPurchased(symbol: string, holding: Holding): Promise<void>;
  updatePurchasedHolding(symbol: string, holding: Holding): Promise<void>;
  removePurchased(symbol: string): Promise<void>;

  createAlert(alert: Omit<UserAlert, 'createdAt' | 'updatedAt'>): Promise<UserAlert>;
  updateAlert(alertId: string, update: Partial<UserAlert>): Promise<UserAlert>;
  deleteAlert(alertId: string): Promise<void>;

  saveNote(symbol: string, note: string): Promise<void>;

  getReports(): Promise<SavedReport[]>;
  saveReport(
    metadata: Omit<SavedReport, 'id' | 'fileName' | 'generatedAt' | 'expiresAt'>,
    pdfBlob: Blob
  ): Promise<SavedReport>;
  downloadReport(reportId: string, fileName: string): Promise<void>;
  deleteReport(reportId: string): Promise<void>;
}
