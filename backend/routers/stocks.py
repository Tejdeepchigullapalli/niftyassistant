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
