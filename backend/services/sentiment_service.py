import random
from datetime import datetime, timedelta
from utils.constants import SYMBOL_MAP

# Simulated news templates for each company
NEWS_TEMPLATES = {
    "RELIANCE": [
        ("Reliance Jio reports record subscriber additions in Q3", "positive", 0.82),
        ("Reliance Retail expands to 200 new cities across India", "positive", 0.78),
        ("RIL announces mega green energy investment of ₹75,000 Cr", "positive", 0.88),
        ("Mukesh Ambani outlines New Energy vision at AGM", "positive", 0.74),
        ("Reliance O2C segment faces margin pressure on crude volatility", "negative", -0.45),
    ],
    "TCS": [
        ("TCS wins $500M multi-year deal from European banking consortium", "positive", 0.89),
        ("TCS Q3 revenue crosses ₹60,000 Cr, beats analyst estimates", "positive", 0.84),
        ("TCS expands AI Centre of Excellence with 10,000 new hires", "positive", 0.76),
        ("TCS attrition rate falls to 12.5%, lowest in 6 quarters", "positive", 0.71),
        ("TCS sees slowdown in BFSI vertical amid global rate concerns", "negative", -0.52),
    ],
    "HDFCBANK": [
        ("HDFC Bank reports 18% PAT growth in Q3 FY25", "positive", 0.83),
        ("HDFC Bank digital transactions up 45% YoY", "positive", 0.77),
        ("HDFC Bank opens 200 new branches in semi-urban India", "positive", 0.68),
        ("HDFC Bank NIM compression concerns post merger integration", "negative", -0.48),
        ("HDFC Bank launches AI-powered credit scoring platform", "positive", 0.72),
    ],
    "BHARTIARTL": [
        ("Airtel adds 4.2M subscribers, regains #2 position in 5G", "positive", 0.81),
        ("Airtel Africa revenue grows 22% in constant currency", "positive", 0.79),
        ("Airtel Business wins large enterprise cloud contracts", "positive", 0.75),
        ("Airtel ARPU rises to ₹208, highest ever", "positive", 0.86),
        ("Spectrum acquisition costs weigh on Airtel FCF", "negative", -0.42),
    ],
    "ICICIBANK": [
        ("ICICI Bank loan book grows 18% YoY, asset quality improves", "positive", 0.84),
        ("ICICI Bank iMobile app crosses 10 crore downloads", "positive", 0.72),
        ("ICICI Bank wins 'Best Digital Bank' award 2024", "positive", 0.65),
        ("ICICI Bank ROE reaches all-time high of 18.5%", "positive", 0.88),
        ("ICICI Bank retail credit growth faces headwinds", "negative", -0.38),
    ],
    "INFY": [
        ("Infosys raises FY25 revenue guidance to 4.5-5% growth", "positive", 0.80),
        ("Infosys wins $1.5B deal from US financial services firm", "positive", 0.91),
        ("Infosys Cobalt cloud platform sees 60% adoption surge", "positive", 0.74),
        ("Infosys cuts workforce by 3,000 amid automation push", "negative", -0.61),
        ("Infosys announces ₹9,600 Cr buyback program", "positive", 0.77),
    ],
    "SBIN": [
        ("SBI posts record quarterly profit of ₹18,000 Cr", "positive", 0.86),
        ("SBI YONO crosses 7 crore daily active users", "positive", 0.73),
        ("SBI NPA ratio falls to lowest in 10 years", "positive", 0.88),
        ("SBI home loan book grows 15% on affordable housing push", "positive", 0.71),
        ("SBI pension liabilities to impact balance sheet", "negative", -0.44),
    ],
    "HINDUNILVR": [
        ("HUL launches premium skincare range under POND'S", "positive", 0.68),
        ("HUL rural volume growth recovers to 5% in Q3", "positive", 0.72),
        ("HUL price-led revenue growth as commodity tailwinds persist", "positive", 0.74),
        ("HUL faces intense competition in detergent segment from Jyothy Labs", "negative", -0.52),
        ("HUL announces ₹3,200 Cr capex for capacity expansion", "positive", 0.66),
    ],
    "ITC": [
        ("ITC Hotels demerger approved, value unlocking ahead", "positive", 0.85),
        ("ITC FMCG business achieves ₹20,000 Cr revenue milestone", "positive", 0.80),
        ("ITC Classmate notebooks expand in rural education", "positive", 0.63),
        ("ITC cigarette volumes decline amid tax hike concerns", "negative", -0.55),
        ("ITC Agribusiness records strong Q3 on wheat exports", "positive", 0.69),
    ],
    "LT": [
        ("L&T wins ₹25,000 Cr metro rail project in NCR", "positive", 0.92),
        ("L&T order book at all-time high of ₹5.2 lakh Cr", "positive", 0.89),
        ("L&T Technology Services wins major EV platform deal", "positive", 0.82),
        ("L&T Green Energy arm secures 1GW solar project", "positive", 0.85),
        ("L&T faces raw material cost pressure in international projects", "negative", -0.41),
    ],
}

