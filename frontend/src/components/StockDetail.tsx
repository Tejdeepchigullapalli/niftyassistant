import React, { useState, useEffect } from 'react';
import { api, getCompanyMeta } from '../utils/api';
import StockHeader from './StockHeader';
import LoadingSkeleton from './LoadingSkeleton';
import OverviewTab from './OverviewTab';
import FinancialsTab from './FinancialsTab';
import TechnicalsTab from './TechnicalsTab';
import NewsSentimentTab from './NewsSentimentTab';
import PeerComparisonTab from './PeerComparisonTab';
import ForecastTab from './ForecastTab';
import AIInsightsTab from './AIInsightsTab';

interface StockDetailProps {
  symbol: string;
  onSymbolSelect?: (symbol: string) => void;
  onNavigateToChat?: (query: string, symbol: string) => void;
}

const PERIOD_MAPPING: Record<string, string> = {
  '1D': '1d',
  '1W': '5d',
  '1M': '1mo',
  '6M': '6mo',
  '1Y': '1y',
  '5Y': '5y'
};

export default function StockDetail({ symbol, onSymbolSelect, onNavigateToChat }: StockDetailProps) {
  const [quote, setQuote] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [sentiment, setSentiment] = useState<any>(null);
  const [corporate, setCorporate] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [allQuotes, setAllQuotes] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState(0); // 0: Overview, etc.
  const [loading, setLoading] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const meta = getCompanyMeta(symbol);

  // Load details
  const fetchStockDetails = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [q, h, f, r, s, c, rec, quotesRes] = await Promise.all([
        api.getQuote(symbol),
        api.getHistory(symbol, '1y'), // Base period
        api.getFinancial(symbol),
        api.getRisk(symbol),
        api.getSentiment(symbol),
        api.getCorporate(symbol),
        api.getRecommendation(symbol),
        api.getAllQuotes()
      ]);
      setQuote(q.data);
      setHistory(h.data);
      setFinancial(f.data);
      setRisk(r.data);
      setSentiment(s.data);
      setCorporate(c.data);
      setRecommendation(rec.data);
      setAllQuotes(quotesRes.data.quotes || []);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      console.error("[NiftyAI Error] Loading details failed:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockDetails(false);
  }, [symbol]);

  const handleWatchToggle = () => {
    setIsWatchlisted(prev => !prev);
  };

  const handleCompare = () => {
    setActiveSubTab(4); // Switch to Peer Comparison view
  };

  const handleAIReport = () => {
    setActiveSubTab(6); // Switch to AI Insights view
  };

  const activeLayout = (() => {
    switch (activeSubTab) {
      case 0: return 'overview';
      case 1: return 'financials';
      case 2: return 'technicals';
      case 3: return 'news';
      case 4: return 'peers';
      case 5: return 'forecast';
      case 6: return 'insights';
      default: return 'overview';
    }
  })();

  return (
    <div className="space-y-4 w-full text-[#F8FAFC] pb-10 bg-[#060B17] font-sans select-none">
      
      {/* 1. Persistent Header Card */}
      <StockHeader
        symbol={symbol}
        meta={meta}
        quote={quote}
        recommendation={recommendation}
        onCompare={handleCompare}
        onAIReport={handleAIReport}
        lastUpdated={lastUpdated}
        allQuotes={allQuotes}
      />

      {/* 2. Sub-tab Selection Bar */}
      <div className="flex border-b border-[#1E293B] gap-4 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5 select-none">
        {['Overview', 'Financials', 'Technicals', 'News & Sentiment', 'Peer Comparison', 'Forecast', 'AI Insights'].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(idx)}
            className={`pb-2 text-[9.5px] font-black uppercase transition-all relative ${
              activeSubTab === idx 
                ? 'text-violet-450 border-b-2 border-violet-550' 
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Dynamic Tab Router Content Area */}
      {loading ? (
        <LoadingSkeleton layout={activeLayout} />
      ) : (
        <div className="w-full">
          {activeSubTab === 0 && (
            <OverviewTab
              symbol={symbol}
              meta={meta}
              quote={quote}
              historyData={history?.data || []}
              recommendation={recommendation}
              sentiment={sentiment}
              risk={risk}
              onSymbolSelect={onSymbolSelect}
              quotes={allQuotes}
            />
          )}

          {activeSubTab === 1 && (
            <FinancialsTab
              symbol={symbol}
              meta={meta}
              quote={quote}
              financial={financial}
            />
          )}

          {activeSubTab === 2 && (
            <TechnicalsTab
              symbol={symbol}
              meta={meta}
              quote={quote}
              historyData={history?.data || []}
              recommendation={recommendation}
            />
          )}

          {activeSubTab === 3 && (
            <NewsSentimentTab
              symbol={symbol}
              meta={meta}
              sentiment={sentiment}
            />
          )}

          {activeSubTab === 4 && (
            <PeerComparisonTab
              symbol={symbol}
              meta={meta}
              quote={quote}
              quotes={allQuotes}
              onSymbolSelect={onSymbolSelect}
            />
          )}

          {activeSubTab === 5 && (
            <ForecastTab
              symbol={symbol}
              meta={meta}
              quote={quote}
              historyData={history?.data || []}
            />
          )}

          {activeSubTab === 6 && (
            <AIInsightsTab
              symbol={symbol}
              meta={meta}
              quote={quote}
              financial={financial}
              recommendation={recommendation}
              sentiment={sentiment}
              quotes={allQuotes}
              corporate={corporate}
              risk={risk}
              isLoading={loading}
              lastQuoteUpdated={quote?.updated_at}
              lastFundamentalUpdated={financial?.updated_at}
              onSymbolSelect={(s) => onSymbolSelect?.(s)}
              onAskAI={onNavigateToChat}
              onOpenPeers={() => setActiveSubTab(4)}
            />
          )}
        </div>
      )}

      {/* Footer warning */}
      <footer className="py-4 text-center border-t border-[#1E293B]/70 mt-6 select-none">
        <p className="text-[9.5px] text-[#64748B] font-bold uppercase leading-snug">
          Nifty AI Investment Assistant · Developed for educational research purposes only · Not certified financial investment advice
        </p>
      </footer>

    </div>
  );
}
