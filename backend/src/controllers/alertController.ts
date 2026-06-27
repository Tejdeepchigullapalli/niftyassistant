import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/requireMongoAuth';
import { MongoAlert } from '../models/MongoAlert';

export const getAlerts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const alerts = await MongoAlert.find({ userId });
    return res.json({ alerts: alerts.map(a => ({
      id: a._id.toString(),
      symbol: a.symbol,
      type: a.type,
      targetValue: a.targetValue,
      enabled: a.enabled,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    })) });
  } catch (err) {
    console.error("Get alerts error:", err);
    return res.status(500).json({ error: "Failed to retrieve alerts" });
  }
};

export const createAlert = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { symbol, type, targetValue } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!type) return res.status(400).json({ error: "Alert type is required" });

    const alert = new MongoAlert({
      userId,
      symbol: symbol ? symbol.toUpperCase().trim() : undefined,
      type,
      targetValue: targetValue !== undefined ? Number(targetValue) : undefined,
      enabled: true
    });

    await alert.save();

    return res.status(201).json({
      alert: {
        id: alert._id.toString(),
        symbol: alert.symbol,
        type: alert.type,
        targetValue: alert.targetValue,
        enabled: alert.enabled,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt
      }
    });
  } catch (err) {
    console.error("Create alert error:", err);
    return res.status(500).json({ error: "Failed to create alert" });
  }
};

export const updateAlert = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { enabled, targetValue } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const alert = await MongoAlert.findOne({ _id: id, userId });
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    if (enabled !== undefined) alert.enabled = !!enabled;
    if (targetValue !== undefined) alert.targetValue = Number(targetValue);

    await alert.save();

    return res.json({
      alert: {
        id: alert._id.toString(),
        symbol: alert.symbol,
        type: alert.type,
        targetValue: alert.targetValue,
        enabled: alert.enabled,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt
      }
    });
  } catch (err) {
    console.error("Update alert error:", err);
    return res.status(500).json({ error: "Failed to update alert" });
  }
};

export const deleteAlert = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const alert = await MongoAlert.findOne({ _id: id, userId });
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    await alert.deleteOne();
    return res.json({ success: true, message: "Alert deleted successfully" });
  } catch (err) {
    console.error("Delete alert error:", err);
    return res.status(500).json({ error: "Failed to delete alert" });
  }
};
