import { db, auth } from '../utils/firebase';
import { 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import axios from 'axios';
import { UserDataRepository, InvestmentState, Holding, UserAlert, SavedReport, CompanyUserRecord } from './UserDataRepository';

const API_BASE = 'http://localhost:8000/api';

export class FirebaseUserDataRepository implements UserDataRepository {
  private getUid(): string {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Google user is not signed in to Firebase");
    return uid;
  }

  private async getAuthHeaders() {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Authorization': `Bearer ${token || ''}`
    };
  }

  async getInvestmentState(): Promise<InvestmentState> {
    const uid = this.getUid();
    
    // 1. Fetch company states
    const statesSnap = await getDocs(collection(db, 'users', uid, 'companyStates'));
    const companyRecords: Record<string, CompanyUserRecord> = {};
    statesSnap.forEach(docSnap => {
      const data = docSnap.data();
      const symbol = docSnap.id.toUpperCase().trim();
      companyRecords[symbol] = {
        symbol,
        positionStatus: data.positionStatus || 'none',
        watchlisted: !!data.watchlisted,
        holding: data.holding ? {
          symbol,
          quantity: data.holding.quantity,
          averageBuyPrice: data.holding.averageBuyPrice,
          purchaseDate: data.holding.purchaseDate,
          notes: data.holding.notes
        } : undefined,
        notes: data.notes || data.note || undefined,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    // 2. Fetch alerts
    const alertsSnap = await getDocs(collection(db, 'users', uid, 'alerts'));
    const alerts: Record<string, UserAlert> = {};
    alertsSnap.forEach(docSnap => {
      const data = docSnap.data();
      alerts[docSnap.id] = {
        id: docSnap.id,
        symbol: data.symbol,
        type: data.type,
        targetValue: data.targetValue,
        enabled: !!data.enabled,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    return { companyRecords, alerts };
  }

  async setInterested(symbol: string): Promise<void> {
    const uid = this.getUid();
    const cleanSymbol = symbol.toUpperCase().trim();
    const docRef = doc(db, 'users', uid, 'companyStates', cleanSymbol);
    
    await setDoc(docRef, {
      positionStatus: 'interested',
      holding: null,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  async clearInterest(symbol: string): Promise<void> {
    const uid = this.getUid();
    const cleanSymbol = symbol.toUpperCase().trim();
    const docRef = doc(db, 'users', uid, 'companyStates', cleanSymbol);
    
    // Fetch doc to see if we can delete it
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (!data.watchlisted && !data.notes && !data.note) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, {
          positionStatus: 'none',
          holding: null,
          updatedAt: serverTimestamp()
        });
      }
    }
  }

  async addToWatchlist(symbol: string): Promise<void> {
    const uid = this.getUid();
    const cleanSymbol = symbol.toUpperCase().trim();
    const docRef = doc(db, 'users', uid, 'companyStates', cleanSymbol);
    
    await setDoc(docRef, {
      watchlisted: true,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  async removeFromWatchlist(symbol: string): Promise<void> {
    const uid = this.getUid();
    const cleanSymbol = symbol.toUpperCase().trim();
    const docRef = doc(db, 'users', uid, 'companyStates', cleanSymbol);
    
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if ((data.positionStatus === 'none' || !data.positionStatus) && !data.notes && !data.note) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, {
          watchlisted: false,
          updatedAt: serverTimestamp()
        });
      }
    }
  }

  async markPurchased(symbol: string, holding: Holding): Promise<void> {
    const uid = this.getUid();
    const cleanSymbol = symbol.toUpperCase().trim();
    const docRef = doc(db, 'users', uid, 'companyStates', cleanSymbol);
    
    await setDoc(docRef, {
      positionStatus: 'purchased',
      holding: {
        quantity: Number(holding.quantity),
        averageBuyPrice: Number(holding.averageBuyPrice),
        purchaseDate: holding.purchaseDate,
        notes: holding.notes || ''
      },
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  async updatePurchasedHolding(symbol: string, holding: Holding): Promise<void> {
    await this.markPurchased(symbol, holding);
  }

  async removePurchased(symbol: string): Promise<void> {
    await this.clearInterest(symbol);
  }

  async createAlert(alert: Omit<UserAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserAlert> {
    const uid = this.getUid();
    const alertId = `alert_${Date.now()}`;
    const docRef = doc(db, 'users', uid, 'alerts', alertId);
    
    const alertData = {
      symbol: alert.symbol || '',
      type: alert.type,
      targetValue: alert.targetValue !== undefined ? Number(alert.targetValue) : null,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(docRef, alertData);

    return {
      id: alertId,
      symbol: alertData.symbol,
      type: alertData.type,
      targetValue: alertData.targetValue !== null ? alertData.targetValue : undefined,
      enabled: alertData.enabled,
      createdAt: alertData.createdAt.toISOString(),
      updatedAt: alertData.updatedAt.toISOString()
    };
  }

  async updateAlert(alertId: string, update: Partial<UserAlert>): Promise<UserAlert> {
    const uid = this.getUid();
    const docRef = doc(db, 'users', uid, 'alerts', alertId);
    
    const updateData: any = {
      updatedAt: new Date()
    };
    if (update.enabled !== undefined) updateData.enabled = !!update.enabled;
    if (update.targetValue !== undefined) updateData.targetValue = Number(update.targetValue);

    await updateDoc(docRef, updateData);
    
    const snap = await getDoc(docRef);
    const data = snap.data() || {};

    return {
      id: alertId,
      symbol: data.symbol,
      type: data.type,
      targetValue: data.targetValue !== null ? data.targetValue : undefined,
      enabled: data.enabled,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async deleteAlert(alertId: string): Promise<void> {
    const uid = this.getUid();
    const docRef = doc(db, 'users', uid, 'alerts', alertId);
    await deleteDoc(docRef);
  }

  async saveNote(symbol: string, note: string): Promise<void> {
    const uid = this.getUid();
    const cleanSymbol = symbol.toUpperCase().trim();
    const docRef = doc(db, 'users', uid, 'companyStates', cleanSymbol);
    
    await setDoc(docRef, {
      notes: note || '',
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  async getReports(): Promise<SavedReport[]> {
    const uid = this.getUid();
    const snap = await getDocs(collection(db, 'users', uid, 'reports'));
    const reports: SavedReport[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      reports.push({
        id: docSnap.id,
        title: data.title,
        reportType: data.reportType,
        companySymbol: data.companySymbol,
        includedSymbols: data.includedSymbols || [],
        fileName: data.fileName,
        pageCount: data.pageCount,
        reportSnapshotId: data.reportSnapshotId,
        generatedAt: data.generatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    return reports;
  }

  async saveReport(
    metadata: Omit<SavedReport, 'id' | 'fileName' | 'generatedAt' | 'expiresAt'>,
    pdfBlob: Blob
  ): Promise<SavedReport> {
    const uid = this.getUid();
    const headers = await this.getAuthHeaders();

    // 1. Upload report binary to the Express backend (stored in MongoDB GridFS)
    const uploadRes = await axios.post(`${API_BASE}/reports/upload`, pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'x-report-metadata': JSON.stringify(metadata),
        ...headers
      }
    });

    const backendReport = uploadRes.data.report;

    // 2. Save metadata details to Firestore users/{uid}/reports/{reportId}
    const reportId = backendReport.id;
    const docRef = doc(db, 'users', uid, 'reports', reportId);

    const reportMeta = {
      title: backendReport.title,
      reportType: backendReport.reportType,
      companySymbol: backendReport.companySymbol || null,
      includedSymbols: backendReport.includedSymbols || [],
      backendReportId: backendReport.id,
      fileName: backendReport.fileName,
      pageCount: backendReport.pageCount || null,
      reportSnapshotId: backendReport.reportSnapshotId,
      generatedAt: new Date(backendReport.generatedAt),
      expiresAt: new Date(backendReport.expiresAt)
    };

    await setDoc(docRef, reportMeta);

    // 3. Keep latest 3 report metadata in Firestore (clean up old ones in Firestore as well)
    const reportsSnap = await getDocs(collection(db, 'users', uid, 'reports'));
    const allReports: any[] = [];
    reportsSnap.forEach(d => allReports.push({ id: d.id, ...d.data() }));
    // Sort descending by generatedAt
    allReports.sort((a, b) => b.generatedAt.toDate() - a.generatedAt.toDate());
    
    if (allReports.length > 3) {
      const toDelete = allReports.slice(3);
      for (const dRecord of toDelete) {
        // Delete Firestore metadata
        await deleteDoc(doc(db, 'users', uid, 'reports', dRecord.id));
        // Delete backend GridFS copy if not already deleted by the backend enforce limit (backend also deletes on post upload if count >= 3)
        try {
          await axios.delete(`${API_BASE}/reports/${dRecord.backendReportId}`, { headers });
        } catch (err) {
          // Might have already been auto-deleted by backend, ignore
        }
      }
    }

    return {
      id: reportId,
      title: reportMeta.title,
      reportType: reportMeta.reportType,
      companySymbol: reportMeta.companySymbol || undefined,
      includedSymbols: reportMeta.includedSymbols,
      fileName: reportMeta.fileName,
      pageCount: reportMeta.pageCount || undefined,
      reportSnapshotId: reportMeta.reportSnapshotId,
      generatedAt: reportMeta.generatedAt.toISOString(),
      expiresAt: reportMeta.expiresAt.toISOString()
    };
  }

  async downloadReport(reportId: string, fileName: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    // Google users download from Express GridFS download endpoint using Firebase credentials
    const response = await axios.get(`${API_BASE}/reports/${reportId}/download`, {
      headers,
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
    const uid = this.getUid();
    const headers = await this.getAuthHeaders();

    // 1. Delete from Firestore
    await deleteDoc(doc(db, 'users', uid, 'reports', reportId));

    // 2. Delete from GridFS via backend Express API
    await axios.delete(`${API_BASE}/reports/${reportId}`, { headers });
  }
}
