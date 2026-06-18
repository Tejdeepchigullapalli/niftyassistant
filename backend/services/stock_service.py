import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from utils.constants import NIFTY_TOP_10, SYMBOL_MAP
import random
import time
import math
from concurrent.futures import ThreadPoolExecutor

def get_ist_time() -> datetime:
    """India Standard Time (IST) is always UTC + 5:30. India has no DST."""
    return datetime.utcnow() + timedelta(hours=5, minutes=30)

def stable_hash(s: str) -> int:
    """Returns a stable 32-bit integer hash for a string to prevent Python 3 hash randomization issues."""
    import hashlib
    return int(hashlib.md5(s.encode('utf-8')).hexdigest(), 16) & 0xffffffff

def is_market_open() -> bool:
    """Returns True if the current time in IST is Monday-Friday, between 9:15 AM and 3:30 PM."""
    ist_now = get_ist_time()
    # Monday is 0, Sunday is 6
    if ist_now.weekday() >= 5:
        return False
    
    # 9:15 is 9*60 + 15 = 555 minutes
    # 15:30 is 15*60 + 30 = 930 minutes
    minutes_since_midnight = ist_now.hour * 60 + ist_now.minute
    return 555 <= minutes_since_midnight <= 930

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
    """Deterministic simulation of stock quotes depending on market open/closed status."""
    price = company.get("base_price", 1000)
    ist_now = get_ist_time()
    
    # 1. Determine the effective trading day
    # If it is Saturday/Sunday, the effective trading day is the previous Friday
    # If it is Monday-Friday:
    # - If before 9:15 AM, the effective trading day is the previous trading day
    # - If after 9:15 AM, the effective trading day is today
    
    is_weekend = ist_now.weekday() >= 5
    is_before_open = (ist_now.hour * 60 + ist_now.minute) < 555  # 9:15 AM is 555 mins
    
    if is_weekend or (ist_now.weekday() < 5 and is_before_open):
        # We need the previous trading date
        effective_date = ist_now - timedelta(days=1)
        if is_weekend:
            days_to_subtract = 1 if ist_now.weekday() == 5 else 2
            effective_date = ist_now - timedelta(days=days_to_subtract)
        else:
            if ist_now.weekday() == 0:  # Monday
                effective_date = ist_now - timedelta(days=3)  # go back to Friday
            else:
                effective_date = ist_now - timedelta(days=1)
        
        # Market is closed, freeze at the closing price of the effective date
        date_str = effective_date.strftime("%Y-%m-%d")
        
        # Calculate deterministic open and close prices for the effective date
        seed_open = stable_hash(symbol + date_str + "open") % (2**32)
        random.seed(seed_open)
        open_pct = random.uniform(-0.015, 0.015)
        open_price = price * (1 + open_pct)
        
        seed_close = stable_hash(symbol + date_str + "close") % (2**32)
        random.seed(seed_close)
        close_pct = random.uniform(-0.02, 0.025)
        current_price = open_price * (1 + close_pct)
        
        # Reset seed
        random.seed()
        
        change = current_price - price
        change_pct = (change / price) * 100
        
        open_val = open_price
        high_val = max(open_price, current_price) * 1.01
        low_val = min(open_price, current_price) * 0.99
    
    else:
        # Market day is today!
        date_str = ist_now.strftime("%Y-%m-%d")
        
        # Calculate deterministic open price for today
        seed_open = stable_hash(symbol + date_str + "open") % (2**32)
        random.seed(seed_open)
        open_pct = random.uniform(-0.015, 0.015)
        open_price = price * (1 + open_pct)
        
        # Calculate deterministic close price for today
        seed_close = stable_hash(symbol + date_str + "close") % (2**32)
        random.seed(seed_close)
        close_pct = random.uniform(-0.02, 0.025)
        close_price = open_price * (1 + close_pct)
        
        # Reset seed
        random.seed()
        
        # Check if market is currently open
        is_open = is_market_open()
        
        if is_open:
            # Calculate interpolation ratio based on current time
            # 9:15 AM (555 minutes) to 3:30 PM (930 minutes)
            total_seconds = (930 - 555) * 60  # 22500 seconds
            current_seconds = (ist_now.hour * 60 + ist_now.minute) * 60 + ist_now.second - (555 * 60)
            ratio = max(0.0, min(1.0, current_seconds / total_seconds))
            
            # Interpolated base price
            int_price = open_price + (close_price - open_price) * ratio
            
            # Intraday waves (up to 0.4% up/down, dynamically moving every second)
            wave = math.sin(current_seconds / 150.0) * 0.003 + math.cos(current_seconds / 600.0) * 0.002
            current_price = int_price * (1 + wave)
        else:
            # Market is closed (after 3:30 PM), freeze at close_price
            current_price = close_price
            
        change = current_price - price
        change_pct = (change / price) * 100
        
        open_val = open_price
        high_val = max(open_price, current_price) * 1.012
        low_val = min(open_price, current_price) * 0.988

    # Ensure logical consistency
    high_val = max(high_val, open_val, current_price)
    low_val = min(low_val, open_val, current_price)

    return {
        "symbol": symbol,
        "name": company["name"],
        "sector": company["sector"],
        "current_price": round(current_price, 2),
        "previous_close": round(price, 2),
        "change": round(change, 2),
        "change_pct": round(change_pct, 2),
        "open": round(open_val, 2),
        "high": round(high_val, 2),
        "low": round(low_val, 2),
        "volume": random.randint(1000000, 15000000) if is_market_open() else 2500000,
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
