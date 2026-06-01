from services.analysis_service import compute_financial_score, compute_risk_score
from services.sentiment_service import get_sentiment, get_corporate_intelligence
from utils.constants import SYMBOL_MAP

RECOMMENDATION_THRESHOLDS = {
    "Strong Buy":  (80, 100),
    "Buy":         (65, 79),
    "Hold":        (50, 64),
    "Reduce":      (35, 49),
    "Sell":        (0, 34),
}

def generate_recommendation(symbol: str) -> dict:
    """Generate AI investment recommendation for a company."""
    company = SYMBOL_MAP.get(symbol)
    if not company:
        return {}

    financial = compute_financial_score(symbol)
    risk = compute_risk_score(symbol)
    sentiment = get_sentiment(symbol)
    corporate = get_corporate_intelligence(symbol)

    fin_score = financial["overall_financial_score"]
    risk_score = risk["risk_score"]
    sentiment_score = sentiment["market_perception_index"]
    growth_score = corporate["growth_potential_score"]

    # Weighted AI Investment Score
    ai_score = round(
        fin_score * 0.35 +
        growth_score * 0.25 +
        sentiment_score * 0.20 +
        risk_score * 0.20
    )

    # Determine recommendation
    recommendation = "Hold"
    for rec, (low, high) in RECOMMENDATION_THRESHOLDS.items():
        if low <= ai_score <= high:
            recommendation = rec
            break

    # Generate supporting rationale
    supporting_factors = []
    risk_flags = []

    if fin_score >= 70:
        supporting_factors.append(f"Strong fundamentals with financial score of {fin_score}/100")
    if growth_score >= 75:
        supporting_factors.append(f"High growth potential ({growth_score}/100) backed by strategic expansion plans")
    if sentiment_score >= 65:
        supporting_factors.append(f"Positive market sentiment index of {sentiment_score}/100")
    if risk_score >= 70:
        supporting_factors.append(f"Low risk profile with risk score of {risk_score}/100")

    metrics = financial["metrics"]
    if metrics["roe_pct"] > 18:
        supporting_factors.append(f"Excellent ROE of {metrics['roe_pct']}% indicating efficient capital use")
    if metrics["revenue_growth_pct"] > 10:
        supporting_factors.append(f"Revenue growing at {metrics['revenue_growth_pct']}% YoY")
    if metrics["pe_ratio"] < 25:
        supporting_factors.append(f"Attractive valuation at P/E of {metrics['pe_ratio']:.1f}")

    for rf in risk["risk_factors"]:
        risk_flags.append(f"{rf['factor']} ({rf['impact']} impact): {rf['detail']}")

    # Analyst target price estimate
    from services.stock_service import get_stock_quote
    quote = get_stock_quote(symbol)
    current_price = quote.get("current_price", 1000)
    
    upside_factors = {
        "Strong Buy": 0.22, "Buy": 0.14, "Hold": 0.05,
        "Reduce": -0.08, "Sell": -0.18
    }
    upside = upside_factors.get(recommendation, 0.05)
    target_price = round(current_price * (1 + upside), 2)
    upside_pct = round(upside * 100, 1)

    return {
        "symbol": symbol,
        "name": company["name"],
        "sector": company["sector"],
        "current_price": current_price,
        "target_price": target_price,
        "upside_pct": upside_pct,
        "recommendation": recommendation,
        "ai_investment_score": ai_score,
        "score_components": {
            "financial_score": fin_score,
            "growth_score": growth_score,
            "sentiment_score": sentiment_score,
            "risk_score": risk_score
        },
        "supporting_factors": supporting_factors[:5],
        "risk_flags": risk_flags[:4],
        "score_weights": {
            "financial": "35%",
            "growth": "25%",
            "sentiment": "20%",
            "risk": "20%"
        }
    }


def get_portfolio_recommendation(symbols: list = None) -> dict:
    """Generate portfolio-level recommendation."""
    from utils.constants import NIFTY_TOP_10
    if not symbols:
        symbols = [c["symbol"] for c in NIFTY_TOP_10]
    
    recs = [generate_recommendation(s) for s in symbols]
    recs.sort(key=lambda x: x.get("ai_investment_score", 0), reverse=True)

    top_picks = [r for r in recs if r["recommendation"] in ["Strong Buy", "Buy"]][:3]
    hold_picks = [r for r in recs if r["recommendation"] == "Hold"]
    avoid = [r for r in recs if r["recommendation"] in ["Reduce", "Sell"]]

    # Sector allocation
    sector_alloc = {}
    for r in top_picks:
        sector = r.get("sector", "Unknown")
        sector_alloc[sector] = sector_alloc.get(sector, 0) + 1

    return {
        "total_analyzed": len(recs),
        "top_picks": top_picks,
        "hold_picks": hold_picks,
        "avoid": avoid,
        "sector_allocation": sector_alloc,
        "portfolio_avg_score": round(sum(r["ai_investment_score"] for r in recs) / len(recs)),
        "all_recommendations": recs
    }
