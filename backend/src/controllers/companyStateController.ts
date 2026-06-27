import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/requireMongoAuth';
import { MongoCompanyState } from '../models/MongoCompanyState';

export const getCompanyStates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const records = await MongoCompanyState.find({ userId });
    
    // Transform list into a symbol-keyed map to match frontend shape
    const recordsMap: Record<string, any> = {};
    records.forEach(r => {
      recordsMap[r.symbol.toUpperCase().trim()] = {
        symbol: r.symbol,
        positionStatus: r.positionStatus,
        watchlisted: r.watchlisted,
        holding: r.holding ? {
          quantity: r.holding.quantity,
          averageBuyPrice: r.holding.averageBuyPrice,
          purchaseDate: r.holding.purchaseDate,
          notes: r.holding.notes
        } : undefined,
        notes: r.note,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      };
    });

    return res.json({ companyRecords: recordsMap });
  } catch (err) {
    console.error("Get company states error:", err);
    return res.status(500).json({ error: "Failed to retrieve user states" });
  }
};

export const updateWatchlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { symbol, watchlisted } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    const cleanSymbol = symbol.toUpperCase().trim();

    const record = await MongoCompanyState.findOneAndUpdate(
      { userId, symbol: cleanSymbol },
      { $set: { watchlisted: !!watchlisted } },
      { upsert: true, new: true }
    );

    // Garbage collect if state becomes empty
    if (record.positionStatus === 'none' && !record.watchlisted && !record.note) {
      await record.deleteOne();
      return res.json({ success: true, deleted: true });
    }

    return res.json({ success: true, record });
  } catch (err) {
    console.error("Update watchlist error:", err);
    return res.status(500).json({ error: "Failed to update watchlist status" });
  }
};

export const setInterested = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { symbol } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    const cleanSymbol = symbol.toUpperCase().trim();

    const record = await MongoCompanyState.findOneAndUpdate(
      { userId, symbol: cleanSymbol },
      { $set: { positionStatus: 'interested', holding: undefined } },
      { upsert: true, new: true }
    );

    return res.json({ success: true, record });
  } catch (err) {
    console.error("Set interested error:", err);
    return res.status(500).json({ error: "Failed to mark as interested" });
  }
};

export const markPurchased = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { symbol, holding } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!symbol || !holding) return res.status(400).json({ error: "Symbol and holding details are required" });

    const cleanSymbol = symbol.toUpperCase().trim();

    const record = await MongoCompanyState.findOneAndUpdate(
      { userId, symbol: cleanSymbol },
      { 
        $set: { 
          positionStatus: 'purchased', 
          holding: {
            quantity: Number(holding.quantity),
            averageBuyPrice: Number(holding.averageBuyPrice),
            purchaseDate: holding.purchaseDate,
            notes: holding.notes
          } 
        } 
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, record });
  } catch (err) {
    console.error("Mark purchased error:", err);
    return res.status(500).json({ error: "Failed to record holding" });
  }
};

export const removePurchased = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { symbol } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    const cleanSymbol = symbol.toUpperCase().trim();

    const record = await MongoCompanyState.findOne({ userId, symbol: cleanSymbol });
    if (record) {
      record.positionStatus = 'none';
      record.holding = undefined;
      await record.save();

      // Garbage collect if state becomes empty
      if (!record.watchlisted && !record.note) {
        await record.deleteOne();
        return res.json({ success: true, deleted: true });
      }
      return res.json({ success: true, record });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Remove purchased error:", err);
    return res.status(500).json({ error: "Failed to remove holding" });
  }
};

export const saveNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { symbol, note } = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    const cleanSymbol = symbol.toUpperCase().trim();

    const record = await MongoCompanyState.findOneAndUpdate(
      { userId, symbol: cleanSymbol },
      { $set: { note: note || '' } },
      { upsert: true, new: true }
    );

    // Garbage collect if state becomes empty
    if (record.positionStatus === 'none' && !record.watchlisted && !record.note) {
      await record.deleteOne();
      return res.json({ success: true, deleted: true });
    }

    return res.json({ success: true, record });
  } catch (err) {
    console.error("Save note error:", err);
    return res.status(500).json({ error: "Failed to save note" });
  }
};
