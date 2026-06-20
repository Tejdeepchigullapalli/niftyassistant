import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, formatCurrency, getRecBadgeClass, getRecColor, getScoreColor, getCompanyMeta } from '../utils/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar
} from 'recharts';
import { 
  Star, 
  ChevronDown, 
  Info,
  ChevronRight,
  Heart,
  Lock,
  Check,
  Search,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Company domains matching for logos
const COMPANY_DOMAINS: Record<string, string> = {
  HDFCBANK: 'hdfcbank.com',
  RELIANCE: 'relianceindustries.com',
  ICICIBANK: 'icicibank.com',
  BHARTIARTL: 'airtel.in',
  INFY: 'infosys.com',
  LT: 'larsentoubro.com',
  SBIN: 'sbi.co.in',
  AXISBANK: 'axisbank.com',
  ITC: 'itcportal.com',
  'M&M': 'mahindra.com',
  KOTAKBANK: 'kotak.com',
  TCS: 'tcs.com',
  BAJFINANCE: 'bajajfinance.in',
  SUNPHARMA: 'sunpharma.com',
  HINDUNILVR: 'hul.co.in',
  NTPC: 'ntpc.co.in',
  ETERNAL: 'eternal.com',
  TITAN: 'titancompany.in',
  MARUTI: 'marutisuzuki.com',
  TATASTEEL: 'tatasteel.com',
  BEL: 'bel-india.in',
  HCLTECH: 'hcltech.com',
  POWERGRID: 'powergrid.in',
  HINDALCO: 'hindalco.com',
  ULTRACEMCO: 'ultratechcement.com',
  SHRIRAMFIN: 'shriramfinance.in',
  ONGC: 'ongcindia.com',
  JSWSTEEL: 'jsw.in',
  COALINDIA: 'coalindia.in',
  ASIANPAINT: 'asianpaints.com',
  GRASIM: 'grasim.com',
  'BAJAJ-AUTO': 'bajajauto.com',
  ADANIPORTS: 'adaniports.com',
  BAJAJFINSV: 'bajajfinserv.in',
  INDIGO: 'goindigo.in',
  TECHM: 'techmahindra.com',
  NESTLEIND: 'nestle.in',
  SBILIFE: 'sbilife.co.in',
  APOLLOHOSP: 'apollohospitals.com',
  DRREDDY: 'drreddys.com',
  JIOFIN: 'jiofinancial.com',
  TRENT: 'trentlimited.com',
  MAXHEALTH: 'maxhealthcare.in',
  EICHERMOT: 'eichermotors.com',
  CIPLA: 'cipla.com',
  TATACONSUM: 'tataconsumerproducts.com',
  HDFCLIFE: 'hdfclife.com',
  TMPV: 'tatamotors.com',
  WIPRO: 'wipro.com',
  ADANIENT: 'adani.com',
  NIFTY: 'nseindia.com'
};

// Local logo files maps
const LOCAL_LOGOS: Record<string, string> = {
  RELIANCE: 'Reliance.png',
  TCS: 'Tata_Consultancy_Services_Logo_2020_full_stacked.png',
  HDFCBANK: 'hdfc-bank-logo.png',
  BHARTIARTL: 'Airtel_logo_PNG2.png',
  ICICIBANK: 'icici-bank-logo.png',
  INFY: 'infosys-logo.png',
  SBIN: 'sbi-logo.png',
  HINDUNILVR: 'Hindustan-Unilever-Limited-logo.png',
  ITC: 'itc-limited-logo-black-and-white.png',
  LT: 'Larsen__Toubro_Logo.png',
  HCLTECH: 'HLC_logo_PNG3.png',
  AXISBANK: 'axis-bank-logo.png',
  SUNPHARMA: 'sun pharma.png',
  MARUTI: 'Maruti-Suzuki-Logo-png.png',
  KOTAKBANK: 'Kotak_Mahindra_Bank_logo.png',
  ULTRACEMCO: 'ultratech-cement-logo-png.png',
  NTPC: 'NTPC_Logo.png',
  TMPV: 'tata motors sharing.png',
  ONGC: 'Oil_and_Natural_Gas_Corporation-Logo.wine.png',
  COALINDIA: 'Coal_India.svg',
  POWERGRID: 'POWERGRID.NS.png',
  TITAN: 'titan-logo.png',
  ADANIENT: 'adani.png',
  ADANIPORTS: 'Adani_Ports_Logo.svg',
  'M&M': 'mahindra-auto-seeklogo.png',
  JSWSTEEL: 'jswsteel-og-1.webp',
  ASIANPAINT: 'asian-paints-logo.png',
  HINDALCO: 'hindalco.png',
  TATASTEEL: 'Tata Steel.svg',
  GRASIM: 'Grasim.svg',
  WIPRO: 'wipro-logo-png.png',
  TECHM: 'tech mahindra.png',
  NESTLEIND: 'NESTLE INDIA.png',
  'BAJAJ-AUTO': 'Bajaj-Logo.png',
  BAJFINANCE: 'Bajaj_Finance_Limited_Logo.png',
  BAJAJFINSV: 'Bajaj_Finserv_Logo.png',
  CIPLA: 'Cipla.avif',
  DRREDDY: "Dr.Reddy's_logo.png",
  APOLLOHOSP: 'Apollo_Hospitals_Logo.png',
  SBILIFE: 'sbi life insurance.jpg',
  EICHERMOT: 'eicher-logo-png_.png',
  JIOFIN: 'jio financial.png',
  BEL: 'Bharat_Electronics_Limited_Logo.png',
  TRENT: 'marketing-strategy-of-trent-trent-limited-logo-.png',
  MAXHEALTH: 'max health care.png',
  INDIGO: 'IndiGo-Logo.png',
  SHRIRAMFIN: 'shriram finance.jpg',
  TATACONSUM: 'TATA-Consumer.png',
  HDFCLIFE: 'HDFC life insurance.png',
  ETERNAL: 'zomato-eternal.png'
};

import { CompanyLogo } from './common/CompanyLogo';
export { CompanyLogo };

// Top 50 Nifty Companies matching mockup metrics exactly
const NIFTY_50_COMPANIES = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', logo: '🔴', color: '#e11d48', basePrice: 1325.70, changePct: -0.18, rank: 1, sector: 'Energy & Retail', industry: 'Conglomerate', mcap: '17.94 L Cr' },
  { symbol: 'TCS',      name: 'Tata Consultancy Services', logo: '🔵', color: '#2563eb', basePrice: 3732.45, changePct: 3.45, rank: 2, sector: 'Information Technology', industry: 'IT Services', mcap: '13.62 L Cr' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', logo: '🟣', color: '#7c3aed', basePrice: 1682.40, changePct: -0.42, rank: 3, sector: 'Banking & Financial', industry: 'Private Bank', mcap: '11.67 L Cr' },
  { symbol: 'ICICIBANK',name: 'ICICI Bank Ltd', logo: '🟡', color: '#d97706', basePrice: 1345.30, changePct: 2.42, rank: 4, sector: 'Banking & Financial', industry: 'Private Bank', mcap: '9.45 L Cr' },
  { symbol: 'INFY',     name: 'Infosys Ltd', logo: '🟢', color: '#16a34a', basePrice: 1041.30, changePct: 2.18, rank: 5, sector: 'Information Technology', industry: 'IT Services', mcap: '4.31 L Cr' },
  { symbol: 'SBIN',     name: 'State Bank of India', logo: '🔷', color: '#0284c7', basePrice: 812.40, changePct: 2.85, rank: 6, sector: 'Banking & Financial', industry: 'Public Sector Bank', mcap: '7.24 L Cr' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', logo: '🟠', color: '#ea580c', basePrice: 1885.50, changePct: 0.57, rank: 7, sector: 'Telecom', industry: 'Telecommunications', mcap: '8.02 L Cr' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', logo: '🟤', color: '#92400e', basePrice: 2185.40, changePct: -1.49, rank: 8, sector: 'FMCG', industry: 'Consumer Goods', mcap: '5.19 L Cr' },
  { symbol: 'ITC',      name: 'ITC Ltd', logo: '⚫', color: '#374151', basePrice: 476.80, changePct: 1.12, rank: 9, sector: 'FMCG & Diversified', industry: 'Conglomerate', mcap: '5.93 L Cr' },
  { symbol: 'LT',       name: 'Larsen & Toubro Ltd', logo: '🔶', color: '#b45309', basePrice: 3625.80, changePct: 1.26, rank: 10, sector: 'Infrastructure', industry: 'Engineering', mcap: '4.86 L Cr' },
  { symbol: 'HCLTECH',  name: 'HCL Technologies Ltd', logo: '💻', color: '#06b6d4', basePrice: 1345.50, changePct: -0.72, rank: 11, sector: 'Information Technology', industry: 'IT Services', mcap: '3.65 L Cr' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', logo: '🔴', color: '#be123c', basePrice: 1042.80, changePct: -0.15, rank: 12, sector: 'Banking & Financial', industry: 'Private Bank', mcap: '3.12 L Cr' },
  { symbol: 'SUNPHARMA',name: 'Sun Pharmaceutical Ltd', logo: '💊', color: '#059669', basePrice: 1540.20, changePct: 1.25, rank: 13, sector: 'Healthcare', industry: 'Pharmaceuticals', mcap: '3.45 L Cr' },
  { symbol: 'MARUTI',   name: 'Maruti Suzuki India Ltd', logo: '🚗', color: '#1e3a8a', basePrice: 12420.50, changePct: 2.10, rank: 14, sector: 'Automobile', industry: 'Passenger Vehicles', mcap: '3.80 L Cr' },
  { symbol: 'KOTAKBANK',name: 'Kotak Mahindra Bank', logo: '🔴', color: '#b91c1c', basePrice: 1721.40, changePct: -0.65, rank: 15, sector: 'Banking & Financial', industry: 'Private Bank', mcap: '3.40 L Cr' },
  { symbol: 'ULTRACEMCO',name: 'UltraTech Cement Ltd', logo: '🧱', color: '#4b5563', basePrice: 9840.50, changePct: 0.35, rank: 16, sector: 'Materials', industry: 'Cement', mcap: '2.85 L Cr' },
  { symbol: 'NTPC',     name: 'NTPC Ltd', logo: '⚡', color: '#047857', basePrice: 362.40, changePct: -0.80, rank: 17, sector: 'Utilities', industry: 'Power Generation', mcap: '3.62 L Cr' },
  { symbol: 'TMPV',     name: 'Tata Motors Passenger Vehicles', logo: '🚗', color: '#1d4ed8', basePrice: 450.0, changePct: 1.65, rank: 18, sector: 'Automobile', industry: 'Passenger Vehicles', mcap: '1.62 L Cr' },
  { symbol: 'ONGC',     name: 'Oil & Natural Gas Corp', logo: '🔥', color: '#b45309', basePrice: 275.60, changePct: -1.10, rank: 19, sector: 'Utilities', industry: 'Oil exploration', mcap: '3.25 L Cr' },
  { symbol: 'COALINDIA',name: 'Coal India Ltd', logo: '⬛', color: '#111827', basePrice: 462.15, changePct: 0.85, rank: 20, sector: 'Utilities', industry: 'Coal Mining', mcap: '2.60 L Cr' },
  { symbol: 'POWERGRID',name: 'Power Grid Corp', logo: '🎛️', color: '#0369a1', basePrice: 312.45, changePct: 0.25, rank: 21, sector: 'Utilities', industry: 'Power Transmission', mcap: '2.20 L Cr' },
  { symbol: 'TITAN',    name: 'Titan Company Ltd', logo: '💎', color: '#7c2d12', basePrice: 3241.60, changePct: -0.58, rank: 22, sector: 'FMCG', industry: 'Jewellery & Watches', mcap: '2.80 L Cr' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', logo: '🦅', color: '#312e81', basePrice: 3122.50, changePct: 2.45, rank: 23, sector: 'Diversified', industry: 'Conglomerate', mcap: '3.40 L Cr' },
  { symbol: 'ADANIPORTS',name: 'Adani Ports & SEZ', logo: '⚓', color: '#1e1b4b', basePrice: 1284.60, changePct: 1.95, rank: 24, sector: 'Infrastructure', industry: 'Ports & Logistics', mcap: '2.70 L Cr' },
  { symbol: 'M&M',      name: 'Mahindra & Mahindra', logo: '🚜', color: '#991b1b', basePrice: 2842.10, changePct: 1.15, rank: 25, sector: 'Automobile', industry: 'Diversified Vehicles', mcap: '2.50 L Cr' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', logo: '🏗️', color: '#0f172a', basePrice: 875.40, changePct: 0.65, rank: 26, sector: 'Materials', industry: 'Steel Production', mcap: '2.10 L Cr' },
  { symbol: 'ASIANPAINT',name: 'Asian Paints Ltd', logo: '🎨', color: '#701a75', basePrice: 2854.20, changePct: -0.98, rank: 27, sector: 'FMCG', industry: 'Paints & Decors', mcap: '2.40 L Cr' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries', logo: '🏭', color: '#14532d', basePrice: 642.15, changePct: 1.35, rank: 28, sector: 'Materials', industry: 'Aluminium', mcap: '1.45 L Cr' },
  { symbol: 'TATASTEEL',name: 'Tata Steel Ltd', logo: '⚙️', color: '#0369a1', basePrice: 165.40, changePct: 0.20, rank: 29, sector: 'Materials', industry: 'Steel Production', mcap: '1.80 L Cr' },
  { symbol: 'GRASIM',   name: 'Grasim Industries Ltd', logo: '🧶', color: '#581c87', basePrice: 2354.20, changePct: 0.90, rank: 30, sector: 'Diversified', industry: 'Textiles & Cement', mcap: '1.55 L Cr' },
  { symbol: 'WIPRO',    name: 'Wipro Ltd', logo: '🌈', color: '#1e40af', basePrice: 462.15, changePct: -0.15, rank: 31, sector: 'Information Technology', industry: 'IT Services', mcap: '2.40 L Cr' },
  { symbol: 'TECHM',    name: 'Tech Mahindra Ltd', logo: '🌐', color: '#be123c', basePrice: 1242.30, changePct: -0.75, rank: 32, sector: 'Information Technology', industry: 'IT Services', mcap: '1.20 L Cr' },
  { symbol: 'NESTLEIND',name: 'Nestle India Ltd', logo: '☕', color: '#4b5563', basePrice: 24500.60, changePct: 0.40, rank: 33, sector: 'FMCG', industry: 'Packaged Foods', mcap: '2.35 L Cr' },
  { symbol: 'BAJAJ-AUTO',name: 'Bajaj Auto Ltd', logo: '🏍️', color: '#1d4ed8', basePrice: 9400.0, changePct: 1.45, rank: 34, sector: 'Automobile', industry: 'Two & Three Wheelers', mcap: '2.65 L Cr' },
  { symbol: 'BAJFINANCE',name: 'Bajaj Finance Ltd', logo: '💵', color: '#0369a1', basePrice: 6842.10, changePct: -1.45, rank: 35, sector: 'Banking & Financial', industry: 'NBFC', mcap: '4.15 L Cr' },
  { symbol: 'BAJAJFINSV',name: 'Bajaj Finserv Ltd', logo: '🛡️', color: '#0284c7', basePrice: 1542.30, changePct: -1.25, rank: 36, sector: 'Banking & Financial', industry: 'NBFC', mcap: '2.45 L Cr' },
  { symbol: 'CIPLA',    name: 'Cipla Ltd', logo: '🔬', color: '#047857', basePrice: 1425.40, changePct: 0.80, rank: 37, sector: 'Healthcare', industry: 'Pharmaceuticals', mcap: '1.14 L Cr' },
  { symbol: 'DRREDDY',  name: 'Dr Reddys Laboratories', logo: '🧪', color: '#065f46', basePrice: 5845.20, changePct: 1.10, rank: 38, sector: 'Healthcare', industry: 'Pharmaceuticals', mcap: '1.02 L Cr' },
  { symbol: 'APOLLOHOSP',name: 'Apollo Hospitals', logo: '🏥', color: '#991b1b', basePrice: 5940.50, changePct: 1.85, rank: 39, sector: 'Healthcare', industry: 'Hospitals', mcap: '0.85 L Cr' },
  { symbol: 'SBILIFE',  name: 'SBI Life Insurance', logo: '🛡️', color: '#0369a1', basePrice: 1420.20, changePct: 0.35, rank: 40, sector: 'Banking & Financial', industry: 'Life Insurance', mcap: '1.42 L Cr' },
  { symbol: 'EICHERMOT',name: 'Eicher Motors Ltd', logo: '🏍️', color: '#854d0e', basePrice: 4540.60, changePct: 1.45, rank: 41, sector: 'Automobile', industry: 'Motorcycles', mcap: '1.24 L Cr' },
  { symbol: 'JIOFIN',   name: 'Jio Financial Services', logo: '💎', color: '#4338ca', basePrice: 362.45, changePct: 2.10, rank: 42, sector: 'Banking & Financial', industry: 'NBFC', mcap: '2.30 L Cr' },
  { symbol: 'BEL',      name: 'Bharat Electronics Ltd', logo: '📡', color: '#047857', basePrice: 285.40, changePct: 3.10, rank: 43, sector: 'Infrastructure', industry: 'Defense Tech', mcap: '2.08 L Cr' },
  { symbol: 'TRENT',    name: 'Trent Ltd', logo: '🛍️', color: '#4b5563', basePrice: 4700.0, changePct: 2.65, rank: 44, sector: 'Consumer Services', industry: 'Retail & Apparel', mcap: '1.67 L Cr' },
  { symbol: 'MAXHEALTH',name: 'Max Healthcare Institute', logo: '🏥', color: '#991b1b', basePrice: 850.0, changePct: 1.95, rank: 45, sector: 'Healthcare', industry: 'Hospitals', mcap: '0.82 L Cr' },
  { symbol: 'INDIGO',   name: 'InterGlobe Aviation Ltd', logo: '✈️', color: '#1e3a8a', basePrice: 4200.0, changePct: 1.85, rank: 46, sector: 'Consumer Services', industry: 'Airlines', mcap: '1.62 L Cr' },
  { symbol: 'SHRIRAMFIN',name: 'Shriram Finance Ltd', logo: '🪙', color: '#0284c7', basePrice: 2400.0, changePct: 1.15, rank: 47, sector: 'Banking & Financial', industry: 'NBFC', mcap: '0.90 L Cr' },
  { symbol: 'TATACONSUM',name: 'Tata Consumer Products Ltd', logo: '🍵', color: '#0ea5e9', basePrice: 1150.0, changePct: 1.25, rank: 48, sector: 'FMCG', industry: 'Consumer Goods', mcap: '1.05 L Cr' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Co', logo: '🛡️', color: '#7c3aed', basePrice: 600.0, changePct: 0.95, rank: 49, sector: 'Banking & Financial', industry: 'Life Insurance', mcap: '1.28 L Cr' },
  { symbol: 'ETERNAL',  name: 'Eternal Limited', logo: '🍔', color: '#cb202d', basePrice: 250.0, changePct: 2.45, rank: 50, sector: 'Consumer Services', industry: 'Online Food Delivery', mcap: '0.25 L Cr' },
];

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

export default function DashboardView({ onSymbolSelect, initialSymbol = 'RELIANCE', onNavigateToChat, filterLimit = 10, quotes = [] }: DashboardViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(true);
  const [askInput, setAskInput] = useState('');
  const [currentLimit, setCurrentLimit] = useState(filterLimit);
  const [showDropdown, setShowDropdown] = useState(false);

  // Sync external sidebar filterLimit prop with local state
  useEffect(() => {
    setCurrentLimit(filterLimit);
  }, [filterLimit]);

  // Star Watchlist state management
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    RELIANCE: true,
    TCS: true,
    HDFCBANK: true,
    ICICIBANK: true,
    INFY: false,
    SBIN: false,
    BHARTIARTL: false,
    HINDUNILVR: false,
    ITC: false,
    LT: false
  });

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  // Interest Status tracking (dropdown selection) for each company
  const [companyInterest, setCompanyInterest] = useState<Record<string, 'Interested' | 'Purchased' | 'Locked' | 'Watch'>>({
    RELIANCE: 'Interested',
    TCS: 'Locked',
    HDFCBANK: 'Locked',
    ICICIBANK: 'Interested',
    INFY: 'Locked',
    SBIN: 'Locked',
    BHARTIARTL: 'Interested',
    HINDUNILVR: 'Locked',
    ITC: 'Interested',
    LT: 'Locked'
  });

  const handleInterestSelect = (status: 'Interested' | 'Purchased' | 'Locked' | 'Watch') => {
    setCompanyInterest(prev => ({
      ...prev,
      [selectedSymbol]: status
    }));
    setShowDropdown(false);
  };

  // Checkboxes list state
  const [checkedCompanies, setCheckedCompanies] = useState<Record<string, boolean>>({
    RELIANCE: true,
    TCS: true,
    HDFCBANK: true,
    ICICIBANK: true,
    INFY: true,
    SBIN: true,
    BHARTIARTL: true,
    HINDUNILVR: true,
    ITC: true,
    LT: true
  });

  const toggleCheckbox = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedCompanies(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
  };

  // Loaded Details State
  const [quote, setQuote] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [sentiment, setSentiment] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  // Helper: Find quote in live data array
  const getLiveQuote = (symbol: string) => {
    return quotes.find(q => q.symbol.toUpperCase() === symbol.toUpperCase());
  };

  // Helper: Resolve price with fallback
  const getPrice = (symbol: string, defaultPrice: number) => {
    const q = getLiveQuote(symbol);
    return q ? q.current_price : defaultPrice;
  };

  // Helper: Resolve 1D change percentage with fallback
  const getChangePct = (symbol: string, defaultChange: number) => {
    const q = getLiveQuote(symbol);
    return q ? q.change_pct : defaultChange;
  };

  const fetchStockDetails = useCallback(async (symbol: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [q, h, f, s, rec] = await Promise.all([
        api.getQuote(symbol),
        api.getHistory(symbol, period),
        api.getFinancial(symbol),
        api.getSentiment(symbol),
        api.getRecommendation(symbol),
      ]);
      setQuote(q.data);
      setHistory(h.data);
      setFinancial(f.data);
      setSentiment(s.data);
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
    if (onSymbolSelect) {
      onSymbolSelect(symbol);
    }
  };

  // Sliced companies table list based on local active limit
  const displayCompanies = useMemo(() => {
    return NIFTY_50_COMPANIES.slice(0, currentLimit).map(c => {
      const livePrice = getPrice(c.symbol, c.basePrice);
      const liveChange = getChangePct(c.symbol, c.changePct);
      return { ...c, basePrice: livePrice, changePct: liveChange };
    });
  }, [quotes, currentLimit]);

  // Search filter
  const filteredCompanies = useMemo(() => {
    return displayCompanies.filter(c =>
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayCompanies, searchTerm]);

  // Sparkline generator helper for top cards
  const getSparklineData = (changePct: number, seed: number) => {
    const data = [];
    let base = 100;
    const step = changePct / 10;
    for (let i = 0; i < 12; i++) {
      base = base + step + Math.sin(i * 1.5 + seed) * 0.45;
      data.push({ value: base });
    }
    return data;
  };

  // Calculate Index Stats dynamically based on actual constituent prices (centered around mockup positive bases)
  const avgNifty50Change = useMemo(() => {
    return quotes.length > 0
      ? quotes.reduce((acc, q) => acc + q.change_pct, 0) / quotes.length
      : 0.85;
  }, [quotes]);

  const avgBankNiftyChange = useMemo(() => {
    const banking = quotes.filter(q => getCompanyMeta(q.symbol).sector === 'Banking & Financial');
    return banking.length > 0
      ? banking.reduce((acc, q) => acc + q.change_pct, 0) / banking.length
      : 1.24;
  }, [quotes]);

  // Derived Index values corresponding to mockup starting bases
  const niftyPrice = 22517.60 * (1 + (avgNifty50Change - 0.85) / 100);
  const niftyChangePct = avgNifty50Change;
  const niftyChange = niftyPrice - (22517.60 / (1 + 0.85 / 100));

  const bankNiftyPrice = 48153.15 * (1 + (avgBankNiftyChange - 1.24) / 100);
  const bankNiftyChangePct = avgBankNiftyChange;
  const bankNiftyChange = bankNiftyPrice - (48153.15 / (1 + 1.24 / 100));

  // Sparkline data
  const niftySpark = useMemo(() => getSparklineData(niftyChangePct, 1), [niftyChangePct]);
  const bankNiftySpark = useMemo(() => getSparklineData(bankNiftyChangePct, 2), [bankNiftyChangePct]);

  const chartData = history?.data?.map((d: any) => ({ ...d, close: d.close })) || [];
  const activeCompanyMetadata = NIFTY_50_COMPANIES.find(c => c.symbol === selectedSymbol) || NIFTY_50_COMPANIES[0];

  const renderOverviewTab = () => {
    const shareholdingData = [
      { name: 'Promoter', value: 50.33, fill: '#8B5CF6' },
      { name: 'FII', value: 23.15, fill: '#6366F1' },
      { name: 'DII', value: 15.42, fill: '#22C55E' },
      { name: 'Public', value: 11.10, fill: '#3B82F6' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
        {/* Donut Chart: Shareholding Pattern */}
        <div className="bg-[#0B1220] p-4 rounded-2xl border border-[#1E293B] flex flex-col justify-between h-[230px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">SHAREHOLDING PATTERN</span>
            <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">JUN 24 LEDGER</span>
          </div>
          <div className="flex items-center justify-between gap-2 h-28">
            <div className="h-full w-1/2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shareholdingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={42}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {shareholdingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center leading-none">
                <span className="text-[6.5px] text-[#64748B] uppercase block">TOTAL</span>
                <span className="text-[9.5px] font-black text-[#F8FAFC] block mt-0.5">100%</span>
              </div>
            </div>
            <div className="w-1/2 space-y-1.5 overflow-y-auto chat-scrollbar h-full pr-1 flex flex-col justify-center">
              {shareholdingData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                  <span className="text-[#94A3B8] truncate w-14 block">{item.name}</span>
                  <span className="text-[#F8FAFC] font-black ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center border-t border-[#1E293B]/70 pt-2">
            <span className="text-[8.5px] font-black text-[#8B5CF6] hover:text-[#8B5CF6]/85 cursor-pointer uppercase tracking-wider">
              VIEW SHAREHOLDING →
            </span>
          </div>
        </div>

        {/* Confidence Gauge: AI Recommendation */}
        <div className="bg-[#0B1220] p-4 rounded-2xl border border-[#1E293B] flex flex-col justify-between h-[230px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">AI INVESTMENT RECOMMENDATION</span>
            <span className="text-[8.5px] text-[#64748B] block mt-0.5 font-bold uppercase font-black">CONFIDENCE SCORE</span>
          </div>
          <div className="relative h-20 flex items-center justify-center -mt-1 select-none">
            <svg className="w-32 h-16" viewBox="0 0 100 55">
              <defs>
                <linearGradient id="recGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="#1E293B" 
                strokeWidth="7" 
                strokeLinecap="round" 
              />
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="url(#recGaugeGrad)" 
                strokeWidth="7" 
                strokeDasharray="125.6"
                strokeDashoffset={125.6 * (1 - 76 / 100)}
                strokeLinecap="round" 
              />
              {(() => {
                const angle = (76 / 100) * 180 - 180;
                const rad = (angle * Math.PI) / 180;
                const length = 32;
                const nx = 50 + length * Math.cos(rad);
                const ny = 50 + length * Math.sin(rad);
                return (
                  <>
                    <line x1="50" y1="50" x2={nx} y2={ny} stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="3.5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
                  </>
                );
              })()}
            </svg>
            <div className="absolute text-center pt-8">
              <span className="text-[14px] font-black text-[#F8FAFC] block leading-none">76%</span>
              <span className="text-[7px] text-[#64748B] uppercase block tracking-wider font-extrabold mt-0.5">CONFIDENCE SCORE</span>
            </div>
          </div>
          <div className="flex justify-center gap-1 flex-wrap mt-0.5 select-none">
            {['STRONG FUNDAMENTALS', 'GOOD GROWTH', 'LOW RISK'].map((tag, i) => (
              <span key={i} className="text-[6.5px] px-1.5 py-0.5 rounded bg-violet-600/10 border border-violet-500/20 text-violet-400 font-extrabold tracking-wider uppercase">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[7.5px] text-[#94A3B8] font-medium leading-relaxed mt-1 block select-none border-t border-[#1E293B]/70 pt-2 text-center truncate">
            Reliance is well positioned in Energy transition, Retail expansion and Digital services.
          </p>
        </div>

        {/* Price Performance Area Chart */}
        <div className="bg-[#0B1220] p-4 rounded-2xl border border-[#1E293B] flex flex-col justify-between h-[230px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">PRICE PERFORMANCE</span>
              <span className="text-[8.5px] text-[#64748B] block mt-0.5 font-bold uppercase font-black">1Y RELATIVE GROWTH</span>
            </div>
            <div className="flex gap-1 bg-[#060B17] border border-[#1E293B] rounded-full p-0.5 text-[8.5px] font-black leading-none select-none">
              {['1D', '1W', '1M', '6M', '1Y'].map(t => (
                <span key={t} className={`px-1.5 py-1 rounded-full cursor-pointer leading-none ${t === '1Y' ? 'bg-[#8B5CF6] text-white' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>{t}</span>
              ))}
            </div>
          </div>
          <div className="h-[95px] w-full mt-1.5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DUAL_CHART_MOCK}>
                <defs>
                  <linearGradient id="pricePerfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="Asset" stroke="#8B5CF6" strokeWidth={1.8} fill="url(#pricePerfGrad)" dot={false} />
                <Area type="monotone" dataKey="Nifty50" stroke="#94A3B8" strokeWidth={1} strokeDasharray="3 3" fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center text-[7.5px] text-[#94A3B8] border-t border-[#1E293B]/70 pt-2 font-bold uppercase tracking-wider select-none">
            <span>1Y CHANGE <span className="text-[#22C55E]">+18.45%</span></span>
            <span className="text-[#8B5CF6] hover:text-[#8B5CF6]/85 cursor-pointer">VIEW ADVANCED CHART →</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialsTab = () => {
    return (
      <div className="bg-[#0B1220] p-4 rounded-2xl border border-[#1E293B] flex flex-col justify-between min-h-[230px] hover:border-[#8B5CF6]/30 transition-all duration-300">
        <div>
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">FINANCIAL SCORECARD</span>
          <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">LEDGER ANALYSIS</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">EPS (Earnings/Share)</span>
              <span className="text-[#F8FAFC] font-extrabold">₹{quote?.eps ? quote.eps.toFixed(1) : '74.5'}</span>
            </div>
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">Debt to Equity</span>
              <span className="text-[#F8FAFC] font-extrabold">{quote?.debt_equity ? quote.debt_equity.toFixed(2) : '0.45'}</span>
            </div>
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">Revenue Growth</span>
              <span className="text-[#F8FAFC] font-extrabold">{quote?.revenue_growth ? `${(quote.revenue_growth * 100).toFixed(1)}%` : '12.4%'}</span>
            </div>
          </div>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">Earnings Growth</span>
              <span className="text-[#F8FAFC] font-extrabold">{quote?.earnings_growth ? `${(quote.earnings_growth * 100).toFixed(1)}%` : '15.6%'}</span>
            </div>
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">Free Cash Flow</span>
              <span className="text-[#F8FAFC] font-extrabold">{quote?.free_cashflow ? formatCurrency(quote.free_cashflow) : '₹42,000Cr'}</span>
            </div>
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">P/B Value Ratio</span>
              <span className="text-[#F8FAFC] font-extrabold">{quote?.pb_ratio ? quote.pb_ratio.toFixed(2) : '3.82'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    return (
      <div className="bg-[#0B1220] p-4 rounded-2xl border border-[#1E293B] flex flex-col justify-between min-h-[230px] hover:border-[#8B5CF6]/30 transition-all duration-300">
        <div>
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">TECHNICAL INDICATORS</span>
          <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">MOMENTUM ANALYSIS</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">RSI (14 Days)</span>
              <span className="text-[#22C55E] font-extrabold">64.50 (Bullish)</span>
            </div>
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">MACD Line</span>
              <span className="text-[#22C55E] font-extrabold">24.50 (Signal Buy)</span>
            </div>
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">Bollinger Bands</span>
              <span className="text-[#F8FAFC] font-extrabold">Inside Upper Range</span>
            </div>
          </div>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">200-Day SMA</span>
              <span className="text-[#F8FAFC] font-extrabold">₹{(getPrice(selectedSymbol, 1200) * 0.95).toFixed(1)}</span>
            </div>
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">Volatility (Beta)</span>
              <span className="text-[#F8FAFC] font-extrabold">0.68 (Low Vol)</span>
            </div>
            <div className="flex justify-between border-b border-[#1E293B] pb-1.5">
              <span className="text-[#94A3B8]">Opening Price</span>
              <span className="text-[#F8FAFC] font-extrabold">₹{quote?.open?.toLocaleString('en-IN') || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNewsTab = () => {
    const articles = sentiment?.articles || [];
    return (
      <div className="bg-[#0B1220] p-4 rounded-2xl border border-[#1E293B] flex flex-col justify-between min-h-[230px] hover:border-[#8B5CF6]/30 transition-all duration-300">
        <div>
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">RECENT CORPORATE NEWS</span>
          <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">SENTIMENT ANALYSIS</span>
        </div>
        <div className="space-y-2 mt-3 max-h-[140px] overflow-y-auto chat-scrollbar pr-1">
          {articles.map((art: any, i: number) => (
            <div key={i} className="p-2 bg-[#060B17] border border-[#1E293B] rounded-xl flex flex-col justify-between">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold text-[#F8FAFC] leading-snug line-clamp-1">{art.headline}</span>
                <span className={`text-[7px] px-1 rounded font-black uppercase ${
                  art.sentiment === 'positive' ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20' : 'bg-[#EF4444]/10 text-[#EF4444]'
                }`}>{art.sentiment}</span>
              </div>
              <div className="flex justify-between text-[8px] text-[#64748B] mt-1">
                <span>{art.source}</span>
                <span>{art.published_at}</span>
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <span className="text-[9px] text-[#64748B] text-center block py-4">No recent news available.</span>
          )}
        </div>
      </div>
    );
  };

  const renderPeerComparisonTab = () => {
    return (
      <div className="bg-[#0B1220] p-4 rounded-2xl border border-[#1E293B] flex flex-col justify-between min-h-[230px] hover:border-[#8B5CF6]/30 transition-all duration-300">
        <div>
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">SECTOR COMPETITOR COMPARISON</span>
          <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">{activeCompanyMetadata.sector.toUpperCase()} PEERS</span>
        </div>
        <div className="space-y-2 mt-3">
          <p className="text-[10px] text-[#94A3B8] leading-relaxed select-none">
            {selectedSymbol} maintains leadership in the {activeCompanyMetadata.sector} industry with a score of {recommendation?.ai_investment_score || 80}/100. Key metrics outperform sector median values.
          </p>
        </div>
      </div>
    );
  };

  const renderHistoryTab = () => {
    return (
      <div className="bg-[#0B1220] p-4 rounded-2xl border border-[#1E293B] flex flex-col justify-between min-h-[230px] hover:border-[#8B5CF6]/30 transition-all duration-300">
        <div>
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">MILESTONES & HISTORY</span>
          <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">KEY HIGHLIGHTS</span>
        </div>
        <div className="space-y-2 mt-3 select-none">
          <div className="border-l border-violet-500/30 pl-3.5 space-y-3.5 text-[9.5px]">
            <div>
              <span className="text-violet-400 font-extrabold block">2016 — Jio Launch</span>
              <p className="text-[#94A3B8] leading-snug">Launched telecom services, revolutionizing data usage in India.</p>
            </div>
            <div>
              <span className="text-violet-400 font-extrabold block">2025 — Jamnagar Clean Energy</span>
              <p className="text-[#94A3B8] leading-snug">Investing ₹75,000 Cr in massive solar and green energy gigafactories.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full text-[#F8FAFC] pb-10 bg-[#060B17] font-sans dashboard-zoom-container">
      
      {/* 3. Top Market Metrics Row (7 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        
        {/* Card 1: NIFTY 50 */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-between min-h-[90px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-0.5 min-w-0">
            <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block">NIFTY 50</span>
            <span className="text-[15px] font-black text-[#F8FAFC] leading-none mt-1">
              {niftyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`text-[9.5px] font-extrabold mt-1 leading-none ${niftyChangePct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {niftyChangePct >= 0 ? '+' : ''}{niftyChange.toFixed(2)} ({niftyChangePct >= 0 ? '+' : ''}{niftyChangePct.toFixed(2)}%)
            </div>
          </div>
          <div className="h-8 w-[38%] flex-shrink-0 self-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={niftySpark}>
                <defs>
                  <filter id="niftyGlowDash" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="niftyGradDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={niftyChangePct >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={niftyChangePct >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} hide />
                <Area type="monotone" dataKey="value" stroke={niftyChangePct >= 0 ? '#22C55E' : '#EF4444'} fill="url(#niftyGradDash)" strokeWidth={2} dot={false} filter="url(#niftyGlowDash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: BANK NIFTY */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-between min-h-[90px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-0.5 min-w-0">
            <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block">BANK NIFTY</span>
            <span className="text-[15px] font-black text-[#F8FAFC] leading-none mt-1">
              {bankNiftyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`text-[9.5px] font-extrabold mt-1 leading-none ${bankNiftyChangePct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {bankNiftyChangePct >= 0 ? '+' : ''}{bankNiftyChange.toFixed(2)} ({bankNiftyChangePct >= 0 ? '+' : ''}{bankNiftyChangePct.toFixed(2)}%)
            </div>
          </div>
          <div className="h-8 w-[38%] flex-shrink-0 self-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bankNiftySpark}>
                <defs>
                  <filter id="bankGlowDash" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="bankGradDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={bankNiftyChangePct >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={bankNiftyChangePct >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} hide />
                <Area type="monotone" dataKey="value" stroke={bankNiftyChangePct >= 0 ? '#22C55E' : '#EF4444'} fill="url(#bankGradDash)" strokeWidth={2} dot={false} filter="url(#bankGlowDash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: AI Market Score */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-between min-h-[90px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-0.5">
            <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block">AI Market Score</span>
            <div className="flex items-baseline mt-1 leading-none">
              <span className="text-lg font-black text-[#F8FAFC]">82</span>
              <span className="text-[10px] text-[#94A3B8] font-bold ml-0.5">/100</span>
            </div>
            <span className="text-[10px] font-black text-[#22C55E] mt-1 block">Very Strong</span>
          </div>
          <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0 self-center">
            <svg className="w-10 h-10" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" stroke="#1E293B" strokeWidth="3" fill="none" />
              <circle cx="18" cy="18" r="16" stroke="#22C55E" strokeWidth="3" strokeDasharray="82, 100" strokeLinecap="round" fill="none" transform="rotate(-90 18 18)" />
            </svg>
          </div>
        </div>

        {/* Card 4: Market Sentiment */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[90px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col h-full py-0.5 justify-between w-full">
            <div>
              <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block">Market Sentiment</span>
              <div className="text-[14px] font-black text-[#22C55E] mt-0.5 leading-none">Bullish</div>
            </div>
            <div className="space-y-1 w-full mt-2 select-none">
              <div className="relative h-1 bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#22C55E] rounded-full">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#F8FAFC] border border-slate-950 shadow-[0_0_6px_#ffffff]"
                  style={{ left: '76%' }}
                />
              </div>
              <div className="flex justify-between text-[7px] text-[#94A3B8] font-black uppercase tracking-wider">
                <span>Bearish</span>
                <span>Bullish</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: FII Net Buy */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[90px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-0.5">
            <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block">FII Net Buy</span>
            <span className="text-[16px] font-black text-[#22C55E] leading-none mt-1 block">₹4,200 Cr</span>
            <span className="text-[8.5px] text-[#64748B] font-bold block mt-1 uppercase">Today</span>
          </div>
        </div>

        {/* Card 6: DII Net Buy */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[90px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-0.5">
            <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block">DII Net Buy</span>
            <span className="text-[16px] font-black text-[#22C55E] leading-none mt-1 block">₹2,100 Cr</span>
            <span className="text-[8.5px] text-[#64748B] font-bold block mt-1 uppercase">Today</span>
          </div>
        </div>

        {/* Card 7: Fear & Greed Index */}
        <div className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex items-center justify-between min-h-[90px] hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300">
          <div className="flex flex-col justify-between h-full py-0.5">
            <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider block">Fear & Greed Index</span>
            <span className="text-[15px] font-black text-[#F8FAFC] mt-1 block leading-none">72</span>
            <span className="text-[9.5px] font-black text-[#22C55E] mt-1 block">Greed</span>
          </div>
          <div className="relative w-14 h-9 flex items-end justify-center overflow-hidden self-center flex-shrink-0">
            <svg className="w-14 h-9" viewBox="0 0 100 50">
              <defs>
                <linearGradient id="fearGreedCardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#fearGreedCardGrad)" strokeWidth="6" strokeLinecap="round" />
              {(() => {
                const angle = (72 / 100) * 180 - 180;
                const rad = (angle * Math.PI) / 180;
                const length = 32;
                const nx = 50 + length * Math.cos(rad);
                const ny = 50 + length * Math.sin(rad);
                return (
                  <>
                    <line x1="50" y1="50" x2={nx} y2={ny} stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="3.5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
                  </>
                );
              })()}
            </svg>
            <span className="absolute bottom-0 left-0.5 text-[6.5px] text-[#94A3B8] font-black">0</span>
            <span className="absolute bottom-0 right-0.5 text-[6.5px] text-[#94A3B8] font-black">100</span>
          </div>
        </div>

      </div>

      {/* 4. Hero Section: Top Nifty 50 Companies */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-900/30 to-indigo-900/20 border border-violet-500/20 shadow-xl relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 select-none">
          <div className="w-11 h-11 rounded-xl bg-violet-600/25 border border-violet-500/30 flex items-center justify-center text-xl shadow-lg shadow-violet-950/20 font-black">
            📈
          </div>
          <div>
            <h2 className="text-lg font-black text-[#F8FAFC] tracking-tight">Top NIFTY 50 Companies</h2>
            <p className="text-xs text-[#94A3B8] font-medium mt-0.5">AI ranked NIFTY 50 companies based on 100+ factors</p>
          </div>
        </div>

        {/* 4 KPI overview cards inside the banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto flex-1 max-w-3xl select-none">
          {[
            { label: '50 Companies', value: 'NIFTY Universe', icon: '🏢' },
            { label: '12 Sectors', value: 'Sectors Covered', icon: '📡' },
            { label: '₹246.78 L Cr', value: 'Total Market Cap', icon: '💼' },
            { label: '+0.86%', value: 'NIFTY 50 Change', icon: '📈', isPositive: true }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-slate-950/45 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
              <span className="text-lg flex-shrink-0">{kpi.icon}</span>
              <div>
                <span className={`text-[11.5px] font-black block leading-none ${kpi.isPositive ? 'text-[#22C55E]' : 'text-[#F8FAFC]'}`}>{kpi.label}</span>
                <span className="text-[8.5px] text-[#94A3B8] font-bold block mt-1 leading-none">{kpi.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Top Filter Bar */}
      <div className="flex justify-between items-center border-b border-[#1E293B]/70 pb-3.5 flex-wrap gap-3 select-none">
        <div className="flex gap-2 flex-wrap">
          {[10, 20, 30, 40, 50].map((limit) => {
            const isActive = currentLimit === limit;
            return (
              <button
                key={limit}
                onClick={() => setCurrentLimit(limit)}
                className={`text-[10px] font-black uppercase px-5 py-2.5 rounded-full border tracking-wider transition-all duration-300 leading-none ${
                  isActive 
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-650 border-violet-500 text-white shadow-lg shadow-violet-500/35 scale-[1.03]' 
                    : 'bg-[#0F172A] border-[#1E293B] text-[#94A3B8] hover:border-slate-700 hover:text-[#F8FAFC]'
                }`}
              >
                TOP {limit}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0B1220] border border-[#1E293B] rounded-full px-4.5 py-2 text-[10px] font-bold text-[#94A3B8]">
            Selected: <span className="text-[#F8FAFC] font-extrabold">Top {currentLimit}</span>
          </div>
          <button 
            onClick={() => setCurrentLimit(50)}
            className="px-5 py-2 bg-slate-950 border border-[#1E293B] hover:border-violet-500/50 hover:text-violet-400 text-[10px] font-black uppercase tracking-wider rounded-full transition-all duration-300"
          >
            VIEW ALL NIFTY 50
          </button>
        </div>
      </div>

      {/* 6. Main Dashboard Grid (Split 40/60) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch">
        
        {/* 7. LEFT COLUMN: TOP NIFTY TABLE (40% width / span 4) */}
        <div className="lg:col-span-4 card p-4 bg-[#0F172A] border-[#1E293B] flex flex-col justify-between min-h-[580px] hover:border-[#8B5CF6]/15 hover:shadow-[0_0_20px_rgba(139,92,246,0.02)] transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#1E293B] pb-3">
              <div>
                <h3 className="text-xs font-black text-violet-400 uppercase tracking-wider">Top {currentLimit} NIFTY 50 Companies</h3>
                <p className="text-[9px] text-[#94A3B8] font-bold mt-0.5 uppercase tracking-wide">Ranked by AI Score</p>
              </div>
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-[8.5px] bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-2 py-0.5 rounded font-black uppercase">
                  {currentLimit} Selected
                </span>
                <span 
                  onClick={() => setSearchTerm('')} 
                  className="text-[8px] text-[#64748B] hover:text-[#94A3B8] font-extrabold uppercase cursor-pointer"
                >
                  Clear All
                </span>
              </div>
            </div>

            {/* Search Input inside the ranking block */}
            <div className="relative mb-3 flex-shrink-0">
              <input
                type="text"
                placeholder="Search companies, stocks or anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#060B17] border border-[#1E293B] rounded-xl py-2 pl-10 pr-4 text-xs text-[#F8FAFC] focus:outline-none focus:border-violet-500 placeholder-slate-600 transition-colors"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>

            {/* Table headers */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1 text-[8.5px] text-[#64748B] font-black uppercase tracking-wider flex-shrink-0 select-none border-b border-[#1E293B]/40">
              <span className="col-span-1"></span>
              <span className="col-span-1 text-center">Rank</span>
              <span className="col-span-6 pl-2">Company</span>
              <span className="col-span-4 text-right">LTP / Change</span>
            </div>

            {/* Scrollable list of ranks */}
            <div className="overflow-y-auto pr-1 mt-1 space-y-1.5 max-h-[360px] chat-scrollbar">
              {filteredCompanies.map((c) => {
                const isSelected = selectedSymbol === c.symbol;
                const interest = companyInterest[c.symbol] || 'Locked';
                
                return (
                  <button
                    key={c.symbol}
                    onClick={() => handleCompanyClick(c.symbol)}
                    className={`w-full grid grid-cols-12 gap-1 items-center p-2.5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                      isSelected 
                        ? 'bg-violet-600/10 border-violet-500/40 shadow-lg' 
                        : 'bg-[#060B17]/40 border-[#1E293B] hover:border-slate-800'
                    }`}
                  >
                    {/* Selected Left Edge Glow Indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#8B5CF6] shadow-[0_0_12px_#8b5cf6]" />
                    )}

                    {/* Checkbox */}
                    <div 
                      className="col-span-1 flex items-center justify-center"
                      onClick={(e) => toggleCheckbox(c.symbol, e)}
                    >
                      <input 
                        type="checkbox" 
                        checked={checkedCompanies[c.symbol] ?? false}
                        onChange={() => {}}
                        className="w-3 h-3 accent-violet-600 border-[#1E293B] rounded cursor-pointer"
                      />
                    </div>
                    
                    {/* Rank */}
                    <span className="col-span-1 text-[10px] font-black text-[#94A3B8] text-center">{c.rank}</span>
                    
                    {/* Company info */}
                    <div className="col-span-6 flex items-center gap-2 pl-2">
                      <CompanyLogo symbol={c.symbol} size="sm" />
                      <div className="min-w-0">
                        <span className="text-[10.5px] font-black text-[#F8FAFC] block leading-tight truncate">{c.name.replace(' Ltd', '').replace(' Limited', '')}</span>
                        <div className="flex items-center gap-2 mt-1.5 leading-none">
                          <span className="text-[8px] text-[#94A3B8] uppercase font-bold tracking-wider leading-none">{c.symbol}</span>
                          <span className={`text-[7.5px] px-1.5 py-0.5 rounded font-black tracking-wide leading-none ${
                            c.changePct >= 0 
                              ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20' 
                              : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                          }`}>
                            {c.mcap}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* LTP / Change with Interest badge */}
                    <div className="col-span-4 text-right flex items-center justify-end gap-2.5">
                      <div className="leading-none">
                        <span className="text-[10.5px] font-black text-[#F8FAFC] block">₹{c.basePrice.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                        <span className={`text-[8.5px] font-bold block mt-0.5 ${c.changePct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {c.changePct >= 0 ? '+' : ''}{c.changePct.toFixed(2)}%
                        </span>
                      </div>
                      
                      {/* Interest state representation badge */}
                      <div className="flex items-center justify-center w-5.5 h-5.5 rounded-lg border border-[#1E293B]/80 bg-[#0B1220]/50">
                        {interest === 'Interested' && (
                          <Heart className="w-3 h-3 text-violet-400 fill-violet-500" />
                        )}
                        {interest === 'Purchased' && (
                          <Check className="w-3 h-3 text-[#22C55E]" />
                        )}
                        {interest === 'Locked' && (
                          <Lock className="w-2.5 h-2.5 text-[#F59E0B]" />
                        )}
                        {interest === 'Watch' && (
                          <Star className="w-3 h-3 text-sky-400" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="text-center pt-2 mt-2.5 border-t border-[#1E293B]/70">
            <span 
              onClick={() => setCurrentLimit(50)}
              className="text-[9px] font-bold text-[#8B5CF6] hover:text-[#8B5CF6]/85 cursor-pointer uppercase tracking-wider"
            >
              View All 50 NIFTY Companies
            </span>
          </div>
        </div>

        {/* 8. RIGHT COLUMN: SELECTED COMPANY PANEL (60% width / span 6) */}
        <div className="lg:col-span-6 card p-4 bg-[#0F172A] border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[580px] hover:border-[#8B5CF6]/15 hover:shadow-[0_0_20px_rgba(139,92,246,0.02)] transition-all duration-300">
          
          {loading ? (
            <div className="flex items-center justify-center flex-1 h-[450px]">
              <div className="text-center space-y-3">
                <div className="text-3xl animate-spin">⏳</div>
                <p className="text-xs text-[#94A3B8]">Compiling AI Analysis...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected company header info */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E293B]/60 pb-3">
                <div className="flex items-center gap-3">
                  <CompanyLogo symbol={selectedSymbol} size="lg" className="w-12 h-12 text-sm font-black" />
                  <div>
                    <span className="text-[7.5px] text-violet-400 uppercase tracking-widest block font-black mb-0.5">SELECTED COMPANY</span>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-[#F8FAFC]">{quote?.name || activeCompanyMetadata.name}</h2>
                      <span className="text-[8px] bg-violet-600/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded font-black uppercase">
                        RANK {activeCompanyMetadata.rank}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-[#94A3B8] font-bold uppercase tracking-wider mt-1.5 leading-none">
                      {selectedSymbol} - {activeCompanyMetadata.sector.toUpperCase()} - {activeCompanyMetadata.industry.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-black text-[#F8FAFC] block leading-none">₹{getPrice(selectedSymbol, 1325.70).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                    <span className={`text-[9.5px] font-bold flex items-center justify-end gap-0.5 leading-none mt-1 ${getChangePct(selectedSymbol, -0.18) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {getChangePct(selectedSymbol, -0.18) >= 0 ? '▲' : '▼'}{Math.abs(getChangePct(selectedSymbol, -0.18)).toFixed(2)}% (₹{(getPrice(selectedSymbol, 1325.70) * Math.abs(getChangePct(selectedSymbol, -0.18))/100).toFixed(2)})
                    </span>
                  </div>
                  
                  {/* Dropdown Interest state button */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="px-4 py-2 bg-violet-650 hover:bg-violet-600 border border-violet-500/20 text-[#F8FAFC] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-violet-550/15"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{companyInterest[selectedSymbol] || 'Interested'}</span>
                      <ChevronDown className="w-3 h-3 text-[#F8FAFC]" />
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-[#0F172A] border border-[#1E293B] p-1 shadow-2xl z-30 select-none">
                        {[
                          { id: 'Interested', label: 'Interested', icon: Heart, iconColor: 'text-violet-400 fill-violet-500' },
                          { id: 'Purchased', label: 'Mark as Purchased', icon: Check, iconColor: 'text-[#22C55E]' },
                          { id: 'Locked', label: 'Add Price Alert', icon: Info, iconColor: 'text-[#F59E0B]' },
                          { id: 'Watch', label: 'Add to Watchlist', icon: Star, iconColor: 'text-sky-400' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => handleInterestSelect(opt.id as any)}
                            className="w-full text-left px-3 py-2 text-[9.5px] font-bold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1220] rounded-lg flex items-center gap-2"
                          >
                            <opt.icon className={`w-3.5 h-3.5 ${opt.iconColor}`} />
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subtabs for Company Profile */}
              <div className="flex border-b border-[#1E293B] gap-4 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5 select-none">
                {['OVERVIEW', 'FINANCIALS', 'PERFORMANCE', 'NEWS', 'PEER COMPARISON', 'HISTORY'].map((tab, idx) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(idx)}
                    className={`pb-2.5 text-[9.5px] font-black uppercase transition-all relative ${
                      activeSubTab === idx 
                        ? 'text-violet-400 border-b-2 border-violet-500' 
                        : 'text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[
                  { label: 'MARKET CAP', value: `₹${selectedSymbol === 'RELIANCE' ? '17.94' : '13.62'} L Cr`, desc: 'Large Cap' },
                  { label: 'P/E RATIO', value: selectedSymbol === 'RELIANCE' ? '22.22' : '28.45', desc: 'Earnings multiple' },
                  { label: 'ROC', value: selectedSymbol === 'RELIANCE' ? '9.14%' : '14.85%', desc: 'Return on funds' },
                  { label: 'DIV YIELD', value: selectedSymbol === 'RELIANCE' ? '45.00%' : '2.43%', desc: 'Annual payout' },
                  { label: '52W HIGH', value: selectedSymbol === 'RELIANCE' ? '₹1,612' : '₹4,120', desc: 'May 24, 2024' },
                  { label: '52W LOW', value: selectedSymbol === 'RELIANCE' ? '₹1,253' : '₹3,025', desc: 'Nov 10, 2023' }
                ].map((m, idx) => (
                  <div key={idx} className="bg-[#0B1220] p-2.5 rounded-xl border border-[#1E293B] flex flex-col justify-between h-14 relative overflow-hidden">
                    <span className="text-[7.5px] text-[#64748B] uppercase font-black tracking-wider block">{m.label}</span>
                    <span className="text-xs font-black text-[#F8FAFC] truncate mt-0.5 block">{m.value}</span>
                    <span className="text-[7px] text-[#64748B] block truncate mt-0.5">{m.desc}</span>
                  </div>
                ))}
              </div>

              {/* Analytics tab renders */}
              {activeSubTab === 0 && renderOverviewTab()}
              {activeSubTab === 1 && renderFinancialsTab()}
              {activeSubTab === 2 && renderPerformanceTab()}
              {activeSubTab === 3 && renderNewsTab()}
              {activeSubTab === 4 && renderPeerComparisonTab()}
              {activeSubTab === 5 && renderHistoryTab()}
            </div>
          )}

          {/* AI Bot Prompt Chat Bar */}
          <div className="bg-[#0B1220] p-3 rounded-2xl border border-[#1E293B] flex flex-col gap-2 mt-4 select-none">
            <div className="flex items-center gap-2.5 w-full">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shadow-md animate-pulse">
                🤖
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ask NiftyAI anything about these companies..."
                  className="w-full bg-[#060B17] border border-[#1E293B] rounded-xl py-2 pl-3.5 pr-12 text-xs text-[#F8FAFC] focus:outline-none focus:border-violet-500 placeholder-slate-650"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && askInput.trim()) {
                      onNavigateToChat?.(askInput.trim(), selectedSymbol);
                      setAskInput('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (askInput.trim()) {
                      onNavigateToChat?.(askInput.trim(), selectedSymbol);
                      setAskInput('');
                    } else {
                      onNavigateToChat?.('', selectedSymbol);
                    }
                  }}
                  className="absolute right-2 top-1.5 text-[8.5px] font-black text-violet-400 hover:text-violet-300 uppercase bg-violet-950/40 border border-violet-850 px-2 py-0.8 rounded-lg"
                >
                  Ask
                </button>
              </div>
            </div>
            
            {/* Quick action chips */}
            <div className="flex flex-wrap gap-1 items-center mt-1">
              <span className="text-[7.5px] text-[#64748B] font-extrabold uppercase mr-1 tracking-wider">Suggested:</span>
              {[
                `Compare ${selectedSymbol} vs TCS`,
                'Show top gainers today',
                'Best stocks for long term'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateToChat?.(chip, selectedSymbol)}
                  className="text-[7.5px] font-bold px-2 py-1 bg-[#060B17] border border-[#1E293B] rounded-lg text-[#94A3B8] hover:text-[#8B5CF6] hover:border-violet-500/50 transition-colors shadow"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 11. Lower Dashboard Cards (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1: Sector Performance */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[180px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Sector Performance</span>
          <div className="space-y-1.5 mt-2 flex-grow flex flex-col justify-center select-none">
            {[
              { label: 'IT', pct: 2.43, fill: '#22C55E' },
              { label: 'Banking', pct: 1.89, fill: '#22C55E' },
              { label: 'Auto', pct: 3.12, fill: '#22C55E' },
              { label: 'Financial', pct: 1.45, fill: '#22C55E' },
              { label: 'FMCG', pct: -0.62, fill: '#EF4444' }
            ].map(sec => (
              <div key={sec.label} className="space-y-0.5">
                <div className="flex justify-between text-[8px] font-semibold">
                  <span className="text-slate-400">{sec.label}</span>
                  <span className={sec.pct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}>{sec.pct >= 0 ? '+' : ''}{sec.pct.toFixed(2)}%</span>
                </div>
                <div className="h-1 bg-[#060B17] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(sec.pct) * 20, 100)}%`, background: sec.fill }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Top Gainers */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[180px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2">Top Gainers</span>
          <div className="space-y-2 mt-1 flex-grow flex flex-col justify-center select-none">
            {[
              { sym: 'TCS', val: '3,732.45', pct: 3.45 },
              { sym: 'SBIN', val: '812.40', pct: 2.85 },
              { sym: 'ICICIBANK', val: '1,345.30', pct: 2.42 },
              { sym: 'RELIANCE', val: '1,325.70', pct: 2.41 },
              { sym: 'INFY', val: '1,041.30', pct: 2.18 }
            ].map(g => (
              <div key={g.sym} className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-1.5">
                  <CompanyLogo symbol={g.sym} size="sm" />
                  <span className="font-extrabold text-[#F8FAFC]">{g.sym}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#F8FAFC] block">₹{g.val}</span>
                  <span className="text-[8.5px] font-bold text-[#22C55E] block">+{g.pct.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Top Losers */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[180px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2">Top Losers</span>
          <div className="space-y-2 mt-1 flex-grow flex flex-col justify-center select-none">
            {[
              { sym: 'HINDUNILVR', val: '2,185.40', pct: -1.49 },
              { sym: 'ITC', val: '476.80', pct: -1.12 },
              { sym: 'ASIANPAINT', val: '2,854.20', pct: -0.98 },
              { sym: 'HCLTECH', val: '1,345.50', pct: -0.72 },
              { sym: 'TITAN', val: '3,241.60', pct: -0.58 }
            ].map(l => (
              <div key={l.sym} className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-1.5">
                  <CompanyLogo symbol={l.sym} size="sm" />
                  <span className="font-extrabold text-[#F8FAFC]">{l.sym}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#F8FAFC] block">₹{l.val}</span>
                  <span className="text-[8.5px] font-bold text-[#EF4444] block">{l.pct.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: AI Market Prediction */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[180px] hover:border-[#8B5CF6]/30 transition-all duration-300">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">AI Market Prediction</span>
          
          <div className="space-y-2 mt-2 flex-grow flex flex-col justify-center">
            <div className="flex justify-between items-center leading-none">
              <div className="space-y-0.5 leading-none">
                <span className="text-[8px] font-bold text-[#64748B] uppercase tracking-wider block">Tomorrow Prediction</span>
                <span className="text-xs font-black text-[#22C55E] block mt-0.5 leading-none">Bullish</span>
              </div>
              <div className="w-14 h-6 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={niftySpark.slice(-6)}>
                    <defs>
                      <filter id="predGlowDash" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} hide />
                    <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} dot={false} filter="url(#predGlowDash)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[8.5px] select-none">
              <div>
                <span className="text-[#64748B] block">Probability</span>
                <span className="font-black text-[#F8FAFC]">78%</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Expected Range</span>
                <span className="font-black text-[#F8FAFC] whitespace-nowrap">22,400 - 22,750</span>
              </div>
            </div>

            <div className="space-y-0.5 select-none">
              <div className="relative h-1 bg-[#060B17] rounded-full overflow-hidden">
                <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: '78%' }} />
              </div>
              <div className="flex justify-between text-[7px] text-[#64748B] font-black leading-none pt-0.5">
                <span>LOW</span>
                <span>HIGH (78%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
