import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Trophy, 
  Search, 
  Download, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { formatCurrency, getCompanyMeta } from '../utils/api';

interface HeatmapViewProps {
  quotes: any[];
  onSymbolSelect?: (symbol: string) => void;
}

// Full 50 Nifty Companies matching DashboardView constituent list
const NIFTY_50_COMPANIES = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', color: '#e11d48', basePrice: 1325.70, changePct: -0.18, rank: 1, sector: 'Energy', industry: 'Conglomerate', mcap: '17.94 L Cr' },
  { symbol: 'TCS',      name: 'Tata Consultancy Services', color: '#2563eb', basePrice: 3732.45, changePct: 3.45, rank: 2, sector: 'IT', industry: 'IT Services', mcap: '13.62 L Cr' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', color: '#7c3aed', basePrice: 1682.40, changePct: -0.42, rank: 3, sector: 'Banking', industry: 'Private Bank', mcap: '11.67 L Cr' },
  { symbol: 'ICICIBANK',name: 'ICICI Bank Ltd', color: '#d97706', basePrice: 1345.30, changePct: 2.42, rank: 4, sector: 'Banking', industry: 'Private Bank', mcap: '9.45 L Cr' },
  { symbol: 'INFY',     name: 'Infosys Ltd', color: '#16a34a', basePrice: 1041.30, changePct: 2.18, rank: 5, sector: 'IT', industry: 'IT Services', mcap: '4.31 L Cr' },
  { symbol: 'SBIN',     name: 'State Bank of India', color: '#0284c7', basePrice: 812.40, changePct: 2.85, rank: 6, sector: 'Banking', industry: 'Public Sector Bank', mcap: '7.24 L Cr' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', color: '#ea580c', basePrice: 1885.50, changePct: 0.57, rank: 7, sector: 'Telecom', industry: 'Telecommunications', mcap: '8.02 L Cr' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', color: '#92400e', basePrice: 2185.40, changePct: -1.49, rank: 8, sector: 'FMCG', industry: 'Consumer Goods', mcap: '5.19 L Cr' },
  { symbol: 'ITC',      name: 'ITC Ltd', color: '#374151', basePrice: 476.80, changePct: 1.12, rank: 9, sector: 'FMCG', industry: 'Conglomerate', mcap: '5.93 L Cr' },
  { symbol: 'LT',       name: 'Larsen & Toubro Ltd', color: '#b45309', basePrice: 3625.80, changePct: 1.26, rank: 10, sector: 'Infrastructure', industry: 'Engineering', mcap: '4.86 L Cr' },
  { symbol: 'HCLTECH',  name: 'HCL Technologies Ltd', color: '#06b6d4', basePrice: 1345.50, changePct: -0.72, rank: 11, sector: 'IT', industry: 'IT Services', mcap: '3.65 L Cr' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', color: '#be123c', basePrice: 1042.80, changePct: -0.15, rank: 12, sector: 'Banking', industry: 'Private Bank', mcap: '3.12 L Cr' },
  { symbol: 'SUNPHARMA',name: 'Sun Pharmaceutical Ltd', color: '#059669', basePrice: 1540.20, changePct: 1.25, rank: 13, sector: 'Pharma', industry: 'Pharmaceuticals', mcap: '3.45 L Cr' },
  { symbol: 'MARUTI',   name: 'Maruti Suzuki India Ltd', color: '#1e3a8a', basePrice: 12420.50, changePct: 2.10, rank: 14, sector: 'Auto', industry: 'Passenger Vehicles', mcap: '3.80 L Cr' },
  { symbol: 'KOTAKBANK',name: 'Kotak Mahindra Bank', color: '#b91c1c', basePrice: 1721.40, changePct: -0.65, rank: 15, sector: 'Banking', industry: 'Private Bank', mcap: '3.40 L Cr' },
  { symbol: 'ULTRACEMCO',name: 'UltraTech Cement Ltd', color: '#4b5563', basePrice: 9840.50, changePct: 0.35, rank: 16, sector: 'Materials', industry: 'Cement', mcap: '2.85 L Cr' },
  { symbol: 'NTPC',     name: 'NTPC Ltd', color: '#047857', basePrice: 362.40, changePct: -0.80, rank: 17, sector: 'Utilities', industry: 'Power Generation', mcap: '3.62 L Cr' },
  { symbol: 'TMPV',     name: 'Tata Motors Passenger Vehicles', color: '#1d4ed8', basePrice: 450.0, changePct: 1.65, rank: 18, sector: 'Auto', industry: 'Passenger Vehicles', mcap: '1.62 L Cr' },
  { symbol: 'ONGC',     name: 'Oil & Natural Gas Corp', color: '#b45309', basePrice: 275.60, changePct: -1.10, rank: 19, sector: 'Utilities', industry: 'Oil exploration', mcap: '3.25 L Cr' },
  { symbol: 'COALINDIA',name: 'Coal India Ltd', color: '#111827', basePrice: 462.15, changePct: 0.85, rank: 20, sector: 'Utilities', industry: 'Coal Mining', mcap: '2.60 L Cr' },
  { symbol: 'POWERGRID',name: 'Power Grid Corp', color: '#0369a1', basePrice: 312.45, changePct: 0.25, rank: 21, sector: 'Utilities', industry: 'Power Transmission', mcap: '2.20 L Cr' },
  { symbol: 'TITAN',    name: 'Titan Company Ltd', color: '#7c2d12', basePrice: 3241.60, changePct: -0.58, rank: 22, sector: 'FMCG', industry: 'Jewellery & Watches', mcap: '2.80 L Cr' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', color: '#312e81', basePrice: 3122.50, changePct: 2.45, rank: 23, sector: 'Diversified', industry: 'Conglomerate', mcap: '3.40 L Cr' },
  { symbol: 'ADANIPORTS',name: 'Adani Ports & SEZ', color: '#1e1b4b', basePrice: 1284.60, changePct: 1.95, rank: 24, sector: 'Infrastructure', industry: 'Ports & Logistics', mcap: '2.70 L Cr' },
  { symbol: 'M&M',      name: 'Mahindra & Mahindra', color: '#991b1b', basePrice: 2842.10, changePct: 1.15, rank: 25, sector: 'Auto', industry: 'Diversified Vehicles', mcap: '2.50 L Cr' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', color: '#0f172a', basePrice: 875.40, changePct: 0.65, rank: 26, sector: 'Metals', industry: 'Steel Production', mcap: '2.10 L Cr' },
  { symbol: 'ASIANPAINT',name: 'Asian Paints Ltd', color: '#701a75', basePrice: 2854.20, changePct: -0.98, rank: 27, sector: 'FMCG', industry: 'Paints & Decors', mcap: '2.40 L Cr' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries', color: '#14532d', basePrice: 642.15, changePct: 1.35, rank: 28, sector: 'Metals', industry: 'Aluminium', mcap: '1.45 L Cr' },
  { symbol: 'TATASTEEL',name: 'Tata Steel Ltd', color: '#0369a1', basePrice: 165.40, changePct: 0.20, rank: 29, sector: 'Metals', industry: 'Steel Production', mcap: '1.80 L Cr' },
  { symbol: 'GRASIM',   name: 'Grasim Industries Ltd', color: '#581c87', basePrice: 2354.20, changePct: 0.90, rank: 30, sector: 'Diversified', industry: 'Textiles & Cement', mcap: '1.55 L Cr' },
  { symbol: 'WIPRO',    name: 'Wipro Ltd', color: '#1e40af', basePrice: 462.15, changePct: -0.15, rank: 31, sector: 'IT', industry: 'IT Services', mcap: '2.40 L Cr' },
  { symbol: 'TECHM',    name: 'Tech Mahindra Ltd', color: '#be123c', basePrice: 1242.30, changePct: -0.75, rank: 32, sector: 'IT', industry: 'IT Services', mcap: '1.20 L Cr' },
  { symbol: 'NESTLEIND',name: 'Nestle India Ltd', color: '#4b5563', basePrice: 24500.60, changePct: 0.40, rank: 33, sector: 'FMCG', industry: 'Packaged Foods', mcap: '2.35 L Cr' },
  { symbol: 'BAJAJ-AUTO',name: 'Bajaj Auto Ltd', color: '#1d4ed8', basePrice: 9400.0, changePct: 1.45, rank: 34, sector: 'Auto', industry: 'Two & Three Wheelers', mcap: '2.65 L Cr' },
  { symbol: 'BAJFINANCE',name: 'Bajaj Finance Ltd', color: '#0369a1', basePrice: 6842.10, changePct: -1.45, rank: 35, sector: 'Financial Services', industry: 'NBFC', mcap: '4.15 L Cr' },
  { symbol: 'BAJAJFINSV',name: 'Bajaj Finserv Ltd', color: '#0284c7', basePrice: 1542.30, changePct: -1.25, rank: 36, sector: 'Financial Services', industry: 'NBFC', mcap: '2.45 L Cr' },
  { symbol: 'CIPLA',    name: 'Cipla Ltd', color: '#047857', basePrice: 1425.40, changePct: 0.80, rank: 37, sector: 'Pharma', industry: 'Pharmaceuticals', mcap: '1.14 L Cr' },
  { symbol: 'DRREDDY',  name: 'Dr Reddys Laboratories', color: '#065f46', basePrice: 5845.20, changePct: 1.10, rank: 38, sector: 'Pharma', industry: 'Pharmaceuticals', mcap: '1.02 L Cr' },
  { symbol: 'APOLLOHOSP',name: 'Apollo Hospitals', color: '#991b1b', basePrice: 5940.50, changePct: 1.85, rank: 39, sector: 'Pharma', industry: 'Hospitals', mcap: '0.85 L Cr' },
  { symbol: 'SBILIFE',  name: 'SBI Life Insurance', color: '#0369a1', basePrice: 1420.20, changePct: 0.35, rank: 40, sector: 'Financial Services', industry: 'Life Insurance', mcap: '1.42 L Cr' },
  { symbol: 'EICHERMOT',name: 'Eicher Motors Ltd', color: '#854d0e', basePrice: 4540.60, changePct: 1.45, rank: 41, sector: 'Auto', industry: 'Motorcycles', mcap: '1.24 L Cr' },
  { symbol: 'JIOFIN',   name: 'Jio Financial Services', color: '#4338ca', basePrice: 362.45, changePct: 2.10, rank: 42, sector: 'Financial Services', industry: 'NBFC', mcap: '2.30 L Cr' },
  { symbol: 'BEL',      name: 'Bharat Electronics Ltd', color: '#047857', basePrice: 285.40, changePct: 3.10, rank: 43, sector: 'Infrastructure', industry: 'Defense Tech', mcap: '2.08 L Cr' },
  { symbol: 'TRENT',    name: 'Trent Ltd', color: '#4b5563', basePrice: 4700.0, changePct: 2.65, rank: 44, sector: 'Consumer Services', industry: 'Retail & Apparel', mcap: '1.67 L Cr' },
  { symbol: 'MAXHEALTH',name: 'Max Healthcare Institute', color: '#991b1b', basePrice: 850.0, changePct: 1.95, rank: 45, sector: 'Pharma', industry: 'Hospitals', mcap: '0.82 L Cr' },
  { symbol: 'INDIGO',   name: 'InterGlobe Aviation Ltd', color: '#1e3a8a', basePrice: 4200.0, changePct: 1.85, rank: 46, sector: 'Consumer Services', industry: 'Airlines', mcap: '1.62 L Cr' },
  { symbol: 'SHRIRAMFIN',name: 'Shriram Finance Ltd', color: '#0284c7', basePrice: 2400.0, changePct: 1.15, rank: 47, sector: 'Financial Services', industry: 'NBFC', mcap: '0.90 L Cr' },
  { symbol: 'TATACONSUM',name: 'Tata Consumer Products Ltd', color: '#0ea5e9', basePrice: 1150.0, changePct: 1.25, rank: 48, sector: 'FMCG', industry: 'Consumer Goods', mcap: '1.05 L Cr' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Co', color: '#7c3aed', basePrice: 600.0, changePct: 0.95, rank: 49, sector: 'Financial Services', industry: 'Life Insurance', mcap: '1.28 L Cr' },
  { symbol: 'ETERNAL',  name: 'Eternal Limited', color: '#cb202d', basePrice: 250.0, changePct: 2.45, rank: 50, sector: 'Consumer Services', industry: 'Online Food Delivery', mcap: '0.25 L Cr' },
];

const COMPANY_LOGOS: Record<string, string> = {
  RELIANCE: '/logos/Reliance.png',
  TCS: '/logos/Tata_Consultancy_Services_Logo_2020_full_stacked.png',
  HDFCBANK: '/logos/hdfc-bank-logo.png',
  ICICIBANK: '/logos/icici-bank-logo.png',
  INFY: '/logos/infosys-logo.png',
  SBIN: '/logos/sbi-logo.png',
  BHARTIARTL: '/logos/Airtel_logo_PNG2.png',
  HINDUNILVR: '/logos/Hindustan-Unilever-Limited-logo.png',
  ITC: '/logos/itc-limited-logo-black-and-white.png',
  LT: '/logos/Larsen__Toubro_Logo.png',
  AXISBANK: '/logos/axis-bank-logo.png',
  MARUTI: '/logos/Maruti-Suzuki-Logo-png.png',
  HCLTECH: '/logos/HLC_logo_PNG3.png',
  ULTRACEMCO: '/logos/ultratech-cement-logo-png.png',
  POWERGRID: '/logos/POWERGRID.NS.png',
  COALINDIA: '/logos/Coal_India.svg',
  TATASTEEL: '/logos/Tata Steel.svg',
  JSWSTEEL: '/logos/jswsteel-og-1.webp',
  ASIANPAINT: '/logos/asian-paints-logo.png',
  WIPRO: '/logos/wipro-logo-png.png',
  TECHM: '/logos/tech mahindra.png',
  'M&M': '/logos/mahindra-auto-seeklogo.png',
  KOTAKBANK: '/logos/Kotak_Mahindra_Bank_logo.png',
  BAJFINANCE: '/logos/Bajaj_Finance_Limited_Logo.png',
  SUNPHARMA: '/logos/sun pharma.png',
  NTPC: '/logos/NTPC_Logo.png',
  ETERNAL: '/logos/zomato-eternal.png',
  TITAN: '/logos/titan-logo.png',
  BEL: '/logos/Bharat_Electronics_Limited_Logo.png',
  HINDALCO: '/logos/hindalco.png',
  SHRIRAMFIN: '/logos/shriram finance.jpg',
  ONGC: '/logos/Oil_and_Natural_Gas_Corporation-Logo.wine.png',
  GRASIM: '/logos/Grasim.svg',
  'BAJAJ-AUTO': '/logos/Bajaj-Logo.png',
  ADANIPORTS: '/logos/Adani_Ports_Logo.svg',
  BAJAJFINSV: '/logos/Bajaj_Finserv_Logo.png',
  INDIGO: '/logos/IndiGo-Logo.png',
  NESTLEIND: '/logos/NESTLE INDIA.png',
  SBILIFE: '/logos/sbi life insurance.jpg',
  APOLLOHOSP: '/logos/Apollo_Hospitals_Logo.png',
  DRREDDY: "/logos/Dr.Reddy's_logo.png",
  JIOFIN: '/logos/jio financial.png',
  TRENT: '/logos/marketing-strategy-of-trent-trent-limited-logo-.png',
  MAXHEALTH: '/logos/max health care.png',
  EICHERMOT: '/logos/eicher-logo-png_.png',
  CIPLA: '/logos/Cipla.avif',
  TATACONSUM: '/logos/TATA-Consumer.png',
  HDFCLIFE: '/logos/HDFC life insurance.png',
  TMPV: '/logos/tata motors sharing.png',
  ADANIENT: '/logos/adani.png'
};

// Tree layout bounding box types
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TreemapItem {
  symbol: string;
  name: string;
  value: number; // weight
  changePct: number;
  sector: string;
  mcap: string;
  price: number;
  aiScore: number;
}

// Treemap generator helper using Binary Partitioning
function generateTreemap(items: TreemapItem[], x: number, y: number, w: number, h: number): (TreemapItem & Rect)[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ ...items[0], x, y, w, h }];
  }

  const total = items.reduce((sum, item) => sum + item.value, 0);
  let accumulated = 0;
  let splitIdx = 0;
  for (let i = 0; i < items.length; i++) {
    accumulated += items[i].value;
    if (accumulated >= total / 2) {
      splitIdx = i;
      break;
    }
  }

  if (splitIdx === 0) splitIdx = 1;
  if (splitIdx === items.length) splitIdx = items.length - 1;

  const left = items.slice(0, splitIdx);
  const right = items.slice(splitIdx);

  const leftSum = left.reduce((sum, item) => sum + item.value, 0);
  const rightSum = right.reduce((sum, item) => sum + item.value, 0);

  if (w > h) {
    const wLeft = (w * leftSum) / (leftSum + rightSum);
    return [
      ...generateTreemap(left, x, y, wLeft, h),
      ...generateTreemap(right, x + wLeft, y, w - wLeft, h)
    ];
  } else {
    const hTop = (h * leftSum) / (leftSum + rightSum);
    return [
      ...generateTreemap(left, x, y, w, hTop),
      ...generateTreemap(right, x, y + hTop, w, h - hTop)
    ];
  }
}

// Color logic selector matching specs
const getHeatmapColor = (pct: number) => {
  if (pct > 3.0) return '#166534';       // Dark Green
  if (pct > 1.5) return '#15803D';       // Green
  if (pct > 0.5) return '#22C55E';       // Light Green
  if (pct >= -0.5 && pct <= 0.5) return '#374151'; // Neutral Gray
  if (pct >= -1.5 && pct < -0.5) return '#F59E0B'; // Orange
  if (pct >= -3.0 && pct < -1.5) return '#B91C1C'; // Red
  return '#7F1D1D';                      // Dark Red
};

export default function HeatmapView({ quotes, onSymbolSelect }: HeatmapViewProps) {
  const [filterLimit, setFilterLimit] = useState(10);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'mcap' | 'change' | 'score'>('mcap');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [isCapWeighted, setIsCapWeighted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMoverTab, setActiveMoverTab] = useState<'gainers' | 'losers'>('gainers');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Helper mapping logo to local or initials fallback
  const renderLogo = (symbol: string, size = 20, showBg = true) => {
    const src = COMPANY_LOGOS[symbol.toUpperCase()];
    if (src) {
      return (
        <img 
          src={src} 
          alt={symbol} 
          className={`rounded-full object-contain flex-shrink-0 ${showBg ? 'bg-white border border-slate-700/30' : ''}`}
          style={{ width: size, height: size }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    const initials = symbol.slice(0, 2).toUpperCase();
    return (
      <div 
        className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 leading-none select-none ${showBg ? 'bg-slate-750' : ''}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>{initials}</span>
      </div>
    );
  };

  // Compile active quotes mapping
  const quoteMap = useMemo(() => {
    const map: Record<string, any> = {};
    quotes.forEach(q => {
      map[q.symbol.toUpperCase()] = q;
    });
    return map;
  }, [quotes]);

  // Dynamic companies list with realtime metrics integration
  const compiledCompanies = useMemo(() => {
    return NIFTY_50_COMPANIES.map(c => {
      const q = quoteMap[c.symbol];
      const livePrice = q ? q.current_price : c.basePrice;
      const liveChangePct = q ? q.change_pct : c.changePct;
      
      // Parse MCAP weight
      const parsedWeight = parseFloat(c.mcap.replace(/[^\d.]/g, ''));
      const weight = isNaN(parsedWeight) ? 1.0 : parsedWeight;

      // Mock score matching active metadata lookup
      const meta = getCompanyMeta(c.symbol);
      const score = c.symbol === 'RELIANCE' ? 78 : (meta.basePrice % 30 + 50);

      return {
        ...c,
        price: livePrice,
        changePct: liveChangePct,
        value: weight,
        aiScore: Math.round(score)
      };
    });
  }, [quoteMap]);

  // Apply filters and limits
  const filteredList = useMemo(() => {
    let result = compiledCompanies;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.symbol.toLowerCase().includes(query) || 
        c.name.toLowerCase().includes(query)
      );
    }

    // Sector Filter
    if (sectorFilter !== 'ALL') {
      result = result.filter(c => c.sector.toUpperCase() === sectorFilter.toUpperCase());
    }

    // Sort order
    if (sortBy === 'mcap') {
      result = [...result].sort((a, b) => b.value - a.value);
    } else if (sortBy === 'change') {
      result = [...result].sort((a, b) => b.changePct - a.changePct);
    } else {
      result = [...result].sort((a, b) => b.aiScore - a.aiScore);
    }

    // Filter limit caps
    return result.slice(0, filterLimit);
  }, [compiledCompanies, searchQuery, sectorFilter, sortBy, filterLimit]);

  // Summary Metrics calculations
  const summaryMetrics = useMemo(() => {
    const activeList = compiledCompanies;
    const total = activeList.length;
    let pos = 0;
    let neg = 0;
    let neut = 0;

    activeList.forEach(c => {
      if (c.changePct > 0.05) pos++;
      else if (c.changePct < -0.05) neg++;
      else neut++;
    });

    // Compute Sector performance averages
    const sectorGroups: Record<string, number[]> = {};
    activeList.forEach(c => {
      if (!sectorGroups[c.sector]) sectorGroups[c.sector] = [];
      sectorGroups[c.sector].push(c.changePct);
    });

    const sectorAverages = Object.keys(sectorGroups).map(sec => {
      const vals = sectorGroups[sec];
      const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
      return { sector: sec, avg };
    });

    const strongest = sectorAverages.reduce((max, s) => s.avg > max.avg ? s : max, { sector: 'Energy', avg: 0 });
    const weakest = sectorAverages.reduce((min, s) => s.avg < min.avg ? s : min, { sector: 'IT', avg: 0 });

    return {
      total,
      positiveCount: pos,
      positivePct: Math.round((pos / total) * 100),
      negativeCount: neg,
      negativePct: Math.round((neg / total) * 100),
      neutralCount: neut,
      neutralPct: Math.round((neut / total) * 100),
      strongestSectorName: strongest.sector,
      strongestSectorAvg: strongest.avg,
      weakestSectorName: weakest.sector,
      weakestSectorAvg: weakest.avg
    };
  }, [compiledCompanies]);

  // Sector Performance Progress list
  const sectorPerformanceList = useMemo(() => {
    const list = ['Energy', 'Metals', 'Auto', 'FMCG', 'Pharma', 'Banking', 'IT', 'Financial Services'];
    const groups: Record<string, number[]> = {};
    
    compiledCompanies.forEach(c => {
      const key = c.sector === 'Utilities' ? 'Energy' : c.sector;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c.changePct);
    });

    return list.map(sec => {
      const vals = groups[sec] || [];
      const avg = vals.length > 0 ? vals.reduce((sum, v) => sum + v, 0) / vals.length : 0.25;
      return { name: sec, avg };
    }).sort((a, b) => b.avg - a.avg);
  }, [compiledCompanies]);

  // Top movers calculation
  const topMovers = useMemo(() => {
    const sorted = [...compiledCompanies].sort((a, b) => b.changePct - a.changePct);
    const gainers = sorted.slice(0, 5);
    const losers = [...sorted].reverse().slice(0, 5);
    return { gainers, losers };
  }, [compiledCompanies]);

  // Generate treemap rectangles if cap-weighted layout is active
  const treemapRects = useMemo(() => {
    if (!isCapWeighted) return [];
    return generateTreemap(filteredList, 0, 0, 100, 100);
  }, [filteredList, isCapWeighted]);

  const selectedNodeInfo = useMemo(() => {
    if (!selectedSymbol) return null;
    return compiledCompanies.find(c => c.symbol === selectedSymbol) || null;
  }, [selectedSymbol, compiledCompanies]);

  // Extract unique sectors list for filter select options
  const sectorsList = useMemo(() => {
    const set = new Set<string>();
    compiledCompanies.forEach(c => set.add(c.sector));
    return ['ALL', ...Array.from(set)];
  }, [compiledCompanies]);

  return (
    <div className="space-y-5 w-full text-[#F8FAFC] pb-10 bg-[#060B17] font-sans selection:bg-violet-500/30">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white leading-none">NIFTY 50 HEATMAP</h1>
          <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mt-1.5 leading-none">
            Market-cap weighted view of NIFTY companies by daily price change
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex h-8 items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#0F172A] px-3.5 text-[9px] font-black uppercase tracking-wider hover:border-violet-500/40 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors leading-none">
            <Download className="w-3 h-3" />
            Export
          </button>
          <button className="flex h-8 items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#0F172A] px-3.5 text-[9px] font-black uppercase tracking-wider hover:border-violet-500/40 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors leading-none">
            <SlidersHorizontal className="w-3 h-3" />
            Filters
          </button>
        </div>
      </div>

      {/* 3. Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 select-none">
        {[
          { label: 'Total Companies', value: `${summaryMetrics.total} of 50`, desc: 'Active NIFTY constituents', icon: LayoutGrid, iconColor: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20' },
          { label: 'Positive Stocks', value: `${summaryMetrics.positiveCount} Stocks`, desc: `${summaryMetrics.positivePct}% Breadth`, icon: TrendingUp, iconColor: 'text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20' },
          { label: 'Negative Stocks', value: `${summaryMetrics.negativeCount} Stocks`, desc: `${summaryMetrics.negativePct}% Breadth`, icon: TrendingDown, iconColor: 'text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20' },
          { label: 'Neutral Stocks', value: `${summaryMetrics.neutralCount} Stocks`, desc: `${summaryMetrics.neutralPct}% Breadth`, icon: Minus, iconColor: 'text-[#94A3B8] bg-slate-800/20 border border-slate-700/30' },
          { label: 'Strongest Sector', value: summaryMetrics.strongestSectorName, desc: `Avg +${summaryMetrics.strongestSectorAvg.toFixed(2)}%`, icon: Trophy, iconColor: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' },
          { label: 'Weakest Sector', value: summaryMetrics.weakestSectorName, desc: `Avg ${summaryMetrics.weakestSectorAvg.toFixed(2)}%`, icon: Trophy, iconColor: 'text-rose-500 bg-rose-500/10 border border-rose-500/20' }
        ].map((c, i) => (
          <div key={i} className="card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between h-[85px] hover:border-slate-750 transition-colors">
            <div className="flex justify-between items-start gap-1.5 leading-none">
              <span className="text-[8.5px] font-black text-[#64748B] uppercase tracking-wider block">{c.label}</span>
              <div className={`p-1 rounded-lg ${c.iconColor}`}>
                <c.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="text-sm font-black text-[#F8FAFC] block leading-none">{c.value}</span>
              <span className="text-[8.5px] text-[#94A3B8] font-bold block mt-1 leading-none">{c.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-3 select-none">
        
        {/* Top limit selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[10, 20, 30, 40, 50].map((limit) => (
            <button
              key={limit}
              onClick={() => setFilterLimit(limit)}
              className={`text-[9.5px] font-black uppercase px-4 py-2.5 rounded-full border transition-all leading-none ${
                filterLimit === limit 
                  ? 'bg-[#8B5CF6] border-violet-500 text-white shadow-lg shadow-violet-500/15' 
                  : 'bg-[#0F172A] border-[#1E293B] text-[#94A3B8] hover:border-slate-800'
              }`}
            >
              Top {limit}
            </button>
          ))}
          <span className="text-[8.5px] text-[#64748B] font-bold uppercase tracking-wider ml-1">
            Selected: Top {filterLimit}
          </span>
        </div>

        {/* Action dropdowns & toggles */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Sort By selector */}
          <div className="relative">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex h-8.5 items-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#0F172A] px-3.5 text-[9.5px] font-black uppercase text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              Sort By: <span className="text-[#8B5CF6]">{sortBy === 'mcap' ? 'Market Cap' : sortBy === 'change' ? 'Price Change' : 'AI Score'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-[#0F172A] border border-[#1E293B] p-1.5 shadow-2xl z-30 flex flex-col gap-0.5">
                {[
                  { id: 'mcap', label: 'Market Cap' },
                  { id: 'change', label: 'Price Change' },
                  { id: 'score', label: 'AI Score' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortBy(opt.id as any); setShowSortDropdown(false); }}
                    className="w-full text-left px-2.5 py-2 text-[9.5px] font-bold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1220] rounded-lg"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sector filter */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex h-8.5 items-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#0F172A] px-3.5 text-[9.5px] font-black uppercase text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              Sector: <span className="text-[#8B5CF6]">{sectorFilter}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-1.5 w-40 max-h-48 overflow-y-auto chat-scrollbar rounded-xl bg-[#0F172A] border border-[#1E293B] p-1.5 shadow-2xl z-30 flex flex-col gap-0.5">
                {sectorsList.map(sec => (
                  <button
                    key={sec}
                    onClick={() => { setSectorFilter(sec); setShowFilterDropdown(false); }}
                    className="w-full text-left px-2.5 py-2 text-[9.5px] font-bold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1220] rounded-lg"
                  >
                    {sec}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cap Weighted Toggle */}
          <div className="flex items-center gap-2 pl-1.5 border-l border-[#1E293B] h-6">
            <span className="text-[9px] font-black text-[#94A3B8] uppercase">Cap-weighted</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isCapWeighted} 
                onChange={() => setIsCapWeighted(!isCapWeighted)} 
                className="sr-only peer" 
              />
              <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-450 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
            </label>
          </div>

        </div>
      </div>

      {/* Main Grid: Heatmap (Left) and Statistics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Heatmap Area */}
        <div className="lg:col-span-9 card p-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl min-h-[480px] flex flex-col justify-between hover:border-[#8B5CF6]/15 transition-all">
          
          <div className="relative flex-1 w-full min-h-[450px]">
            {isCapWeighted ? (
              // 1. CAP-WEIGHTED TREEMAP
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                {treemapRects.map((node) => {
                  const color = getHeatmapColor(node.changePct);
                  const isSelected = selectedSymbol === node.symbol;

                  return (
                    <motion.div
                      key={node.symbol}
                      onClick={() => {
                        setSelectedSymbol(node.symbol);
                        onSymbolSelect?.(node.symbol);
                      }}
                      className="absolute p-[1.5px] cursor-pointer"
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: `${node.w}%`,
                        height: `${node.h}%`
                      }}
                      whileHover={{ scale: 1.01, zIndex: 10 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    >
                      <div 
                        className={`w-full h-full rounded-lg flex flex-col justify-between p-2.5 relative overflow-hidden transition-all duration-350 ${
                          isSelected ? 'outline outline-2 outline-[#8B5CF6] z-10 shadow-[0_0_15px_rgba(139,92,246,0.4)]' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {/* Faded logo watermark */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.25] select-none pointer-events-none transform scale-125 rotate-12 text-white z-0">
                          {renderLogo(node.symbol, 64, true)}
                        </div>

                        {/* Top info */}
                        <div className="flex justify-between items-start select-none w-full gap-2 relative z-10">
                          <span className="text-[12px] font-black tracking-tight text-white leading-none block truncate">{node.symbol}</span>
                          {renderLogo(node.symbol, 16)}
                        </div>

                        {/* Middle details (rendered only if node is large enough) */}
                        {node.h > 15 && node.w > 12 && (
                          <div className="text-[8px] text-white/60 font-bold block truncate leading-none relative z-10 mt-1 select-none">
                            {node.name.replace(' Ltd', '').replace(' Limited', '')}
                          </div>
                        )}

                        {/* Price Change */}
                        <div className="text-right mt-auto select-none relative z-10 w-full">
                          <span className="text-[11px] font-black text-white leading-none">
                            {node.changePct >= 0 ? '+' : ''}{node.changePct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              // 2. EQUAL SIZE GRID
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2 w-full h-full">
                {filteredList.map((node) => {
                  const color = getHeatmapColor(node.changePct);
                  const isSelected = selectedSymbol === node.symbol;

                  return (
                    <motion.div
                      key={node.symbol}
                      onClick={() => {
                        setSelectedSymbol(node.symbol);
                        onSymbolSelect?.(node.symbol);
                      }}
                      className={`rounded-xl cursor-pointer p-2.5 flex flex-col justify-between min-h-[82px] relative overflow-hidden transition-all duration-350 ${
                        isSelected ? 'outline outline-2 outline-[#8B5CF6] z-10 shadow-[0_0_15px_rgba(139,92,246,0.4)]' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      whileHover={{ scale: 1.03, zIndex: 10 }}
                    >
                      {/* Faded Logo Watermark */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.25] select-none pointer-events-none transform scale-125 rotate-12 text-white z-0">
                        {renderLogo(node.symbol, 44, true)}
                      </div>

                      <div className="flex justify-between items-start gap-1 select-none relative z-10">
                        <span className="text-[11px] font-black tracking-tight text-white leading-none">{node.symbol}</span>
                        {renderLogo(node.symbol, 16)}
                      </div>

                      <div className="text-[7.5px] text-white/60 font-bold block truncate leading-none relative z-10 select-none">
                        {node.name.replace(' Ltd', '').replace(' Limited', '')}
                      </div>

                      <div className="text-right select-none relative z-10 w-full">
                        <span className="text-[10.5px] font-black text-white leading-none">
                          {node.changePct >= 0 ? '+' : ''}{node.changePct.toFixed(2)}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side Panels: Sector Performance and Top Movers */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Card A: Sector Performance */}
          <div className="card p-3.5 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[235px] hover:border-slate-800 transition-colors">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-[#1E293B]/40">
              <span className="text-[9.5px] font-black text-[#94A3B8] uppercase tracking-wider block">Sector Performance</span>
              <span className="text-[7px] text-[#64748B] font-bold uppercase select-none">Live updates</span>
            </div>
            <div className="space-y-2 flex-grow flex flex-col justify-center select-none text-[8.5px]">
              {sectorPerformanceList.map(sec => (
                <div key={sec.name} className="space-y-1">
                  <div className="flex justify-between font-semibold leading-none">
                    <span className="text-slate-450 font-bold">{sec.name}</span>
                    <span className={sec.avg >= 0 ? 'text-[#22C55E] font-black' : 'text-[#EF4444] font-black'}>
                      {sec.avg >= 0 ? '+' : ''}{sec.avg.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1 bg-[#060B17] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(Math.abs(sec.avg) * 18, 100)}%`, 
                        backgroundColor: sec.avg >= 0 ? '#22C55E' : '#EF4444' 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: Top Movers */}
          <div className="card p-3.5 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[220px] hover:border-slate-800 transition-colors">
            <div>
              <span className="text-[9.5px] font-black text-[#94A3B8] uppercase tracking-wider block">Top Movers</span>
              
              {/* Gainers / Losers Selector pills */}
              <div className="flex gap-1.5 mt-2 bg-[#060B17] border border-[#1E293B] rounded-xl p-0.5 select-none">
                <button 
                  onClick={() => setActiveMoverTab('gainers')}
                  className={`flex-1 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider leading-none transition-colors ${
                    activeMoverTab === 'gainers' ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'text-[#64748B] hover:text-[#94A3B8]'
                  }`}
                >
                  Gainers
                </button>
                <button 
                  onClick={() => setActiveMoverTab('losers')}
                  className={`flex-1 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider leading-none transition-colors ${
                    activeMoverTab === 'losers' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'text-[#64748B] hover:text-[#94A3B8]'
                  }`}
                >
                  Losers
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-3 flex-grow flex flex-col justify-center select-none text-[9.5px]">
              {(activeMoverTab === 'gainers' ? topMovers.gainers : topMovers.losers).map((m, idx) => (
                <div 
                  key={m.symbol} 
                  onClick={() => { setSelectedSymbol(m.symbol); onSymbolSelect?.(m.symbol); }}
                  className="flex justify-between items-center leading-none border-b border-[#1E293B]/20 pb-1 last:border-b-0 cursor-pointer hover:bg-slate-800/10 p-0.5 rounded transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#64748B] font-bold text-[8.5px]">{idx + 1}</span>
                    {renderLogo(m.symbol, 14)}
                    <span className="font-extrabold text-[#F8FAFC] block truncate max-w-[80px]">{m.symbol}</span>
                  </div>
                  <span className={`font-black text-[9px] ${m.changePct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {m.changePct >= 0 ? '+' : ''}{m.changePct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Selected Node Tooltip Overlay Block */}
      <AnimatePresence>
        {selectedNodeInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card p-3.5 bg-[#0B1220] border border-[#8B5CF6]/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 select-none relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              {renderLogo(selectedNodeInfo.symbol, 32)}
              <div>
                <div className="flex items-center gap-2 leading-none">
                  <h3 className="text-[14px] font-black text-white">{selectedNodeInfo.name}</h3>
                  <span className="text-[8px] bg-violet-600/10 border border-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded font-black uppercase">
                    RANK {selectedNodeInfo.rank}
                  </span>
                </div>
                <span className="text-[8.5px] text-[#64748B] font-black uppercase mt-1.5 block tracking-wider">
                  {selectedNodeInfo.symbol} • {selectedNodeInfo.sector.toUpperCase()} • {selectedNodeInfo.industry.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right leading-none">
                <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block mb-0.5">CURRENT PRICE</span>
                <span className="text-[13px] font-black text-[#F8FAFC] block">
                  ₹{selectedNodeInfo.price.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                </span>
              </div>
              <div className="text-right leading-none">
                <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block mb-0.5">PRICE CHANGE</span>
                <span className={`text-[12px] font-black block ${selectedNodeInfo.changePct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {selectedNodeInfo.changePct >= 0 ? '▲' : '▼'} {Math.abs(selectedNodeInfo.changePct).toFixed(2)}%
                </span>
              </div>
              <div className="text-right leading-none">
                <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block mb-0.5">MARKET CAP</span>
                <span className="text-[12px] font-black text-white block">{selectedNodeInfo.mcap}</span>
              </div>
              <div className="text-right leading-none">
                <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block mb-0.5">AI SCORE</span>
                <span className="text-[12px] font-black text-[#8B5CF6] block">{selectedNodeInfo.aiScore} / 100</span>
              </div>
            </div>
            
            <button 
              onClick={() => onSymbolSelect?.(selectedNodeInfo.symbol)}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-750 text-[#F8FAFC] rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-lg"
            >
              Analyze Stock →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Bottom Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card A: About This Heatmap */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[145px] hover:border-slate-800 transition-colors">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2 select-none">About This Heatmap</span>
            <ul className="space-y-1 text-[9.5px] text-[#94A3B8] list-disc list-inside">
              <li>Each rectangle represents a constituent NIFTY 50 company.</li>
              <li>Size of the block is proportional to the stock's market capitalization.</li>
              <li>Color of the block represents the daily price change percentage.</li>
              <li>Toggle "Cap-weighted" to switch between market cap tree sizes and equal sizes.</li>
            </ul>
          </div>
        </div>

        {/* Card B: Price Change Legend */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[145px] hover:border-slate-800 transition-colors select-none">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-2.5">Price Change Legend (%)</span>
          <div className="grid grid-cols-7 gap-1.5 items-center flex-grow">
            {[
              { index: '-3', label: '≤ -3%', color: '#7F1D1D' },
              { index: '-2', label: '-3% to -1.5%', color: '#B91C1C' },
              { index: '-1', label: '-1.5% to -0.5%', color: '#F59E0B' },
              { index: '0', label: '-0.5% to +0.5%', color: '#374151' },
              { index: '+1', label: '+0.5% to +1.5%', color: '#22C55E' },
              { index: '+2', label: '+1.5% to +3%', color: '#15803D' },
              { index: '+3', label: '≥ +3%', color: '#166534' }
            ].map((leg, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[8px] font-black text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-1.5 py-0.5 rounded-md leading-none select-none">
                  Index {leg.index}
                </span>
                <div className="w-full h-8 rounded-lg border border-slate-700/20" style={{ backgroundColor: leg.color }} />
                <span className="text-[7.5px] font-extrabold text-slate-500 text-center leading-tight">{leg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card C: Market Breadth */}
        <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between min-h-[145px] hover:border-slate-800 transition-colors select-none">
          <div>
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Market Breadth</span>
            <span className="text-[8px] text-[#64748B] block mt-0.5 font-bold uppercase">Proportion of gainers vs losers</span>
          </div>
          <div className="space-y-2 mt-2">
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-[#1E293B]">
              <div className="h-full bg-[#EF4444]" style={{ width: `${summaryMetrics.negativePct}%` }} title={`Negative: ${summaryMetrics.negativeCount}`} />
              <div className="h-full bg-[#374151]" style={{ width: `${summaryMetrics.neutralPct}%` }} title={`Neutral: ${summaryMetrics.neutralCount}`} />
              <div className="h-full bg-[#22C55E]" style={{ width: `${summaryMetrics.positivePct}%` }} title={`Positive: ${summaryMetrics.positiveCount}`} />
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold text-[#94A3B8] leading-none pt-0.5">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> {summaryMetrics.negativeCount} ({summaryMetrics.negativePct}%) Neg</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#374151]" /> {summaryMetrics.neutralCount} ({summaryMetrics.neutralPct}%) Neut</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> {summaryMetrics.positiveCount} ({summaryMetrics.positivePct}%) Pos</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
