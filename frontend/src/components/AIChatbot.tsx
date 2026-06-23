import React, { useState, useEffect, useRef } from 'react';
import { api, formatCurrency, getRecBadgeClass, getRecColor, getScoreColor } from '../utils/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import { CompanyLogo } from './common/CompanyLogo';
import CompanyActionMenu from './common/CompanyActionMenu';
import SectorComparisonBoard from './ai/SectorComparisonBoard';

// Top 50 Nifty Companies list
const COMPANIES = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd' },
  { symbol: 'TCS',      name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd' },
  { symbol: 'ICICIBANK',name: 'ICICI Bank Ltd' },
  { symbol: 'INFY',     name: 'Infosys Ltd' },
  { symbol: 'SBIN',     name: 'State Bank of India' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd' },
  { symbol: 'ITC',      name: 'ITC Ltd' },
  { symbol: 'LT',       name: 'Larsen & Toubro Ltd' },
  { symbol: 'HCLTECH',  name: 'HCL Technologies Ltd' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd' },
  { symbol: 'SUNPHARMA',name: 'Sun Pharmaceutical Ltd' },
  { symbol: 'MARUTI',   name: 'Maruti Suzuki India Ltd' },
  { symbol: 'KOTAKBANK',name: 'Kotak Mahindra Bank' },
  { symbol: 'ULTRACEMCO',name: 'UltraTech Cement Ltd' },
  { symbol: 'NTPC',     name: 'NTPC Ltd' },
  { symbol: 'TATAMOTORS',name: 'Tata Motors Ltd' },
  { symbol: 'ONGC',     name: 'Oil & Natural Gas Corp' },
  { symbol: 'COALINDIA',name: 'Coal India Ltd' },
  { symbol: 'POWERGRID',name: 'Power Grid Corp' },
  { symbol: 'TITAN',    name: 'Titan Company Ltd' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd' },
  { symbol: 'ADANIPORTS',name: 'Adani Ports & SEZ' },
  { symbol: 'M&M',      name: 'Mahindra & Mahindra' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd' },
  { symbol: 'ASIANPAINT',name: 'Asian Paints Ltd' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries' },
  { symbol: 'TATASTEEL',name: 'Tata Steel Ltd' },
  { symbol: 'GRASIM',   name: 'Grasim Industries Ltd' },
  { symbol: 'WIPRO',    name: 'Wipro Ltd' },
  { symbol: 'TECHM',    name: 'Tech Mahindra Ltd' },
  { symbol: 'NESTLEIND',name: 'Nestle India Ltd' },
  { symbol: 'LTIM',     name: 'LTIMindtree Ltd' },
  { symbol: 'INDUSINDBK',name: 'IndusInd Bank Ltd' },
  { symbol: 'BAJFINANCE',name: 'Bajaj Finance Ltd' },
  { symbol: 'BAJAJFINSV',name: 'Bajaj Finserv Ltd' },
  { symbol: 'CIPLA',    name: 'Cipla Ltd' },
  { symbol: 'DRREDDY',  name: 'Dr Reddys Laboratories' },
  { symbol: 'APOLLOHOSP',name: 'Apollo Hospitals' },
  { symbol: 'SBILIFE',  name: 'SBI Life Insurance' },
  { symbol: 'EICHERMOT',name: 'Eicher Motors Ltd' },
  { symbol: 'BPCL',     name: 'Bharat Petroleum' },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories' },
  { symbol: 'HEROCOCO', name: 'Hero MotoCorp Ltd' },
  { symbol: 'BRITANNIA',name: 'Britannia Industries' },
  { symbol: 'JIOFIN',   name: 'Jio Financial Services' },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd' },
  { symbol: 'BEL',      name: 'Bharat Electronics Ltd' },
  { symbol: 'HAL',      name: 'Hindustan Aeronautics' }
];

const HISTORICAL_TIMELINES: Record<string, { year: string; title: string; desc: string }[]> = {
  RELIANCE: [
    { year: '1973', title: 'Founded', desc: 'Dhirubhai Ambani establishes Reliance Industries as a textile company.' },
    { year: '1977', title: 'Mega IPO', desc: 'Landmark public listing, pioneering equity cult and retail investing in India.' },
    { year: '2002', title: 'Gas Discovery', desc: 'Discovered major gas reserves in Krishna Godavari basin (KG-D6).' },
    { year: '2016', title: 'Jio Revolution', desc: 'Launched Jio, providing ultra-cheap 4G data and transforming digital India.' },
    { year: '2025', title: 'New Green Energy', desc: 'Investing ₹75,000 Cr in massive solar and hydrogen gigafactories in Jamnagar.' }
  ],
  TCS: [
    { year: '1968', title: 'Established', desc: 'Founded as Tata Computer Systems, pioneering Indian IT consulting.' },
    { year: '1981', title: 'R&D Centre', desc: 'Set up India\'s first software research and development centre in Pune.' },
    { year: '2004', title: 'Public Listing', desc: 'Listed on NSE/BSE in one of India\'s largest ever tech IPOs.' },
    { year: '2018', title: '$100B Cap', desc: 'Became first Indian IT company to surpass $100 Billion in market capitalization.' },
    { year: '2024', title: 'GenAI Scaling', desc: 'Deployed Generative AI solutions across hundreds of global enterprise clients.' }
  ],
  HDFCBANK: [
    { year: '1994', title: 'Incorporation', desc: 'Incorporated as a private sector bank, headquartered in Mumbai.' },
    { year: '1995', title: 'First Branch', desc: 'Commenced operations as a scheduled commercial bank, focusing on corporate loans.' },
    { year: '2008', title: 'CBOP Acquisition', desc: 'Acquired Centurion Bank of Punjab, massive boost to retail operations.' },
    { year: '2015', title: 'Go Digital', desc: 'Launched digital banking revolution: "Bank in your pocket" mobile campaigns.' },
    { year: '2023', title: 'Mega Merger', desc: 'Historic merger with parent HDFC Ltd, creating one of the world\'s largest financial entities.' }
  ],
  BHARTIARTL: [
    { year: '1995', title: 'Cellular Launch', desc: 'Bharti Cellular launches mobile services under the brand name "Airtel" in Delhi.' },
    { year: '2004', title: 'IBM Outsourcing', desc: 'Pioneered outsourcing model, handing over network IT to IBM in a global benchmark.' },
    { year: '2010', title: 'Africa Expansion', desc: 'Acquired Zain Group\'s African operations, becoming a global telecom player.' },
    { year: '2020', title: 'Digital Scale', desc: 'Airtel Payments Bank and Airtel Wynk cross massive digital subscriber milestones.' },
    { year: '2022', title: '5G Plus', desc: 'Rolls out high-speed 5G Plus across major Indian cities in record time.' }
  ],
  ICICIBANK: [
    { year: '1994', title: 'Founded', desc: 'Established by financial institution ICICI Ltd, pioneering tech-led banking.' },
    { year: '1999', title: 'NYSE Listing', desc: 'Became the first Indian bank and company from non-Japan Asia to list on NYSE.' },
    { year: '2001', title: 'Madura Merger', desc: 'Acquired Bank of Madura, aggressively expanding its physical branch retail base.' },
    { year: '2008', title: 'Digital Core', desc: 'Rolled out internet banking and mobile apps, securing dominant retail lending shares.' },
    { year: '2023', title: 'Record ROE', desc: 'Reached historical high Return on Equity (ROE) of 18.5% with stellar credit growth.' }
  ],
  INFY: [
    { year: '1981', title: 'Inception', desc: 'Narayana Murthy and 6 engineers start Infosys in Pune with just $250.' },
    { year: '1993', title: 'IPO Listing', desc: 'Listed on Indian stock exchanges, introducing employee stock options (ESOPs).' },
    { year: '1999', title: 'NASDAQ Listing', desc: 'First Indian-registered company to list shares on NASDAQ.' },
    { year: '2011', title: 'Stellar Revenue', desc: 'Annual revenues cross $6 Billion, expanding presence across US & Europe.' },
    { year: '2023', title: 'Topaz AI Launch', desc: 'Pioneered "Topaz" - an AI-first suite to accelerate enterprise cognitive operations.' }
  ],
  SBIN: [
    { year: '1806', title: 'Predecessor Roots', desc: 'Bank of Calcutta established, later becoming Bank of Bengal.' },
    { year: '1955', title: 'Nationalisation', desc: 'Imperial Bank nationalized to form State Bank of India (SBI).' },
    { year: '2017', title: 'Grand Merger', desc: 'Merged 5 associate banks and Bharatiya Mahila Bank, entering global top 50.' },
    { year: '2019', title: 'YONO Launch', desc: 'Introduced YONO app, rapidly becoming India\'s largest banking super-app.' },
    { year: '2024', title: 'Stellar Profit', desc: 'Announced record quarterly net profits of ₹18,000 Cr, leading Indian banks.' }
  ],
  HINDUNILVR: [
    { year: '1933', title: 'Lever Brothers', desc: 'Lever Brothers India established, launching Sunlight soap.' },
    { year: '1956', title: 'Hindustan Lever', desc: 'Entities merged to form Hindustan Lever Ltd, a household consumer giant.' },
    { year: '2007', title: 'HUL Rebranding', desc: 'Rebranded as Hindustan Unilever Ltd, emphasizing Indian identity.' },
    { year: '2020', title: 'GSK Merger', desc: 'Completed merger with GlaxoSmithKline Consumer Healthcare, acquiring Horlicks.' },
    { year: '2024', title: 'D2C Expansion', desc: 'Rapidly scaled digital commerce platforms and premium beauty products.' }
  ],
  ITC: [
    { year: '1910', title: 'Imperial Tobacco', desc: 'Incorporated as Imperial Tobacco Company of India, beginning in cigarettes.' },
    { year: '1975', title: 'Hotel Venture', desc: 'Opened Chola Sheraton hotel in Chennai, launching premium hospitality.' },
    { year: '2001', title: 'FMCG Expansion', desc: 'Launched Aashirvaad and Sunfeast, quickly becoming a leading packaged foods player.' },
    { year: '2020', title: 'e-Choupal Scale', desc: 'Empowered over 4 million farmers via internet-enabled agricultural supply chains.' },
    { year: '2024', title: 'Hotels Demerger', desc: 'demerged hotel business to unlock massive value for shareholders.' }
  ],
  LT: [
    { year: '1938', title: 'Danish Founders', desc: 'Henning Holck-Larsen & Søren Kristian Toubro start import firm in Bombay.' },
    { year: '1946', title: 'Incorporated', desc: 'Incorporated as Larsen & Toubro Private Ltd, entering heavy engineering.' },
    { year: '1999', title: 'Tech Parks', desc: 'Built landmark IT hubs, expanding into IT services (L&T Infotech).' },
    { year: '2019', title: 'Mindtree M&A', desc: 'Completed hostile takeover of Mindtree, forming global LTIMindtree.' },
    { year: '2024', title: 'Hydrogen & Defence', desc: 'Orders touch record ₹5.2 lakh Cr, leading in hydrogen tech and missile systems.' }
  ]
};

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  component?: React.ReactNode;
  timestamp: string;
  type?: 'sector-comparison';
  comparisonData?: {
    selectedSymbol: string;
    quotes: any[];
    recs: any;
    historicalReturnsBySymbol: any;
  };
}

interface AIChatbotProps {
  onCompanySelect?: (symbol: string) => void;
  selectedSymbol?: string;
  embedded?: boolean;
  initialQuery?: string;
  clearPreQuery?: () => void;
}

export default function AIChatbot({ onCompanySelect, selectedSymbol: externalSymbol, embedded = false, initialQuery, clearPreQuery }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [simAmount, setSimAmount] = useState('100000');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autocomplete Suggestions State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [filteredCompanies, setFilteredCompanies] = useState<typeof COMPANIES>([]);

  // Close suggestions on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If we clicked outside the input container, hide suggestions
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter suggestions as the user types
  const handleInputChange = (val: string) => {
    setInputText(val);
    const cleanInput = val.trim().toLowerCase();
    if (!cleanInput) {
      setFilteredCompanies([]);
      setShowSuggestions(false);
      return;
    }

    // Match the entire input text first
    let matches = COMPANIES.filter(c => 
      c.symbol.toLowerCase().includes(cleanInput) || 
      c.name.toLowerCase().includes(cleanInput)
    );

    // If no match and the input has multiple words, try matching with the last word
    if (matches.length === 0 && cleanInput.includes(' ')) {
      const words = cleanInput.split(/\s+/);
      const lastWord = words[words.length - 1];
      if (lastWord.length >= 1) {
        matches = COMPANIES.filter(c => 
          c.symbol.toLowerCase().includes(lastWord) || 
          c.name.toLowerCase().includes(lastWord)
        );
      }
    }

    setFilteredCompanies(matches.slice(0, 10)); // Limit to top 10 matches for UI elegance
    setActiveSuggestionIndex(0);
    setShowSuggestions(matches.length > 0);
  };

  const handleSelectSuggestion = (company: typeof COMPANIES[0]) => {
    const words = inputText.split(/\s+/);
    if (words.length > 1) {
      // Replace the last word fragment with the chosen symbol
      const lastSpaceIndex = inputText.lastIndexOf(' ');
      const prefix = inputText.substring(0, lastSpaceIndex + 1);
      setInputText(prefix + company.symbol);
    } else {
      setInputText(company.symbol);
    }
    setShowSuggestions(false);
    setFilteredCompanies([]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredCompanies.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < filteredCompanies.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredCompanies.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredCompanies.length) {
          handleSelectSuggestion(filteredCompanies[activeSuggestionIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  // Set input text when initialQuery is provided, allowing the user to send it manually
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      const query = initialQuery.trim();
      setInputText(query);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      // Delay clearing parent state to avoid React batching/rendering race conditions
      setTimeout(() => {
        if (clearPreQuery) {
          clearPreQuery();
        }
      }, 300);
    }
  }, [initialQuery]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeId = 'welcome-' + Date.now();
    setMessages([
      {
        id: welcomeId,
        sender: 'ai',
        text: "Hello! I'm your AI investment assistant. Let's analyze and grow your wealth together.",
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'welcome-steps-' + Date.now(),
        sender: 'ai',
        component: renderStep1CompanySelector(),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  // Sync external select with chatbot if the user changes the main active stock
  useEffect(() => {
    if (externalSymbol && externalSymbol !== selectedSymbol) {
      setSelectedSymbol(externalSymbol);
      handleSelectCompanyFlow(externalSymbol, false);
    }
  }, [externalSymbol]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // RENDER STEP 1: Company selector dropdown/buttons inside chat
  const renderStep1CompanySelector = () => {
    return (
      <div className="p-4 rounded-xl border border-dashed border-violet-500/30 bg-violet-950/20 max-w-sm">
        <p className="text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">Step 1: Select a Company</p>
        <p className="text-sm text-slate-300 mb-3">Choose a company from the NIFTY Top 10 to begin our guided stock analysis:</p>
        <div className="relative space-y-3">
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            onChange={(e) => {
              if (e.target.value) {
                handleSelectCompanyFlow(e.target.value, true);
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>-- Select a stock --</option>
            {COMPANIES.map(co => (
              <option key={co.symbol} value={co.symbol}>{co.symbol} - {co.name}</option>
            ))}
          </select>

          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5">
            <span className="text-[10px] text-slate-400 font-medium">Or compare two companies:</span>
            <button
              type="button"
              onClick={() => triggerComparisonSelector()}
              className="text-[10px] px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-all flex items-center gap-1 shadow-md"
            >
              <span>⚔️</span> Comparision
            </button>
          </div>
        </div>
      </div>
    );
  };

  // STEP 2: Handle Company selection
  const handleSelectCompanyFlow = async (symbol: string, appendUserMsg = true) => {
    setSelectedSymbol(symbol);
    if (onCompanySelect) {
      onCompanySelect(symbol);
    }

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const company = COMPANIES.find(c => c.symbol === symbol) || { name: symbol };

    let newMessages = [...messages];

    if (appendUserMsg) {
      newMessages.push({
        id: 'user-select-' + Date.now(),
        sender: 'user',
        text: `Analyze ${company.name} (${symbol})`,
        timestamp: time
      });
    }

    setMessages([...newMessages, {
      id: 'ai-loading-' + Date.now(),
      sender: 'ai',
      text: `Fetching live market data and computing scores for ${symbol}...`,
      timestamp: time
    }]);

    setLoading(true);

    try {
      // Fetch details from backend
      const [quoteRes, recRes, corporateRes, historyRes] = await Promise.all([
        api.getQuote(symbol),
        api.getRecommendation(symbol),
        api.getCorporate(symbol),
        api.getHistory(symbol, '1y'),
      ]);

      const quote = quoteRes.data;
      const rec = recRes.data;
      const corporate = corporateRes.data;
      const history = historyRes.data;

      const aiText = `Here is the comprehensive overview for **${quote.name} (${symbol})**. This is a **${quote.sector}** company currently trading at **₹${quote.current_price?.toLocaleString('en-IN')}**.`;

      const timeUpdated = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      setMessages(prev => {
        // filter out the temporary loading message
        const cleaned = prev.filter(m => !m.id.startsWith('ai-loading-'));
        return [
          ...cleaned,
          {
            id: 'ai-overview-' + Date.now(),
            sender: 'ai',
            text: aiText,
            timestamp: timeUpdated
          },
          {
            id: 'ai-overview-card-' + Date.now(),
            sender: 'ai',
            component: renderCompanyOverviewCard(quote, rec),
            timestamp: timeUpdated
          },
          {
            id: 'ai-checklist-' + Date.now(),
            sender: 'ai',
            component: renderCompanyHighlights(rec, symbol),
            timestamp: timeUpdated
          },
          {
            id: 'ai-navigation-' + Date.now(),
            sender: 'ai',
            component: renderNextActions(symbol, quote, rec, corporate, history),
            timestamp: timeUpdated
          }
        ];
      });

    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const cleaned = prev.filter(m => !m.id.startsWith('ai-loading-'));
        return [
          ...cleaned,
          {
            id: 'ai-error-' + Date.now(),
            sender: 'ai',
            text: "Oops, I encountered an issue fetching live details. Let's make sure the backend is active.",
            timestamp: time
          }
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSectorComparison = async (symbol: string) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const meta = COMPANIES.find(c => c.symbol === symbol) || { name: symbol };

    setMessages(prev => [
      ...prev,
      {
        id: 'user-compare-' + Date.now(),
        sender: 'user',
        text: `Compare ${symbol} with its sector peers`,
        timestamp: time
      },
      {
        id: 'ai-loading-comparison-' + Date.now(),
        sender: 'ai',
        text: `Generating full-width sector-wide comparison board for ${symbol}...`,
        timestamp: time
      }
    ]);

    setLoading(true);

    try {
      const res = await api.getSectorComparison(symbol);
      const data = res.data;

      // Map response to the props format expected by SectorComparisonBoard
      const quotes = data.companies.map((c: any) => ({
        symbol: c.symbol,
        current_price: c.currentPrice,
        change_pct: c.changePct,
        market_cap: c.marketCap,
        pe_ratio: c.peRatio,
        pb_ratio: c.pbRatio,
        roe: c.roe,
        revenue_growth: c.revenueGrowth
      }));

      const recs: Record<string, any> = {};
      data.companies.forEach((c: any) => {
        recs[c.symbol] = {
          ai_investment_score: c.aiScore,
          recommendation: c.recommendation
        };
      });

      const historicalReturnsBySymbol: Record<string, any> = {};
      data.companies.forEach((c: any) => {
        historicalReturnsBySymbol[c.symbol] = {
          return1W: c.return1W,
          return1M: c.return1M,
          return1Y: c.return1Y
        };
      });

      setMessages(prev => {
        const cleaned = prev.filter(m => !m.id.startsWith('ai-loading-comparison-'));
        return [
          ...cleaned,
          {
            id: 'ai-comparison-' + Date.now(),
            sender: 'ai',
            timestamp: time,
            type: 'sector-comparison',
            comparisonData: {
              selectedSymbol: symbol,
              quotes,
              recs,
              historicalReturnsBySymbol
            }
          }
        ];
      });
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const cleaned = prev.filter(m => !m.id.startsWith('ai-loading-comparison-'));
        return [
          ...cleaned,
          {
            id: 'ai-compare-error-' + Date.now(),
            sender: 'ai',
            text: `I had trouble generating the comparison board for **${symbol}**. Let's make sure the backend is active.`,
            timestamp: time
          }
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  // Render overview cards in chat bubble
  const renderCompanyOverviewCard = (quote: any, rec: any) => {
    return (
      <div className="card p-4 bg-slate-900 border-slate-800 max-w-md shadow-2xl">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <CompanyLogo symbol={quote.symbol} size="sm" />
            <div>
              <h4 className="text-base font-bold text-slate-100">{quote.symbol}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{quote.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getRecBadgeClass(rec.recommendation)}`}>
              {rec.recommendation}
            </span>
            <CompanyActionMenu symbol={quote.symbol} align="right" className="scale-90 origin-top-right mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
            <span className="text-[10px] text-slate-500 block">Market Cap</span>
            <span className="text-sm font-semibold text-slate-200">{formatCurrency(quote.market_cap)}</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
            <span className="text-[10px] text-slate-500 block">Current Price</span>
            <span className="text-sm font-semibold text-slate-200">₹{quote.current_price?.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
            <span className="text-[10px] text-slate-500 block">P/E Ratio</span>
            <span className="text-sm font-semibold text-slate-200">{quote.pe_ratio ? quote.pe_ratio.toFixed(2) : '—'}</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
            <span className="text-[10px] text-slate-500 block">AI Score</span>
            <span className="text-sm font-bold" style={{ color: getScoreColor(rec.ai_investment_score) }}>
              {rec.ai_investment_score}/100
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render company highlights list in chat bubble
  const renderCompanyHighlights = (rec: any, symbol: string) => {
    return (
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 max-w-md">
        <h5 className="text-xs font-semibold text-violet-400 mb-3 tracking-wider flex items-center gap-1.5 uppercase">
          🧠 AI Key Highlights & Rationale
        </h5>
        <ul className="space-y-2">
          {rec.supporting_factors?.map((fact: string, idx: number) => (
            <li key={idx} className="flex gap-2 text-xs text-slate-300">
              <span className="text-emerald-500 flex-shrink-0">✓</span>
              <span>{fact}</span>
            </li>
          ))}
          {rec.risk_flags?.length > 0 && (
            <li className="flex gap-2 text-xs text-rose-400 mt-2 border-t border-slate-800/60 pt-2">
              <span className="text-rose-500 flex-shrink-0">⚠️</span>
              <span><strong>Key Risk:</strong> {rec.risk_flags[0]}</span>
            </li>
          )}
        </ul>
      </div>
    );
  };

  // Helper quick options buttons inside chat bubble
  const renderNextActions = (symbol: string, quote: any, rec: any, corporate: any, history: any) => {
    return (
      <div className="flex flex-wrap gap-2 max-w-sm">
        <button
          onClick={() => triggerHistoryTimeline(symbol)}
          className="text-xs px-3 py-2 bg-slate-900 border border-slate-700 hover:border-violet-500 hover:text-violet-400 text-slate-300 font-medium rounded-lg transition-colors flex items-center gap-1 shadow-md"
        >
          <span>🎯</span> Show History Timeline
        </button>
        <button
          onClick={() => triggerCharts(symbol, quote, history)}
          className="text-xs px-3 py-2 bg-slate-900 border border-slate-700 hover:border-indigo-500 hover:text-indigo-400 text-slate-300 font-medium rounded-lg transition-colors flex items-center gap-1 shadow-md"
        >
          <span>📊</span> Show Performance Charts
        </button>
        <button
          onClick={() => triggerSimulator(symbol, rec)}
          className="text-xs px-3 py-2 bg-slate-900 border border-slate-700 hover:border-emerald-500 hover:text-emerald-400 text-slate-300 font-medium rounded-lg transition-colors flex items-center gap-1 shadow-md"
        >
          <span>💸</span> Run Simulator
        </button>
        <button
          onClick={() => handleTriggerSectorComparison(symbol)}
          className="text-xs px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-all flex items-center gap-1 shadow-md cursor-pointer"
        >
          <span>⚔️</span> Comparision
        </button>
      </div>
    );
  };

  // STEP 3: Timeline Animation Bubble
  const triggerHistoryTimeline = (symbol: string) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const milestones = HISTORICAL_TIMELINES[symbol] || [
      { year: '2010', title: 'Operational Genesis', desc: `Commenced foundational services in the primary ${symbol} business sector.` },
      { year: '2015', title: 'National Scale', desc: 'Completed regional hub listings and established retail logistics.' },
      { year: '2020', title: 'Digital Enterprise', desc: 'Introduced cloud systems and automated operations globally.' },
      { year: '2025', title: 'AI Acceleration', desc: 'Partnered with key cognitive technology nodes for expansion.' }
    ];

    setMessages(prev => [
      ...prev,
      {
        id: 'user-history-' + Date.now(),
        sender: 'user',
        text: `Tell me about the history of ${symbol}`,
        timestamp: time
      },
      {
        id: 'ai-history-msg-' + Date.now(),
        sender: 'ai',
        text: `Generating the animated history timeline of milestones for **${symbol}**...`,
        timestamp: time
      },
      {
        id: 'ai-history-timeline-' + Date.now(),
        sender: 'ai',
        component: renderTimelineComponent(milestones),
        timestamp: time
      }
    ]);
  };

  const triggerComparisonSelector = () => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: 'user-compare-req-' + Date.now(),
        sender: 'user',
        text: 'I want to compare two companies',
        timestamp: time
      },
      {
        id: 'ai-compare-selector-' + Date.now(),
        sender: 'ai',
        text: 'Please select two companies to compare side-by-side. You can filter the companies by NIFTY Rank ranges (Top 10, Top 20, etc.) to quickly locate them:',
        component: (
          <InteractiveComparison 
            companies={COMPANIES} 
            onCompare={(symA, symB) => handleTriggerComparison(symA, symB)} 
          />
        ),
        timestamp: time
      }
    ]);
  };

  const handleTriggerComparison = async (symA: string, symB: string) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [
      ...prev,
      {
        id: 'user-compare-exec-' + Date.now(),
        sender: 'user',
        text: `Compare ${symA} vs ${symB}`,
        timestamp: time
      },
      {
        id: 'ai-loading-comp-' + Date.now(),
        sender: 'ai',
        text: `Executing real-time peer comparison between **${symA}** and **${symB}**...`,
        timestamp: time
      }
    ]);

    setLoading(true);

    try {
      const [qResA, recResA, qResB, recResB] = await Promise.all([
        api.getQuote(symA),
        api.getRecommendation(symA),
        api.getQuote(symB),
        api.getRecommendation(symB)
      ]);

      setMessages(prev => {
        const cleaned = prev.filter(m => !m.id.startsWith('ai-loading-comp-'));
        return [
          ...cleaned,
          {
            id: 'ai-comp-verdict-' + Date.now(),
            sender: 'ai',
            text: `Here is the side-by-side comparison between **${symA}** and **${symB}**:`,
            timestamp: time
          },
          {
            id: 'ai-comp-card-' + Date.now(),
            sender: 'ai',
            component: renderComparisonBoard(qResA.data, recResA.data, qResB.data, recResB.data),
            timestamp: time
          }
        ];
      });
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const cleaned = prev.filter(m => !m.id.startsWith('ai-loading-comp-'));
        return [
          ...cleaned,
          {
            id: 'ai-comp-error-' + Date.now(),
            sender: 'ai',
            text: `I had trouble comparing **${symA}** and **${symB}**. Let's ensure the network fallback is operating cleanly.`,
            timestamp: time
          }
        ];
      });
    }
    setLoading(false);
  };

  const renderTimelineComponent = (milestones: { year: string; title: string; desc: string }[]) => {
    return (
      <div className="card p-5 bg-slate-900 border-slate-800 max-w-sm overflow-hidden relative shadow-2xl">
        <h5 className="text-xs font-semibold text-violet-400 mb-4 tracking-wider uppercase flex items-center gap-1.5">
          🎬 Interactive Company Timeline
        </h5>
        <div className="relative pl-6 border-l border-slate-800 space-y-5">
          {milestones.map((item, idx) => (
            <div
              key={idx}
              className="timeline-item relative group"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              {/* Timeline marker */}
              <div className="absolute -left-[30px] top-1 w-2 h-2 rounded-full bg-violet-500 border border-violet-400 group-hover:bg-violet-400 transition-colors animate-ping" />
              <div className="absolute -left-[30px] top-1 w-2 h-2 rounded-full bg-violet-500 border border-violet-400 group-hover:bg-violet-400 transition-colors" />

              <div className="text-xs font-bold text-violet-400 mb-0.5">{item.year} - {item.title}</div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // STEP 4: Render Charts inside Chat Bubble
  const triggerCharts = (symbol: string, quote: any, history: any) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: 'user-charts-' + Date.now(),
        sender: 'user',
        text: `Show me the charts and performance for ${symbol}`,
        timestamp: time
      },
      {
        id: 'ai-charts-msg-' + Date.now(),
        sender: 'ai',
        text: `Here are the interactive performance charts and returns for **${symbol}**:`,
        timestamp: time
      },
      {
        id: 'ai-charts-recharts-' + Date.now(),
        sender: 'ai',
        component: renderRechartsBubble(quote, history),
        timestamp: time
      }
    ]);
  };

  const renderRechartsBubble = (quote: any, history: any) => {
    const chartData = history?.data?.slice(-30).map((d: any) => ({ ...d, close: d.close })) || [];

    // Daily Profit/Loss Returns simulated data for returns bars
    const dailyReturns = [
      { date: 'May 10', change: 1.25 },
      { date: 'May 13', change: -0.85 },
      { date: 'May 14', change: 2.35 },
      { date: 'May 15', change: -1.45 },
      { date: 'May 16', change: 3.15 },
      { date: 'May 17', change: 0.75 },
    ];

    return (
      <div className="space-y-4 max-w-md w-full">
        {/* Chart 1: Stock Trend */}
        <div className="card p-4 bg-slate-900 border-slate-800">
          <h6 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">📈 Stock Price Trend (Last 30 Days)</h6>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chatPriceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 8 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fill: '#475569', fontSize: 8 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(v: any) => [`₹${Number(v).toFixed(2)}`, 'Close']}
                />
                <Area type="monotone" dataKey="close" stroke="#8b5cf6" strokeWidth={2} fill="url(#chatPriceGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily profit/loss returns bar chart */}
        <div className="card p-4 bg-slate-900 border-slate-800">
          <h6 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">📊 Historical Returns (Daily Profit / Loss)</h6>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyReturns}>
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 8 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 8 }} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(v: any) => [`${v > 0 ? '+' : ''}${v}%`, 'Return']}
                />
                <Bar dataKey="change">
                  {dailyReturns.map((entry, i) => (
                    <Cell key={i} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // STEP 5: Simulator Bubble
  const triggerSimulator = (symbol: string, rec: any) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: 'user-sim-start-' + Date.now(),
        sender: 'user',
        text: `Run the Investment Simulator for ${symbol}`,
        timestamp: time
      },
      {
        id: 'ai-sim-ask-' + Date.now(),
        sender: 'ai',
        text: `Enter your investment amount below to project the growth of your capital in **${symbol}** over the next 5 years:`,
        timestamp: time
      },
      {
        id: 'ai-sim-form-' + Date.now(),
        sender: 'ai',
        component: renderSimForm(symbol, rec),
        timestamp: time
      }
    ]);
  };

  const renderSimForm = (symbol: string, rec: any) => {
    return (
      <div className="card p-4 bg-slate-900 border-slate-800 max-w-sm shadow-2xl">
        <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Simulator Amount</div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2 text-slate-500 text-sm">₹</span>
            <input
              type="number"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 pl-7 pr-3 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              placeholder="Investment Amount"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleSimulateSubmit(symbol, rec)}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Simulate
          </button>
        </div>
      </div>
    );
  };

  const handleSimulateSubmit = (symbol: string, rec: any) => {
    const amountVal = parseFloat(simAmount) || 100000;
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // expectations calculations
    const score = rec.ai_investment_score;
    const isBullish = rec.recommendation.includes('Buy');
    
    // conservative return multipliers
    const conservativeMul = isBullish ? 0.125 : 0.06;
    const moderateMul = isBullish ? 0.2875 : 0.11;
    const aggressiveMul = isBullish ? 0.563 : 0.18;

    const conservativeVal = amountVal * (1 + conservativeMul);
    const moderateVal = amountVal * (1 + moderateMul);
    const aggressiveVal = amountVal * (1 + aggressiveMul);

    // growth path for charts
    const growthData = [
      { period: 'Now', current: amountVal },
      { period: '6M',  current: amountVal * (1 + moderateMul * 0.4) },
      { period: '1Y',  current: amountVal * (1 + moderateMul) },
      { period: '2Y',  current: amountVal * Math.pow(1 + moderateMul, 1.6) },
      { period: '3Y',  current: amountVal * Math.pow(1 + moderateMul, 2.2) },
      { period: '5Y',  current: amountVal * Math.pow(1 + moderateMul, 3.5) },
    ];

    setMessages(prev => [
      ...prev,
      {
        id: 'user-sim-val-' + Date.now(),
        sender: 'user',
        text: `I want to invest ₹${amountVal.toLocaleString('en-IN')}`,
        timestamp: time
      },
      {
        id: 'ai-sim-results-msg-' + Date.now(),
        sender: 'ai',
        text: `Excellent. Based on the fundamental score of **${score}/100**, here is your investment projection and portfolio recommendation for **${symbol}**:`,
        timestamp: time
      },
      {
        id: 'ai-sim-results-card-' + Date.now(),
        sender: 'ai',
        component: renderSimResultsCard(symbol, rec, amountVal, conservativeVal, moderateVal, aggressiveVal, growthData),
        timestamp: time
      }
    ]);
  };

  const renderSimResultsCard = (
    symbol: string,
    rec: any,
    amount: number,
    cons: number,
    mod: number,
    agg: number,
    growthData: any[]
  ) => {
    return (
      <div className="space-y-4 max-w-md w-full">
        {/* simulator yields */}
        <div className="card p-4 bg-slate-900 border-slate-800 shadow-2xl">
          <div className="text-xs font-bold text-violet-400 mb-3 uppercase tracking-wider flex items-center justify-between">
            <span>Expected Returns (1 Year)</span>
            <span className="text-[10px] text-slate-500 font-light lowercase">based on historical data</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block uppercase">Conservative</span>
              <span className="text-xs font-bold text-slate-200">₹{Math.round(cons).toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-emerald-400 block mt-0.5">+{(cons/amount * 100 - 100).toFixed(1)}%</span>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500" />
              <span className="text-[9px] text-slate-500 block uppercase">Moderate</span>
              <span className="text-xs font-bold text-indigo-300">₹{Math.round(mod).toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-indigo-400 block mt-0.5">+{(mod/amount * 100 - 100).toFixed(1)}%</span>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[9px] text-slate-500 block uppercase">Aggressive</span>
              <span className="text-xs font-bold text-slate-200">₹{Math.round(agg).toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-emerald-400 block mt-0.5">+{(agg/amount * 100 - 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className={`p-3 rounded-lg flex items-center justify-between mb-4 ${rec.recommendation.includes('Buy') ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-300' : 'bg-amber-950/30 border border-amber-900/50 text-amber-300'}`}>
            <div>
              <span className="text-[9px] uppercase tracking-wider block font-bold">Investment Recommendation</span>
              <span className="text-sm font-extrabold">{rec.recommendation === 'Strong Buy' || rec.recommendation === 'Buy' ? '🟢 RECOMMEND INVEST' : '🟡 PROCEED WITH CAUTION'}</span>
            </div>
            <span className="text-xs text-right max-w-[150px] leading-snug opacity-90">
              Score: {rec.ai_investment_score}/100
            </span>
          </div>

          {/* Growth comparison chart */}
          <div className="h-36 w-full mt-3">
            <span className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Projected Value Growth (5 Years)</span>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="chatGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" tick={{ fill: '#475569', fontSize: 8 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 8 }} tickFormatter={v => `₹${(v / 1e5).toFixed(1)}L`} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(v: any) => [`₹${Math.round(v).toLocaleString('en-IN')}`, 'Value']}
                />
                <Area type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2} fill="url(#chatGrowthGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderComparisonBoard = (qA: any, recA: any, qB: any, recB: any) => {
    return (
      <div className="card p-4 bg-slate-900 border-slate-800 max-w-sm shadow-2xl space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
          <span className="text-sm">⚔️</span>
          <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-wider">AI Sector Peer Comparison Board</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[9px]">
            <thead>
              <tr className="border-b border-slate-800/80">
                <th className="pb-1 text-slate-500 font-bold uppercase">Metric</th>
                <th className="pb-1 font-bold text-violet-400 text-center">{qA.symbol}</th>
                <th className="pb-1 font-bold text-cyan-400 text-center">{qB.symbol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              <tr>
                <td className="py-1.5 text-slate-400">Current Price</td>
                <td className="py-1.5 text-center font-bold text-slate-200">₹{qA.current_price?.toLocaleString('en-IN')}</td>
                <td className="py-1.5 text-center font-bold text-slate-200">₹{qB.current_price?.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-400">Daily Change</td>
                <td className={`py-1.5 text-center font-bold ${qA.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{qA.change_pct >= 0 ? '+' : ''}{qA.change_pct}%</td>
                <td className={`py-1.5 text-center font-bold ${qB.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{qB.change_pct >= 0 ? '+' : ''}{qB.change_pct}%</td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-400">Market Cap</td>
                <td className="py-1.5 text-center text-slate-300">{formatCurrency(qA.market_cap)}</td>
                <td className="py-1.5 text-center text-slate-300">{formatCurrency(qB.market_cap)}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-400">P/E Ratio</td>
                <td className="py-1.5 text-center text-slate-300">{qA.pe_ratio ? qA.pe_ratio.toFixed(1) : '—'}</td>
                <td className="py-1.5 text-center text-slate-300">{qB.pe_ratio ? qB.pe_ratio.toFixed(1) : '—'}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-400">AI Score</td>
                <td className="py-1.5 text-center font-black" style={{ color: getScoreColor(recA.ai_investment_score) }}>{recA.ai_investment_score}/100</td>
                <td className="py-1.5 text-center font-black" style={{ color: getScoreColor(recB.ai_investment_score) }}>{recB.ai_investment_score}/100</td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-400">Rating</td>
                <td className="py-1.5 text-center">
                  <span className={`px-1 rounded text-[7.5px] font-bold ${getRecBadgeClass(recA.recommendation)}`}>{recA.recommendation}</span>
                </td>
                <td className="py-1.5 text-center">
                  <span className={`px-1 rounded text-[7.5px] font-bold ${getRecBadgeClass(recB.recommendation)}`}>{recB.recommendation}</span>
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-400">Actions</td>
                <td className="py-1.5 text-center">
                  <div className="flex justify-center scale-75 origin-center">
                    <CompanyActionMenu symbol={qA.symbol} align="left" />
                  </div>
                </td>
                <td className="py-1.5 text-center">
                  <div className="flex justify-center scale-75 origin-center">
                    <CompanyActionMenu symbol={qB.symbol} align="right" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80 text-[8.5px] leading-relaxed text-slate-350">
          <span className="font-bold text-violet-400 block mb-0.5">🤖 AI Verdict:</span>
          {recA.ai_investment_score > recB.ai_investment_score ? (
            <span><strong>{qA.symbol}</strong> shows superior AI ranking ({recA.ai_investment_score} vs {recB.ai_investment_score}), backed by stronger financial indicators and growth potential.</span>
          ) : recA.ai_investment_score < recB.ai_investment_score ? (
            <span><strong>{qB.symbol}</strong> displays stronger indicators and higher AI score ({recB.ai_investment_score} vs {recA.ai_investment_score}). It presents superior momentum in current projections.</span>
          ) : (
            <span>Both assets rank equally at <strong>{recA.ai_investment_score}/100</strong>. <strong>{qA.symbol}</strong> offers slightly lower volatility, while <strong>{qB.symbol}</strong> exhibits slightly faster expansion pacing.</span>
          )}
        </div>
      </div>
    );
  };

  const renderTopGainersComponent = (gainers: any[]) => {
    const chartData = gainers.map(g => ({
      symbol: g.symbol,
      change: g.change_pct,
      price: g.current_price
    }));

    return (
      <div className="card p-4 bg-slate-900 border-slate-800 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
          <span className="text-emerald-400 text-sm">📈</span>
          <h5 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Top Nifty 50 Gainers Today</h5>
        </div>
        
        <div className="space-y-2">
          {gainers.map((g, idx) => (
            <div key={g.symbol} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{g.symbol}</span>
                  <span className="text-[9px] text-slate-500">{g.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-200 block">₹{g.current_price?.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-bold text-emerald-400">+{g.change_pct.toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="h-44 w-full bg-slate-950/30 p-2 rounded-lg border border-slate-850">
          <span className="text-[9px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">Daily Gain Percentage Comparison</span>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 8 }} unit="%" />
              <YAxis dataKey="symbol" type="category" tick={{ fill: '#94a3b8', fontSize: 8 }} width={60} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(v: any) => [`+${Number(v).toFixed(2)}%`, 'Change']}
              />
              <Bar dataKey="change" fill="#10b981" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#10b981" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderBestStocksComponent = (stocks: any[]) => {
    const chartData = stocks.map(s => ({
      symbol: s.symbol,
      score: s.ai_investment_score,
      recommendation: s.recommendation
    }));

    return (
      <div className="card p-4 bg-slate-900 border-slate-800 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
          <span className="text-violet-400 text-sm">🧠</span>
          <h5 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Top AI Long-Term Picks</h5>
        </div>
        
        <div className="space-y-2">
          {stocks.map((s, idx) => (
            <div key={s.symbol} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{s.symbol}</span>
                  <span className="text-[9px] text-slate-500">{s.name}</span>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-extrabold block" style={{ color: getScoreColor(s.ai_investment_score) }}>
                    {s.ai_investment_score}/100
                  </span>
                  <span className={`text-[7.5px] px-1 py-0.2 rounded font-black ${getRecBadgeClass(s.recommendation)}`}>
                    {s.recommendation}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-44 w-full bg-slate-950/30 p-2 rounded-lg border border-slate-850">
          <span className="text-[9px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">AI Investment Score Comparison</span>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
              <YAxis dataKey="symbol" type="category" tick={{ fill: '#94a3b8', fontSize: 8 }} width={60} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(v: any) => [`${v}/100`, 'AI Score']}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderHighDividendComponent = (dividendStocks: any[]) => {
    const chartData = dividendStocks.map(d => ({
      symbol: d.symbol,
      yield: parseFloat((d.dividend_yield * 100).toFixed(2)),
      price: d.current_price
    }));

    return (
      <div className="card p-4 bg-slate-900 border-slate-800 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
          <span className="text-cyan-400 text-sm">💎</span>
          <h5 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Top Dividend Yielding Stocks</h5>
        </div>
        
        <div className="space-y-2">
          {dividendStocks.map((d, idx) => (
            <div key={d.symbol} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{d.symbol}</span>
                  <span className="text-[9px] text-slate-500">{d.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-200 block">₹{d.current_price?.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-bold text-cyan-400">{(d.dividend_yield * 100).toFixed(2)}% Yield</span>
              </div>
            </div>
          ))}
        </div>

        <div className="h-44 w-full bg-slate-950/30 p-2 rounded-lg border border-slate-850">
          <span className="text-[9px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">Dividend Yield Percentage Comparison</span>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 8 }} unit="%" />
              <YAxis dataKey="symbol" type="category" tick={{ fill: '#94a3b8', fontSize: 8 }} width={60} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(v: any) => [`${Number(v).toFixed(2)}%`, 'Dividend Yield']}
              />
              <Bar dataKey="yield" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#06b6d4" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderSectorPerformanceComponent = (sectors: any[]) => {
    const chartData = sectors.slice(0, 6).map(s => ({
      sector: s.sector.length > 18 ? s.sector.slice(0, 15) + '...' : s.sector,
      change: s.avgChange
    }));

    return (
      <div className="card p-4 bg-slate-900 border-slate-800 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
          <span className="text-indigo-400 text-sm">🏢</span>
          <h5 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Sector Performance Comparison</h5>
        </div>
        
        <div className="space-y-2">
          {sectors.slice(0, 5).map((s, idx) => (
            <div key={s.sector} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-200">{s.sector}</span>
              </div>
              <span className={`text-xs font-bold ${s.avgChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {s.avgChange >= 0 ? '+' : ''}{s.avgChange.toFixed(2)}% Avg
              </span>
            </div>
          ))}
        </div>

        <div className="h-44 w-full bg-slate-950/30 p-2 rounded-lg border border-slate-850">
          <span className="text-[9px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">Average Daily Returns by Sector</span>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="sector" tick={{ fill: '#94a3b8', fontSize: 7 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 8 }} unit="%" />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(v: any) => [`${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`, 'Average Return']}
              />
              <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Submit Text Input manually
  const handleSubmitInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const query = inputText.trim();
    setInputText('');
    await processQuery(query);
  };

  async function processQuery(query: string) {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: 'user-msg-' + Date.now(),
        sender: 'user',
        text: query,
        timestamp: time
      }
    ]);

    setLoading(true);

    const queryUpper = query.toUpperCase();

    // Check if sector peer comparison is requested (e.g. "Compare INFY with all sector peers")
    const isSectorCompare = (queryUpper.includes('COMPARE') || queryUpper.includes('PEER')) &&
                            (queryUpper.includes('PEER') || queryUpper.includes('SECTOR') || queryUpper.includes('ALL')) &&
                            !queryUpper.includes('VS');
    
    // Find the symbol to compare. Check if there's any matching Nifty symbol in query, otherwise fallback to selected/external symbol.
    const sectorCompareSymbol = COMPANIES.find(c => queryUpper.includes(c.symbol))?.symbol || selectedSymbol || externalSymbol;
    
    if (isSectorCompare && sectorCompareSymbol) {
      await handleTriggerSectorComparison(sectorCompareSymbol);
      return;
    }

    // Check for peer comparison requests
    const words = queryUpper.replace(/[^A-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    const mentionedSymbols = Array.from(new Set(
      words.filter(w => 
        COMPANIES.some(c => c.symbol === w) || 
        (w.length >= 3 && w.length <= 10 && !['COMPARE', 'CHART', 'STOCK', 'PRICE', 'DIFFERENCE', 'AND', 'VERSUS', 'SHOW', 'TELL', 'ABOUT', 'HELP', 'FAQ'].includes(w))
      )
    ));

    if (mentionedSymbols.length >= 2 && (queryUpper.includes('VS') || queryUpper.includes('COMPARE') || queryUpper.includes('DIFFERENCE') || queryUpper.includes('AND'))) {
      const symA = mentionedSymbols[0];
      const symB = mentionedSymbols[1];
      
      setMessages(prev => [
        ...prev,
        {
          id: 'ai-loading-comp-' + Date.now(),
          sender: 'ai',
          text: `Executing real-time peer comparison between **${symA}** and **${symB}**...`,
          timestamp: time
        }
      ]);
      
      try {
        const [qResA, recResA, qResB, recResB] = await Promise.all([
          api.getQuote(symA),
          api.getRecommendation(symA),
          api.getQuote(symB),
          api.getRecommendation(symB)
        ]);
        
        setMessages(prev => {
          const cleaned = prev.filter(m => !m.id.startsWith('ai-loading-comp-'));
          return [
            ...cleaned,
            {
              id: 'ai-comp-verdict-' + Date.now(),
              sender: 'ai',
              text: `Here is the side-by-side comparison between **${symA}** and **${symB}**:`,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            },
            {
              id: 'ai-comp-card-' + Date.now(),
              sender: 'ai',
              component: renderComparisonBoard(qResA.data, recResA.data, qResB.data, recResB.data),
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            }
          ];
        });
      } catch (err) {
        console.error(err);
        setMessages(prev => {
          const cleaned = prev.filter(m => !m.id.startsWith('ai-loading-comp-'));
          return [
            ...cleaned,
            {
              id: 'ai-comp-error-' + Date.now(),
              sender: 'ai',
              text: `I had trouble comparing **${symA}** and **${symB}**. Let's ensure the network fallback is operating cleanly.`,
              timestamp: time
            }
          ];
        });
      }
      setLoading(false);
      return;
    }

    // Pattern matching for dynamic symbol typing lookup
    let singleSymbol = '';
    const lowercaseQuery = query.toLowerCase();

    // 1. Try to find a direct symbol or name match from COMPANIES
    const matched = COMPANIES.find(
      c => queryUpper.includes(c.symbol) || 
           lowercaseQuery.includes(c.name.toLowerCase()) || 
           c.name.toLowerCase().includes(lowercaseQuery)
    );

    if (matched) {
      singleSymbol = matched.symbol;
    } else {
      // 2. Try smart mapping for common market names
      if (lowercaseQuery.includes('tata motors')) {
        singleSymbol = 'TMPV';
      } else if (lowercaseQuery.includes('zomato')) {
        singleSymbol = 'ETERNAL';
      } else if (lowercaseQuery.includes('airtel') || lowercaseQuery.includes('bharti')) {
        singleSymbol = 'BHARTIARTL';
      } else if (lowercaseQuery.includes('reliance') || lowercaseQuery.includes('reliance industries')) {
        singleSymbol = 'RELIANCE';
      } else if (lowercaseQuery.includes('trent')) {
        singleSymbol = 'TRENT';
      } else if (lowercaseQuery.includes('infosys')) {
        singleSymbol = 'INFY';
      } else if (lowercaseQuery.includes('tcs') || lowercaseQuery.includes('tata consultancy')) {
        singleSymbol = 'TCS';
      } else {
        // 3. Fallback to check if a word is exactly a valid symbol
        const possibleSymbols = queryUpper.replace(/[^A-Z]/g, ' ').split(/\s+/).filter(w => 
          w.length >= 3 && w.length <= 10 && 
          !['COMPARE', 'CHART', 'STOCK', 'PRICE', 'SHOW', 'TELL', 'ABOUT', 'HELP', 'FAQ', 'INVEST', 'WHAT', 'WHO', 'THEM', 'THIS', 'THAT', 'AND', 'VERSUS'].includes(w)
        );
        if (possibleSymbols.length === 1 && COMPANIES.some(c => c.symbol === possibleSymbols[0])) {
          singleSymbol = possibleSymbols[0];
        }
      }
    }

    if (singleSymbol) {
      handleSelectCompanyFlow(singleSymbol, false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const lowercase = query.toLowerCase();
    let replyText = '';
    let replyComponent: React.ReactNode = null;

    if (lowercase.includes('gainer') || lowercase.includes('gaining') || (lowercase.includes('perform') && lowercase.includes('best') && !lowercase.includes('sector'))) {
      replyText = "Here are today's top-performing Nifty 50 stocks based on real-time daily price change calculations:";
      try {
        const quotesRes = await api.getAllQuotes();
        const quotes = quotesRes.data.quotes || [];
        const sorted = [...quotes].sort((a, b) => b.change_pct - a.change_pct);
        const topGainers = sorted.slice(0, 5);
        
        replyComponent = renderTopGainersComponent(topGainers);
      } catch (err) {
        console.error(err);
        replyText = "I was unable to load the top gainers right now. Please check if the backend mock data server is available.";
      }
    } else if (lowercase.includes('long term') || lowercase.includes('best stock') || lowercase.includes('top pick') || lowercase.includes('investment score')) {
      replyText = "Here are the top 5 long-term Nifty 50 stock picks ranked by our proprietary AI Investment Scoring engine:";
      try {
        const portRes = await api.getPortfolio();
        const allRecs = portRes.data.all_recommendations || [];
        const sorted = [...allRecs].sort((a, b) => b.ai_investment_score - a.ai_investment_score);
        const bestStocks = sorted.slice(0, 5);
        
        replyComponent = renderBestStocksComponent(bestStocks);
      } catch (err) {
        console.error(err);
        replyText = "I was unable to retrieve portfolio analysis right now. Please check if the backend mock data server is available.";
      }
    } else if (lowercase.includes('dividend') || lowercase.includes('high yield')) {
      replyText = "Here are the top 5 highest dividend yielding Nifty 50 stocks based on core financial yield analysis:";
      try {
        const quotesRes = await api.getAllQuotes();
        const quotes = quotesRes.data.quotes || [];
        const sorted = [...quotes].sort((a, b) => b.dividend_yield - a.dividend_yield);
        const highDividend = sorted.slice(0, 5);
        
        replyComponent = renderHighDividendComponent(highDividend);
      } catch (err) {
        console.error(err);
        replyText = "I was unable to load high dividend stocks right now. Please check if the backend mock data server is available.";
      }
    } else if (lowercase.includes('sector') || lowercase.includes('industry')) {
      replyText = "Here is the compiled sector performance overview computed dynamically from daily stock price changes across the Nifty 50:";
      try {
        const quotesRes = await api.getAllQuotes();
        const quotes = quotesRes.data.quotes || [];
        
        const sectorPerf: Record<string, { totalChange: number; count: number; name: string }> = {};
        quotes.forEach((q: any) => {
          const sec = q.sector || 'Other';
          if (!sectorPerf[sec]) {
            sectorPerf[sec] = { totalChange: 0, count: 0, name: sec };
          }
          sectorPerf[sec].totalChange += q.change_pct;
          sectorPerf[sec].count += 1;
        });

        const sectors = Object.values(sectorPerf).map((s: any) => ({
          sector: s.name,
          avgChange: parseFloat((s.totalChange / s.count).toFixed(2))
        })).sort((a: any, b: any) => b.avgChange - a.avgChange);
        
        replyComponent = renderSectorPerformanceComponent(sectors);
      } catch (err) {
        console.error(err);
        replyText = "I was unable to calculate sector performance statistics. Please check if the backend mock data server is available.";
      }
    } else if (lowercase.includes('invest') || lowercase.includes('simulate') || lowercase.includes('amount')) {
      replyText = "I can definitely help you simulate an investment. To start, please select a company first or run the simulator on a specific stock detail page.";
    } else if (lowercase.includes('nifty') || lowercase.includes('index') || lowercase.includes('top 50')) {
      replyText = "The Nifty 50 represents the most liquid and highly capitalized companies on the National Stock Exchange (NSE) of India. We track and score the top 50 companies, including Reliance, TCS, HDFC Bank, Infosys, and more, based on a blended score of financials (35%), growth potential (25%), market sentiment (20%), and risk indicators (20%).";
    } else if (lowercase.includes('buy') || lowercase.includes('sell') || lowercase.includes('recommend')) {
      replyText = "Our AI scores companies out of 100 to issue recommendations: Strong Buy (78+), Buy (65-77), Hold (48-64), Reduce (35-47), and Sell (under 35). Tell me a specific company name and I'll pull its AI recommendation!";
    } else if (lowercase.includes('help') || lowercase.includes('faq') || lowercase.includes('what can you do')) {
      replyText = "As your NiftyAI assistant, I can: \n1. Conduct in-depth financial analysis of any of the top 50 NSE stocks.\n2. Walk you through beautiful milestones of their corporate history.\n3. Show daily return statistics and revenue breakdowns.\n4. Perform future investment value simulations based on active market indicators.\n5. Execute dynamic side-by-side sector peer comparisons (e.g. comparing RELIANCE with sector peers).\n\nWhich company are you interested in?";
    } else {
      replyText = "I hold real-time knowledge of all NIFTY 50 companies, financial algorithms, and risk indicators. Would you like to select a company to see its comprehensive AI-powered investment profile and animated history?";
      replyComponent = renderStep1CompanySelector();
    }

    setMessages(prev => [
      ...prev,
      {
        id: 'ai-faq-' + Date.now(),
        sender: 'ai',
        text: replyText,
        component: replyComponent,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setLoading(false);
  }

  return (
    <div className={`flex flex-col ${embedded ? 'h-full bg-transparent' : 'h-[600px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden'}`}>
      {/* Header */}
      {!embedded && (
        <div className="flex items-center gap-3 p-4 bg-slate-900 border-b border-slate-800">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-lg animate-pulse">
            🤖
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              NiftyAI Assistant
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            </h4>
            <p className="text-[10px] text-slate-400">Your smart Nifty investment companion</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar bg-[#090d16]">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            {m.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-sm shadow-md">
                🤖
              </div>
            )}
            <div className={`${m.type === 'sector-comparison' ? 'w-full max-w-full lg:max-w-[95%]' : 'max-w-[85%]'} space-y-2`}>
              {m.text && (
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-violet-605 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  } shadow-md`}
                  dangerouslySetInnerHTML={{
                    __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
              )}
              {m.type === 'sector-comparison' && m.comparisonData ? (
                <div className="w-full slide-in-left max-w-full">
                  <SectorComparisonBoard
                    selectedSymbol={m.comparisonData.selectedSymbol}
                    quotes={m.comparisonData.quotes}
                    recs={m.comparisonData.recs}
                    historicalReturnsBySymbol={m.comparisonData.historicalReturnsBySymbol}
                    onSymbolSelect={(sym) => handleSelectCompanyFlow(sym, true)}
                    onOpenFullComparison={(sym) => {
                      if (onCompanySelect) {
                        onCompanySelect(sym);
                      }
                    }}
                  />
                </div>
              ) : m.component ? (
                <div className="slide-in-left">
                  {m.component}
                </div>
              ) : null}
              <span className="text-[9px] text-slate-500 block px-1 mt-0.5">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-sm animate-spin">
              ⏳
            </div>
            <div className="bg-slate-900 border border-slate-800 text-slate-400 text-xs p-3 rounded-2xl rounded-tl-none shadow-md">
              AI is compiling market signals...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <div className="relative">
        {showSuggestions && filteredCompanies.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-[#0f172a]/95 backdrop-blur-md shadow-2xl p-1 divide-y divide-slate-800/40 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredCompanies.map((company, index) => (
              <div
                key={company.symbol}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectSuggestion(company);
                }}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                  index === activeSuggestionIndex
                    ? 'bg-violet-600/20 text-violet-200'
                    : 'text-slate-350 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CompanyLogo symbol={company.symbol} size="sm" />
                  <span className="font-bold text-slate-200">{company.symbol}</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{company.name}</span>
                </div>
                <span className="text-[9px] text-slate-500 uppercase font-medium bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/40">
                  Nifty 50
                </span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmitInput} className="p-3 bg-slate-900/80 border-t border-slate-800/80 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
            placeholder={selectedSymbol ? `Ask about ${selectedSymbol} or Nifty...` : "Ask anything about Nifty stocks..."}
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center justify-center"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Interactive Stock Comparision Sub-Component
// ----------------------------------------------------
interface InteractiveComparisonProps {
  companies: typeof COMPANIES;
  onCompare: (symbolA: string, symbolB: string) => void;
}

function InteractiveComparison({ companies, onCompare }: InteractiveComparisonProps) {
  const [range1, setRange1] = useState(10);
  const [range2, setRange2] = useState(10);

  const filteredList1 = companies.slice(0, range1);
  const filteredList2 = companies.slice(0, range2);

  const [selectedSym1, setSelectedSym1] = useState('RELIANCE');
  const [selectedSym2, setSelectedSym2] = useState('TCS');

  // Sync selected symbol with range changes to prevent undefined selections
  useEffect(() => {
    const list = companies.slice(0, range1);
    if (!list.some(c => c.symbol === selectedSym1)) {
      setSelectedSym1(list[0]?.symbol || '');
    }
  }, [range1, companies, selectedSym1]);

  useEffect(() => {
    const list = companies.slice(0, range2);
    if (!list.some(c => c.symbol === selectedSym2)) {
      setSelectedSym2(list[0]?.symbol || '');
    }
  }, [range2, companies, selectedSym2]);

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/95 max-w-sm space-y-4 shadow-2xl slide-in-left">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <span className="text-sm text-violet-400">⚔️</span>
        <h5 className="text-[10px] font-black text-violet-400 uppercase tracking-wider">Interactive Stock Comparision</h5>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Company 1 */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-col justify-between space-y-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Company 1</span>
          
          <div className="space-y-2">
            <div>
              <label className="text-[8px] font-semibold text-slate-500 block uppercase mb-1">Rank filter</label>
              <select
                value={range1}
                onChange={(e) => setRange1(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-350 focus:outline-none focus:border-violet-500"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={30}>Top 30</option>
                <option value={40}>Top 40</option>
                <option value={50}>Top 50</option>
              </select>
            </div>

            <div>
              <label className="text-[8px] font-semibold text-slate-500 block uppercase mb-1">Select stock</label>
              <select
                value={selectedSym1}
                onChange={(e) => setSelectedSym1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-violet-500"
              >
                {filteredList1.map(co => (
                  <option key={co.symbol} value={co.symbol}>{co.symbol} - {co.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Company 2 */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-col justify-between space-y-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Company 2</span>
          
          <div className="space-y-2">
            <div>
              <label className="text-[8px] font-semibold text-slate-500 block uppercase mb-1">Rank filter</label>
              <select
                value={range2}
                onChange={(e) => setRange2(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-350 focus:outline-none focus:border-violet-500"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={30}>Top 30</option>
                <option value={40}>Top 40</option>
                <option value={50}>Top 50</option>
              </select>
            </div>

            <div>
              <label className="text-[8px] font-semibold text-slate-500 block uppercase mb-1">Select stock</label>
              <select
                value={selectedSym2}
                onChange={(e) => setSelectedSym2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-violet-500"
              >
                {filteredList2.map(co => (
                  <option key={co.symbol} value={co.symbol}>{co.symbol} - {co.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onCompare(selectedSym1, selectedSym2)}
        disabled={selectedSym1 === selectedSym2}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg border border-violet-500/30"
      >
        <span>⚔️</span> Compare Stocks Side-by-Side
      </button>
    </div>
  );
}

