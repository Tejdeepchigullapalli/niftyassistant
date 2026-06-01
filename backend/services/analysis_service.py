import numpy as np
from services.stock_service import get_stock_quote, get_historical_data
import random

def compute_financial_score(symbol: str) -> dict:
    """Compute fundamental analysis scores for a company."""
    quote = get_stock_quote(symbol)
    
    scores = {}
    
    # P/E Score (lower is better for value)
    pe = quote.get("pe_ratio", 25)
    if pe and pe > 0:
        if pe < 15:
            scores["valuation"] = 90
        elif pe < 25:
            scores["valuation"] = 75
        elif pe < 35:
            scores["valuation"] = 55
        elif pe < 50:
            scores["valuation"] = 35
        else:
            scores["valuation"] = 20
    else:
        scores["valuation"] = 50

    # ROE Score
    roe = quote.get("roe", 0.15) or 0.15
    if roe > 0.25:
        scores["profitability"] = 90
    elif roe > 0.18:
        scores["profitability"] = 75
    elif roe > 0.12:
        scores["profitability"] = 60
    elif roe > 0.08:
        scores["profitability"] = 45
    else:
        scores["profitability"] = 25

    # Revenue Growth Score
    rev_growth = quote.get("revenue_growth", 0.1) or 0.1
    if rev_growth > 0.2:
        scores["growth"] = 92
    elif rev_growth > 0.12:
        scores["growth"] = 78
    elif rev_growth > 0.06:
        scores["growth"] = 62
    elif rev_growth > 0:
        scores["growth"] = 45
    else:
        scores["growth"] = 20

    # Debt/Equity Score (lower is better)
    de = quote.get("debt_equity", 0.5) or 0.5
    if de < 0.3:
        scores["financial_health"] = 92
    elif de < 0.6:
        scores["financial_health"] = 75
    elif de < 1.0:
        scores["financial_health"] = 55
    elif de < 1.5:
        scores["financial_health"] = 35
    else:
        scores["financial_health"] = 18

    # FCF Score
    fcf = quote.get("free_cashflow", 0) or 0
    if fcf > 100_000_000_000:
        scores["cashflow"] = 90
    elif fcf > 30_000_000_000:
        scores["cashflow"] = 72
    elif fcf > 10_000_000_000:
        scores["cashflow"] = 55
    elif fcf > 0:
        scores["cashflow"] = 40
    else:
        scores["cashflow"] = 20

    # Earnings Growth Score
    eg = quote.get("earnings_growth", 0.1) or 0.1
    if eg > 0.25:
        scores["earnings_quality"] = 90
    elif eg > 0.15:
        scores["earnings_quality"] = 74
    elif eg > 0.08:
        scores["earnings_quality"] = 58
    elif eg > 0:
        scores["earnings_quality"] = 40
    else:
        scores["earnings_quality"] = 20

    # 52-week position score
    high = quote.get("52w_high", 1) or 1
    low = quote.get("52w_low", 0) or 0
    current = quote.get("current_price", (high+low)/2)
    range_pct = (current - low) / (high - low) if (high - low) > 0 else 0.5
    # Sweet spot: 40-70% of 52w range
    if 0.4 <= range_pct <= 0.7:
        scores["price_momentum"] = 80
    elif range_pct < 0.4:
        scores["price_momentum"] = 65 + range_pct * 30  # oversold
    else:
        scores["price_momentum"] = 60 - (range_pct - 0.7) * 40  # overbought

    overall = round(
        scores["valuation"] * 0.15 +
        scores["profitability"] * 0.20 +
        scores["growth"] * 0.20 +
        scores["financial_health"] * 0.15 +
        scores["cashflow"] * 0.10 +
        scores["earnings_quality"] * 0.10 +
        scores["price_momentum"] * 0.10
    )

    return {
        "symbol": symbol,
        "scores": {k: round(v) for k, v in scores.items()},
        "overall_financial_score": overall,
        "metrics": {
            "pe_ratio": pe,
            "roe_pct": round(roe * 100, 2),
            "revenue_growth_pct": round(rev_growth * 100, 2),
            "debt_equity": de,
            "earnings_growth_pct": round(eg * 100, 2),
            "52w_range_position": round(range_pct * 100, 1)
        }
    }


def compute_risk_score(symbol: str) -> dict:
    """Compute risk score for a company."""
    quote = get_stock_quote(symbol)
    hist = get_historical_data(symbol, "1y")
    
    risk_factors = []
    risk_score = 100  # start perfect, deduct

    # Volatility from historical data
    if hist.get("data"):
        closes = [d["close"] for d in hist["data"]]
        if len(closes) > 20:
            returns = [abs((closes[i] - closes[i-1]) / closes[i-1]) for i in range(1, len(closes))]
            avg_daily_move = np.mean(returns) * 100
            if avg_daily_move > 2.5:
                risk_score -= 20
                risk_factors.append({"factor": "High Volatility", "impact": "High", "detail": f"Average daily move: {avg_daily_move:.1f}%"})
            elif avg_daily_move > 1.5:
                risk_score -= 10
                risk_factors.append({"factor": "Moderate Volatility", "impact": "Medium", "detail": f"Average daily move: {avg_daily_move:.1f}%"})

    # Debt risk
    de = quote.get("debt_equity", 0.5) or 0.5
    if de > 1.5:
        risk_score -= 20
        risk_factors.append({"factor": "High Leverage", "impact": "High", "detail": f"Debt/Equity: {de:.2f}"})
    elif de > 0.8:
        risk_score -= 10
        risk_factors.append({"factor": "Moderate Leverage", "impact": "Medium", "detail": f"Debt/Equity: {de:.2f}"})

    # Valuation risk
    pe = quote.get("pe_ratio", 25) or 25
    if pe > 50:
        risk_score -= 15
        risk_factors.append({"factor": "High Valuation", "impact": "Medium", "detail": f"P/E: {pe:.1f}"})

    # Negative revenue growth
    rev = quote.get("revenue_growth", 0.1) or 0.1
    if rev < 0:
        risk_score -= 20
        risk_factors.append({"factor": "Revenue Decline", "impact": "High", "detail": f"Revenue growth: {rev*100:.1f}%"})
    elif rev < 0.03:
        risk_score -= 10
        risk_factors.append({"factor": "Slow Revenue Growth", "impact": "Medium", "detail": f"Revenue growth: {rev*100:.1f}%"})

    risk_score = max(10, risk_score)
    
    if risk_score >= 75:
        risk_level = "Low"
    elif risk_score >= 55:
        risk_level = "Moderate"
    elif risk_score >= 35:
        risk_level = "High"
    else:
        risk_level = "Very High"

    return {
        "symbol": symbol,
        "risk_score": round(risk_score),
        "risk_level": risk_level,
        "risk_factors": risk_factors
    }
