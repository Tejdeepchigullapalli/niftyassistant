import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CompanyMeta, QuoteData, PortfolioHolding, RecommendationData } from '../types/stock';
import { getCompanyMeta } from '../utils/api';

interface AllocationChartProps {
  type: 'asset' | 'sector' | 'marketcap' | 'recommendation';
  quotes: QuoteData[];
  portfolio: PortfolioHolding[];
  recs?: Record<string, RecommendationData>;
}

export default function AllocationChart({
  type,
  quotes = [],
  portfolio = [],
  recs = {}
}: AllocationChartProps) {

  // Calculate current value of holdings
  const holdingsWithValues = useMemo(() => {
    return portfolio.map(holding => {
      const matchingQuote = quotes.find(q => q.symbol.toUpperCase() === holding.symbol.toUpperCase());
      const currentPrice = matchingQuote?.current_price ?? holding.averageBuyPrice;
      const currentValue = holding.quantity * currentPrice;
      const meta = getCompanyMeta(holding.symbol);
      const rec = recs[holding.symbol]?.recommendation || 'Hold';

      // Market cap categorization
      let capCategory = 'Large Cap';
      const mcapValue = matchingQuote?.market_cap ?? (holding.averageBuyPrice * 10000000);
      if (mcapValue < 20000000000) capCategory = 'Small Cap';
      else if (mcapValue < 100000000000) capCategory = 'Mid Cap';

      return {
        ...holding,
        currentValue,
        sector: meta.sector,
        recommendation: rec,
        marketCapCat: capCategory
      };
    });
  }, [portfolio, quotes, recs]);

  // Aggregate by selected type
  const distributionData = useMemo(() => {
    const totalPortfolioValue = holdingsWithValues.reduce((sum, h) => sum + h.currentValue, 0) || 1;

    if (type === 'asset') {
      // Simulate diversified asset splits for high-end look
      return [
        { name: 'Equity (Live Portfolio)', value: parseFloat((85.0).toFixed(1)), color: '#8B5CF6' },
        { name: 'Debt & Bonds', value: parseFloat((10.0).toFixed(1)), color: '#3B82F6' },
        { name: 'Gold / Commodities', value: parseFloat((3.0).toFixed(1)), color: '#EAB308' },
        { name: 'Liquid Cash', value: parseFloat((2.0).toFixed(1)), color: '#10B981' }
      ];
    }

    if (type === 'sector') {
      const sectorMap: Record<string, number> = {};
      holdingsWithValues.forEach(h => {
        sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue;
      });

      const colors = ['#8B5CF6', '#06B6D4', '#F97316', '#EF4444', '#10B981', '#EAB308', '#EC4899', '#64748B'];
      return Object.entries(sectorMap).map(([name, val], idx) => ({
        name,
        value: parseFloat(((val / totalPortfolioValue) * 100).toFixed(1)),
        color: colors[idx % colors.length]
      })).sort((a, b) => b.value - a.value);
    }

    if (type === 'marketcap') {
      const capMap: Record<string, number> = { 'Large Cap': 0, 'Mid Cap': 0, 'Small Cap': 0 };
      holdingsWithValues.forEach(h => {
        capMap[h.marketCapCat] = (capMap[h.marketCapCat] || 0) + h.currentValue;
      });

      const colors: Record<string, string> = { 'Large Cap': '#8B5CF6', 'Mid Cap': '#3B82F6', 'Small Cap': '#06B6D4' };
      return Object.entries(capMap)
        .filter(([_, val]) => val > 0)
        .map(([name, val]) => ({
          name,
          value: parseFloat(((val / totalPortfolioValue) * 100).toFixed(1)),
          color: colors[name] || '#64748b'
        }));
    }

    if (type === 'recommendation') {
      const recMap: Record<string, number> = { 'Strong Buy': 0, 'Buy': 0, 'Hold': 0, 'Reduce': 0, 'Sell': 0 };
      holdingsWithValues.forEach(h => {
        const rating = h.recommendation;
        recMap[rating] = (recMap[rating] || 0) + h.currentValue;
      });

      const colors: Record<string, string> = {
        'Strong Buy': '#22C55E',
        'Buy': '#10B981',
        'Hold': '#F59E0B',
        'Reduce': '#EF4444',
        'Sell': '#B91C1C'
      };
      
      return Object.entries(recMap)
        .filter(([_, val]) => val > 0)
        .map(([name, val]) => ({
          name,
          value: parseFloat(((val / totalPortfolioValue) * 100).toFixed(1)),
          color: colors[name] || '#64748b'
        }));
    }

    return [];
  }, [holdingsWithValues, type]);

  const totalValueSum = holdingsWithValues.reduce((sum, h) => sum + h.currentValue, 0);

  return (
    <div className="flex items-center justify-between gap-2 h-full select-none">
      
      {/* 1. Pie / Donut visual */}
      <div className="w-[90px] h-[90px] flex-shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distributionData}
              cx="50%"
              cy="50%"
              innerRadius={26}
              outerRadius={38}
              paddingAngle={2}
              dataKey="value"
            >
              {distributionData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Centered value details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className="text-[5.5px] font-black text-slate-500 uppercase leading-none">Total</span>
          <span className="text-[8px] font-black text-slate-200 mt-0.5 leading-none">
            ₹{(totalValueSum / 100000).toFixed(2)}L
          </span>
        </div>
      </div>

      {/* 2. Scrollable Legend List */}
      <div className="flex-grow pl-2 max-h-[110px] overflow-y-auto chat-scrollbar space-y-1">
        {distributionData.map((item) => (
          <div key={item.name} className="flex justify-between items-center text-[9px] font-bold">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 min-w-0 pr-1.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate max-w-[85px]">{item.name}</span>
            </span>
            <span className="text-slate-200 flex-shrink-0 font-black">{item.value}%</span>
          </div>
        ))}
      </div>

    </div>
  );
}
