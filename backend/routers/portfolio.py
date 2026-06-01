from fastapi import APIRouter
from services.recommendation_service import get_portfolio_recommendation

router = APIRouter()

@router.get("/overview")
def portfolio_overview():
    return get_portfolio_recommendation()
