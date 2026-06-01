# 📈 Nifty AI Investment Assistant

An AI-powered stock market investment assistant for **Nifty Top 10** companies featuring real-time financial data, sentiment analysis, corporate strategy intelligence, and explainable AI recommendations.

## 🏢 Covered Companies

| # | Symbol | Company |
|---|--------|---------|
| 1 | RELIANCE | Reliance Industries Ltd |
| 2 | TCS | Tata Consultancy Services |
| 3 | HDFCBANK | HDFC Bank Ltd |
| 4 | BHARTIARTL | Bharti Airtel Ltd |
| 5 | ICICIBANK | ICICI Bank Ltd |
| 6 | INFY | Infosys Ltd |
| 7 | SBIN | State Bank of India |
| 8 | HINDUNILVR | Hindustan Unilever Ltd |
| 9 | ITC | ITC Ltd |
| 10 | LT | Larsen & Toubro Ltd |

## ✨ Features

- **Real-Time Stock Data** — Live prices, OHLCV, market cap via Yahoo Finance (NSE)
- **Financial Analysis** — P/E, ROE, D/E, revenue growth, EPS, cashflow scoring
- **Sentiment Analysis** — News sentiment scoring, market perception index
- **Corporate Intelligence** — Strategic goals, expansion plans, R&D, M&A tracking
- **Risk Assessment** — Volatility, leverage, valuation, growth risk scoring
- **AI Recommendations** — Strong Buy / Buy / Hold / Reduce / Sell with explainability
- **Portfolio View** — Top picks, sector allocation, diversification insights
- **Interactive Charts** — Price history, radar charts, score comparisons

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, Recharts |
| Backend | Python FastAPI, Uvicorn |
| Data | yfinance (Yahoo Finance / NSE), Pandas, NumPy |
| Analysis | Rule-based scoring engine + Scikit-learn ready |

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **npm** or **yarn**

---

### Option A: Automated Setup (Recommended)

**On Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**On Windows:**
```cmd
start.bat
```

---

### Option B: Manual Setup

#### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: http://localhost:8000  
API Docs (Swagger): http://localhost:8000/docs

#### 2. Start Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks/` | List all companies |
| GET | `/api/stocks/quotes` | All live quotes |
| GET | `/api/stocks/{symbol}/quote` | Single stock quote |
| GET | `/api/stocks/{symbol}/history?period=1y` | Price history |
| GET | `/api/analysis/{symbol}/financial` | Financial scores |
| GET | `/api/analysis/{symbol}/risk` | Risk assessment |
| GET | `/api/sentiment/{symbol}` | Sentiment analysis |
| GET | `/api/sentiment/{symbol}/corporate` | Corporate intelligence |
| GET | `/api/recommendations/{symbol}` | AI recommendation |
| GET | `/api/portfolio/overview` | Portfolio overview |

## 📊 Scoring Methodology

### AI Investment Score (0–100)
| Component | Weight | Source |
|-----------|--------|--------|
| Financial Score | 35% | P/E, ROE, D/E, growth, cashflow |
| Growth Score | 25% | Expansion plans, capex, corporate strategy |
| Sentiment Score | 20% | News sentiment, market perception |
| Risk Score | 20% | Volatility, leverage, valuation risk |

### Recommendation Thresholds
| Score | Recommendation |
|-------|---------------|
| 80–100 | Strong Buy |
| 65–79 | Buy |
| 50–64 | Hold |
| 35–49 | Reduce |
| 0–34 | Sell |

## ⚠️ Disclaimer

This tool is for **educational and research purposes only**. It does not constitute financial advice. Always consult a SEBI-registered investment advisor before making investment decisions.

---

*Data sourced from Yahoo Finance (NSE). Sentiment data is simulated for demonstration.*
