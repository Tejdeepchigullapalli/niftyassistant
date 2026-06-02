import React, { useState, useEffect, useCallback } from 'react';
import { api, formatCurrency, getRecBadgeClass, getRecColor, getScoreColor } from '../utils/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line
} from 'recharts';

const COMPANY_DOMAINS: Record<string, string> = {
  RELIANCE: 'relianceindustries.com',
  TCS: 'tcs.com',
  HDFCBANK: 'hdfcbank.com',
  BHARTIARTL: 'airtel.in',
  ICICIBANK: 'icicibank.com',
  INFY: 'infosys.com',
  SBIN: 'sbi.co.in',
  HINDUNILVR: 'hul.co.in',
  ITC: 'itcportal.com',
  LT: 'larsentoubro.com',
  HCLTECH: 'hcltech.com',
  AXISBANK: 'axisbank.com',
  SUNPHARMA: 'sunpharma.com',
  MARUTI: 'marutisuzuki.com',
  KOTAKBANK: 'kotak.com',
  ULTRACEMCO: 'ultratechcement.com',
  NTPC: 'ntpc.co.in',
  TATAMOTORS: 'tatamotors.com',
  ONGC: 'ongcindia.com',
  COALINDIA: 'coalindia.in',
  POWERGRID: 'powergrid.in',
  TITAN: 'titancompany.in',
  ADANIENT: 'adani.com',
  ADANIPORTS: 'adaniports.com',
  'M&M': 'mahindra.com',
  JSWSTEEL: 'jsw.in',
  ASIANPAINT: 'asianpaints.com',
  HINDALCO: 'hindalco.com',
  TATASTEEL: 'tatasteel.com',
  GRASIM: 'grasim.com',
  WIPRO: 'wipro.com',
  TECHM: 'techmahindra.com',
  NESTLEIND: 'nestle.in',
  LTIM: 'ltimindtree.com',
  INDUSINDBK: 'indusind.com',
  BAJFINANCE: 'bajajfinance.in',
  BAJAJFINSV: 'bajajfinserv.in',
  CIPLA: 'cipla.com',
  DRREDDY: 'drreddys.com',
  APOLLOHOSP: 'apollohospitals.com',
  SBILIFE: 'sbilife.co.in',
  EICHERMOT: 'eichermotors.com',
  BPCL: 'bharatpetroleum.in',
  DIVISLAB: 'divislabs.com',
  HEROCOCO: 'heromotocorp.com',
  BRITANNIA: 'britannia.co.in',
  JIOFIN: 'jiofinancial.com',
  SHREECEM: 'shreecement.com',
  BEL: 'bel-india.in',
  HAL: 'hal-india.co.in'
};

