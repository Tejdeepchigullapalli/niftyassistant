from fastapi import APIRouter, HTTPException
from services.analysis_service import compute_financial_score, compute_risk_score

router = APIRouter()

@router.get("/{symbol}/financial")
def financial_analysis(symbol: str):
    symbol = symbol.upper()
    try:
        return compute_financial_score(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{symbol}/risk")
def risk_analysis(symbol: str):
    symbol = symbol.upper()
    try:
        return compute_risk_score(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
