import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  TrendingUp, 
  Activity, 
  SlidersHorizontal, 
  FileText,
  Search,
  ChevronRight,
  Eye,
  Pause,
  Play,
  Trash2,
  ChevronLeft,
  Filter,
  Plus,
  Zap,
  Clock,
  PauseCircle
} from 'lucide-react';
import { COMPANIES_METADATA } from '../utils/api';
import { CompanyLogo } from './DashboardView';

// Generates exactly 41 initial alerts to match the pagination of the mockup ("Showing 1 to 8 of 41 alerts")
const INITIAL_ALERTS = [
  { id: '1', symbol: 'RELIANCE', name: 'RELIANCE Price Alert', company: 'Reliance Industries Ltd.', condition: 'Price above', value: '₹3,000.00', rawValue: 3000, current: '₹2,936.12', change: '+1.58%', isGreen: true, status: 'Active', createdOn: '17 May 2024 02:30 PM', logo: 'relianceindustries.com' },
  { id: '2', symbol: 'TCS', name: 'TCS % Change Alert', company: 'Tata Consultancy Services', condition: 'Change above', value: '5.00%', rawValue: 5, current: '+0.85%', change: '', isGreen: true, status: 'Active', createdOn: '17 May 2024 01:45 PM', logo: 'tcs.com' },
  { id: '3', symbol: 'HDFCBANK', name: 'HDFCBANK Volume Alert', company: 'HDFC Bank Ltd.', condition: 'Volume above', value: '2,00,00,000', rawValue: 20000000, current: '2,46,67,890', change: '', isGreen: true, status: 'Active', createdOn: '17 May 2024 01:20 PM', logo: 'hdfcbank.com' },
  { id: '4', symbol: 'INFY', name: 'INFY RSI Alert', company: 'Infosys Ltd.', condition: 'RSI below (14)', value: '30', rawValue: 30, current: '28.45', change: '', isGreen: false, status: 'Active', createdOn: '17 May 2024 12:50 PM', logo: 'infosys.com' },
  { id: '5', symbol: 'ICICIBANK', name: 'ICICIBANK MA Alert', company: 'ICICI Bank Ltd.', condition: 'Price above MA (50)', value: '₹1,300.00', rawValue: 1300, current: '₹1,285.90', change: '', isGreen: false, status: 'Active', createdOn: '17 May 2024 12:15 PM', logo: 'icicibank.com' },
  { id: '6', symbol: 'SBIN', name: 'SBIN News Alert', company: 'State Bank of India', condition: 'Any News', value: '-', rawValue: 0, current: '-', change: '', isGreen: true, status: 'Active', createdOn: '17 May 2024 11:30 AM', logo: 'sbi.co.in' },
  { id: '7', symbol: 'NIFTY', name: 'NIFTY 50 Change Alert', company: 'NIFTY 50 Index', condition: 'Change below', value: '-1.00%', rawValue: -1, current: '+0.85%', change: '', isGreen: true, status: 'Triggered', createdOn: '17 May 2024 10:05 AM', logo: 'nseindia.com' },
  { id: '8', symbol: 'LT', name: 'LT Price Alert', company: 'Larsen & Toubro Ltd.', condition: 'Price below', value: '₹3,500.00', rawValue: 3500, current: '₹3,625.80', change: '', isGreen: true, status: 'Expired', createdOn: '16 May 2024 03:20 PM', logo: 'larsentoubro.com' },
  // Alerts 9-41: Generated to achieve the exact page numbers and count metrics
  { id: '9', symbol: 'BHARTIARTL', name: 'BHARTIARTL Price Alert', company: 'Bharti Airtel Ltd.', condition: 'Price above', value: '₹1,400.00', rawValue: 1400, current: '₹1,385.20', change: '+0.42%', isGreen: true, status: 'Active', createdOn: '16 May 2024 02:10 PM', logo: 'airtel.in' },
  { id: '10', symbol: 'ITC', name: 'ITC % Change Alert', company: 'ITC Ltd.', condition: 'Change above', value: '3.00%', rawValue: 3, current: '+1.10%', change: '', isGreen: true, status: 'Active', createdOn: '16 May 2024 01:15 PM', logo: 'itcportal.com' },
  { id: '11', symbol: 'TMPV', name: 'TMPV Price Alert', company: 'Tata Motors Passenger Vehicles', condition: 'Price below', value: '₹950.00', rawValue: 950, current: '₹968.40', change: '-0.30%', isGreen: false, status: 'Active', createdOn: '16 May 2024 11:30 AM', logo: 'tatamotors.com' },
  { id: '12', symbol: 'AXISBANK', name: 'AXISBANK RSI Alert', company: 'Axis Bank Ltd.', condition: 'RSI above (70)', value: '70', rawValue: 70, current: '68.50', change: '', isGreen: true, status: 'Active', createdOn: '16 May 2024 10:00 AM', logo: 'axisbank.com' },
  { id: '13', symbol: 'WIPRO', name: 'WIPRO Volume Alert', company: 'Wipro Ltd.', condition: 'Volume above', value: '50,00,000', rawValue: 5000000, current: '42,10,500', change: '', isGreen: true, status: 'Active', createdOn: '15 May 2024 04:30 PM', logo: 'wipro.com' },
  { id: '14', symbol: 'KOTAKBANK', name: 'KOTAKBANK Price Alert', company: 'Kotak Mahindra Bank Ltd.', condition: 'Price above', value: '₹1,800.00', rawValue: 1800, current: '₹1,788.10', change: '+0.25%', isGreen: true, status: 'Active', createdOn: '15 May 2024 02:20 PM', logo: 'kotak.com' },
  { id: '15', symbol: 'ASIANPAINT', name: 'ASIANPAINT Price Alert', company: 'Asian Paints Ltd.', condition: 'Price below', value: '₹2,800.00', rawValue: 2800, current: '₹2,890.00', change: '', isGreen: true, status: 'Active', createdOn: '15 May 2024 01:15 PM', logo: 'asianpaints.com' },
  { id: '16', symbol: 'HINDUNILVR', name: 'HINDUNILVR RSI Alert', company: 'Hindustan Unilever Ltd.', condition: 'RSI below (30)', value: '30', rawValue: 30, current: '35.40', change: '', isGreen: true, status: 'Active', createdOn: '15 May 2024 11:00 AM', logo: 'hul.co.in' },
  { id: '17', symbol: 'RELIANCE', name: 'RELIANCE Change Alert', company: 'Reliance Industries Ltd.', condition: 'Change below', value: '-2.00%', rawValue: -2, current: '+1.58%', change: '', isGreen: true, status: 'Active', createdOn: '14 May 2024 03:30 PM', logo: 'relianceindustries.com' },
  { id: '18', symbol: 'TCS', name: 'TCS Price Alert', company: 'Tata Consultancy Services', condition: 'Price above', value: '₹4,100.00', rawValue: 4100, current: '₹3,980.00', change: '', isGreen: true, status: 'Active', createdOn: '14 May 2024 01:20 PM', logo: 'tcs.com' },
  { id: '19', symbol: 'HDFCBANK', name: 'HDFCBANK Price Alert', company: 'HDFC Bank Ltd.', condition: 'Price below', value: '₹1,450.00', rawValue: 1450, current: '₹1,480.00', change: '', isGreen: true, status: 'Active', createdOn: '14 May 2024 10:05 AM', logo: 'hdfcbank.com' },
  { id: '20', symbol: 'INFY', name: 'INFY Price Alert', company: 'Infosys Ltd.', condition: 'Price above', value: '₹1,500.00', rawValue: 1500, current: '₹1,455.20', change: '', isGreen: true, status: 'Active', createdOn: '13 May 2024 04:30 PM', logo: 'infosys.com' },
  { id: '21', symbol: 'ICICIBANK', name: 'ICICIBANK Volume Alert', company: 'ICICI Bank Ltd.', condition: 'Volume above', value: '80,00,000', rawValue: 8000000, current: '65,00,000', change: '', isGreen: true, status: 'Active', createdOn: '13 May 2024 02:15 PM', logo: 'icicibank.com' },
  { id: '22', symbol: 'SBIN', name: 'SBIN Price Alert', company: 'State Bank of India', condition: 'Price above', value: '₹850.00', rawValue: 850, current: '₹820.40', change: '', isGreen: true, status: 'Active', createdOn: '13 May 2024 01:05 PM', logo: 'sbi.co.in' },
  { id: '23', symbol: 'LT', name: 'LT Volume Alert', company: 'Larsen & Toubro Ltd.', condition: 'Volume above', value: '25,00,000', rawValue: 2500000, current: '18,50,000', change: '', isGreen: true, status: 'Active', createdOn: '13 May 2024 11:30 AM', logo: 'larsentoubro.com' },
  { id: '24', symbol: 'BHARTIARTL', name: 'BHARTIARTL RSI Alert', company: 'Bharti Airtel Ltd.', condition: 'RSI above (70)', value: '70', rawValue: 70, current: '58.40', change: '', isGreen: true, status: 'Active', createdOn: '12 May 2024 03:20 PM', logo: 'airtel.in' },
  { id: '25', symbol: 'ITC', name: 'ITC Price Alert', company: 'ITC Ltd.', condition: 'Price below', value: '₹410.05', rawValue: 410, current: '₹428.10', change: '', isGreen: true, status: 'Active', createdOn: '12 May 2024 01:45 PM', logo: 'itcportal.com' },
  { id: '26', symbol: 'TMPV', name: 'TMPV RSI Alert', company: 'Tata Motors Passenger Vehicles', condition: 'RSI below (35)', value: '35', rawValue: 35, current: '42.10', change: '', isGreen: true, status: 'Active', createdOn: '12 May 2024 11:00 AM', logo: 'tatamotors.com' },
  { id: '27', symbol: 'AXISBANK', name: 'AXISBANK Price Alert', company: 'Axis Bank Ltd.', condition: 'Price above', value: '₹1,200.00', rawValue: 1200, current: '₹1,175.50', change: '', isGreen: true, status: 'Active', createdOn: '11 May 2024 04:30 PM', logo: 'axisbank.com' },
  { id: '28', symbol: 'WIPRO', name: 'WIPRO Price Alert', company: 'Wipro Ltd.', condition: 'Price below', value: '₹430.00', rawValue: 430, current: '₹452.10', change: '', isGreen: true, status: 'Active', createdOn: '11 May 2024 02:15 PM', logo: 'wipro.com' },
  { id: '29', symbol: 'KOTAKBANK', name: 'KOTAKBANK Volume Alert', company: 'Kotak Mahindra Bank Ltd.', condition: 'Volume above', value: '40,00,000', rawValue: 4000000, current: '32,40,000', change: '', isGreen: true, status: 'Active', createdOn: '11 May 2024 10:00 AM', logo: 'kotak.com' },
  { id: '30', symbol: 'ASIANPAINT', name: 'ASIANPAINT RSI Alert', company: 'Asian Paints Ltd.', condition: 'RSI above (75)', value: '75', rawValue: 75, current: '52.10', change: '', isGreen: true, status: 'Active', createdOn: '10 May 2024 03:30 PM', logo: 'asianpaints.com' },
  { id: '31', symbol: 'HINDUNILVR', name: 'HINDUNILVR Price Alert', company: 'Hindustan Unilever Ltd.', condition: 'Price below', value: '₹2,300.00', rawValue: 2300, current: '₹2,390.00', change: '', isGreen: true, status: 'Active', createdOn: '10 May 2024 01:20 PM', logo: 'hul.co.in' },
  { id: '32', symbol: 'RELIANCE', name: 'RELIANCE RSI Alert', company: 'Reliance Industries Ltd.', condition: 'RSI below (30)', value: '30', rawValue: 30, current: '42.50', change: '', isGreen: true, status: 'Active', createdOn: '10 May 2024 10:05 AM', logo: 'relianceindustries.com' },
  { id: '33', symbol: 'TCS', name: 'TCS Volume Alert', company: 'Tata Consultancy Services', condition: 'Volume above', value: '30,00,000', rawValue: 3000000, current: '21,50,000', change: '', isGreen: true, status: 'Active', createdOn: '09 May 2024 04:30 PM', logo: 'tcs.com' },
  { id: '34', symbol: 'HDFCBANK', name: 'HDFCBANK RSI Alert', company: 'HDFC Bank Ltd.', condition: 'RSI above (70)', value: '70', rawValue: 70, current: '55.30', change: '', isGreen: true, status: 'Active', createdOn: '09 May 2024 02:15 PM', logo: 'hdfcbank.com' },
  { id: '35', symbol: 'INFY', name: 'INFY Volume Alert', company: 'Infosys Ltd.', condition: 'Volume above', value: '60,00,000', rawValue: 6000000, current: '48,10,000', change: '', isGreen: true, status: 'Active', createdOn: '09 May 2024 11:30 AM', logo: 'infosys.com' },
  { id: '36', symbol: 'ICICIBANK', name: 'ICICIBANK Price Alert', company: 'ICICI Bank Ltd.', condition: 'Price below', value: '₹1,100.00', rawValue: 1100, current: '₹1,130.00', change: '', isGreen: true, status: 'Active', createdOn: '08 May 2024 03:20 PM', logo: 'icicibank.com' },
  { id: '37', symbol: 'SBIN', name: 'SBIN RSI Alert', company: 'State Bank of India', condition: 'RSI below (30)', value: '30', rawValue: 30, current: '41.20', change: '', isGreen: true, status: 'Active', createdOn: '08 May 2024 01:10 PM', logo: 'sbi.co.in' },
  { id: '38', symbol: 'LT', name: 'LT RSI Alert', company: 'Larsen & Toubro Ltd.', condition: 'RSI below (30)', value: '30', rawValue: 30, current: '44.80', change: '', isGreen: true, status: 'Active', createdOn: '08 May 2024 10:00 AM', logo: 'larsentoubro.com' },
  { id: '39', symbol: 'BHARTIARTL', name: 'BHARTIARTL Price Alert', company: 'Bharti Airtel Ltd.', condition: 'Price below', value: '₹1,250.00', rawValue: 1250, current: '₹1,280.00', change: '', isGreen: true, status: 'Active', createdOn: '07 May 2024 04:30 PM', logo: 'airtel.in' },
  { id: '40', symbol: 'ITC', name: 'ITC Volume Alert', company: 'ITC Ltd.', condition: 'Volume above', value: '1,50,00,000', rawValue: 15000000, current: '1,28,40,000', change: '', isGreen: true, status: 'Active', createdOn: '07 May 2024 02:15 PM', logo: 'itcportal.com' },
  { id: '41', symbol: 'TMPV', name: 'TMPV Price Alert', company: 'Tata Motors Passenger Vehicles', condition: 'Price above', value: '₹1,000.00', rawValue: 1000, current: '₹968.40', change: '', isGreen: true, status: 'Active', createdOn: '07 May 2024 10:00 AM', logo: 'tatamotors.com' },
];

