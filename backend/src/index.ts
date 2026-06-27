import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Load environment configurations
dotenv.config();

import emailAuthRoutes from './routes/emailAuthRoutes';
import companyStateRoutes from './routes/companyStateRoutes';
import alertRoutes from './routes/alertRoutes';
import reportRoutes from './routes/reportRoutes';
import { startRetentionCron } from './services/reportRetentionService';

const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/niftyai';
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8001';

// 1. CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-report-metadata']
}));

// 2. Cookie Parser
app.use(cookieParser());

// 3. FastAPI Proxy configuration for public market metrics
// Proxies public APIs to FastAPI running on Port 8001
const fastapiProxy = createProxyMiddleware({
  target: FASTAPI_URL,
  changeOrigin: true
});

app.use('/api/stocks', fastapiProxy);
app.use('/api/analysis', fastapiProxy);
app.use('/api/sentiment', fastapiProxy);
app.use('/api/recommendations', fastapiProxy);
app.use('/api/sector-comparison', fastapiProxy);

// 4. Express JSON parser (Specifically bypass raw routes like report uploads)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/reports/upload') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// 5. Register Express backend routes
app.use('/api/auth', emailAuthRoutes);
app.use('/api/company-state', companyStateRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);

// Base route checker
app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", mode: "production-node-express", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// 6. Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`[Database] MongoDB connected successfully to ${MONGODB_URI.split('@')[1] || MONGODB_URI}`);
    
    // Start retention check background process
    startRetentionCron();
    
    app.listen(PORT, () => {
      console.log(`[Server] Express authentication & proxy gateway running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[Database] Failed to connect to MongoDB:", err);
    process.exit(1);
  });
