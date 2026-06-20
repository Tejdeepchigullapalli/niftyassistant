import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Holding } from '../context/InvestmentStateContext';
import { getCompanyMeta } from '../utils/api';

interface PortfolioAllocationChartsProps {
  holdings: Holding[];
  quotes: Record<string, any>;
}

const ALLOCATION_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1'];

export default function PortfolioAllocationCharts({
  holdings,
  quotes
}: PortfolioAllocationChartsProps) {
  
  // 1. Calculate values and allocate lists
  const chartData = useMemo(() => {
    let totalVal = 0;
    const items = holdings.map(h => {
      const q = quotes[h.symbol];
      const currentPrice = q?.current_price ?? getCompanyMeta(h.symbol).basePrice;
      const value = h.quantity * currentPrice;
      totalVal += value;
      return {
        name: h.symbol,
        value,
        color: getCompanyMeta(h.symbol).color
      };
    });

    // Sector allocation calculations
    const sectorMap: Record<string, number> = {};
    holdings.forEach(h => {
      const q = quotes[h.symbol];
      const currentPrice = q?.current_price ?? getCompanyMeta(h.symbol).basePrice;
      const val = h.quantity * currentPrice;
      const sector = getCompanyMeta(h.symbol).sector;
      sectorMap[sector] = (sectorMap[sector] || 0) + val;
    });

    const sectors = Object.keys(sectorMap).map((sec, idx) => ({
      name: sec,
      value: parseFloat(((sectorMap[sec] / (totalVal || 1)) * 100).toFixed(1)),
      fill: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]
    })).sort((a, b) => b.value - a.value);

    return {
      stocks: items,
      sectors,
      totalVal
    };
  }, [holdings, quotes]);

  if (holdings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch select-none">
      
      {/* Stocks Asset Donut Chart */}
      <div className="lg:col-span-5 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between h-[300px] shadow-xl hover:border-violet-500/10 transition-all">
        <div className="text-left">
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Asset Concentration</span>
          <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Weight distribution of holdings by stock</span>
        </div>
        
        <div className="flex-1 flex items-center justify-center relative mt-2">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.stocks}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="75%"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.stocks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`₹${Math.round(Number(value)).toLocaleString('en-IN')}`, 'Valuation']}
                  contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '10px', fontSize: 9 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute flex flex-col items-center justify-center leading-none">
            <span className="text-[8px] text-slate-500 font-extrabold uppercase">Total Assets</span>
            <span className="text-sm font-black text-white mt-1">₹{Math.round(chartData.totalVal).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Sector Allocation Bar Chart */}
      <div className="lg:col-span-7 card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl flex flex-col justify-between h-[300px] shadow-xl hover:border-violet-500/10 transition-all text-left">
        <div>
          <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block">Sector Allocation %</span>
          <span className="text-[7.5px] text-[#64748B] block mt-0.5 font-bold uppercase">Concentration distribution by industry sectors</span>
        </div>

        <div className="h-44 w-full mt-4 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData.sectors}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis type="number" stroke="#475569" fontSize={7} tickLine={false} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="#475569" fontSize={7} tickLine={false} width={80} />
              <Tooltip 
                formatter={(value: any) => [`${value}%`, 'Weight']}
                contentStyle={{ backgroundColor: '#0d121f', borderColor: '#1e293b', borderRadius: '10px', fontSize: 9 }}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={8}>
                {chartData.sectors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