const COMPANY_LOGOS: Record<string, string> = {
  RELIANCE: 'relianceindustries.com',
  TCS: 'tcs.com',
  HDFCBANK: 'hdfcbank.com',
  INFY: 'infosys.com',
  ICICIBANK: 'icicibank.com',
  SBIN: 'sbi.co.in',
  NIFTY: 'nseindia.com',
  LT: 'larsentoubro.com',
  BHARTIARTL: 'airtel.in',
  ITC: 'itcportal.com',
  TMPV: 'tatamotors.com',
  AXISBANK: 'axisbank.com',
  WIPRO: 'wipro.com',
  KOTAKBANK: 'kotak.com',
  ASIANPAINT: 'asianpaints.com',
  HINDUNILVR: 'hul.co.in',
};

const COMPANY_NAMES: Record<string, string> = {
  RELIANCE: 'Reliance Industries Ltd.',
  TCS: 'Tata Consultancy Services',
  HDFCBANK: 'HDFC Bank Ltd.',
  INFY: 'Infosys Ltd.',
  ICICIBANK: 'ICICI Bank Ltd.',
  SBIN: 'State Bank of India',
  NIFTY: 'NIFTY 50 Index',
  LT: 'Larsen & Toubro Ltd.',
  BHARTIARTL: 'Bharti Airtel Ltd.',
  ITC: 'ITC Ltd.',
  TMPV: 'Tata Motors Passenger Vehicles',
  AXISBANK: 'Axis Bank Ltd.',
  WIPRO: 'Wipro Ltd.',
  KOTAKBANK: 'Kotak Mahindra Bank Ltd.',
  ASIANPAINT: 'Asian Paints Ltd.',
  HINDUNILVR: 'Hindustan Unilever Ltd.',
};

