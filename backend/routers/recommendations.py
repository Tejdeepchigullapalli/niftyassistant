from fastapi import APIRouter, HTTPException
from services.recommendation_service import generate_recommendation, get_portfolio_recommendation

router = APIRouter()

@router.get("/{symbol}")
def stock_recommendation(symbol: str):
    symbol = symbol.upper()
    try:
        return generate_recommendation(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def portfolio_recs():
    try:
        return get_portfolio_recommendation()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
