import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from utils.constants import NIFTY_TOP_10, SYMBOL_MAP
import random
import time
from concurrent.futures import ThreadPoolExecutor

# In-memory thread-safe caches to prevent Yahoo Finance API rate limits and keep response times fast
_QUOTE_CACHE = {}  # symbol -> (timestamp, data)
_HISTORY_CACHE = {}  # (symbol, period) -> (timestamp, data)
CACHE_EXPIRY_SECONDS = 300  # 5 minutes cache expiration

def get_stock_quote(symbol: str) -> dict:
    """Fetch real-time stock quote from Yahoo Finance with caching."""
    now = time.time()
    if symbol in _QUOTE_CACHE:
        cached_time, cached_data = _QUOTE_CACHE[symbol]
        if now - cached_time < CACHE_EXPIRY_SECONDS:
            return cached_data

    company = SYMBOL_MAP.get(symbol)
    if not company:
        return {}
    try:
        ticker = yf.Ticker(company["nse_symbol"])
        info = ticker.info
        hist = ticker.history(period="2d")
        
        current_price = info.get("currentPrice") or info.get("regularMarketPrice")
        if current_price is None:
            # Fallback to history if info is missing price
            if not hist.empty:
                current_price = hist["Close"].iloc[-1]
            else:
                current_price = company.get("base_price", 1000)
                
        prev_close = info.get("previousClose")
        if prev_close is None:
            if not hist.empty and len(hist) > 1:
                prev_close = hist["Close"].iloc[-2]
            else:
                prev_close = current_price

        change = current_price - prev_close
        change_pct = (change / prev_close * 100) if prev_close else 0
        
        data = {
            "symbol": symbol,
            "name": company["name"],
            "sector": company["sector"],
            "current_price": round(current_price, 2),
            "previous_close": round(prev_close, 2),
            "change": round(change, 2),
            "change_pct": round(change_pct, 2),
            "open": info.get("open") or current_price,
            "high": info.get("dayHigh") or current_price,
            "low": info.get("dayLow") or current_price,
            "volume": info.get("volume") or 0,
            "market_cap": info.get("marketCap") or 0,
            "pe_ratio": info.get("trailingPE") or 0,
            "pb_ratio": info.get("priceToBook") or 0,
            "dividend_yield": info.get("dividendYield") or 0,
            "52w_high": info.get("fiftyTwoWeekHigh") or 0,
            "52w_low": info.get("fiftyTwoWeekLow") or 0,
            "avg_volume": info.get("averageVolume") or 0,
            "eps": info.get("trailingEps") or 0,
            "roe": info.get("returnOnEquity") or 0,
            "debt_equity": info.get("debtToEquity") or 0,
            "revenue_growth": info.get("revenueGrowth") or 0,
            "earnings_growth": info.get("earningsGrowth") or 0,
            "free_cashflow": info.get("freeCashflow") or 0,
            "timestamp": datetime.now().isoformat()
        }
        _QUOTE_CACHE[symbol] = (now, data)
        return data
    except Exception as e:
        # Fallback to mock data on error
        mock_data = _mock_stock_quote(symbol, company)
        _QUOTE_CACHE[symbol] = (now, mock_data)
        return mock_data


def _mock_stock_quote(symbol: str, company: dict) -> dict:
    """Fallback mock data if API fails."""
    price = company.get("base_price", 1000)
    change = random.uniform(-30, 30)
    return {
        "symbol": symbol,
        "name": company["name"],
        "sector": company["sector"],
        "current_price": round(price + change, 2),
        "previous_close": price,
        "change": round(change, 2),
        "change_pct": round(change / price * 100, 2),
        "open": round(price + random.uniform(-10, 10), 2),
        "high": round(price + abs(change) + random.uniform(5, 20), 2),
        "low": round(price - abs(change) - random.uniform(5, 20), 2),
        "volume": random.randint(1000000, 15000000),
        "market_cap": random.randint(500000000000, 20000000000000),
        "pe_ratio": round(random.uniform(15, 45), 2),
        "pb_ratio": round(random.uniform(1.5, 8), 2),
        "dividend_yield": round(random.uniform(0.005, 0.04), 4),
        "52w_high": round(price * 1.25, 2),
        "52w_low": round(price * 0.75, 2),
        "avg_volume": random.randint(5000000, 20000000),
        "eps": round(random.uniform(30, 150), 2),
        "roe": round(random.uniform(0.1, 0.35), 4),
        "debt_equity": round(random.uniform(0.1, 1.5), 2),
        "revenue_growth": round(random.uniform(0.05, 0.25), 4),
        "earnings_growth": round(random.uniform(0.05, 0.3), 4),
        "free_cashflow": random.randint(10000000000, 500000000000),
        "timestamp": datetime.now().isoformat()
    }


def get_historical_data(symbol: str, period: str = "1y") -> dict:
    """Fetch historical OHLCV data with caching."""
    now = time.time()
    cache_key = (symbol, period)
    if cache_key in _HISTORY_CACHE:
        cached_time, cached_data = _HISTORY_CACHE[cache_key]
        if now - cached_time < CACHE_EXPIRY_SECONDS:
            return cached_data

    company = SYMBOL_MAP.get(symbol)
    if not company:
        return {}
    try:
        ticker = yf.Ticker(company["nse_symbol"])
        hist = ticker.history(period=period)
        
        records = []
        for date, row in hist.iterrows():
            records.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": int(row["Volume"])
            })
        data = {"symbol": symbol, "period": period, "data": records}
        _HISTORY_CACHE[cache_key] = (now, data)
        return data
    except Exception as e:
        mock_data = _mock_historical_data(symbol, period)
        _HISTORY_CACHE[cache_key] = (now, mock_data)
        return mock_data


def _mock_historical_data(symbol: str, period: str) -> dict:
    company = SYMBOL_MAP.get(symbol, {})
    price = company.get("base_price", 1000)
    days = {"1mo": 30, "3mo": 90, "6mo": 180, "1y": 365, "2y": 730}
    num_days = days.get(period, 365)
    records = []
    current = price * 0.75
    end = datetime.now()
    start = end - timedelta(days=num_days)
    d = start
    while d <= end:
        if d.weekday() < 5:
            change = current * random.uniform(-0.025, 0.028)
            current = max(current + change, price * 0.5)
            records.append({
                "date": d.strftime("%Y-%m-%d"),
                "open": round(current - random.uniform(0, current*0.01), 2),
                "high": round(current + random.uniform(0, current*0.015), 2),
                "low": round(current - random.uniform(0, current*0.015), 2),
                "close": round(current, 2),
                "volume": random.randint(2000000, 20000000)
            })
        d += timedelta(days=1)
    return {"symbol": symbol, "period": period, "data": records}


def get_all_quotes() -> list:
    """Fetch quotes for all Nifty companies concurrently using ThreadPoolExecutor."""
    with ThreadPoolExecutor(max_workers=20) as executor:
        results = list(executor.map(lambda c: get_stock_quote(c["symbol"]), NIFTY_TOP_10))
    return results