def get_sentiment(symbol: str) -> dict:
    """Get sentiment analysis for a company."""
    company = SYMBOL_MAP.get(symbol)
    if not company:
        return {}

    news_items = NEWS_TEMPLATES.get(symbol)
    if not news_items:
        # Dynamically generate 5 simulated news headlines for fallback
        name = company.get("name", symbol)
        sector = company.get("sector", "market")
        news_items = [
            (f"{name} announces strategic expansion plans in the {sector} sector", "positive", 0.78),
            (f"{name} reports solid financial performance and margin improvements", "positive", 0.82),
            (f"Analysts raise price targets for {symbol} following positive outlook", "positive", 0.74),
            (f"{name} launches new operational R&D centers across India", "positive", 0.68),
            (f"Short-term raw material inflation could impact margins for {symbol}", "negative", -0.42),
        ]
    
    # Pick 3-4 random news items
    selected = random.sample(news_items, min(len(news_items), random.randint(3, 4)))
    
    articles = []
    base_date = datetime.now()
    for i, (headline, sentiment_type, score) in enumerate(selected):
        noise = random.uniform(-0.05, 0.05)
        articles.append({
            "headline": headline,
            "sentiment": sentiment_type,
            "score": round(score + noise, 3),
            "source": random.choice(["Economic Times", "Moneycontrol", "Business Standard", "Mint", "CNBC TV18"]),
            "published_at": (base_date - timedelta(hours=i * 8 + random.randint(1, 6))).strftime("%Y-%m-%d %H:%M"),
            "url": "#"
        })

    positive_scores = [a["score"] for a in articles if a["sentiment"] == "positive"]
    negative_scores = [abs(a["score"]) for a in articles if a["sentiment"] == "negative"]
    
    pos_avg = sum(positive_scores) / len(positive_scores) if positive_scores else 0
    neg_avg = sum(negative_scores) / len(negative_scores) if negative_scores else 0
    
    pos_count = len(positive_scores)
    neg_count = len(negative_scores)
    total = len(articles)
    
    overall_score = round((pos_avg * pos_count - neg_avg * neg_count) / total, 3)
    
    if overall_score > 0.5:
        sentiment_label = "Very Bullish"
    elif overall_score > 0.2:
        sentiment_label = "Bullish"
    elif overall_score > -0.1:
        sentiment_label = "Neutral"
    elif overall_score > -0.4:
        sentiment_label = "Bearish"
    else:
        sentiment_label = "Very Bearish"

    return {
        "symbol": symbol,
        "name": company["name"],
        "overall_sentiment": sentiment_label,
        "overall_score": overall_score,
        "positive_pct": round(pos_count / total * 100),
        "negative_pct": round(neg_count / total * 100),
        "neutral_pct": round((total - pos_count - neg_count) / total * 100),
        "articles": articles,
        "market_perception_index": round((overall_score + 1) / 2 * 100)  # 0-100
    }


