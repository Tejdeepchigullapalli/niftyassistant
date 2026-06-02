from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stocks, analysis, sentiment, portfolio, recommendations

app = FastAPI(
    title="Nifty Investment Assistant API",
    description="AI-Powered Stock Market Investment Assistant for Nifty Top 10",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://niftyassistant.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(sentiment.router, prefix="/api/sentiment", tags=["Sentiment"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])

@app.get("/")
def root():
    return {"message": "Nifty Investment Assistant API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
