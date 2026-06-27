import { Response } from 'express';
import { AnyAuthRequest } from '../middleware/requireAnyAuth';
import { uploadReportToGridFS, downloadReportFromGridFS, deleteReportFromGridFS } from '../services/gridFsReportService';
import { enforceMaxReportLimit, runRetentionCleanup } from '../services/reportRetentionService';
import { MongoReport } from '../models/MongoReport';
import { MongoAuditLog } from '../models/MongoAuditLog';

const REPORT_LIMITS = {
  maxPdfSizeBytes: 4 * 1024 * 1024, // 4 MB
  reportRetentionDays: 30
};

export const uploadReport = async (req: AnyAuthRequest, res: Response) => {
  try {
    const owner = req.owner;
    if (!owner) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1. Validate content type & body existence
    if (req.headers['content-type'] !== 'application/pdf') {
      return res.status(400).json({ error: "Only application/pdf files are allowed" });
    }

    const pdfBuffer = req.body;
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
      return res.status(400).json({ error: "PDF content body is empty or invalid" });
    }

    // 2. Enforce file size limit
    if (pdfBuffer.length > REPORT_LIMITS.maxPdfSizeBytes) {
      return res.status(400).json({ error: "PDF size exceeds the free-tier limit of 4 MB" });
    }

    // 3. Parse and validate metadata from header
    const metadataHeader = req.headers['x-report-metadata'];
    if (!metadataHeader || typeof metadataHeader !== 'string') {
      return res.status(400).json({ error: "Missing x-report-metadata header" });
    }

    let parsedMeta: any;
    try {
      parsedMeta = JSON.parse(metadataHeader);
    } catch (parseErr) {
      return res.status(400).json({ error: "Invalid metadata header JSON format" });
    }

    const { title, reportType, companySymbol, includedSymbols, reportSnapshotId, pageCount } = parsedMeta;
    if (!title || !reportType || !reportSnapshotId || !Array.isArray(includedSymbols)) {
      return res.status(400).json({ error: "Missing required metadata parameters" });
    }

    const fileName = `${reportSnapshotId}-${Date.now()}.pdf`;

    // 4. Enforce free-tier limit of max 3 reports per user (removes the oldest if count is 3)
    await enforceMaxReportLimit(owner.ownerKey);

    // 5. Upload file buffer to GridFS
    const gridFsFileId = await uploadReportToGridFS(fileName, pdfBuffer);

    // 6. Save metadata record to MongoDB (MongoReport acts as the global registry linking to GridFS)
    const expiresAt = new Date(Date.now() + REPORT_LIMITS.reportRetentionDays * 24 * 60 * 60 * 1000);
    
    const reportDoc = new MongoReport({
      userId: owner.ownerType === "mongo-user" ? owner.ownerId : undefined,
      ownerKey: owner.ownerKey,
      title,
      reportType,
      companySymbol,
      includedSymbols,
      gridFsFileId,
      fileName,
      pageCount: pageCount ? Number(pageCount) : undefined,
      reportSnapshotId,
      expiresAt
    });

    await reportDoc.save();

    // 7. Log audit log
    const auditLog = new MongoAuditLog({
      userId: owner.ownerType === "mongo-user" ? owner.ownerId : undefined,
      ownerKey: owner.ownerKey,
      action: "REPORT_SAVE",
      details: `Saved ${reportType} report "${title}" (Size: ${(pdfBuffer.length / 1024).toFixed(1)} KB)`
    });
    await auditLog.save();

    return res.status(201).json({
      report: {
        id: reportDoc._id.toString(),
        title: reportDoc.title,
        reportType: reportDoc.reportType,
        companySymbol: reportDoc.companySymbol,
        includedSymbols: reportDoc.includedSymbols,
        fileName: reportDoc.fileName,
        pageCount: reportDoc.pageCount,
        reportSnapshotId: reportDoc.reportSnapshotId,
        generatedAt: reportDoc.generatedAt,
        expiresAt: reportDoc.expiresAt
      }
    });
  } catch (err: any) {
    console.error("Upload report error:", err);
    return res.status(500).json({ error: "Failed to upload and save report file" });
  }
};

export const downloadReport = async (req: AnyAuthRequest, res: Response) => {
  try {
    const owner = req.owner;
    if (!owner) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { reportId } = req.params;

    // Find the report record
    const report = await MongoReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Verify ownership
    if (report.ownerKey !== owner.ownerKey) {
      return res.status(403).json({ error: "Forbidden: You do not own this report" });
    }

    // Set download headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);

    // Stream PDF binary out of GridFS directly to the client response
    await downloadReportFromGridFS(report.gridFsFileId, res);

    // Log download event
    const auditLog = new MongoAuditLog({
      userId: owner.ownerType === "mongo-user" ? owner.ownerId : undefined,
      ownerKey: owner.ownerKey,
      action: "REPORT_DOWNLOAD",
      details: `Downloaded report: ${report.title}`
    });
    await auditLog.save();

  } catch (err: any) {
    console.error("Download report error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to download report file" });
    }
  }
};

export const deleteReport = async (req: AnyAuthRequest, res: Response) => {
  try {
    const owner = req.owner;
    if (!owner) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { reportId } = req.params;

    const report = await MongoReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (report.ownerKey !== owner.ownerKey) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete both GridFS chunks and metadata document
    try {
      await deleteReportFromGridFS(report.gridFsFileId);
    } catch (fsErr) {
      console.error(`Failed to delete GridFS file ${report.gridFsFileId}:`, fsErr);
    }

    await report.deleteOne();

    // Log deletion
    const auditLog = new MongoAuditLog({
      userId: owner.ownerType === "mongo-user" ? owner.ownerId : undefined,
      ownerKey: owner.ownerKey,
      action: "REPORT_DELETE",
      details: `Deleted report: ${report.title}`
    });
    await auditLog.save();

    // Trigger cleanup of any other expired files asynchronously
    runRetentionCleanup();

    return res.json({ success: true, message: "Report deleted successfully" });
  } catch (err: any) {
    console.error("Delete report error:", err);
    return res.status(500).json({ error: "Failed to delete report" });
  }
};

export const getUserReports = async (req: AnyAuthRequest, res: Response) => {
  try {
    const owner = req.owner;
    if (!owner) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get metadata records for this user
    const reports = await MongoReport.find({ ownerKey: owner.ownerKey }).sort({ generatedAt: -1 });
    
    return res.json({
      reports: reports.map(r => ({
        id: r._id.toString(),
        title: r.title,
        reportType: r.reportType,
        companySymbol: r.companySymbol,
        includedSymbols: r.includedSymbols,
        fileName: r.fileName,
        pageCount: r.pageCount,
        reportSnapshotId: r.reportSnapshotId,
        generatedAt: r.generatedAt,
        expiresAt: r.expiresAt
      }))
    });
  } catch (err: any) {
    console.error("Get reports error:", err);
    return res.status(500).json({ error: "Failed to retrieve user reports list" });
  }
};