def get_corporate_intelligence(symbol: str) -> dict:
    """Extract corporate goals and expansion plans."""
    CORPORATE_DATA = {
        "RELIANCE": {
            "goals": ["Achieve Net Zero carbon emissions by 2035", "Build 100GW renewable energy capacity", "Expand Jio 5G to all Indian districts"],
            "expansion": ["New Energy gigafactories in Jamnagar", "Jio Financial Services rollout", "Reliance Retail targeting ₹1 lakh Cr GMV"],
            "rd_initiatives": ["Green hydrogen production", "Advanced energy storage", "AI-powered retail analytics"],
            "ma_activities": ["Potential acquisition in solar cell manufacturing", "Partnership with global EV OEMs"],
        },
        "TCS": {
            "goals": ["Become leading AI-first IT services company", "Achieve $50B revenue by FY28", "Carbon neutral operations by 2030"],
            "expansion": ["AI Centre of Excellence in 15 countries", "Expanding BPO in Latin America", "Cloud migration services scaling"],
            "rd_initiatives": ["TCS Pace innovation labs", "Quantum computing research", "GenAI for enterprise integration"],
            "ma_activities": ["Strategic partnerships with hyperscalers", "Acquiring niche AI talent companies"],
        },
        "HDFCBANK": {
            "goals": ["Deepen rural and semi-urban penetration", "Increase retail loan mix to 60%", "Digital transactions to form 85% of volume"],
            "expansion": ["1,000 new branch openings in FY25", "HDFC Life cross-selling integration", "Agri lending expansion"],
            "rd_initiatives": ["AI-based credit underwriting", "Blockchain for trade finance", "Conversational banking assistant"],
            "ma_activities": ["Post-merger synergy realization with erstwhile HDFC Ltd"],
        },
        "BHARTIARTL": {
            "goals": ["Achieve 500M subscribers in India", "Build pan-India 5G by FY26", "₹1 lakh Cr Airtel Africa revenue"],
            "expansion": ["Airtel Business cloud & security services", "Satellite internet via OneWeb", "Airtel Payments Bank UPI expansion"],
            "rd_initiatives": ["Open RAN 5G deployment", "Edge computing infrastructure", "IoT platform for enterprises"],
            "ma_activities": ["OneWeb satellite expansion", "Potential Africa market acquisitions"],
        },
        "ICICIBANK": {
            "goals": ["Grow retail franchise 20% annually", "Achieve ROE above 18%", "Double SME loan book in 3 years"],
            "expansion": ["NRI banking services expansion globally", "ICICI Prudential AMC scale-up", "International branches in key markets"],
            "rd_initiatives": ["InstaBIZ platform for SMEs", "AI-powered fraud detection", "Open banking API ecosystem"],
            "ma_activities": ["ICICI Securities potential privatization", "Fintech co-investment strategies"],
        },
        "INFY": {
            "goals": ["Build AI-first delivery model", "Achieve 25% of revenue from AI/cloud", "Expand in Continental Europe"],
            "expansion": ["Infosys Topaz AI platform roll-out", "New design thinking hubs in Europe", "Cobalt cloud vertical solutions"],
            "rd_initiatives": ["Responsible AI frameworks", "AI-augmented software development", "Digital twin platforms for manufacturing"],
            "ma_activities": ["Acquired BASE life science firm", "Potential acquisitions in engineering services"],
        },
        "SBIN": {
            "goals": ["Become India's most profitable PSU bank", "Digitize 90% of transactions by FY26", "Expand MSME loan book to ₹5 lakh Cr"],
            "expansion": ["SBI Cards scaling in Tier 3/4 cities", "YONO 2.0 super-app launch", "SBI Mutual Fund growth push"],
            "rd_initiatives": ["AI-based NPA prediction", "Blockchain for consortium lending", "Voice banking in regional languages"],
            "ma_activities": ["State govt bancassurance partnerships", "Potential stake in fintech players"],
        },
        "HINDUNILVR": {
            "goals": ["Double premium portfolio revenue", "Achieve carbon positive operations", "Rural market volume CAGR of 8%"],
            "expansion": ["Premium beauty brands scaling", "Direct-to-consumer e-commerce push", "Unilever food portfolio strengthening"],
            "rd_initiatives": ["Sustainable packaging innovation", "Microbiome-based skincare R&D", "AI for demand forecasting"],
            "ma_activities": ["Acquiring regional D2C brands", "Strategic beauty brand licensing"],
        },
        "ITC": {
            "goals": ["ITC FMCG to hit ₹1 lakh Cr revenue by FY30", "Hotels demerger value unlock", "Agri-tech platform pan-India scale"],
            "expansion": ["ITC Hotels expansion to 200 properties", "Classmate D2C education brand", "B-Natural juice capacity tripling"],
            "rd_initiatives": ["Agri-chain blockchain traceability", "Paperboard lightweighting innovations", "Green cigarette alternatives R&D"],
            "ma_activities": ["ITC Hotels strategic brand partnerships", "Agri start-up investments"],
        },
        "LT": {
            "goals": ["Achieve ₹10 lakh Cr order book by FY27", "International revenue to reach 30%", "L&T Technology to hit $2B revenue"],
            "expansion": ["Middle East & Africa infra projects", "L&T Green Energy 10GW pipeline", "L&T Semiconductor fab venture"],
            "rd_initiatives": ["Defence tech indigenization", "Hyperloop technology feasibility", "AI-powered project management platform"],
            "ma_activities": ["L&T acquired Mindtree scaled as LTIMindtree", "Defence co-production JVs"],
        },
    }
    
    company = SYMBOL_MAP.get(symbol, {})
    data = CORPORATE_DATA.get(symbol)
    if not data:
        name = company.get("name", symbol)
        sector = company.get("sector", "primary industry")
        data = {
            "goals": [
                f"Expand market share in the {sector} sector by 15%",
                f"Transition 30% of energy requirements to eco-friendly resources",
                f"Achieve carbon-neutral operational milestones ahead of schedule"
            ],
            "expansion": [
                f"Establish secondary smart production lines and regional hubs",
                f"Deploy retail channels in Tier-3 and Tier-4 urban localities",
                f"Boost international joint venture distributions"
            ],
            "rd_initiatives": [
                "Integrate AI diagnostics and automated supply chains",
                "Pioneer clean tech materials and packaging light-weighting"
            ],
            "ma_activities": [
                "Acquire niche digital startups for asset synergies",
                "Establish strategic partnerships with specialized logistics providers"
            ],
        }
    
    growth_score = random.randint(62, 92)
    
    return {
        "symbol": symbol,
        "name": company.get("name", symbol),
        "strategic_goals": data.get("goals", []),
        "expansion_plans": data.get("expansion", []),
        "rd_initiatives": data.get("rd_initiatives", []),
        "ma_activities": data.get("ma_activities", []),
        "growth_potential_score": growth_score
    }
