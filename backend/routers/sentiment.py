from fastapi import APIRouter, HTTPException
from services.sentiment_service import get_sentiment, get_corporate_intelligence

router = APIRouter()

@router.get("/{symbol}")
def sentiment_analysis(symbol: str):
    symbol = symbol.upper()
    try:
        return get_sentiment(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{symbol}/corporate")
def corporate_intelligence(symbol: str):
    symbol = symbol.upper()
    try:
        return get_corporate_intelligence(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
