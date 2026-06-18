from fastapi import APIRouter, HTTPException
from services.stock_service import get_stock_quote, get_historical_data, get_all_quotes
from utils.constants import NIFTY_TOP_10

router = APIRouter()

@router.get("/")
def list_companies():
    return {"companies": NIFTY_TOP_10}

@router.get("/quotes")
def all_quotes():
    return {"quotes": get_all_quotes()}

@router.get("/market-status")
def market_status():
    from services.stock_service import get_ist_time, is_market_open
    ist_now = get_ist_time()
    
    is_open = is_market_open()
    is_weekend = ist_now.weekday() >= 5
    
    # 9:00 AM is 540 minutes, 9:08 AM is 548 minutes
    minutes_since_midnight = ist_now.hour * 60 + ist_now.minute
    is_pre_open = (not is_weekend) and (540 <= minutes_since_midnight <= 548)
    
    # 3:30 PM is 930 minutes, 4:00 PM is 960 minutes
    is_closing = (not is_weekend) and (930 < minutes_since_midnight <= 960)
    
    status_str = "Closed"
    if is_open:
        status_str = "Open"
    elif is_pre_open:
        status_str = "Pre-Open"
    elif is_closing:
        status_str = "Closing"
        
    return {
        "status": status_str,
        "is_open": is_open,
        "ist_time": ist_now.strftime("%Y-%m-%d %I:%M:%S %p"),
        "weekday": ist_now.strftime("%A")
    }

@router.get("/{symbol}/quote")
def stock_quote(symbol: str):
    symbol = symbol.upper()
    data = get_stock_quote(symbol)
    if not data:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    return data

@router.get("/{symbol}/history")
def stock_history(symbol: str, period: str = "1y"):
    symbol = symbol.upper()
    valid_periods = ["1mo", "3mo", "6mo", "1y", "2y"]
    if period not in valid_periods:
        raise HTTPException(status_code=400, detail=f"Period must be one of {valid_periods}")
    data = get_historical_data(symbol, period)
    if not data:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    return data
