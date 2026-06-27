import mongoose, { Schema } from 'mongoose';

export interface IMongoAuditLog extends mongoose.Document {
  userId?: string;
  ownerKey: string;
  action: string;
  details: string;
  createdAt: Date;
}

const MongoAuditLogSchema = new Schema<IMongoAuditLog>({
  userId: { type: String, index: true },
  ownerKey: { type: String, required: true, index: true },
  action: { type: String, required: true },
  details: { type: String, required: true }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// TTL index to automatically expire audit logs after 90 days (60 * 60 * 24 * 90 seconds)
MongoAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const MongoAuditLog = mongoose.model<IMongoAuditLog>('MongoAuditLog', MongoAuditLogSchema, 'mongo_audit_logs');
