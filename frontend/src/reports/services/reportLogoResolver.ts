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

export interface ResolvedLogo {
  src: string | null;
  initials: string;
  isSvg: boolean;
}

export function getLogoInitials(symbol: string): string {
  const sym = symbol.toUpperCase().trim();
  let initials = sym.slice(0, 2);
  if (sym === 'RELIANCE') initials = 'RI';
  if (sym === 'HDFCBANK') initials = 'HB';
  if (sym === 'BHARTIARTL') initials = 'BA';
  if (sym === 'ICICIBANK') initials = 'IB';
  if (sym === 'HINDUNILVR') initials = 'HU';
  if (sym === 'ASIANPAINT') initials = 'AP';
  if (sym === 'TATASTEEL') initials = 'TS';
  if (sym === 'TATAMOTORS') initials = 'TM';
  return initials;
}

export function resolveCompanyLogo(symbol: string): ResolvedLogo {
  const sym = symbol.toUpperCase().trim();
  const file = LOCAL_LOGOS[sym];
  
  if (!file) {
    return {
      src: null,
      initials: getLogoInitials(sym),
      isSvg: false
    };
  }

  // React PDF does not support rendering SVGs in the <Image /> component.
  // We identify SVGs so that we can trigger the vector text placeholder fallback.
  const isSvg = file.toLowerCase().endsWith('.svg');
  
  return {
    src: `/logos/${file}`,
    initials: getLogoInitials(sym),
    isSvg
  };
}