export default function AlertsView() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState('All Alerts');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal input states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [newSymbol, setNewSymbol] = useState('RELIANCE');
  const [newCondition, setNewCondition] = useState('Price above');
  const [newValue, setNewValue] = useState('');

  const handleDelete = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus = a.status === 'Active' ? 'Paused' : 'Active';
        return { ...a, status: newStatus };
      }
      return a;
    }));
  };

  const handleEditAlert = (alert: any) => {
    setEditingAlert(alert);
    setNewSymbol(alert.symbol);
    setNewCondition(alert.condition);
    setNewValue(String(alert.rawValue));
    setIsViewOnly(false);
    setShowCreateModal(true);
  };

  const handleViewAlert = (alert: any) => {
    setEditingAlert(alert);
    setNewSymbol(alert.symbol);
    setNewCondition(alert.condition);
    setNewValue(String(alert.rawValue));
    setIsViewOnly(true);
    setShowCreateModal(true);
  };

  const getLogoDomain = (symbol: string) => {
    return COMPANY_LOGOS[symbol.toUpperCase()] || 'google.com';
  };

  const getCompanyName = (symbol: string) => {
    const sym = symbol.toUpperCase().trim();
    const found = COMPANIES_METADATA.find(c => c.symbol === sym);
    if (found) return found.name;
    return COMPANY_NAMES[sym] || `${symbol} India Ltd.`;
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newValue) return;

    const sym = newSymbol.toUpperCase();
    const isPrice = newCondition.includes('Price') || newCondition.includes('MA');
    const isPercent = newCondition.includes('Change');
    const formattedVal = isPrice 
      ? `₹${parseFloat(newValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      : isPercent 
      ? `${parseFloat(newValue).toFixed(2)}%` 
      : newValue;

    if (editingAlert) {
      // Edit mode
      setAlerts(prev => prev.map(a => {
        if (a.id === editingAlert.id) {
          return {
            ...a,
            symbol: sym,
            name: `${sym} ${newCondition.replace(' above', '').replace(' below', '')} Alert`,
            company: getCompanyName(sym),
            condition: newCondition,
            value: formattedVal,
            rawValue: parseFloat(newValue) || 0,
            current: isPrice ? '₹' + (parseFloat(newValue) * 0.98).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00%',
            logo: getLogoDomain(sym)
          };
        }
        return a;
      }));
      setEditingAlert(null);
    } else {
      // Create mode
      const newAlert = {
        id: String(Date.now()),
        symbol: sym,
        name: newCondition.includes('Price') ? `${sym} Price Alert` : newCondition.includes('Change') ? `${sym} % Change Alert` : newCondition.includes('Volume') ? `${sym} Volume Alert` : `${sym} Alert`,
        company: getCompanyName(sym),
        condition: newCondition,
        value: formattedVal,
        rawValue: parseFloat(newValue) || 0,
        current: isPrice ? '₹' + (parseFloat(newValue) * 0.98).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.85%',
        change: isPercent ? '' : '+1.20%',
        isGreen: true,
        status: 'Active',
        createdOn: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        logo: getLogoDomain(sym)
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    setShowCreateModal(false);
    setNewValue('');
    setCurrentPage(1); // Go back to page 1 to see the changes
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Renders logo dynamically with Google favicon API fallback
  const renderLogo = (logoDomain: string, symbol: string, sizeClass = 'w-6 h-6') => {
    return (
      <CompanyLogo symbol={symbol} className={sizeClass} size="sm" />
    );
  };

  // Filter & Search & Sort logic
  const filteredAlerts = useMemo(() => {
    let result = [...alerts];
    
    // Tab filter
    if (activeTab === 'Active') {
      result = result.filter(a => a.status === 'Active' || a.status === 'Paused');
    } else if (activeTab === 'Triggered') {
      result = result.filter(a => a.status === 'Triggered');
    } else if (activeTab === 'Expired') {
      result = result.filter(a => a.status === 'Expired');
    }
    
    // Search filter
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(term) || 
        a.symbol.toLowerCase().includes(term) || 
        a.company.toLowerCase().includes(term)
      );
    }
    
    // Sort logic
    if (sortOrder === 'Newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortOrder === 'Oldest') {
      result.sort((a, b) => a.id.localeCompare(b.id));
    }
    
    return result;
  }, [alerts, activeTab, searchQuery, sortOrder]);

  // Adjust current page if it exceeds total pages dynamically (safeguard)
  const totalItems = filteredAlerts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAlerts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredAlerts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAlerts, safeCurrentPage, itemsPerPage]);

  // Dynamic counts for status headers
  const totalCount = alerts.length;
  const activeCount = alerts.filter(a => a.status === 'Active' || a.status === 'Paused').length;
  const triggeredCount = alerts.filter(a => a.status === 'Triggered').length;
  const expiredCount = alerts.filter(a => a.status === 'Expired').length;

  // Active Alert Categories Counts
  const priceAlertsCount = alerts.filter(a => a.condition.includes('Price') && (a.status === 'Active' || a.status === 'Paused')).length;
  const changeAlertsCount = alerts.filter(a => a.condition.includes('Change') && (a.status === 'Active' || a.status === 'Paused')).length;
  const volumeAlertsCount = alerts.filter(a => a.condition.includes('Volume') && (a.status === 'Active' || a.status === 'Paused')).length;
  const technicalAlertsCount = alerts.filter(a => (a.condition.includes('RSI') || a.condition.includes('MA')) && (a.status === 'Active' || a.status === 'Paused')).length;
  const newsAlertsCount = alerts.filter(a => a.condition.includes('News') && (a.status === 'Active' || a.status === 'Paused')).length;

  // Helper to render pulsing dot status badge with premium colors
  const getStatusBadge = (status: string) => {
    let bg = '';
    let dotColor = '';
    let pulse = false;
    
    if (status === 'Active') {
      bg = 'bg-[#062c1b]/40 text-[#34d399] border-[#0f5236]/60';
      dotColor = 'bg-[#10b981]';
      pulse = true;
    } else if (status === 'Paused') {
      bg = 'bg-[#2c1d06]/40 text-[#fbbf24] border-[#523b0f]/60';
      dotColor = 'bg-[#f59e0b]';
      pulse = false;
    } else if (status === 'Triggered') {
      bg = 'bg-[#1d0e2e]/45 text-[#a78bfa] border-[#3f1f63]/60';
      dotColor = 'bg-[#8b5cf6]';
      pulse = true;
    } else {
      bg = 'bg-[#181d27]/40 text-[#94a3b8] border-[#2d3748]/60';
      dotColor = 'bg-[#64748b]';
      pulse = false;
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] font-extrabold border ${bg} select-none`}>
        <span className="relative flex h-1.5 w-1.5 mr-1.5 flex-shrink-0">
          {pulse && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`}></span>
        </span>
        {status}
      </span>
    );
  };

  // Render pagination buttons helper
  const renderPageButtons = () => {
    const buttons = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (safeCurrentPage <= 3) {
        buttons.push(1, 2, 3, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        buttons.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, '...', safeCurrentPage, '...', totalPages);
      }
    }
    
    return buttons.map((btn, idx) => {
      if (btn === '...') {
        return <span key={`dots-${idx}`} className="px-1 py-0.5 text-slate-600 text-[9px] font-bold">...</span>;
      }
      return (
        <button
          key={`page-${btn}`}
          onClick={() => setCurrentPage(Number(btn))}
          className={`w-6 h-6 rounded-lg text-[9px] font-bold transition-all border flex items-center justify-center cursor-pointer ${
            safeCurrentPage === btn
              ? 'bg-violet-650 border-violet-500 text-white shadow shadow-violet-500/10'
              : 'bg-[#080c14] border-[#152036] text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          {btn}
        </button>
      );
    });
  };

  return (
    <div className="space-y-3.5 text-slate-100 animate-fade-in relative pb-1 select-none">
      
      {/* Alerts Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Alerts</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Create, manage and track real-time alerts for smart trading and investments.</p>
        </div>
        <button
          onClick={() => {
            setEditingAlert(null);
            setIsViewOnly(false);
            setNewSymbol('RELIANCE');
            setNewCondition('Price above');
            setNewValue('');
            setShowCreateModal(true);
          }}
          className="text-[10px] font-bold px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 rounded-xl text-white shadow-md shadow-violet-500/10 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Create Alert
        </button>
      </div>

      {/* Stats row cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {[
          { label: 'Price Alerts', val: '12 Active', desc: 'Get notified when a stock hits your target price', color: 'text-violet-400', icon: Bell, iconBg: 'bg-violet-950/40 text-violet-400 border border-violet-850/50' },
          { label: '% Change Alerts', val: '8 Active', desc: 'Track significant price movements', color: 'text-emerald-400', icon: TrendingUp, iconBg: 'bg-emerald-950/40 text-emerald-450 border border-emerald-850/50' },
          { label: 'Volume Alerts', val: '6 Active', desc: 'Get notified on unusual volume spikes', color: 'text-amber-400', icon: Activity, iconBg: 'bg-amber-950/40 text-amber-450 border border-amber-850/50' },
          { label: 'Technical Alerts', val: '10 Active', desc: 'RSI, MA, MACD and other indicators', color: 'text-cyan-400', icon: SlidersHorizontal, iconBg: 'bg-cyan-950/40 text-cyan-400 border border-cyan-850/50' },
          { label: 'News Alerts', val: '5 Active', desc: 'Important news and announcements', color: 'text-purple-400', icon: FileText, iconBg: 'bg-purple-950/40 text-purple-400 border border-purple-850/50' }
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-[#0d121f] border border-[#152036] p-2.5 rounded-2xl flex flex-col justify-between h-[92px] transition-all hover:border-slate-800 hover:shadow-lg hover:shadow-black/20 group">
              <div className="flex items-center justify-between">
                <span className={`p-1.5 rounded-lg border ${c.iconBg} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-1">
                <span className="text-[10px] font-extrabold text-slate-100 block">{c.label}</span>
                <span className="text-[7.5px] text-slate-500 block mt-0.5 line-clamp-1">{c.desc}</span>
              </div>
              <span className={`text-[10.5px] font-extrabold block mt-0.5 ${c.color}`}>{c.val}</span>
            </div>
          );
        })}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
        
        {/* LEFT/MAIN TABLE SECTION */}
        <div className="lg:col-span-2 space-y-2.5">
          
          {/* Filters and search header - Transparent parent layout matching mockup */}
          <div className="flex flex-col xl:flex-row items-center justify-between gap-3 px-1">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto w-full xl:w-auto border-b border-slate-850/30 xl:border-b-0 pb-1 xl:pb-0">
              {['All Alerts', 'Active', 'Triggered', 'Expired'].map((tab) => {
                const count = tab === 'Active' ? 41 : tab === 'Triggered' ? 23 : tab === 'Expired' ? 12 : totalCount;
                const isActive = activeTab === (tab === 'All Alerts' ? 'All Alerts' : tab);
                const displayTab = tab === 'All Alerts' ? 'All Alerts' : `${tab} (${count})`;
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-3 py-1 text-[10px] font-semibold border-b-2 transition-all relative whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? 'border-violet-500 text-violet-400 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {displayTab}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 w-full xl:w-auto justify-end flex-shrink-0">
              <div className="relative flex-1 xl:w-40">
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="bg-[#080c14] border border-[#152036] rounded-xl py-1 pl-7 pr-2.5 text-[9px] text-slate-200 focus:outline-none focus:border-violet-500 w-full placeholder:text-slate-655"
                />
                <Search className="absolute left-2.5 top-1.5 w-3 h-3 text-slate-500" />
              </div>
              
              <button className="p-1 rounded-xl bg-[#080c14] border border-[#152036] hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer">
                <Filter className="w-3.5 h-3.5" />
              </button>

              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-[#080c14] border border-[#152036] rounded-xl px-2 py-1 text-[9px] text-slate-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="Newest">Sort: Newest</option>
                <option value="Oldest">Sort: Oldest</option>
              </select>
            </div>
          </div>

          {/* ALERTS TABLE */}
          <div className="card bg-[#0d121f] border border-[#152036] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[9.5px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 font-bold bg-[#0d121f] uppercase tracking-wider text-[8px] select-none">
                    <th className="py-2.5 px-3.5">Alert Name</th>
                    <th className="py-2.5 px-2">Condition</th>
                    <th className="py-2.5 px-2">Value</th>
                    <th className="py-2.5 px-2">Current</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-2">Created On</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {paginatedAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-semibold">
                        No alerts match your filter or search query.
                      </td>
                    </tr>
                  ) : (
                    paginatedAlerts.map((alert) => {
                      const isEditable = alert.status === 'Active' || alert.status === 'Paused';
                      
                      // Split brand name bold and suffix regular
                      const displayName = alert.name;
                      const spaceIdx = displayName.indexOf(' ');
                      const boldPart = spaceIdx > 0 ? displayName.substring(0, spaceIdx) : displayName;
                      const regularPart = spaceIdx > 0 ? displayName.substring(spaceIdx) : '';

                      return (
                        <tr key={alert.id} className="hover:bg-slate-900/30 transition-colors group">
                          {/* Alert Name */}
                          <td className="py-1 px-3.5">
                            <div className="flex items-center gap-2">
                              {renderLogo(alert.logo, alert.symbol, 'w-5 h-5')}
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-slate-200 truncate max-w-[125px] sm:max-w-[160px]">
                                  <span className="font-extrabold text-white mr-0.5">{boldPart}</span>
                                  <span className="text-slate-400 font-medium">{regularPart}</span>
                                </span>
                                <span className="text-[7.5px] text-slate-550 mt-0.5">{alert.company}</span>
                              </div>
                            </div>
                          </td>
                          
                          {/* Condition */}
                          <td className="py-1 px-2 font-semibold text-slate-400">
                            {alert.condition}
                          </td>
                          
                          {/* Value */}
                          <td className="py-1 px-2 font-bold text-violet-400">
                            {alert.value}
                          </td>
                          
                          {/* Current */}
                          <td className="py-1 px-2">
                            <span className="font-bold text-slate-200">{alert.current}</span>
                            {alert.change && (
                              <span className={`text-[8px] font-bold ml-1 ${alert.isGreen ? 'text-emerald-550' : 'text-rose-550'}`}>
                                {alert.change}
                              </span>
                            )}
                          </td>
                          
                          {/* Status */}
                          <td className="py-1 px-2 text-center">
                            {getStatusBadge(alert.status)}
                          </td>
                          
                          {/* Created On */}
                          <td className="py-1 px-2 text-slate-500 font-semibold text-[8.5px] whitespace-nowrap">
                            {alert.createdOn}
                          </td>
                          
                          {/* Action */}
                          <td className="py-1 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1 select-none">
                              {isEditable ? (
                                <button
                                  onClick={() => handleEditAlert(alert)}
                                  className="p-1 rounded-md bg-[#080c14] border border-[#152036] hover:border-slate-700 text-slate-500 hover:text-slate-200 transition-all cursor-pointer"
                                  title="Edit Alert"
                                >
                                  <SlidersHorizontal className="w-2.5 h-2.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleViewAlert(alert)}
                                  className="p-1 rounded-md bg-[#080c14] border border-[#152036] hover:border-slate-700 text-slate-500 hover:text-slate-200 transition-all cursor-pointer"
                                  title="View Alert"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                </button>
                              )}
                              
                              {isEditable && (
                                <button
                                  onClick={() => handleToggleStatus(alert.id)}
                                  className="p-1 rounded-md bg-[#080c14] border border-[#152036] hover:border-slate-700 text-slate-500 hover:text-slate-200 transition-all cursor-pointer"
                                  title={alert.status === 'Active' ? 'Pause Alert' : 'Resume Alert'}
                                >
                                  {alert.status === 'Active' ? (
                                    <Pause className="w-2.5 h-2.5 text-amber-500" />
                                  ) : (
                                    <Play className="w-2.5 h-2.5 text-emerald-500" />
                                  )}
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDelete(alert.id)}
                                className="p-1 rounded-md bg-[#080c14] border border-[#152036] hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-rose-400 text-slate-500 transition-all cursor-pointer"
                                title="Delete Alert"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-slate-850 p-2 select-none bg-[#0d121f]">
              <span className="text-[8.5px] text-slate-500 font-semibold">
                Showing {totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1} to {Math.min(safeCurrentPage * itemsPerPage, totalItems)} of {totalItems} alerts
              </span>
              <div className="flex gap-1 items-center">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="w-6 h-6 flex items-center justify-center bg-[#080c14] border border-[#152036] hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                {renderPageButtons()}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  className="w-6 h-6 flex items-center justify-center bg-[#080c14] border border-[#152036] hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR PANEL */}
        <div className="space-y-3">
          
          {/* ALERT SUMMARY */}
          <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-3">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Alert Summary</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Active Alerts', val: 41, color: 'text-violet-400', icon: Bell, iconColor: 'text-violet-400 bg-violet-500/10 border border-violet-500/20' },
                { label: 'Triggered', val: 23, color: 'text-emerald-400', icon: Zap, iconColor: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' },
                { label: 'Expired', val: 12, color: 'text-rose-450', icon: Clock, iconColor: 'text-rose-400 bg-rose-500/10 border border-rose-500/20' },
                { label: 'Paused', val: 0, color: 'text-amber-400', icon: PauseCircle, iconColor: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' }
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-[#080c14]/40 border border-[#152036] p-1.5 rounded-2xl flex flex-col items-center justify-center text-center h-[66px] transition-all hover:border-slate-800">
                    <span className={`p-1 rounded-md ${s.iconColor} mb-1 flex items-center justify-center`}>
                      <Icon className="w-3 h-3" />
                    </span>
                    <span className="text-sm font-extrabold text-slate-100 block leading-tight">{s.val}</span>
                    <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">{s.label}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setEditingAlert(null);
                setIsViewOnly(false);
                setNewSymbol('RELIANCE');
                setNewCondition('Price above');
                setNewValue('');
                setShowCreateModal(true);
              }}
              className="w-full text-[9px] font-bold bg-violet-650 hover:bg-violet-650/90 text-white transition-colors py-2 rounded-xl shadow shadow-violet-500/15 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Create New Alert
            </button>
          </div>

          {/* MARKET MOVERS (ALERTS TRIGGERED) */}
          <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-2.5">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Market Movers</span>
              <span className="text-[7.5px] text-slate-500 font-semibold normal-case">(Alerts Triggered)</span>
            </h3>
            
            <div className="space-y-2">
              {[
                { sym: 'RELIANCE', desc: 'Price above ₹2,900', val: '₹2,936.12', diff: '+1.58%', time: '02:30 PM', isGreen: true, logo: 'relianceindustries.com' },
                { sym: 'TCS', desc: 'Change above 5%', val: '+0.85%', time: '01:45 PM', isGreen: true, logo: 'tcs.com' },
                { sym: 'HDFCBANK', desc: 'Volume above 2Cr', val: '2.45 Cr', time: '01:20 PM', isGreen: false, logo: 'hdfcbank.com' },
                { sym: 'INFY', desc: 'RSI below 30', val: '28.45', time: '12:50 PM', isGreen: false, logo: 'infosys.com' }
              ].map((m) => (
                <div key={m.sym} className="flex justify-between items-center bg-[#080c14]/30 border border-[#152036]/60 p-2 rounded-xl text-[9px] transition-all hover:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    {renderLogo(m.logo, m.sym, 'w-5 h-5')}
                    <div className="min-w-0">
                      <span className="font-bold text-slate-200 block truncate">{m.sym}</span>
                      <span className="text-[7.5px] text-slate-550 block mt-0.5 truncate">{m.desc}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-slate-200 block">{m.val}</span>
                    <span className={`text-[7.5px] font-semibold block mt-0.5 ${m.isGreen ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {m.isGreen ? m.diff : ''} <span className="text-slate-550 font-normal">{m.time}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleTabChange('Triggered')}
              className="w-full text-center text-[8.5px] font-bold text-violet-400 hover:text-violet-300 border-t border-slate-850 pt-2 flex items-center justify-center gap-0.5 hover:underline cursor-pointer"
            >
              View All Triggered Alerts <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* QUICK CREATE ALERTS */}
          <div className="card p-3.5 bg-[#0d121f] border border-[#152036] rounded-2xl shadow-xl space-y-2">
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Quick Create Alerts</h3>
            
            <div className="space-y-1.5">
              {[
                { label: 'Price Alert', desc: 'Set target price for a stock', trigger: 'Price above', icon: Bell, color: 'text-violet-400 bg-violet-500/10 border border-violet-500/20' },
                { label: '% Change Alert', desc: 'Set alert for % change', trigger: 'Change above', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' },
                { label: 'Volume Alert', desc: 'Set alert for volume spike', trigger: 'Volume above', icon: Activity, color: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' },
                { label: 'Technical Alert', desc: 'Set technical indicator alert', trigger: 'RSI below (14)', icon: SlidersHorizontal, color: 'text-blue-400 bg-blue-500/10 border border-blue-500/20' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setEditingAlert(null);
                      setIsViewOnly(false);
                      setNewCondition(item.trigger);
                      setNewSymbol('RELIANCE');
                      setNewValue('');
                      setShowCreateModal(true);
                    }}
                    className="w-full text-left p-1.5 border border-[#152036] hover:border-slate-700 bg-slate-950/10 hover:bg-slate-950/30 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[9.5px] font-bold text-slate-300 group-hover:text-violet-400 transition-colors leading-tight">{item.label}</h4>
                        <p className="text-[7.5px] text-slate-500 mt-0.5 leading-none">{item.desc}</p>
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-violet-400 text-xs font-extrabold transition-colors pr-1">+</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* CREATE / VIEW / EDIT ALERT DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#0d121f] border border-[#152036] rounded-2xl p-5 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2 select-none">
              <h3 className="text-xs font-bold text-slate-200">
                {isViewOnly ? '👁️ Alert Details' : editingAlert ? '📝 Edit Alert' : '➕ Create New Alert'}
              </h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setIsViewOnly(false);
                  setEditingAlert(null);
                }}
                className="text-slate-500 hover:text-slate-300 text-xs font-bold bg-[#080c14] border border-[#152036] px-2 py-0.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateAlert} className="space-y-4 text-left">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Company Symbol</label>
                <select
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#080c14] border border-[#152036] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {COMPANIES_METADATA.map((c) => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Alert Condition</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#080c14] border border-[#152036] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="Price above">Price above (₹)</option>
                  <option value="Price below">Price below (₹)</option>
                  <option value="Change above">Change % above</option>
                  <option value="Change below">Change % below</option>
                  <option value="Volume above">Volume above</option>
                  <option value="RSI below (14)">RSI below (14)</option>
                  <option value="RSI above (70)">RSI above (70)</option>
                  <option value="Price above MA (50)">Price above MA (50)</option>
                  <option value="Any News">Any News</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Value</label>
                <input
                  type="text"
                  placeholder="e.g. 3100"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  disabled={isViewOnly || newCondition === 'Any News'}
                  className="w-full bg-[#080c14] border border-[#152036] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required={newCondition !== 'Any News'}
                />
              </div>

              <div className="flex gap-3.5 pt-2 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setIsViewOnly(false);
                    setEditingAlert(null);
                  }}
                  className="flex-1 text-[10px] font-bold py-2 rounded-xl bg-[#080c14] border border-[#152036] hover:border-slate-700 text-slate-400 transition-colors cursor-pointer"
                >
                  {isViewOnly ? 'Close' : 'Cancel'}
                </button>
                {!isViewOnly && (
                  <button
                    type="submit"
                    className="flex-1 text-[10px] font-bold py-2 rounded-xl bg-violet-650 hover:bg-violet-600 text-white transition-colors cursor-pointer"
                  >
                    {editingAlert ? 'Save Changes' : 'Create Alert'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
