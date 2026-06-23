from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stocks, analysis, sentiment, portfolio, recommendations

app = FastAPI(
    title="Nifty Investment Assistant API",
    description="AI-Powered Stock Market Investment Assistant for Nifty Top 10",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(sentiment.router, prefix="/api/sentiment", tags=["Sentiment"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])

@app.get("/")
def root():
    return {"message": "Nifty Investment Assistant API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

from fastapi import Query
from datetime import datetime
from services.stock_service import get_stock_quote, get_historical_data
from services.recommendation_service import generate_recommendation
from utils.constants import NIFTY_TOP_10

RELATED_COMPARISON_GROUPS = {
    "RELIANCE": ["ONGC", "NTPC", "POWERGRID", "COALINDIA", "ADANIENT", "GRASIM"]
}

@app.get("/api/sector-comparison")
def get_sector_comparison(symbol: str = Query(..., description="The symbol of the baseline company")):
    symbol = symbol.upper().strip()
    
    # Find baseline company
    baseline = next((c for c in NIFTY_TOP_10 if c["symbol"] == symbol), None)
    if not baseline:
        return {"error": f"Symbol {symbol} not found in Nifty universe"}

    sector = baseline["sector"]
    industry = baseline["industry"]

    # Determine target comparison symbols list
    if symbol == "RELIANCE":
        compare_symbols = ["RELIANCE"] + RELATED_COMPARISON_GROUPS["RELIANCE"]
    else:
        # Sector peers
        peers = [c["symbol"] for c in NIFTY_TOP_10 if c["sector"] == sector and c["symbol"] != symbol]
        compare_symbols = [symbol] + peers

    # Batch fetch quotes, recommendations, and calculate returns
    companies_data = []
    
    for sym in compare_symbols:
        meta = next((c for c in NIFTY_TOP_10 if c["symbol"] == sym), None)
        if not meta:
            continue
            
        quote = get_stock_quote(sym)
        rec = generate_recommendation(sym)
        
        # Calculate multi-period returns
        ret_1w, ret_1m, ret_1y = None, None, None
        try:
            history = get_historical_data(sym, "1y")
            if history and "data" in history and history["data"]:
                data = history["data"]
                current_price = quote.get("current_price") or meta.get("base_price", 100)
                
                close_1y = data[0]["close"] if len(data) > 0 else None
                close_1m = data[-21]["close"] if len(data) >= 21 else (data[0]["close"] if len(data) > 0 else None)
                close_1w = data[-6]["close"] if len(data) >= 6 else (data[0]["close"] if len(data) > 0 else None)
                
                if close_1w:
                    ret_1w = round(((current_price - close_1w) / close_1w) * 100, 2)
                if close_1m:
                    ret_1m = round(((current_price - close_1m) / close_1m) * 100, 2)
                if close_1y:
                    ret_1y = round(((current_price - close_1y) / close_1y) * 100, 2)
        except Exception as e:
            print(f"Error calculating returns for {sym}: {e}")

        companies_data.append({
            "symbol": sym,
            "name": meta["name"],
            "sector": meta["sector"],
            "industry": meta["industry"],
            "currentPrice": quote.get("current_price"),
            "changePct": quote.get("change_pct"),
            "marketCap": quote.get("market_cap"),
            "peRatio": quote.get("pe_ratio"),
            "pbRatio": quote.get("pb_ratio"),
            "roe": quote.get("roe"),
            "revenueGrowth": quote.get("revenue_growth"),
            "aiScore": rec.get("ai_investment_score"),
            "recommendation": rec.get("recommendation"),
            "return1W": ret_1w,
            "return1M": ret_1m,
            "return1Y": ret_1y
        })

    return {
        "selectedSymbol": symbol,
        "sector": sector,
        "industry": industry,
        "companies": companies_data,
        "lastQuoteUpdated": datetime.now().strftime("%I:%M %p"),
        "lastFundamentalUpdated": "latest available"
    }
