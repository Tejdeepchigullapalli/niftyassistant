import { MongoReport } from '../models/MongoReport';
import { deleteReportFromGridFS } from './gridFsReportService';
import { MongoAuditLog } from '../models/MongoAuditLog';

/**
 * Deletes expired reports (expiry older than now) and removes both the GridFS binary and metadata.
 */
export const runRetentionCleanup = async () => {
  try {
    const now = new Date();
    const expiredReports = await MongoReport.find({ expiresAt: { $lt: now } });
    
    if (expiredReports.length > 0) {
      console.log(`[Retention Service] Found ${expiredReports.length} expired reports. Initiating cleanup.`);
      
      for (const report of expiredReports) {
        try {
          await deleteReportFromGridFS(report.gridFsFileId);
        } catch (fsErr) {
          console.error(`[Retention Service] Failed to delete GridFS binary ${report.gridFsFileId}:`, fsErr);
        }
        await report.deleteOne();
      }

      const log = new MongoAuditLog({
        ownerKey: "system:cleanup",
        action: "AUTO_CLEANUP",
        details: `Deleted ${expiredReports.length} expired report binaries and metadata records.`
      });
      await log.save();
    }
  } catch (err) {
    console.error("[Retention Service] Retention cleanup failed:", err);
  }
};

/**
 * Enforces the 3-report limit per user. If the user already has 3 reports,
 * deletes the oldest report to make room for the incoming one.
 */
export const enforceMaxReportLimit = async (ownerKey: string) => {
  try {
    // Sort reports by generatedAt descending (newest first)
    const reports = await MongoReport.find({ ownerKey }).sort({ generatedAt: -1 });
    
    if (reports.length >= 3) {
      // If we have 3 or more reports, keep only the latest 2, delete the rest to make space
      const toDelete = reports.slice(2);
      
      for (const report of toDelete) {
        try {
          await deleteReportFromGridFS(report.gridFsFileId);
        } catch (fsErr) {
          console.error(`[Retention Service] Failed to delete GridFS binary ${report.gridFsFileId} during limit enforcement:`, fsErr);
        }
        await report.deleteOne();
        
        console.log(`[Retention Service] Enforced 3-report limit: deleted oldest report ${report._id} for owner ${ownerKey}`);
      }

      const log = new MongoAuditLog({
        ownerKey,
        action: "RETENTION_LIMIT_ENFORCED",
        details: `Enforced 3-report limit: deleted oldest report records.`
      });
      await log.save();
    }
  } catch (err) {
    console.error(`[Retention Service] Failed to enforce report limit for owner ${ownerKey}:`, err);
  }
};

/**
 * Starts daily retention interval checks
 */
export const startRetentionCron = () => {
  // Trigger cleanup immediately on startup
  setTimeout(() => {
    runRetentionCleanup();
  }, 5000);

  // Daily interval (24 hours)
  setInterval(() => {
    runRetentionCleanup();
  }, 24 * 60 * 60 * 1000);
};
