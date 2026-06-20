import React from 'react';
import { Star } from 'lucide-react';
import { useInvestmentState } from '../../context/InvestmentStateContext';

interface WatchlistToggleProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WatchlistToggle({ symbol, size = 'md', className = '' }: WatchlistToggleProps) {
  const { getCompanyRecord, addToWatchlist, removeFromWatchlist } = useInvestmentState();
  const record = getCompanyRecord(symbol);
  const isWatchlisted = record.watchlisted;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isWatchlisted) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const paddingClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  return (
    <button
      onClick={handleToggle}
      className={`rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm ${
        isWatchlisted
          ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/20 hover:border-[#F59E0B]/50'
          : 'bg-[#080c14] border-[#152036] text-slate-500 hover:text-slate-350 hover:border-slate-700'
      } ${paddingClasses[size]} ${className}`}
      title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
      aria-label={isWatchlisted ? `Remove ${symbol} from Watchlist` : `Add ${symbol} to Watchlist`}
    >
      <Star className={`${sizeClasses[size]} ${isWatchlisted ? 'fill-[#F59E0B]' : ''}`} />
    </button>
  );
}
