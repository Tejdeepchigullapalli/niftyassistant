import axios from 'axios';
import { UserDataRepository, InvestmentState, Holding, UserAlert, SavedReport } from './UserDataRepository';

const API_BASE = 'http://localhost:8000/api';

// Axios instance with cookies credentials support
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

export class MongoUserDataRepository implements UserDataRepository {
  async getInvestmentState(): Promise<InvestmentState> {
    const res = await api.get('/company-state');
    const alertsRes = await api.get('/alerts');
    
    return {
      companyRecords: res.data.companyRecords || {},
      alerts: (alertsRes.data.alerts || []).reduce((acc: any, a: any) => {
        acc[a.id] = a;
        return acc;
      }, {})
    };
  }

  async setInterested(symbol: string): Promise<void> {
    await api.post('/company-state/interested', { symbol });
  }

  async clearInterest(symbol: string): Promise<void> {
    await api.post('/company-state/purchase/delete', { symbol });
  }

  async addToWatchlist(symbol: string): Promise<void> {
    await api.post('/company-state/watchlist', { symbol, watchlisted: true });
  }

  async removeFromWatchlist(symbol: string): Promise<void> {
    await api.post('/company-state/watchlist', { symbol, watchlisted: false });
  }

  async markPurchased(symbol: string, holding: Holding): Promise<void> {
    await api.post('/company-state/purchase', { symbol, holding });
  }

  async updatePurchasedHolding(symbol: string, holding: Holding): Promise<void> {
    await api.post('/company-state/purchase', { symbol, holding });
  }

  async removePurchased(symbol: string): Promise<void> {
    await api.post('/company-state/purchase/delete', { symbol });
  }

  async createAlert(alert: Omit<UserAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserAlert> {
    const res = await api.post('/alerts', alert);
    return res.data.alert;
  }

  async updateAlert(alertId: string, update: Partial<UserAlert>): Promise<UserAlert> {
    const res = await api.put(`/alerts/${alertId}`, update);
    return res.data.alert;
  }

  async deleteAlert(alertId: string): Promise<void> {
    await api.delete(`/alerts/${alertId}`);
  }

  async saveNote(symbol: string, note: string): Promise<void> {
    await api.post('/company-state/notes', { symbol, note });
  }

  async getReports(): Promise<SavedReport[]> {
    const res = await api.get('/reports');
    return res.data.reports || [];
  }

  async saveReport(
    metadata: Omit<SavedReport, 'id' | 'fileName' | 'generatedAt' | 'expiresAt'>,
    pdfBlob: Blob
  ): Promise<SavedReport> {
    const res = await api.post('/reports/upload', pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'x-report-metadata': JSON.stringify(metadata)
      }
    });
    return res.data.report;
  }

  async downloadReport(reportId: string, fileName: string): Promise<void> {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async deleteReport(reportId: string): Promise<void> {
    await api.delete(`/reports/${reportId}`);
  }
}
