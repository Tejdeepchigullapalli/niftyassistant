import React from 'react';
import { Heart, Star, Bell, Briefcase } from 'lucide-react';
import { useInvestmentState } from '../../context/InvestmentStateContext';

interface CompanyStatusBadgeProps {
  symbol: string;
  className?: string;
  showLabels?: boolean;
}

export default function CompanyStatusBadge({ symbol, className = '', showLabels = false }: CompanyStatusBadgeProps) {
  const { getCompanyRecord, getCompanyAlerts } = useInvestmentState();
  const record = getCompanyRecord(symbol);
  const alerts = getCompanyAlerts(symbol);

  const isPurchased = record.positionStatus === 'purchased';
  const isInterested = record.positionStatus === 'interested';
  const isWatchlisted = record.watchlisted;
  const hasAlerts = alerts.length > 0;

  if (!isPurchased && !isInterested && !isWatchlisted && !hasAlerts) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      {isPurchased && (
        <div 
          className="flex items-center gap-1 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider"
          title="Portfolio holding owned"
        >
          <Briefcase className="w-2.5 h-2.5" />
          {showLabels && <span>Purchased</span>}
        </div>
      )}
      
      {isInterested && (
        <div 
          className="flex items-center gap-1 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider"
          title="Researching / Interested"
        >
          <Heart className="w-2.5 h-2.5 fill-current" />
          {showLabels && <span>Interested</span>}
        </div>
      )}

      {isWatchlisted && (
        <div 
          className="flex items-center gap-1 bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider"
          title="Added to watchlist"
        >
          <Star className="w-2.5 h-2.5 fill-current" />
          {showLabels && <span>Watchlist</span>}
        </div>
      )}

      {hasAlerts && (
        <div 
          className="flex items-center gap-1 bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider"
          title={`${alerts.length} active alerts configured`}
        >
          <Bell className="w-2.5 h-2.5 fill-current" />
          {showLabels && <span>Alerts ({alerts.length})</span>}
        </div>
      )}
    </div>
  );
}