interface CompanyLogoProps {
  symbol: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CompanyLogo({ symbol, className = '', size = 'md' }: CompanyLogoProps) {
  const sym = symbol.toUpperCase().trim();
  const meta = NIFTY_50_COMPANIES.find(c => c.symbol === sym) || { color: '#8b5cf6', name: sym };
  const domain = COMPANY_DOMAINS[sym];
  
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [fallbackLevel, setFallbackLevel] = useState(0); // 0 = Clearbit, 1 = Google Favicon, 2 = Monogram Text

  useEffect(() => {
    if (domain) {
      setImgSrc(`https://logo.clearbit.com/${domain}`);
      setFallbackLevel(0);
    } else {
      setFallbackLevel(2);
    }
  }, [domain, sym]);

  const handleImageError = () => {
    if (fallbackLevel === 0 && domain) {
      setImgSrc(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
      setFallbackLevel(1);
    } else {
      setFallbackLevel(2);
    }
  };

  // Get dynamic initials (e.g. RELIANCE -> RI, HDFCBANK -> HB)
  let initials = sym.slice(0, 2);
  if (sym === 'RELIANCE') initials = 'RI';
  if (sym === 'HDFCBANK') initials = 'HB';
  if (sym === 'BHARTIARTL') initials = 'BA';
  if (sym === 'ICICIBANK') initials = 'IB';
  if (sym === 'HINDUNILVR') initials = 'HU';
  if (sym === 'ASIANPAINT') initials = 'AP';
  if (sym === 'TATASTEEL') initials = 'TS';
  if (sym === 'TATAMOTORS') initials = 'TM';
  if (sym === 'SUNPHARMA') initials = 'SP';
  if (sym === 'KOTAKBANK') initials = 'KB';
  if (sym === 'COALINDIA') initials = 'CI';
  if (sym === 'POWERGRID') initials = 'PG';
  if (sym === 'JSWSTEEL') initials = 'JS';
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-[8px]',
    md: 'w-8 h-8 text-[9px]',
    lg: 'w-10 h-10 text-[11px]'
  };

  if (fallbackLevel < 2 && imgSrc) {
    return (
      <div 
        className={`rounded-full overflow-hidden flex items-center justify-center bg-slate-950 border border-slate-800/80 flex-shrink-0 ${sizeClasses[size]} ${className}`}
        style={{
          boxShadow: `0 0 10px rgba(0,0,0,0.4)`
        }}
      >
        <img 
          src={imgSrc} 
          alt={`${sym} logo`}
          className="w-[75%] h-[75%] object-contain"
          onError={handleImageError}
        />
      </div>
    );
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-extrabold text-white shadow-lg tracking-tight select-none flex-shrink-0 ${sizeClasses[size]} ${className}`}
      style={{
        background: `radial-gradient(circle at top left, ${meta.color}c0, ${meta.color})`,
        border: `1px solid ${meta.color}60`,
        boxShadow: `0 0 12px ${meta.color}30`
      }}
    >
      {initials}
    </div>
  );
}

// Top 50 Nifty Companies matching constants
const NIFTY_50_COMPANIES = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', logo: '🔴', color: '#e11d48', basePrice: 2936.12, changePct: 1.58, rank: 1, sector: 'Energy & Retail', industry: 'Conglomerate' },
  { symbol: 'TCS',      name: 'Tata Consultancy Services', logo: '🔵', color: '#2563eb', basePrice: 3915.20, changePct: 0.85, rank: 2, sector: 'Information Technology', industry: 'IT Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', logo: '🟣', color: '#7c3aed', basePrice: 1682.40, changePct: -0.45, rank: 3, sector: 'Banking & Financial', industry: 'Private Bank' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', logo: '🟠', color: '#ea580c', basePrice: 1541.35, changePct: 2.15, rank: 4, sector: 'Telecom', industry: 'Telecommunications' },
  { symbol: 'ICICIBANK',name: 'ICICI Bank Ltd', logo: '🟡', color: '#d97706', basePrice: 1285.90, changePct: 1.10, rank: 5, sector: 'Banking & Financial', industry: 'Private Bank' },
  { symbol: 'INFY',     name: 'Infosys Ltd', logo: '🟢', color: '#16a34a', basePrice: 1468.75, changePct: 0.95, rank: 6, sector: 'Information Technology', industry: 'IT Services' },
  { symbol: 'SBIN',     name: 'State Bank of India', logo: '🔷', color: '#0284c7', basePrice: 812.40, changePct: 0.62, rank: 7, sector: 'Banking & Financial', industry: 'Public Sector Bank' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', logo: '🟤', color: '#92400e', basePrice: 2534.65, changePct: 1.32, rank: 8, sector: 'FMCG', industry: 'Consumer Goods' },
  { symbol: 'ITC',      name: 'ITC Ltd', logo: '⚫', color: '#374151', basePrice: 444.75, changePct: 0.31, rank: 9, sector: 'FMCG & Diversified', industry: 'Conglomerate' },
  { symbol: 'LT',       name: 'Larsen & Toubro Ltd', logo: '🔶', color: '#b45309', basePrice: 3625.80, changePct: 1.88, rank: 10, sector: 'Infrastructure', industry: 'Engineering' },
  { symbol: 'HCLTECH',  name: 'HCL Technologies Ltd', logo: '💻', color: '#06b6d4', basePrice: 1345.50, changePct: 0.45, rank: 11, sector: 'Information Technology', industry: 'IT Services' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', logo: '🔴', color: '#be123c', basePrice: 1042.80, changePct: -0.15, rank: 12, sector: 'Banking & Financial', industry: 'Private Bank' },
  { symbol: 'SUNPHARMA',name: 'Sun Pharmaceutical Ltd', logo: '💊', color: '#059669', basePrice: 1540.20, changePct: 1.25, rank: 13, sector: 'Healthcare', industry: 'Pharmaceuticals' },
  { symbol: 'MARUTI',   name: 'Maruti Suzuki India Ltd', logo: '🚗', color: '#1e3a8a', basePrice: 12420.50, changePct: 2.10, rank: 14, sector: 'Automobile', industry: 'Passenger Vehicles' },
  { symbol: 'KOTAKBANK',name: 'Kotak Mahindra Bank', logo: '🔴', color: '#b91c1c', basePrice: 1721.40, changePct: -0.65, rank: 15, sector: 'Banking & Financial', industry: 'Private Bank' },
  { symbol: 'ULTRACEMCO',name: 'UltraTech Cement Ltd', logo: '🧱', color: '#4b5563', basePrice: 9840.50, changePct: 0.35, rank: 16, sector: 'Materials', industry: 'Cement' },
  { symbol: 'NTPC',     name: 'NTPC Ltd', logo: '⚡', color: '#047857', basePrice: 362.40, changePct: -0.80, rank: 17, sector: 'Utilities', industry: 'Power Generation' },
  { symbol: 'TATAMOTORS',name: 'Tata Motors Ltd', logo: '🚚', color: '#1d4ed8', basePrice: 942.30, changePct: 1.65, rank: 18, sector: 'Automobile', industry: 'Commercial Vehicles' },
  { symbol: 'ONGC',     name: 'Oil & Natural Gas Corp', logo: '🔥', color: '#b45309', basePrice: 275.60, changePct: -1.10, rank: 19, sector: 'Utilities', industry: 'Oil exploration' },
  { symbol: 'COALINDIA',name: 'Coal India Ltd', logo: '⬛', color: '#111827', basePrice: 462.15, changePct: 0.85, rank: 20, sector: 'Utilities', industry: 'Coal Mining' },
  { symbol: 'POWERGRID',name: 'Power Grid Corp', logo: '🎛️', color: '#0369a1', basePrice: 312.45, changePct: 0.25, rank: 21, sector: 'Utilities', industry: 'Power Transmission' },
  { symbol: 'TITAN',    name: 'Titan Company Ltd', logo: '💎', color: '#7c2d12', basePrice: 3241.60, changePct: -0.40, rank: 22, sector: 'FMCG', industry: 'Jewellery & Watches' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', logo: '🦅', color: '#312e81', basePrice: 3122.50, changePct: 2.45, rank: 23, sector: 'Diversified', industry: 'Conglomerate' },
  { symbol: 'ADANIPORTS',name: 'Adani Ports & SEZ', logo: '⚓', color: '#1e1b4b', basePrice: 1284.60, changePct: 1.95, rank: 24, sector: 'Infrastructure', industry: 'Ports & Logistics' },
  { symbol: 'M&M',      name: 'Mahindra & Mahindra', logo: '🚜', color: '#991b1b', basePrice: 2842.10, changePct: 1.15, rank: 25, sector: 'Automobile', industry: 'Diversified Vehicles' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', logo: '🏗️', color: '#0f172a', basePrice: 875.40, changePct: 0.65, rank: 26, sector: 'Materials', industry: 'Steel Production' },
  { symbol: 'ASIANPAINT',name: 'Asian Paints Ltd', logo: '🎨', color: '#701a75', basePrice: 2854.20, changePct: -1.05, rank: 27, sector: 'FMCG', industry: 'Paints & Decors' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries', logo: '🏭', color: '#14532d', basePrice: 642.15, changePct: 1.35, rank: 28, sector: 'Materials', industry: 'Aluminium' },
  { symbol: 'TATASTEEL',name: 'Tata Steel Ltd', logo: '⚙️', color: '#0369a1', basePrice: 165.40, changePct: 0.20, rank: 29, sector: 'Materials', industry: 'Steel Production' },
  { symbol: 'GRASIM',   name: 'Grasim Industries Ltd', logo: '🧶', color: '#581c87', basePrice: 2354.20, changePct: 0.90, rank: 30, sector: 'Diversified', industry: 'Textiles & Cement' },
  { symbol: 'WIPRO',    name: 'Wipro Ltd', logo: '🌈', color: '#1e40af', basePrice: 462.15, changePct: -0.15, rank: 31, sector: 'Information Technology', industry: 'IT Services' },
  { symbol: 'TECHM',    name: 'Tech Mahindra Ltd', logo: '🌐', color: '#be123c', basePrice: 1242.30, changePct: -0.75, rank: 32, sector: 'Information Technology', industry: 'IT Services' },
  { symbol: 'NESTLEIND',name: 'Nestle India Ltd', logo: '☕', color: '#4b5563', basePrice: 24500.60, changePct: 0.40, rank: 33, sector: 'FMCG', industry: 'Packaged Foods' },
  { symbol: 'LTIM',     name: 'LTIMindtree Ltd', logo: '🏢', color: '#2e1065', basePrice: 4850.25, changePct: 0.65, rank: 34, sector: 'Information Technology', industry: 'IT Services' },
  { symbol: 'INDUSINDBK',name: 'IndusInd Bank Ltd', logo: '🦁', color: '#c2410c', basePrice: 1421.40, changePct: -0.30, rank: 35, sector: 'Banking & Financial', industry: 'Private Bank' },
  { symbol: 'BAJFINANCE',name: 'Bajaj Finance Ltd', logo: '💵', color: '#0369a1', basePrice: 6842.10, changePct: -1.45, rank: 36, sector: 'Banking & Financial', industry: 'NBFC' },
  { symbol: 'BAJAJFINSV',name: 'Bajaj Finserv Ltd', logo: '🛡️', color: '#0284c7', basePrice: 1542.30, changePct: -1.25, rank: 37, sector: 'Banking & Financial', industry: 'NBFC' },
  { symbol: 'CIPLA',    name: 'Cipla Ltd', logo: '🔬', color: '#047857', basePrice: 1425.40, changePct: 0.80, rank: 38, sector: 'Healthcare', industry: 'Pharmaceuticals' },
  { symbol: 'DRREDDY',  name: 'Dr Reddys Laboratories', logo: '🧪', color: '#065f46', basePrice: 5845.20, changePct: 1.10, rank: 39, sector: 'Healthcare', industry: 'Pharmaceuticals' },
  { symbol: 'APOLLOHOSP',name: 'Apollo Hospitals', logo: '🏥', color: '#991b1b', basePrice: 5940.50, changePct: 1.85, rank: 40, sector: 'Healthcare', industry: 'Hospitals' },
  { symbol: 'SBILIFE',  name: 'SBI Life Insurance', logo: '🛡️', color: '#0369a1', basePrice: 1420.20, changePct: 0.35, rank: 41, sector: 'Banking & Financial', industry: 'Life Insurance' },
  { symbol: 'EICHERMOT',name: 'Eicher Motors Ltd', logo: '🏍️', color: '#854d0e', basePrice: 4540.60, changePct: 1.45, rank: 42, sector: 'Automobile', industry: 'Motorcycles' },
  { symbol: 'BPCL',     name: 'Bharat Petroleum', logo: '⛽', color: '#0369a1', basePrice: 612.40, changePct: 0.15, rank: 43, sector: 'Utilities', industry: 'Oil Refining' },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories', logo: '🧪', color: '#15803d', basePrice: 3840.50, changePct: -0.90, rank: 44, sector: 'Healthcare', industry: 'Biotechnologies' },
  { symbol: 'HEROCOCO', name: 'Hero MotoCorp Ltd', logo: '🛵', color: '#991b1b', basePrice: 4842.10, changePct: 0.65, rank: 45, sector: 'Automobile', industry: 'Motorcycles' },
  { symbol: 'BRITANNIA',name: 'Britannia Industries', logo: '🍪', color: '#854d0e', basePrice: 5240.20, changePct: 1.30, rank: 46, sector: 'FMCG', industry: 'Packaged Foods' },
  { symbol: 'JIOFIN',   name: 'Jio Financial Services', logo: '💎', color: '#4338ca', basePrice: 362.45, changePct: 2.10, rank: 47, sector: 'Banking & Financial', industry: 'NBFC' },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd', logo: '🧱', color: '#374151', basePrice: 24500.20, changePct: -0.45, rank: 48, sector: 'Materials', industry: 'Cement' },
  { symbol: 'BEL',      name: 'Bharat Electronics Ltd', logo: '📡', color: '#047857', basePrice: 285.40, changePct: 3.10, rank: 49, sector: 'Infrastructure', industry: 'Defense Tech' },
  { symbol: 'HAL',      name: 'Hindustan Aeronautics', logo: '✈️', color: '#0369a1', basePrice: 4242.10, changePct: 3.45, rank: 50, sector: 'Infrastructure', industry: 'Aerospace & Defense' }
];

const REVENUE_BREAKDOWN: Record<string, { label: string; name: string; value: number }[]> = {
  RELIANCE: [
    { label: 'Oil & Gas', name: 'Oil & Gas 38%', value: 38 },
    { label: 'Retail', name: 'Retail 28%', value: 28 },
    { label: 'Petrochemicals', name: 'Petrochemicals 16%', value: 16 },
    { label: 'Telecom', name: 'Telecom 10%', value: 10 },
    { label: 'Others', name: 'Others 8%', value: 8 },
  ],
  TCS: [
    { label: 'BFSI', name: 'BFSI 32%', value: 32 },
    { label: 'Retail & CPG', name: 'Retail & CPG 16%', value: 16 },
    { label: 'Communication', name: 'Communication 12%', value: 12 },
    { label: 'Manufacturing', name: 'Manufacturing 10%', value: 10 },
    { label: 'Others', name: 'Others 30%', value: 30 },
  ],
  HDFCBANK: [
    { label: 'Retail Banking', name: 'Retail 45%', value: 45 },
    { label: 'Wholesale Banking', name: 'Wholesale 35%', value: 35 },
    { label: 'Treasury', name: 'Treasury 15%', value: 15 },
    { label: 'Others', name: 'Others 5%', value: 5 },
  ]
};

const DAILY_RETURNS = [
  { date: 'May 10', change: 1.25 },
  { date: 'May 13', change: -0.85 },
  { date: 'May 14', change: 2.35 },
  { date: 'May 15', change: -1.45 },
  { date: 'May 16', change: 3.15 },
  { date: 'May 17', change: 0.75 },
];

const PIE_COLORS = ['#8b5cf6', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

// Double line chart comparing RELIANCE vs NIFTY 50 (1Y relative growth)
const DUAL_CHART_MOCK = [
  { name: 'Jun 23', Asset: 0, Nifty50: 0 },
  { name: 'Aug 23', Asset: 5, Nifty50: 2 },
  { name: 'Oct 23', Asset: -2, Nifty50: 1 },
  { name: 'Dec 23', Asset: 12, Nifty50: 6 },
  { name: 'Feb 24', Asset: 18, Nifty50: 9 },
  { name: 'Apr 24', Asset: 15, Nifty50: 8 },
  { name: 'May 24', Asset: 18.45, Nifty50: 10.27 }
];

interface DashboardViewProps {
  onSymbolSelect?: (symbol: string) => void;
  initialSymbol?: string;
  onNavigateToChat?: (query?: string, symbol?: string) => void;
  filterLimit?: number;
  quotes?: any[];
}

export default function DashboardView({ onSymbolSelect, initialSymbol = 'RELIANCE', onNavigateToChat, filterLimit = 50, quotes = [] }: DashboardViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(true);
  const [askInput, setAskInput] = useState('');
  const [currentLimit, setCurrentLimit] = useState(filterLimit);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'detail'>('list');

  // Loaded Details State
  const [quote, setQuote] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [sentiment, setSentiment] = useState<any>(null);
  const [corporate, setCorporate] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  // Sync external sidebar filterLimit prop with local state
  useEffect(() => {
    setCurrentLimit(filterLimit);
  }, [filterLimit]);

  // Sliced companies table list based on local active limit
  const displayCompanies = NIFTY_50_COMPANIES.slice(0, currentLimit);

  // Search filter
  const filteredCompanies = displayCompanies.filter(c =>
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchStockDetails = useCallback(async (symbol: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [q, h, f, r, s, c, rec] = await Promise.all([
        api.getQuote(symbol),
        api.getHistory(symbol, period),
        api.getFinancial(symbol),
        api.getRisk(symbol),
        api.getSentiment(symbol),
        api.getCorporate(symbol),
        api.getRecommendation(symbol),
      ]);
      setQuote(q.data);
      setHistory(h.data);
      setFinancial(f.data);
      setRisk(r.data);
      setSentiment(s.data);
      setCorporate(c.data);
      setRecommendation(rec.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStockDetails(selectedSymbol, false);
    
    const interval = setInterval(() => {
      fetchStockDetails(selectedSymbol, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedSymbol, fetchStockDetails]);

  // Sync historical period updates
  useEffect(() => {
    api.getHistory(selectedSymbol, period).then(r => setHistory(r.data)).catch(console.error);
  }, [period, selectedSymbol]);

  const handleCompanyClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setMobileActiveView('detail');
    if (onSymbolSelect) {
      onSymbolSelect(symbol);
    }
  };

  const chartData = history?.data?.map((d: any) => ({ ...d, close: d.close })) || [];
  
  // Custom metadata sector mapping for active symbol
  const activeCompanyMetadata = NIFTY_50_COMPANIES.find(c => c.symbol === selectedSymbol) || NIFTY_50_COMPANIES[0];

  const revenueData = REVENUE_BREAKDOWN[selectedSymbol] || [
    { label: 'Core Operations', name: 'Core 60%', value: 60 },
    { label: 'Secondary Operations', name: 'Secondary 25%', value: 25 },
    { label: 'Others', name: 'Others 15%', value: 15 }
  ];
  const totalRevenueText = selectedSymbol === 'RELIANCE' ? '₹9,83,146 Cr' : selectedSymbol === 'TCS' ? '₹2,40,893 Cr' : '₹1,50,000 Cr';
  const score = recommendation?.ai_investment_score || 79;

  const getPeers = () => {
    const activeSector = activeCompanyMetadata.sector;
    const peers = NIFTY_50_COMPANIES.filter(c => c.sector === activeSector && c.symbol !== selectedSymbol).slice(0, 2);
    while (peers.length < 2) {
      const fallback = NIFTY_50_COMPANIES.find(c => c.symbol !== selectedSymbol && !peers.some(p => p.symbol === c.symbol));
      if (fallback) peers.push(fallback);
      else break;
    }
    return peers;
  };

  const renderOverviewTab = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* 1. Shareholding Allocation */}
        <div className="card p-3 bg-slate-950/20 border border-slate-850/60 shadow-xl space-y-2.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Shareholding Allocation</span>
          <div className="space-y-1.5 h-32 overflow-y-auto chat-scrollbar pr-1 flex flex-col justify-center">
            {[
              { label: 'Promoter', pct: 50.33, color: 'bg-violet-600' },
              { label: 'FII', pct: 23.15, color: 'bg-indigo-500' },
              { label: 'DII', pct: 15.42, color: 'bg-cyan-500' },
              { label: 'Public', pct: 11.10, color: 'bg-emerald-500' }
            ].map((item, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between text-[8px] font-semibold">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-slate-200">{item.pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Strategy & Directives */}
        <div className="card p-3 bg-slate-950/20 border border-slate-850/60 shadow-xl space-y-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">AI Corporate Profile & Rationale</span>
          <div className="space-y-1.5 h-32 overflow-y-auto chat-scrollbar pr-1">
            <p className="text-[10px] text-slate-350 leading-relaxed font-light">
              <strong>{quote?.name} ({selectedSymbol})</strong> represents a cornerstone holding inside the <strong>{activeCompanyMetadata.sector}</strong> space. Its extensive capitalization matching <strong>{activeCompanyMetadata.industry}</strong> protocols secures deep operational moat channels.
            </p>
            {corporate?.strategic_goals && (
              <div className="border-t border-slate-850/65 pt-1.5 mt-1.5">
                <span className="text-[8px] font-bold text-violet-400 uppercase tracking-wider block mb-1">Strategic Objective</span>
                <p className="text-[9px] text-slate-450 leading-snug flex gap-1.5">
                  <span className="text-violet-500">•</span>
                  <span>{corporate.strategic_goals[0]}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. AI Dial needle Confidence gauge */}
        <div className="card p-3 bg-slate-950/20 border border-slate-850/60 shadow-xl space-y-2 relative overflow-hidden flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">AI Investment Recommendation</span>
          
          <div className="relative h-24 flex items-center justify-center mt-1">
            <svg className="w-36 h-20" viewBox="0 0 100 55">
              <defs>
                <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="rgba(30, 41, 59, 0.4)" 
                strokeWidth="8" 
                strokeLinecap="round" 
              />
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="url(#gaugeGrad)" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (score / 100) * 125.6}
              />
              {(() => {
                const angle = (score / 100) * 180 - 180;
                const rad = (angle * Math.PI) / 180;
                const length = 32;
                const nx = 50 + length * Math.cos(rad);
                const ny = 50 + length * Math.sin(rad);
                return (
                  <>
                    <line x1="50" y1="50" x2={nx} y2={ny} stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="3.5" fill="#f8fafc" />
                  </>
                );
              })()}
            </svg>
            
            <div className="absolute text-center pt-8">
              <span className="text-xs font-black text-slate-100 block">{score}%</span>
              <span className="text-[7px] text-slate-550 uppercase block tracking-wider font-semibold">Confidence Score</span>
            </div>
          </div>

          <div className="flex justify-center gap-1 flex-wrap flex-shrink-0">
            {['Strong Fundamentals', 'Good Growth', 'Low Risk'].map((b, idx) => (
              <span key={idx} className="text-[6.5px] px-1.5 py-0.5 rounded bg-violet-600/10 border border-violet-500/20 text-violet-400 font-extrabold tracking-wider uppercase">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialsTab = () => {
    const scores = financial?.scores || { valuation: 60, profitability: 70, growth: 65, financial_health: 75, cashflow: 68, earnings_quality: 70 };
    const financialScoreData = [
      { name: 'Valuation', Score: scores.valuation, fill: '#8b5cf6' },
      { name: 'Profit', Score: scores.profitability, fill: '#6366f1' },
      { name: 'Growth', Score: scores.growth, fill: '#10b981' },
      { name: 'Health', Score: scores.financial_health, fill: '#f59e0b' },
      { name: 'Cashflow', Score: scores.cashflow, fill: '#ec4899' },
      { name: 'Quality', Score: scores.earnings_quality, fill: '#06b6d4' }
    ];

    return (
      <div className="card p-5 bg-slate-950/20 border border-slate-850/60 shadow-2xl space-y-5">
        <h4 className="text-xs font-black text-violet-400 uppercase tracking-wider block mb-1">
          📊 Core Ratios & Financial Health Scorecard
        </h4>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between h-48">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Revenue Breakdown Splits</span>
              <div className="flex gap-2 items-center h-28">
                <div className="h-full w-1/2 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={38}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <span className="text-[6px] text-slate-500 uppercase block">Total Rev</span>
                    <span className="text-[8px] font-bold text-slate-200 block truncate max-w-[55px]">{totalRevenueText}</span>
                  </div>
                </div>
                <div className="w-1/2 space-y-1 overflow-y-auto chat-scrollbar h-full pr-1">
                  {revenueData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[8.5px]">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-slate-400 truncate w-14 block">{item.label}</span>
                      <span className="text-slate-200 font-bold ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between h-48">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">AI Health Index Ratings</span>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialScoreData}>
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 7 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 7 }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 8 }} 
                      itemStyle={{ color: '#f8fafc' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                      {financialScoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="xl:col-span-4 bg-slate-950/45 p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider block mb-2">Fundamental Ledger</span>
            <div className="space-y-2 text-xs">
              {[
                { label: 'EPS (Earnings/Share)', val: quote?.eps ? `₹${quote.eps.toFixed(1)}` : '₹74.5' },
                { label: 'Debt to Equity', val: quote?.debt_equity ? quote.debt_equity.toFixed(2) : '0.45' },
                { label: 'Revenue Growth', val: quote?.revenue_growth ? `${(quote.revenue_growth * 100).toFixed(1)}%` : '12.4%' },
                { label: 'Earnings Growth', val: quote?.earnings_growth ? `${(quote.earnings_growth * 100).toFixed(1)}%` : '15.6%' },
                { label: 'Free Cash Flow', val: quote?.free_cashflow ? formatCurrency(quote.free_cashflow) : '₹42,000Cr' },
                { label: 'P/B Value Ratio', val: quote?.pb_ratio ? quote.pb_ratio.toFixed(2) : '3.82' }
              ].map((ratio, i) => (
                <div key={i} className="flex justify-between border-b border-slate-850 pb-1.5">
                  <span className="text-slate-400 text-[10px]">{ratio.label}</span>
                  <span className="text-slate-100 font-extrabold text-[10.5px]">{ratio.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    return (
      <div className="card p-5 bg-slate-950/20 border border-slate-850/60 shadow-2xl space-y-5">
        <h4 className="text-xs font-black text-violet-400 uppercase tracking-wider block mb-1">
          📈 Technical Indicators & Price Momentum
        </h4>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between h-48">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Stock Price Path (Last 30 Days)</span>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.slice(-30)}>
                    <defs>
                      <linearGradient id="priceVioletPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 7 }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fill: '#475569', fontSize: 7 }} domain={['auto', 'auto']} tickFormatter={v => `₹${Math.round(v)}`} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 8 }} 
                      itemStyle={{ color: '#f8fafc' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area type="monotone" dataKey="close" stroke="#8b5cf6" strokeWidth={2} fill="url(#priceVioletPerf)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between h-48">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Historical Returns (Daily Profit / Loss)</span>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DAILY_RETURNS}>
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 7 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 7 }} unit="%" />
                    <Bar dataKey="change">
                      {DAILY_RETURNS.map((entry, idx) => (
                        <Cell key={idx} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="xl:col-span-4 bg-slate-950/45 p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider block mb-2">Momentum Scorecard</span>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Traded Price (LTP)', val: `₹${quote?.current_price?.toLocaleString('en-IN') || '—'}` },
                { label: '52-Week High Price', val: `₹${quote?.['52w_high']?.toLocaleString('en-IN') || '—'}` },
                { label: '52-Week Low Price', val: `₹${quote?.['52w_low']?.toLocaleString('en-IN') || '—'}` },
                { label: 'Traded Volume (Daily)', val: quote?.volume ? formatCurrency(quote.volume).replace('₹', '') : '48.2L shares' },
                { label: 'Volatility Beta Rating', val: selectedSymbol === 'RELIANCE' ? '0.68 (Low Vol)' : selectedSymbol === 'TCS' ? '0.72 (Low Vol)' : '0.92 (Medium Vol)' },
                { label: 'Opening Price Today', val: `₹${quote?.open?.toLocaleString('en-IN') || '—'}` }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between border-b border-slate-850 pb-1.5">
                  <span className="text-slate-400 text-[10px]">{stat.label}</span>
                  <span className="text-slate-100 font-extrabold text-[10.5px]">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNewsTab = () => {
    const articles = sentiment?.articles || [];
    const overallSentimentText = sentiment?.overall_sentiment || 'Bullish';
    const perceptionIndex = sentiment?.market_perception_index || 75;

    return (
      <div className="card p-5 bg-slate-950/20 border border-slate-850/60 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-850/80 pb-3">
          <div>
            <h4 className="text-xs font-black text-violet-400 uppercase tracking-wider block mb-0.5">
              📡 News & Market Sentiment Indices
            </h4>
            <p className="text-[10px] text-slate-500">Live perception tracking based on leading financial publications.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 px-3 py-1 rounded-xl text-center shadow-sm">
              <span className="text-[8px] text-slate-500 uppercase block font-bold">Overall Perception</span>
              <span className="text-xs font-black">{overallSentimentText}</span>
            </div>
            <div className="bg-indigo-950/20 border border-indigo-900/30 text-indigo-400 px-3 py-1 rounded-xl text-center shadow-sm">
              <span className="text-[8px] text-slate-500 uppercase block font-bold">Bullish Index</span>
              <span className="text-xs font-black">{perceptionIndex}%</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          <div className="xl:col-span-8 space-y-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Recent Articles & Press Coverage</span>
            <div className="space-y-2.5 overflow-y-auto chat-scrollbar max-h-[320px] pr-1">
              {articles.map((art: any, i: number) => (
                <div key={i} className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl hover:border-slate-800 transition-colors flex flex-col justify-between shadow">
                  <div className="flex justify-between items-start gap-3 mb-1.5">
                    <h5 className="text-[11px] font-bold text-slate-200 leading-snug">{art.headline}</h5>
                    <span className={`text-[7.5px] px-1.5 py-0.5 rounded font-black uppercase flex-shrink-0 ${
                      art.sentiment === 'positive' 
                        ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-400' 
                        : 'bg-rose-950/30 border border-rose-900/40 text-rose-400'
                    }`}>
                      {art.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[8.5px] text-slate-550">
                    <span className="font-semibold text-slate-450">{art.source}</span>
                    <span>{art.published_at}</span>
                  </div>
                </div>
              ))}
              {articles.length === 0 && (
                <p className="text-[10px] text-slate-600 text-center py-6">No recent articles found.</p>
              )}
            </div>
          </div>
          <div className="xl:col-span-4 bg-slate-950/45 p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider block">Sentiment Distribution</span>
              <div className="space-y-2.5">
                {[
                  { label: 'Positive Indicators', pct: sentiment?.positive_pct || 65, color: 'bg-emerald-500' },
                  { label: 'Neutral Ratios', pct: sentiment?.neutral_pct || 20, color: 'bg-slate-500' },
                  { label: 'Negative Headwinds', pct: sentiment?.negative_pct || 15, color: 'bg-rose-500' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-[8px] font-semibold">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-slate-200">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850/50 mt-4 text-[8px] text-slate-500 leading-snug">
              ⚖️ Sentiment represents algorithmic crawling of positive, neutral, and negative press mentions. Not transactional indicators.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPeerComparisonTab = () => {
    const peers = getPeers();
    return (
      <div className="card p-5 bg-slate-950/20 border border-slate-850/60 shadow-2xl space-y-4">
        <h4 className="text-xs font-black text-violet-400 uppercase tracking-wider block mb-1">
          📊 Sector Peer Comparison Board ({activeCompanyMetadata.sector})
        </h4>
        <p className="text-[10px] text-slate-500 leading-snug">
          Compare <strong>{selectedSymbol}</strong> with key competitors in the same sector based on live-like indicators and AI investment weights.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/30">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-950/60 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="p-3">Company</th>
                <th className="p-3 text-right">LTP (Price)</th>
                <th className="p-3 text-right">Change %</th>
                <th className="p-3 text-right">P/E Ratio</th>
                <th className="p-3 text-right">AI Score</th>
                <th className="p-3 text-center">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              <tr className="bg-violet-600/10 border-l-2 border-violet-500 font-semibold">
                <td className="p-3 flex items-center gap-2">
                  <CompanyLogo symbol={selectedSymbol} size="md" />
                  <div>
                    <span className="text-slate-100 block truncate max-w-[120px]">{activeCompanyMetadata.name}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">{selectedSymbol} (Active)</span>
                  </div>
                </td>
                <td className="p-3 text-right text-slate-100 font-black">₹{quote?.current_price?.toLocaleString('en-IN')}</td>
                <td className={`p-3 text-right font-bold ${quote?.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {quote?.change_pct >= 0 ? '+' : ''}{quote?.change_pct?.toFixed(2)}%
                </td>
                <td className="p-3 text-right text-slate-200">{quote?.pe_ratio?.toFixed(1) || '—'}</td>
                <td className="p-3 text-right font-black text-violet-400">{recommendation?.ai_investment_score}/100</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getRecBadgeClass(recommendation?.recommendation)}`}>
                    {recommendation?.recommendation}
                  </span>
                </td>
              </tr>
              {peers.map((peer) => {
                const peerChangePct = peer.changePct;
                const peerPE = parseFloat((Math.random() * 12 + 18).toFixed(1));
                const peerScore = Math.floor(Math.random() * 25 + 55);
                const peerRec = peerScore >= 75 ? 'Buy' : peerScore >= 50 ? 'Hold' : 'Reduce';

                return (
                  <tr key={peer.symbol} className="hover:bg-slate-900/40">
                    <td className="p-3 flex items-center gap-2">
                      <CompanyLogo symbol={peer.symbol} size="md" />
                      <div>
                        <span className="text-slate-200 block truncate max-w-[120px]">{peer.name}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">{peer.symbol}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-200">₹{peer.basePrice?.toLocaleString('en-IN')}</td>
                    <td className={`p-3 text-right font-bold ${peerChangePct >= 0 ? 'text-emerald-550' : 'text-rose-550'}`}>
                      {peerChangePct >= 0 ? '+' : ''}{peerChangePct}%
                    </td>
                    <td className="p-3 text-right text-slate-350">{peerPE}</td>
                    <td className="p-3 text-right font-bold" style={{ color: getScoreColor(peerScore) }}>{peerScore}/100</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${getRecBadgeClass(peerRec)}`}>
                        {peerRec}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-950/10 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div>
            <strong className="text-violet-400 font-bold block mb-0.5">NiftyAI Sector Analysis:</strong>
            {recommendation?.ai_investment_score > 70 ? (
              <span><strong>{selectedSymbol}</strong> retains primary sector leadership in the <strong>{activeCompanyMetadata.sector}</strong> segment. Its superior AI fundamental rating of <strong>{recommendation?.ai_investment_score}/100</strong> marks it as the preferred allocation overweight relative to its peer assets.</span>
            ) : (
              <span>Within the <strong>{activeCompanyMetadata.sector}</strong> industry, peers present highly comparable valuations. <strong>{selectedSymbol}</strong> shows balanced cash reserves, but selective hedging is recommended for portfolio weighting.</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryTab = () => {
    const predefinedTimelines: Record<string, { year: string; title: string; desc: string }[]> = {
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
      ]
    };

    const milestones = predefinedTimelines[selectedSymbol] || [
      { year: '2010', title: 'Operational Genesis', desc: `Commenced foundational services in the primary ${selectedSymbol} business sector.` },
      { year: '2015', title: 'National Scale', desc: `Completed regional hub listings and expanded logistics coverage.` },
      { year: '2020', title: 'Digital Enterprise', desc: `Introduced cloud logistics and automated supply lines globally.` },
      { year: '2025', title: 'AI Acceleration', desc: `Pioneered joint ventures in smart cognitive analytics and expansion channels.` }
    ];

    return (
      <div className="card p-5 bg-slate-950/20 border border-slate-850/60 shadow-2xl space-y-4">
        <h4 className="text-xs font-black text-violet-400 uppercase tracking-wider block mb-1">
          🎬 Animated Milestones Timeline ({selectedSymbol})
        </h4>
        <p className="text-[10px] text-slate-500 leading-snug">
          Explore the historical evolution, landmark achievements, and strategic growth checkpoints of <strong>{activeCompanyMetadata.name}</strong> over the decades.
        </p>
        <div className="relative pl-8 border-l border-slate-850 space-y-6 pt-2 pb-2">
          {milestones.map((item, idx) => (
            <div
              key={idx}
              className="timeline-item relative group"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="absolute -left-[38px] top-1.5 w-3 h-3 rounded-full bg-violet-600 border-2 border-violet-400 group-hover:bg-violet-400 transition-colors shadow-lg shadow-violet-500/30 animate-pulse" />
              <div className="absolute -left-[38px] top-1.5 w-3 h-3 rounded-full bg-violet-600 border-2 border-violet-400 group-hover:bg-violet-400 transition-colors shadow-lg" />
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850/80 max-w-xl group-hover:border-violet-500/20 transition-all hover:bg-slate-900 shadow">
                <span className="text-xs font-black text-violet-400 block mb-0.5">{item.year} — {item.title}</span>
                <p className="text-[10.5px] text-slate-300 font-light leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Top Banner KPI statistics cards */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-900/30 to-indigo-900/20 border border-violet-500/20 shadow-xl relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/25 border border-violet-500/30 flex items-center justify-center text-xl shadow-lg">
            👑
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
              Top NIFTY Companies
            </h2>
            <p className="text-xs text-slate-400">Explore and analyze top performing NIFTY companies</p>
          </div>
        </div>

        {/* 4 KPI overview cards inside the banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto flex-1 max-w-3xl">
          {[
            { label: '50 Companies', value: 'NIFTY Universe', icon: '🎛️' },
            { label: '12 Sectors', value: 'Covered', icon: '📡' },
            { label: '₹246.78 L Cr', value: 'Total Market Cap', icon: '💼' },
            { label: '+0.86%', value: 'NIFTY 50 Change', icon: '📈', isTrend: true }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-slate-950/45 p-3 rounded-xl border border-slate-880/80 flex items-center gap-2.5">
              <span className="text-lg">{kpi.icon}</span>
              <div>
                <span className={`text-xs font-black block ${kpi.isTrend ? 'text-emerald-400' : 'text-slate-100'}`}>{kpi.label}</span>
                <span className="text-[9px] text-slate-500 block truncate">{kpi.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Filter Strip pills */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 flex-wrap">
        {[10, 20, 30, 40, 50].map((limit) => {
          const isActive = currentLimit === limit;
          return (
            <button
              key={limit}
              onClick={() => setCurrentLimit(limit)}
              className={`text-xs px-4 py-1.5 font-bold rounded-xl border tracking-wide transition-all ${
                isActive 
                  ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' 
                  : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
              }`}
            >
              Top {limit}
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
        
        {/* COLUMN 1: LEFT COMPACT COMPANY TABLE */}
        <div className={`lg:col-span-1 card p-4 bg-slate-900 border-slate-800 flex flex-col h-[650px] shadow-2xl ${mobileActiveView === 'list' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
            <div>
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider">Top {currentLimit} Companies</h3>
              <p className="text-[9px] text-slate-500">Ranked by Market Cap</p>
            </div>
            <span 
              onClick={() => setSearchTerm('')} 
              className="text-[9px] text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              ✕ Clear
            </span>
          </div>

          {/* Search box */}
          <div className="relative mb-3 flex-shrink-0">
            <input
              type="text"
              placeholder="Search company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-3 pr-8 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            />
            <span className="absolute right-3 top-2 text-xs text-slate-500">🔍</span>
          </div>

          {/* Table headers */}
          <div className="grid grid-cols-12 gap-1 px-2.5 py-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider flex-shrink-0">
            <span className="col-span-2">Rank</span>
            <span className="col-span-6">Company</span>
            <span className="col-span-4 text-right">LTP/Chg</span>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto pr-1 mt-1 space-y-1 chat-scrollbar">
            {filteredCompanies.map(c => {
              const isSelected = selectedSymbol === c.symbol;
              const liveQuote = quotes?.find((q: any) => q.symbol === c.symbol);
              const displayPrice = liveQuote ? liveQuote.current_price : c.basePrice;
              const displayChangePct = liveQuote ? liveQuote.change_pct : c.changePct;

              return (
                <button
                  key={c.symbol}
                  onClick={() => handleCompanyClick(c.symbol)}
                  className={`w-full grid grid-cols-12 gap-1 items-center p-2 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-violet-600/10 border-violet-500/40 shadow-md' 
                      : 'bg-slate-950/20 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <span className="col-span-2 text-xs font-black text-slate-500 text-center">{c.rank}</span>
                  
                  <div className="col-span-6 flex items-center gap-2">
                    <CompanyLogo symbol={c.symbol} size="md" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-slate-100 block leading-tight truncate">{c.name.split(' Ltd')[0]}</span>
                      <span className="text-[8px] text-slate-500 uppercase font-semibold block">{c.symbol}</span>
                    </div>
                  </div>

                  <div className="col-span-4 text-right">
                    <span className="text-xs font-black text-slate-200 block">₹{displayPrice?.toLocaleString('en-IN')}</span>
                    <span className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${displayChangePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {displayChangePct >= 0 ? '▲' : '▼'} {Math.abs(displayChangePct).toFixed(2)}%
                    </span>
                  </div>
                </button>
              );
            })}
            {filteredCompanies.length === 0 && (
              <p className="text-[10px] text-slate-600 text-center mt-6">No matching ranks found.</p>
            )}
          </div>
          
          <button 
            onClick={() => alert("Top 50 Nifty Table index matches successfully!")}
            className="w-full mt-3 py-1.5 bg-slate-950 border border-slate-800 text-[10px] text-violet-400 font-bold rounded-lg hover:border-violet-500 transition-colors flex-shrink-0 text-center"
          >
            View all 50 companies →
          </button>
        </div>

        {/* COLUMN 2 & 3: RIGHT ANALYTICS COMPONENT */}
        <div className={`lg:col-span-2 xl:col-span-3 space-y-6 flex flex-col justify-between ${mobileActiveView === 'detail' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Header Panel */}
          {loading ? (
            <div className="card p-6 bg-slate-900 border-slate-800 flex items-center justify-center flex-1">
              <div className="text-center space-y-3">
                <div className="text-3xl animate-spin">⏳</div>
                <p className="text-xs text-slate-400">Loading {selectedSymbol} Analytics...</p>
              </div>
            </div>
          ) : (
            <div className="card p-5 bg-slate-900 border-slate-800 shadow-2xl space-y-5 flex-1">
              
              {/* Back button on mobile */}
              <button
                type="button"
                onClick={() => setMobileActiveView('list')}
                className="lg:hidden w-fit mb-2 flex items-center gap-1.5 text-[10px] font-bold text-violet-400 bg-violet-950/20 border border-violet-900/30 px-3.5 py-2 rounded-xl hover:bg-violet-950/40"
              >
                ← Back to Company List
              </button>

              {/* Asset Header and Badge row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-850 pb-3">
                <div className="flex items-center gap-3">
                  <CompanyLogo symbol={selectedSymbol} size="lg" className="w-12 h-12 text-sm font-black" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-100">{quote?.name}</h2>
                      <span className="text-[9px] bg-violet-600/20 border border-violet-500/30 text-violet-400 px-1.5 py-0.5 rounded font-bold uppercase">
                        Rank {activeCompanyMetadata.rank}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-semibold tracking-wider">
                      {activeCompanyMetadata.sector} · {activeCompanyMetadata.industry}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-200 block">₹{quote?.current_price?.toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${quote?.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {quote?.change >= 0 ? '▲' : '▼'} {quote?.change_pct?.toFixed(2)}% (+₹{Math.abs(quote?.change)})
                    </span>
                  </div>
                  {recommendation && (
                    <span className={`text-xs px-3 py-1 rounded-lg font-black ${getRecBadgeClass(recommendation.recommendation)}`}>
                      {recommendation.recommendation}
                    </span>
                  )}
                  <button 
                    onClick={() => alert(`Added ${selectedSymbol} to your watchlist!`)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:border-violet-500 hover:text-violet-400 rounded-xl text-[10px] font-bold transition-all shadow-md"
                  >
                    ⭐ Watchlist
                  </button>
                </div>
              </div>

              {/* Sub tabs inside right panel */}
              <div className="flex border-b border-slate-800 gap-3 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5 select-none">
                {['Overview', 'Financials', 'Performance', 'News', 'Peer Comparison', 'History'].map((t, idx) => (
                  <button
                    key={t}
                    onClick={() => setActiveSubTab(idx)}
                    className={`pb-2.5 text-[10.5px] font-black uppercase transition-all relative ${
                      activeSubTab === idx 
                        ? 'text-violet-400 border-b-2 border-violet-500' 
                        : 'text-slate-550 hover:text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Horizontal 7-card metrics strip */}
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {[
                  { label: 'Market Cap', value: quote?.market_cap ? formatCurrency(quote.market_cap) : '—', desc: 'Large Cap' },
                  { label: 'P/E Ratio', value: quote?.pe_ratio ? quote.pe_ratio.toFixed(2) : '—', desc: 'Earnings multiple' },
                  { label: 'ROE', value: quote?.roe ? `${(quote.roe * 100).toFixed(2)}%` : '14.85%', desc: 'Return on Equity' },
                  { label: 'Div Yield', value: quote?.dividend_yield ? `${(quote.dividend_yield * 100).toFixed(2)}%` : '2.43%', desc: 'Annual payout' },
                  { label: '52W High', value: quote?.['52w_high'] ? `₹${Math.round(quote['52w_high']).toLocaleString('en-IN')}` : '—', desc: 'May 24, 2024' },
                  { label: '52W Low', value: quote?.['52w_low'] ? `₹${Math.round(quote['52w_low']).toLocaleString('en-IN')}` : '—', desc: 'Nov 10, 2023' },
                  { label: 'Trend', value: '', desc: '', isSparkline: true }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 flex flex-col justify-between h-16 relative overflow-hidden">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">{stat.label}</span>
                    {stat.isSparkline ? (
                      <div className="absolute inset-0 pt-6 px-1 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 20">
                          <path 
                            d="M0,15 Q25,2 50,18 T100,5" 
                            fill="none" 
                            stroke="#8b5cf6" 
                            strokeWidth="1.5"
                            strokeLinecap="round" 
                          />
                        </svg>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-black text-slate-200 truncate mt-0.5 block">{stat.value}</span>
                        <span className="text-[8px] text-slate-500 block truncate">{stat.desc}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid of active visual cards based on sub-tab */}
              {activeSubTab === 0 && renderOverviewTab()}
              {activeSubTab === 1 && renderFinancialsTab()}
              {activeSubTab === 2 && renderPerformanceTab()}
              {activeSubTab === 3 && renderNewsTab()}
              {activeSubTab === 4 && renderPeerComparisonTab()}
              {activeSubTab === 5 && renderHistoryTab()}
            </div>
          )}

          {/* Bottom Chat Prompt bar */}
          <div className="card p-4 bg-slate-900 border-[#1f293d] shadow-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shadow-md animate-pulse">
                🤖
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ask NiftyAI anything about these companies..."
                  className="w-full bg-[#080c14] border border-[#1f293d] rounded-xl py-2 pl-4 pr-12 text-xs text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/10 placeholder-slate-500"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && askInput.trim()) {
                      onNavigateToChat?.(askInput.trim(), 'RELIANCE');
                      setAskInput('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (askInput.trim()) {
                      onNavigateToChat?.(askInput.trim(), 'RELIANCE');
                      setAskInput('');
                    } else {
                      onNavigateToChat?.('', 'RELIANCE');
                    }
                  }}
                  className="absolute right-2.5 top-1.5 text-xs text-violet-400 hover:text-violet-300 font-bold bg-violet-950/40 border border-violet-850 px-2.5 py-0.5 rounded-lg"
                >
                  Ask
                </button>
              </div>
            </div>

            {/* Quick suggested chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[8px] text-slate-500 font-extrabold uppercase mr-1 tracking-wider">Suggested:</span>
              {[
                'Compare RELIANCE vs TCS',
                'Show top gainers today',
                'Best stocks for long term',
                'High dividend paying stocks',
                'Which sector is performing best?'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onNavigateToChat?.(chip, 'RELIANCE');
                  }}
                  className="text-[8px] font-bold px-2 py-1 bg-slate-950/80 border border-slate-850 rounded-lg text-slate-400 hover:text-violet-400 hover:border-violet-500/50 transition-colors shadow"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
