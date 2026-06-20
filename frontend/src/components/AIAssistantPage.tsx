import React, { useState, useMemo, useEffect } from 'react';
import AIChatbot from './AIChatbot';
import { CompanyLogo } from './common/CompanyLogo';
import { 
  api, 
  formatCurrency, 
  getRecBadgeClass, 
  getRecColor, 
  getScoreColor, 
  getCompanyMeta, 
  COMPANIES_METADATA 
} from '../utils/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Sliders, 
  AlertTriangle, 
  BookOpen, 
  GraduationCap, 
  ChevronDown, 
  CheckCircle, 
  HelpCircle, 
  Check, 
  Award, 
  Play, 
  RotateCcw,
  Star,
  Activity
} from 'lucide-react';

interface AIAssistantPageProps {
  onCompanySelect?: (symbol: string) => void;
  selectedSymbol?: string;
  initialQuery?: string;
  clearPreQuery?: () => void;
  quotes?: any[];
  recs?: Record<string, any>;
}

export default function AIAssistantPage({ 
  onCompanySelect, 
  selectedSymbol = 'RELIANCE', 
  initialQuery, 
  clearPreQuery, 
  quotes = [], 
  recs = {} 
}: AIAssistantPageProps) {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [localQuery, setLocalQuery] = useState('');

  // Dynamic risk and sentiment data state
  const [riskData, setRiskData] = useState<any>(null);
  const [sentimentData, setSentimentData] = useState<any>(null);

  // Local state for interactive simulators
  const [dcfGrowth, setDcfGrowth] = useState(12); // Revenue growth rate percentage
  const [dcfWacc, setDcfWacc] = useState(10); // WACC discount rate percentage
  
  const [ratioSimVal, setRatioSimVal] = useState(1.2); // Debt to Equity simulator ratio
  const [selectedRatio, setSelectedRatio] = useState<'pe' | 'de' | 'roce' | 'div'>('de');

  // Local state for Educational Quiz
  const [quizStep, setQuizStep] = useState(0); // 0: intro, 1: q1, 2: q2, 3: result
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Retrieve active company details
  const activeCompany = useMemo(() => {
    return getCompanyMeta(selectedSymbol);
  }, [selectedSymbol]);

  // Retrieve quote details
  const liveQuote = useMemo(() => {
    const q = quotes.find(item => item.symbol.toUpperCase() === selectedSymbol.toUpperCase());
    return q || {
      current_price: activeCompany.basePrice,
      change_pct: 0.85,
      pe_ratio: 24.5,
      pb_ratio: 3.8,
      dividend_yield: 1.25,
      eps: 74.5,
      market_cap: 1250000000000
    };
  }, [quotes, selectedSymbol, activeCompany]);

  // Retrieve recommendation details
  const activeRec = useMemo(() => {
    const r = recs[selectedSymbol.toUpperCase()];
    return r || {
      recommendation: 'Buy',
      ai_investment_score: 76,
      score_components: {
        financial_score: 78,
        growth_score: 82,
        sentiment_score: 72,
        risk_score: 75
      },
      supporting_factors: [
        'Market leader in its core sectors with strong capitalization',
        'Solid historical cashflows supporting future expansion capex',
        'Favorable industry outlook with recovering macro indicators'
      ]
    };
  }, [recs, selectedSymbol]);

  // Fetch risk & sentiment data on company change
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [riskRes, sentimentRes] = await Promise.all([
          api.getRisk(selectedSymbol),
          api.getSentiment(selectedSymbol)
        ]);
        if (active) {
          setRiskData(riskRes.data);
          setSentimentData(sentimentRes.data);
        }
      } catch (err) {
        console.error("Error fetching dynamic details in AI Assistant Page:", err);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [selectedSymbol]);

  // Synchronize simulator inputs with active company fundamentals
  useEffect(() => {
    // 1. DCF Growth (from quote's revenue_growth)
    if (liveQuote.revenue_growth !== undefined) {
      setDcfGrowth(Math.round(liveQuote.revenue_growth * 100));
    } else {
      setDcfGrowth(12); // fallback
    }

    // 2. Ratio simulator starting values based on company actuals
    if (selectedRatio === 'de') {
      setRatioSimVal(liveQuote.debt_equity !== undefined ? liveQuote.debt_equity : 1.2);
    } else if (selectedRatio === 'pe') {
      setRatioSimVal(liveQuote.pe_ratio !== undefined ? liveQuote.pe_ratio : 25);
    } else if (selectedRatio === 'roce') {
      setRatioSimVal(liveQuote.roe !== undefined ? Math.round(liveQuote.roe * 100) : 15);
    } else if (selectedRatio === 'div') {
      setRatioSimVal(liveQuote.dividend_yield !== undefined ? parseFloat((liveQuote.dividend_yield * 100).toFixed(2)) : 1.25);
    }
  }, [selectedSymbol, selectedRatio, liveQuote]);

  // --- DCF Simulator Calculations ---
  const dcfProjections = useMemo(() => {
    const baseMCap = liveQuote.market_cap || 1250000000000;
    // Assume cash flow is approx 4.5% of MCap as starting cash flow
    const startFCF = baseMCap * 0.045;
    const growth = dcfGrowth / 100;
    const wacc = dcfWacc / 100;
    const terminalGrowth = 0.04; // 4% constant terminal growth rate

    const flows = [];
    let discountedSum = 0;

    for (let i = 1; i <= 5; i++) {
      const fcf = startFCF * Math.pow(1 + growth, i);
      const discountFactor = Math.pow(1 + wacc, i);
      const pv = fcf / discountFactor;
      discountedSum += pv;
      flows.push({
        year: `Year ${i}`,
        fcf: parseFloat((fcf / 10000000).toFixed(1)), // In Crores
        pv: parseFloat((pv / 10000000).toFixed(1))
      });
    }

    // Terminal Value calculation
    const fcfYear5 = startFCF * Math.pow(1 + growth, 5);
    const terminalValue = (fcfYear5 * (1 + terminalGrowth)) / (wacc - terminalGrowth);
    const pvTerminalValue = terminalValue / Math.pow(1 + wacc, 5);
    const totalEnterpriseValue = discountedSum + pvTerminalValue;

    // Scale intrinsic value to stock price scale
    const intrinsicPrice = (totalEnterpriseValue / baseMCap) * liveQuote.current_price;
    const premiumDiscountPct = ((intrinsicPrice - liveQuote.current_price) / liveQuote.current_price) * 100;

    let valuationRating = 'FAIRLY VALUED';
    let ratingColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (premiumDiscountPct > 8) {
      valuationRating = 'UNDERVALUED';
      ratingColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else if (premiumDiscountPct < -8) {
      valuationRating = 'OVERVALUED';
      ratingColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }

    return {
      flows,
      enterpriseValue: totalEnterpriseValue,
      intrinsicPrice,
      premiumDiscountPct,
      valuationRating,
      ratingColor
    };
  }, [liveQuote, dcfGrowth, dcfWacc]);

  // AI Score Radar Chart Data
  const radarData = useMemo(() => {
    const sc = activeRec.score_components || {
      financial_score: 75,
      growth_score: 80,
      sentiment_score: 70,
      risk_score: 75
    };
    return [
      { subject: 'Financial Health', A: sc.financial_score, fullMark: 100 },
      { subject: 'Growth Momentum', A: sc.growth_score, fullMark: 100 },
      { subject: 'Social Sentiment', A: sc.sentiment_score, fullMark: 100 },
      { subject: 'Risk Assessment', A: 100 - sc.risk_score + 40, fullMark: 100 } // Inverted scale for lower risk = higher score
    ];
  }, [activeRec]);

  // Peer Comparison Data
  const peerComparisonData = useMemo(() => {
    const sectorPeers = COMPANIES_METADATA.filter(c => c.sector === activeCompany.sector && c.symbol !== selectedSymbol).slice(0, 3);
    const data = [
      { symbol: selectedSymbol, pe: liveQuote.pe_ratio || 25, yield: liveQuote.dividend_yield || 1.25 }
    ];
    sectorPeers.forEach((p, idx) => {
      const q = quotes.find(item => item.symbol.toUpperCase() === p.symbol.toUpperCase());
      data.push({
        symbol: p.symbol,
        pe: q ? q.pe_ratio : (p.basePrice % 10 + 20),
        yield: q ? q.dividend_yield : (p.basePrice % 2 * 0.8)
      });
    });
    return data;
  }, [quotes, activeCompany, selectedSymbol, liveQuote]);

  // Simulated Ratio Score changes
  const simulatedScore = useMemo(() => {
    let baseScore = 70;
    if (selectedRatio === 'de') {
      if (ratioSimVal < 0.5) baseScore = 92;
      else if (ratioSimVal < 1.0) baseScore = 84;
      else if (ratioSimVal < 1.8) baseScore = 68;
      else baseScore = 40;
    } else if (selectedRatio === 'pe') {
      if (ratioSimVal < 15) baseScore = 94;
      else if (ratioSimVal < 28) baseScore = 82;
      else if (ratioSimVal < 45) baseScore = 62;
      else baseScore = 38;
    } else if (selectedRatio === 'roce') {
      if (ratioSimVal > 25) baseScore = 96;
      else if (ratioSimVal > 15) baseScore = 80;
      else if (ratioSimVal > 8) baseScore = 58;
      else baseScore = 30;
    } else if (selectedRatio === 'div') {
      if (ratioSimVal > 3.5) baseScore = 90;
      else if (ratioSimVal > 1.5) baseScore = 78;
      else if (ratioSimVal > 0.5) baseScore = 65;
      else baseScore = 45;
    }

    let rec = 'Hold';
    let color = '#F59E0B';
    if (baseScore >= 78) {
      rec = 'Strong Buy';
      color = '#22C55E';
    } else if (baseScore >= 65) {
      rec = 'Buy';
      color = '#22C55E';
    } else if (baseScore >= 45) {
      rec = 'Hold';
      color = '#F59E0B';
    } else {
      rec = 'Reduce / Sell';
      color = '#EF4444';
    }

    return { score: baseScore, rec, color };
  }, [selectedRatio, ratioSimVal]);

  // Quiz questions definition
  const quizQuestions = [
    {
      question: 'Which of the following metrics generally indicates a company is efficiently allocating its funds to generate profits?',
      options: [
        'Higher Debt-to-Equity ratio',
        'Higher Return on Capital Employed (ROCE)',
        'Higher Price-to-Earnings (P/E) ratio',
        'Lower Asset Turnover ratio'
      ],
      correct: 1,
      explanation: 'ROCE measures how efficiently a company generates profits from its capital base. A higher ROCE implies strong capital allocation efficiency, which elevates the AI score.'
    },
    {
      question: 'Under a DCF Valuation Model, what is the impact of raising the Discount Rate (WACC) assumption?',
      options: [
        'Increases the estimated Intrinsic Value',
        'Has no effect on intrinsic value calculation',
        'Decreases the estimated Intrinsic Value',
        'Increases terminal growth rate directly'
      ],
      correct: 2,
      explanation: 'WACC is used as the discount rate in the denominator. A higher WACC means future cash flows are discounted more heavily, leading to a lower Present Value and a lower Intrinsic Price.'
    }
  ];

  const handleQuizAnswer = (optionIdx: number) => {
    setSelectedAnswer(optionIdx);
    const isCorrect = optionIdx === quizQuestions[quizStep].correct;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      setQuizFeedback('Correct! Outstanding stock analysis terminology skills.');
    } else {
      setQuizFeedback(`Incorrect. The correct answer was: "${quizQuestions[quizStep].options[quizQuestions[quizStep].correct]}".`);
    }
  };

  const handleNextQuizStep = () => {
    setSelectedAnswer(null);
    setQuizFeedback(null);
    if (quizStep + 1 < quizQuestions.length) {
      setQuizStep(prev => prev + 1);
    } else {
      setQuizStep(3); // Result tab
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizFeedback(null);
  };

  return (
    <div className="space-y-6 fade-in select-none">
      
      {/* Time & header strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-900/30 to-indigo-900/20 border border-violet-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xl shadow-lg">
            🤖
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
              AI Investment Assistant
            </h2>
            <p className="text-xs text-slate-400">Your intelligent guide to NIFTY 50 companies and smart investment decisions.</p>
          </div>
        </div>

        {/* Mascot dialog bubble */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 max-w-lg shadow-lg self-stretch md:self-auto">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-base border border-slate-700 animate-bounce">
            🤖
          </div>
          <p className="text-[10px] text-slate-350 leading-snug">
            {activeSubTab === 0 && '"Hello! I\'m your AI Investment Assistant. I can help you analyze companies, explore data, and make smarter investment decisions."'}
            {activeSubTab === 1 && '"Welcome to Analysis Tools! Adjust valuation sliders or view score details to stress-test your chosen stock."'}
            {activeSubTab === 2 && '"Review FII/DII institutional buying momentum and capital rotation matrices to catch macro swings."'}
            {activeSubTab === 3 && '"Learn standard financial terminology and quiz yourself to enhance your fundamental scoring knowledge."'}
          </p>
        </div>
      </div>

      {/* Tabs list under header */}
      <div className="flex border-b border-slate-800 gap-3">
        {['Chat Assistant', 'Analysis Tools', 'Market Insights', 'Learning Center'].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(idx)}
            className={`pb-2.5 text-xs font-black uppercase transition-all relative ${
              activeSubTab === idx 
                ? 'text-violet-400 border-b-2 border-violet-500' 
                : 'text-slate-550 hover:text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Selector banner for Selected Company (for all secondary tabs) */}
      {activeSubTab !== 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0F172A] border border-[#1E293B]">
          <div className="flex items-center gap-3">
            <CompanyLogo symbol={selectedSymbol} size="lg" />
            <div>
              <span className="text-[8px] text-violet-400 font-black uppercase tracking-wider block">ACTIVE COMPANY ANALYSIS</span>
              <h3 className="text-sm font-black text-white leading-none mt-1">{activeCompany.name}</h3>
              <p className="text-[10px] text-[#94A3B8] font-bold mt-1.5 uppercase tracking-wide leading-none">
                {selectedSymbol} • {activeCompany.sector} • {activeCompany.industry}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right leading-none">
              <span className="text-[8px] text-[#64748B] font-bold block uppercase mb-1">Current Price</span>
              <span className="text-sm font-black text-white block">₹{liveQuote.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className={`text-[9.5px] font-bold mt-1 block ${liveQuote.change_pct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {liveQuote.change_pct >= 0 ? '▲' : '▼'} {Math.abs(liveQuote.change_pct).toFixed(2)}%
              </span>
            </div>
            
            <div className="relative">
              <select
                value={selectedSymbol}
                onChange={(e) => onCompanySelect?.(e.target.value)}
                className="bg-[#060B17] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs font-black text-[#94A3B8] hover:text-white focus:outline-none cursor-pointer"
              >
                {COMPANIES_METADATA.map(c => (
                  <option key={c.symbol} value={c.symbol}>{c.symbol} ({c.name.split(' ')[0]})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main split grid content depending on active tab */}
      {activeSubTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* LEFT 3 COLUMNS: REAL INTERACTIVE CHATFEED SCREEN */}
          <div className="lg:col-span-3 card border-slate-800 bg-[#090d16] overflow-hidden shadow-2xl relative h-[700px]">
            <AIChatbot
              selectedSymbol={selectedSymbol}
              onCompanySelect={onCompanySelect}
              embedded={true}
              initialQuery={localQuery || initialQuery}
              clearPreQuery={() => {
                setLocalQuery('');
                if (clearPreQuery) clearPreQuery();
              }}
            />
          </div>

          {/* RIGHT COLUMN: SHORTCUT CARDS SIDEBAR PANEL (takes 1/4) */}
          <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
            
            {/* AI Assistant Features */}
            <div className="card p-4 bg-[#0d121f] border-slate-800 flex-1 flex flex-col justify-between h-[330px] shadow-2xl">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 border-b border-slate-850 pb-1.5">AI Assistant Features</h3>
              <div className="space-y-2 overflow-y-auto chat-scrollbar pr-1">
                {[
                  { title: 'Company Analysis', desc: 'Get deep insights and detailed analysis of NIFTY stocks', icon: '🏢' },
                  { title: 'Investment Recommendations', desc: 'AI-powered picks matching financials & trends', icon: '🧠' },
                  { title: 'Market Insights', desc: 'Real-time market trends, news, and perceptions', icon: '📊' },
                  { title: 'Portfolio Analysis', desc: 'Evaluate assets and optimize investment weighting', icon: '💼' },
                  { title: 'Investment Simulator', desc: 'Project expected yields and simulated cash paths', icon: '💸' },
                  { title: 'Risk Assessment', desc: 'Evaluate volatility factors and leverage flags', icon: '⚠️' }
                ].map((f, i) => (
                  <div key={i} className="bg-slate-950/40 p-2 rounded-xl border border-slate-900 flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-200 leading-tight">{f.title}</h4>
                      <p className="text-[8px] text-slate-500 mt-0.5 leading-snug">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="card p-4 bg-[#0d121f] border-slate-800 flex-1 flex flex-col justify-between h-[310px] shadow-2xl">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 border-b border-slate-850 pb-1.5">Quick Actions</h3>
              <div className="space-y-1.5 overflow-y-auto chat-scrollbar pr-1">
                {[
                  'Analyze Top Gainers',
                  'Show High Dividend Stocks',
                  'Best Stocks for Long Term',
                  'Compare Two Companies',
                  'Sector Performance',
                  'Market News Today'
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => setLocalQuery(act)}
                    className="w-full bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-950/60 p-2 rounded-xl text-left text-[10.5px] font-semibold text-slate-300 transition-colors flex items-center justify-between shadow"
                  >
                    <span>{act}</span>
                    <span className="text-slate-650 text-xs">›</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: ANALYSIS TOOLS VIEW */}
      {activeSubTab === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2 COLUMNS: DCF Simulator & Score Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card A: AI Valuation Simulator (DCF) */}
            <div className="card p-5 bg-[#0F172A] border-[#1E293B] rounded-2xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
                <div>
                  <h3 className="text-xs font-black text-violet-400 uppercase tracking-wider">AI Valuation Simulator (DCF Model)</h3>
                  <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">Discounted Free Cash Flow Projections</span>
                </div>
                <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-black tracking-wide ${dcfProjections.ratingColor}`}>
                  {dcfProjections.valuationRating} ({dcfProjections.premiumDiscountPct >= 0 ? '+' : ''}{dcfProjections.premiumDiscountPct.toFixed(1)}%)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Sliders Form */}
                <div className="space-y-4 select-none">
                  {/* Slider 1: Growth */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#94A3B8]">Revenue Growth (Next 5 Yrs)</span>
                      <span className="text-violet-400">{dcfGrowth}% / Yr</span>
                    </div>
                    <input
                      type="range" min="5" max="25"
                      value={dcfGrowth}
                      onChange={(e) => setDcfGrowth(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#060B17] rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>

                  {/* Slider 2: Discount Rate */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#94A3B8]">Discount Rate (WACC)</span>
                      <span className="text-violet-400">{dcfWacc}%</span>
                    </div>
                    <input
                      type="range" min="8" max="15"
                      value={dcfWacc}
                      onChange={(e) => setDcfWacc(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#060B17] rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>

                  {/* Statistics Comparison */}
                  <div className="bg-[#060B17]/40 border border-[#1E293B] rounded-xl p-3.5 space-y-2 text-[10px] leading-tight font-semibold">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Simulated Intrinsic Price:</span>
                      <span className="text-white font-extrabold">₹{dcfProjections.intrinsicPrice.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Current Market Price:</span>
                      <span className="text-white font-extrabold">₹{liveQuote.current_price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#1E293B]/40 pt-2 text-[10.5px]">
                      <span className="text-[#94A3B8]">Yield Potential Index:</span>
                      <span className={dcfProjections.premiumDiscountPct >= 0 ? 'text-[#22C55E] font-black' : 'text-[#EF4444] font-black'}>
                        {dcfProjections.premiumDiscountPct >= 0 ? 'Undervalued' : 'Overvalued'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Projection Chart */}
                <div className="h-[145px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dcfProjections.flows}>
                      <XAxis dataKey="year" stroke="#475569" fontSize={8} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={8} width={25} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '12px' }}
                        labelStyle={{ fontSize: '8px', color: '#94a3b8', fontWeight: 'bold' }}
                        itemStyle={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="fcf" name="FCF (Cr)" fill={activeCompany.color} radius={[4, 4, 0, 0]}>
                        {dcfProjections.flows.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx === 4 ? `${activeCompany.color}CC` : activeCompany.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Card B: AI Scoring Analysis & Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
              
              {/* Polar Angle Ratings Chart */}
              <div className="card p-4 bg-[#0F172A] border-[#1E293B] rounded-2xl flex flex-col justify-between h-[230px] shadow-xl">
                <div>
                  <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">AI Ratings Profile</h4>
                  <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">Multivariate rating score grid</span>
                </div>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={7.5} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={6} />
                      <Radar name="AI Scores" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Peer Valuation BarChart */}
              <div className="card p-4 bg-[#0F172A] border-[#1E293B] rounded-2xl flex flex-col justify-between h-[230px] shadow-xl">
                <div>
                  <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">Sector PE Ratio Peers Comparison</h4>
                  <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">Valuation multiples vs sector competitors</span>
                </div>
                <div className="h-40 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peerComparisonData}>
                      <XAxis dataKey="symbol" stroke="#475569" fontSize={8} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={8} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '9.5px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="pe" name="P/E Ratio" fill="#10B981" radius={[4, 4, 0, 0]}>
                        {peerComparisonData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.symbol === selectedSymbol ? activeCompany.color : '#475569'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: AI Valuation scorecard & Factors */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card C: Valuation Scorecard */}
            <div className="card p-4 bg-[#0d121f] border-slate-800 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5 leading-none select-none">
                <Sliders className="w-3.5 h-3.5" />
                Valuation Scorecard
              </h3>
              
              <div className="space-y-2 text-[10px] leading-tight select-none">
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 font-bold">P/E Ratio:</span>
                  <span className="text-slate-200 font-black">{liveQuote.pe_ratio ? liveQuote.pe_ratio.toFixed(2) : '24.50'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 font-bold">P/B Ratio:</span>
                  <span className="text-slate-200 font-black">{liveQuote.pb_ratio ? liveQuote.pb_ratio.toFixed(2) : '3.80'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 font-bold">Dividend Yield:</span>
                  <span className="text-slate-200 font-black">{liveQuote.dividend_yield ? `${liveQuote.dividend_yield}%` : '1.25%'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 font-bold">EPS Growth:</span>
                  <span className="text-[#22C55E] font-black">+14.2%</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 font-bold">AI Target Price:</span>
                  <span className="text-violet-400 font-extrabold">₹{activeRec.target_price ? activeRec.target_price.toLocaleString('en-IN') : '₹3,240'}</span>
                </div>
                <div className="flex justify-between pb-0.5">
                  <span className="text-slate-500 font-bold">Upside Potential:</span>
                  <span className="text-[#22C55E] font-black">+{activeRec.upside_pct || 14.5}%</span>
                </div>
              </div>
            </div>

            {/* Card D: Supporting Factors */}
            <div className="card p-4 bg-[#0d121f] border-slate-800 space-y-3.5 shadow-xl">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5 leading-none select-none">
                <Info className="w-3.5 h-3.5 animate-pulse" />
                AI Analysis Thesis
              </h3>
              <ul className="space-y-2 text-[9px] text-[#94A3B8] leading-relaxed list-disc list-inside">
                {activeRec.supporting_factors ? activeRec.supporting_factors.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                )) : (
                  <>
                    <li>Dominant market capitalization leader within the sector constituents list.</li>
                    <li>Attractive historical returns and stable profitability ratios securing ratings.</li>
                    <li>Macro sector tailwinds supporting long-term valuation target increments.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Card E: Risk Indicators Panel */}
            <div className="card p-4 bg-[#0d121f] border-slate-800 space-y-3.5 shadow-xl">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5 leading-none select-none">
                <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                AI Risk Assessment Panel
              </h3>
              
              {riskData ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 leading-none">
                    <span className="text-[8.5px] text-[#94A3B8] font-bold">Overall Risk Rating:</span>
                    <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded leading-none ${
                      riskData.risk_score >= 75 ? 'text-rose-450 bg-rose-500/10' :
                      riskData.risk_score >= 55 ? 'text-amber-455 bg-amber-500/10' :
                      'text-emerald-450 bg-emerald-500/10'
                    }`}>
                      {riskData.risk_score >= 75 ? 'High Risk' :
                       riskData.risk_score >= 55 ? 'Medium Risk' :
                       'Low Risk'} ({riskData.risk_score}/100)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {riskData.risk_factors.map((rf: any, i: number) => (
                      <div key={i} className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-900 space-y-1">
                        <div className="flex justify-between items-center leading-none">
                          <span className="text-[9.5px] font-black text-[#F8FAFC]">{rf.factor}</span>
                          <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${
                            rf.impact === 'High' ? 'text-rose-455 bg-rose-500/5' :
                            rf.impact === 'Medium' ? 'text-amber-455 bg-amber-500/5' :
                            'text-emerald-450 bg-emerald-500/5'
                          }`}>
                            {rf.impact} Impact
                          </span>
                        </div>
                        <p className="text-[8.5px] text-[#94A3B8] leading-relaxed font-medium">{rf.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <span className="text-[9px] text-slate-500 animate-pulse">Analyzing risk factors...</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: MARKET INSIGHTS VIEW */}
      {activeSubTab === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2 COLUMNS: Cash Flow Chart & Sector Matrix */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart A: FII / DII Net Flow Trends */}
            <div className="card p-5 bg-[#0F172A] border-[#1E293B] rounded-2xl space-y-3 shadow-xl">
              <div>
                <h3 className="text-xs font-black text-violet-400 uppercase tracking-wider">Institutional Flow Indicators (FII & DII)</h3>
                <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">Net buying cash flows over the last 6 market sessions</span>
              </div>
              
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { day: 'Mon', FII: 1200, DII: 800 },
                    { day: 'Tue', FII: 1400, DII: 950 },
                    { day: 'Wed', FII: -320, DII: 1100 },
                    { day: 'Thu', FII: 2100, DII: 450 },
                    { day: 'Fri', FII: 4200, DII: 2100 },
                    { day: 'Today', FII: 1850, DII: 1540 }
                  ]}>
                    <defs>
                      <filter id="fiiGlow" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <linearGradient id="fiiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="diiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#475569" fontSize={8} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={8} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '9.5px', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={20} iconSize={6} wrapperStyle={{ fontSize: '8.5px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                    <Area type="monotone" dataKey="FII" name="FII Flow (Cr)" stroke="#22C55E" fill="url(#fiiGrad)" strokeWidth={2} filter="url(#fiiGlow)" dot={false} />
                    <Area type="monotone" dataKey="DII" name="DII Flow (Cr)" stroke="#8B5CF6" fill="url(#diiGrad)" strokeWidth={1.8} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Matrix B: Sector Flow momentum rotation */}
            <div className="card p-5 bg-[#0F172A] border-[#1E293B] rounded-2xl space-y-4 shadow-xl select-none">
              <div>
                <h3 className="text-xs font-black text-violet-400 uppercase tracking-wider">Sector Rotation Momentum Index</h3>
                <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">Capital flow allocation matrices</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { sector: 'IT', flow: 'Leading', desc: 'Sustained buying', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                  { sector: 'Banking', flow: 'Improving', desc: 'FII fresh buying', color: 'text-violet-400 border-violet-500/20 bg-violet-500/5' },
                  { sector: 'Auto', flow: 'Leading', desc: 'Retail retail surge', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                  { sector: 'FMCG', flow: 'Weakening', desc: 'Defensive pricing dips', color: 'text-rose-400 border-rose-500/20 bg-rose-500/5' },
                  { sector: 'Telecom', flow: 'Improving', desc: 'ARPU hike catalyst', color: 'text-violet-400 border-violet-500/20 bg-violet-500/5' },
                  { sector: 'Pharma', flow: 'Lagging', desc: 'Fading safe-haven flow', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
                  { sector: 'Metals', flow: 'Lagging', desc: 'Global price correction', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
                  { sector: 'Power', flow: 'Improving', desc: 'High summer demand load', color: 'text-violet-400 border-violet-500/20 bg-violet-500/5' }
                ].map((s, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex flex-col justify-between h-[68px] ${s.color}`}>
                    <div className="flex justify-between items-center leading-none">
                      <span className="text-[11px] font-black text-white">{s.sector}</span>
                      <span className="text-[8px] font-black uppercase tracking-wider leading-none px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">{s.flow}</span>
                    </div>
                    <span className="text-[7.5px] text-slate-400 block leading-tight font-medium">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: AI Intelligence Cards */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="card p-4 bg-[#0d121f] border-slate-800 space-y-3.5 shadow-xl select-none">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-855 pb-2 flex items-center gap-1.5 leading-none">
                <Activity className="w-3.5 h-3.5 text-[#22C55E]" />
                AI Generated Alerts
              </h3>
              
              <div className="space-y-3">
                {[
                  { title: 'FII Surge', desc: 'Foreign Institutional buying hit a 3-month high today in primary sectors, signaling strong global confidence.', indicator: '▲ 4,200Cr' },
                  { title: 'DII Support', desc: 'Domestic Institutions supported FMCG indices during midday corrections, maintaining firm structural support.', indicator: '▲ 2,100Cr' },
                  { title: 'WACC Impact', desc: 'Rising global bond yields standardizing WACC at 10.2% on simulated valuations. Intrinsic valuations slightly lower.', indicator: '⚠️ alert' }
                ].map((alert, i) => (
                  <div key={i} className="p-3 bg-slate-950/40 rounded-xl border border-slate-900 space-y-1.5">
                    <div className="flex justify-between items-center leading-none">
                      <span className="text-[9.5px] font-black text-[#F8FAFC]">{alert.title}</span>
                      <span className="text-[7.5px] font-black uppercase tracking-wider text-violet-400 bg-violet-950/40 border border-violet-500/10 px-1.5 py-0.5 rounded leading-none">
                        {alert.indicator}
                      </span>
                    </div>
                    <p className="text-[8.5px] text-[#94A3B8] leading-relaxed font-medium">{alert.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment News Feed */}
            <div className="card p-4 bg-[#0d121f] border-slate-800 space-y-3.5 shadow-xl select-none">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-855 pb-2 flex items-center gap-1.5 leading-none">
                <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
                AI Sentiment & News Feed
              </h3>
              
              {sentimentData && sentimentData.articles && sentimentData.articles.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 leading-none">
                    <span className="text-[8.5px] text-[#94A3B8] font-bold">Overall Perception:</span>
                    <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded leading-none ${
                      sentimentData.overall_sentiment.includes('Bullish') ? 'text-emerald-450 bg-emerald-500/10' :
                      sentimentData.overall_sentiment.includes('Bearish') ? 'text-rose-450 bg-rose-500/10' :
                      'text-amber-450 bg-amber-500/10'
                    }`}>
                      {sentimentData.overall_sentiment} ({sentimentData.market_perception_index}%)
                    </span>
                  </div>

                  {sentimentData.articles.map((art: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-950/40 rounded-xl border border-slate-900 space-y-1.5">
                      <div className="flex justify-between items-center leading-none">
                        <span className="text-[7.5px] font-extrabold text-[#64748B]">{art.source} • {art.published_at}</span>
                        <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${
                          art.sentiment === 'positive' ? 'text-emerald-450 bg-emerald-500/5' :
                          art.sentiment === 'negative' ? 'text-rose-450 bg-rose-500/5' :
                          'text-slate-400 bg-slate-500/5'
                        }`}>
                          {art.sentiment}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#E2E8F0] leading-relaxed font-bold">{art.headline}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <span className="text-[9px] text-slate-500 animate-pulse">Analyzing news and sentiment...</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: LEARNING CENTER VIEW */}
      {activeSubTab === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2 COLUMNS: Ratio Explorer & Interactive Simulator */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card A: Ratio Simulator */}
            <div className="card p-5 bg-[#0F172A] border-[#1E293B] rounded-2xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
                <div>
                  <h3 className="text-xs font-black text-violet-400 uppercase tracking-wider">AI Scoring Ratio Simulator</h3>
                  <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">See how changing financial metrics shifts the AI Recommendation</span>
                </div>
                <div 
                  className="px-2.5 py-1 rounded-lg border text-[9px] font-black tracking-wide transition-all"
                  style={{ color: simulatedScore.color, backgroundColor: `${simulatedScore.color}10`, borderColor: `${simulatedScore.color}20` }}
                >
                  {simulatedScore.rec} ({simulatedScore.score}/100)
                </div>
              </div>

              {/* Selector Tabs for Ratios */}
              <div className="flex gap-2 border-b border-slate-800 pb-1 select-none">
                {[
                  { id: 'de', label: 'Debt/Equity' },
                  { id: 'pe', label: 'P/E Ratio' },
                  { id: 'roce', label: 'ROCE %' },
                  { id: 'div', label: 'Div Yield %' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRatio(r.id as any);
                      if (r.id === 'de') setRatioSimVal(1.2);
                      else if (r.id === 'pe') setRatioSimVal(25);
                      else if (r.id === 'roce') setRatioSimVal(15);
                      else if (r.id === 'div') setRatioSimVal(1.25);
                    }}
                    className={`pb-1.5 text-[9.5px] font-black uppercase relative ${
                      selectedRatio === r.id ? 'text-violet-400 border-b-2 border-violet-500' : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Slider for simulated value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center select-none">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#94A3B8]">Simulate {selectedRatio.toUpperCase()} Value:</span>
                      <span className="text-violet-400 font-extrabold">
                        {selectedRatio === 'de' && ratioSimVal.toFixed(2)}
                        {selectedRatio === 'pe' && `${ratioSimVal.toFixed(1)}x`}
                        {selectedRatio === 'roce' && `${ratioSimVal.toFixed(1)}%`}
                        {selectedRatio === 'div' && `${ratioSimVal.toFixed(2)}%`}
                      </span>
                    </div>
                    
                    {selectedRatio === 'de' && (
                      <input
                        type="range" min="0.1" max="3.0" step="0.1"
                        value={ratioSimVal}
                        onChange={(e) => setRatioSimVal(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#060B17] rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    )}
                    {selectedRatio === 'pe' && (
                      <input
                        type="range" min="5" max="60" step="1"
                        value={ratioSimVal}
                        onChange={(e) => setRatioSimVal(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#060B17] rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    )}
                    {selectedRatio === 'roce' && (
                      <input
                        type="range" min="3" max="45" step="1"
                        value={ratioSimVal}
                        onChange={(e) => setRatioSimVal(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#060B17] rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    )}
                    {selectedRatio === 'div' && (
                      <input
                        type="range" min="0" max="6.0" step="0.1"
                        value={ratioSimVal}
                        onChange={(e) => setRatioSimVal(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#060B17] rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    )}
                  </div>

                  {/* Ratio Glossary definition cards */}
                  <div className="bg-[#060B17]/40 border border-[#1E293B] rounded-xl p-3.5 text-[9px] leading-relaxed font-medium text-[#94A3B8] space-y-1">
                    {selectedRatio === 'de' && (
                      <>
                        <span className="text-white font-extrabold uppercase block text-[9.5px] mb-1">Debt to Equity (D/E) Ratio</span>
                        A solvency metric measuring the proportion of equity vs debt financing. A lower ratio (e.g. &lt; 0.5) is preferred by the AI as it indicates low financial leverage risk.
                      </>
                    )}
                    {selectedRatio === 'pe' && (
                      <>
                        <span className="text-white font-extrabold uppercase block text-[9.5px] mb-1">Price to Earnings (P/E) Ratio</span>
                        A valuation metric showing the multiple paid per Rupee of earnings. A lower PE generally indicates undervaluation, while an excessively high PE reduces the AI score unless backed by huge growth.
                      </>
                    )}
                    {selectedRatio === 'roce' && (
                      <>
                        <span className="text-white font-extrabold uppercase block text-[9.5px] mb-1">Return on Capital Employed (ROCE)</span>
                        An efficiency metric representing earnings generated per unit of capital employed. High values (&gt; 22%) indicate efficient funds allocation, raising the AI rating.
                      </>
                    )}
                    {selectedRatio === 'div' && (
                      <>
                        <span className="text-white font-extrabold uppercase block text-[9.5px] mb-1">Dividend Yield</span>
                        An income return ratio comparing the dividend payout per share to the share price. Stable yields provide a valuation safety net, bolstering score fundamentals.
                      </>
                    )}
                  </div>
                </div>

                {/* Score representation Gauges */}
                <div className="bg-[#060B17]/60 p-4 border border-[#1E293B] rounded-xl flex items-center gap-4 justify-center h-28 relative overflow-hidden">
                  <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-20 h-20" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" stroke="#1E293B" strokeWidth="3" fill="none" />
                      <circle cx="18" cy="18" r="16" stroke={simulatedScore.color} strokeWidth="3" strokeDasharray={`${simulatedScore.score}, 100`} strokeLinecap="round" fill="none" transform="rotate(-90 18 18)" />
                    </svg>
                    <div className="absolute text-center pt-1.5 leading-none">
                      <span className="text-base font-black text-white">{simulatedScore.score}</span>
                      <span className="text-[6.5px] text-slate-500 block uppercase font-bold">SCORE</span>
                    </div>
                  </div>
                  <div className="space-y-1 leading-tight w-1/2">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">AI Prediction Yield</span>
                    <span className="text-xs font-black text-slate-200 block" style={{ color: simulatedScore.color }}>{simulatedScore.rec}</span>
                    <p className="text-[8.5px] text-slate-455 leading-relaxed font-medium">As this ratio improves, the AI score index rises, suggesting lower risk and high return potential.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Quiz Challenge */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card B: Interactive Educational Quiz */}
            <div className="card p-4 bg-[#0d121f] border-slate-800 min-h-[360px] flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-slate-855 pb-2 flex items-center gap-1.5 leading-none select-none">
                  <GraduationCap className="w-4 h-4 text-[#8B5CF6]" />
                  AI Investor Quiz
                </h3>

                {quizStep < 2 ? (
                  // Quiz Step (Questions)
                  <div className="space-y-4 mt-3">
                    <div className="flex justify-between items-center text-[8.5px] text-slate-455 font-black uppercase">
                      <span>Question {quizStep + 1} of 2</span>
                      <span>Score: {quizScore}</span>
                    </div>
                    
                    <p className="text-[10px] text-slate-200 font-black leading-relaxed">
                      {quizQuestions[quizStep].question}
                    </p>

                    <div className="space-y-2">
                      {quizQuestions[quizStep].options.map((opt, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === quizQuestions[quizStep].correct;
                        let btnStyle = 'border-slate-900 bg-slate-950/40 text-slate-300 hover:border-slate-800';
                        if (selectedAnswer !== null) {
                          if (isSelected) {
                            btnStyle = isCorrect ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/40 bg-rose-500/10 text-rose-400';
                          } else if (isCorrect) {
                            btnStyle = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={selectedAnswer !== null}
                            onClick={() => handleQuizAnswer(idx)}
                            className={`w-full p-2.5 rounded-xl border text-left text-[9.5px] font-semibold transition-all leading-tight ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // Quiz Results Page
                  <div className="space-y-4 mt-3 text-center flex flex-col items-center justify-center py-6 select-none">
                    <Award className="w-12 h-12 text-[#fbbf24] animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">Quiz Completed!</h4>
                      <p className="text-[10px] text-[#94A3B8] font-bold mt-1 uppercase">Your Score: {quizScore} / 2</p>
                    </div>
                    <p className="text-[8.5px] text-slate-455 max-w-xs mx-auto leading-relaxed">
                      {quizScore === 2 ? 'Master Analyst level achieved! You have a strong grasp of Nifty stock scoring fundamentals.' : 'Keep practicing! Review ratio cards to boost your AI Investment Score knowledge.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Navigation buttons */}
              <div className="mt-4 pt-2 border-t border-slate-855">
                {selectedAnswer !== null && (
                  <div className="space-y-3 select-none">
                    <div className="text-[8.5px] font-semibold text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 leading-normal">
                      {quizFeedback}
                      <p className="mt-1 text-slate-500 leading-snug">{quizQuestions[quizStep].explanation}</p>
                    </div>
                    <button
                      onClick={handleNextQuizStep}
                      className="w-full py-2 bg-violet-650 hover:bg-violet-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-lg"
                    >
                      <Play className="w-2.5 h-2.5" /> Next Question
                    </button>
                  </div>
                )}
                {quizStep === 3 && (
                  <button
                    onClick={resetQuiz}
                    className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Try Again
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
