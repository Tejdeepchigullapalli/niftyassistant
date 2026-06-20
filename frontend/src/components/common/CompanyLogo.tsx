import React, { useState, useEffect } from 'react';
import { getCompanyMeta } from '../../utils/api';

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

interface CompanyLogoProps {
  symbol: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CompanyLogo({ symbol, className = '', size = 'md' }: CompanyLogoProps) {
  const sym = symbol.toUpperCase().trim();
  const meta = getCompanyMeta(sym);
  const domain = COMPANY_DOMAINS[sym];
  
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [fallbackLevel, setFallbackLevel] = useState(0);

  useEffect(() => {
    const localFile = LOCAL_LOGOS[sym];
    if (localFile) {
      setImgSrc(`/logos/${localFile}`);
      setFallbackLevel(0);
    } else if (domain) {
      setImgSrc(`https://logo.clearbit.com/${domain}`);
      setFallbackLevel(1);
    } else {
      setFallbackLevel(3);
    }
  }, [domain, sym]);

  const handleImageError = () => {
    if (fallbackLevel === 0) {
      if (domain) {
        setImgSrc(`https://logo.clearbit.com/${domain}`);
        setFallbackLevel(1);
      } else {
        setFallbackLevel(3);
      }
    } else if (fallbackLevel === 1 && domain) {
      setImgSrc(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
      setFallbackLevel(2);
    } else {
      setFallbackLevel(3);
    }
  };

  let initials = sym.slice(0, 2);
  if (sym === 'RELIANCE') initials = 'RI';
  if (sym === 'HDFCBANK') initials = 'HB';
  if (sym === 'BHARTIARTL') initials = 'BA';
  if (sym === 'ICICIBANK') initials = 'IB';
  if (sym === 'HINDUNILVR') initials = 'HU';
  if (sym === 'ASIANPAINT') initials = 'AP';
  if (sym === 'TATASTEEL') initials = 'TS';
  if (sym === 'TATAMOTORS') initials = 'TM';

  const sizeClasses = {
    sm: 'w-6 h-6 text-[8px]',
    md: 'w-8 h-8 text-[9px]',
    lg: 'w-10 h-10 text-[11px]'
  };

  const padClasses = {
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-1.5'
  };

  if (fallbackLevel < 3 && imgSrc) {
    return (
      <div 
        className={`rounded-full overflow-hidden flex items-center justify-center bg-white border border-slate-200 flex-shrink-0 ${padClasses[size]} ${sizeClasses[size]} ${className}`}
        style={{ boxShadow: `0 2px 8px rgba(0,0,0,0.1)` }}
      >
        <img 
          src={imgSrc} 
          alt={`${sym} logo`}
          className="w-full h-full object-contain"
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
