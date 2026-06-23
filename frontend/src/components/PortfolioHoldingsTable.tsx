import React, { useState } from 'react';
import { Holding, useInvestmentState } from '../context/InvestmentStateContext';
import { CompanyLogo } from './common/CompanyLogo';
import { getCompanyMeta, getRecBadgeClass } from '../utils/api';
import { Edit2, Trash2 } from 'lucide-react';
import PurchaseDialog from './common/PurchaseDialog';

interface PortfolioHoldingsTableProps {
  holdings: Holding[];
  quotes: Record<string, any>;
  recs: Record<string, any>;
}

export default function PortfolioHoldingsTable({
  holdings,
  quotes,
  recs
}: PortfolioHoldingsTableProps) {
  const { markPurchased, removePurchased } = useInvestmentState();

  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [exitConfirmSymbol, setExitConfirmSymbol] = useState<string | null>(null);

  // 1. Calculate financial aggregates for allocation percentages
  const totalValue = holdings.reduce((sum, h) => {
    const q = quotes[h.symbol];
    const currentPrice = q?.current_price ?? getCompanyMeta(h.symbol).basePrice;
    return sum + h.quantity * currentPrice;
  }, 0) || 1;

  const getRowData = (h: Holding) => {
    const cleanSym = h.symbol.toUpperCase();
    const meta = getCompanyMeta(cleanSym);
    const quote = quotes[cleanSym] || {
      current_price: meta.basePrice,
      change: 0,
      change_pct: 0
    };
    const rec = recs[cleanSym] || { recommendation: 'Hold' };

    const investedValue = h.quantity * h.averageBuyPrice;
    const currentValue = h.quantity * quote.current_price;
    const unrealisedPnL = currentValue - investedValue;
    const returnPct = investedValue > 0 ? (unrealisedPnL / investedValue) * 100 : 0;
    const allocationPct = (currentValue / totalValue) * 100;
    const todayPnL = h.quantity * (quote.change || 0);

    return {
      meta,
      quote,
      rec,
      investedValue,
      currentValue,
      unrealisedPnL,
      returnPct,
      allocationPct,
      todayPnL
    };
  };

  const handleSaveEdit = (updatedHolding: Holding) => {
    markPurchased(updatedHolding.symbol, updatedHolding);
    setEditingSymbol(null);
  };

  const activeHoldingForEdit = holdings.find(h => h.symbol === editingSymbol);

  return (
    <div className="card p-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-xl select-none">
      <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider block mb-3.5">Simulated Portfolio Positions</span>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-[9.5px] font-bold border-collapse min-w-[900px]">
          <thead>
            <tr className="text-[8px] text-[#64748B] border-b border-[#1E293B] uppercase tracking-wider">
              <th className="pb-3 pl-2">Company</th>
              <th className="pb-3 text-right">Qty</th>
              <th className="pb-3 text-right">Avg Buy Price</th>
              <th className="pb-3 text-right">LTP Price</th>
              <th className="pb-3 text-right">Invested Value</th>
              <th className="pb-3 text-right">Current Value</th>
              <th className="pb-3 text-right">Today's P&L</th>
              <th className="pb-3 text-right">Unrealised P&L</th>
              <th className="pb-3 text-center">Return %</th>
              <th className="pb-3 text-center">Weight</th>
              <th className="pb-3 text-center">AI Rating</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/40">
            {holdings.map((h) => {
              const {
                meta,
                quote,
                rec,
                investedValue,
                currentValue,
                unrealisedPnL,
                returnPct,
                allocationPct,
                todayPnL
              } = getRowData(h);

              return (
                <tr 
                  key={h.symbol} 
                  className="hover:bg-white/[0.01] transition-colors h-11 leading-none"
                >
                  {/* Company */}
                  <td className="py-2.5 pl-2 flex items-center gap-2">
                    <CompanyLogo symbol={h.symbol} size="sm" />
                    <div className="text-left">
                      <span className="text-[#F8FAFC] font-extrabold block">{h.symbol}</span>
                      <span className="text-[7.5px] text-[#64748B] block mt-0.5 max-w-[100px] truncate" title={meta.name}>
                        {meta.name.replace(' Ltd', '').replace(' Limited', '')}
                      </span>
                    </div>
                  </td>
                  
                  {/* Quantity */}
                  <td className="py-2.5 text-right text-slate-100">{h.quantity.toLocaleString('en-IN', { maximumFractionDigits: 4 })}</td>
                  
                  {/* Average Buy Price */}
                  <td className="py-2.5 text-right text-slate-300">₹{h.averageBuyPrice.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                  
                  {/* Current Price */}
                  <td className="py-2.5 text-right text-slate-100 font-extrabold">₹{quote.current_price.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                  
                  {/* Invested Value */}
                  <td className="py-2.5 text-right text-slate-300">₹{investedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  
                  {/* Current Value */}
                  <td className="py-2.5 text-right text-slate-100">₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  
                  {/* Today's P&L */}
                  <td className={`py-2.5 text-right font-black ${todayPnL >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {todayPnL >= 0 ? '+' : ''}₹{todayPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>

                  {/* Unrealised P&L */}
                  <td className={`py-2.5 text-right font-black ${unrealisedPnL >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {unrealisedPnL >= 0 ? '+' : ''}₹{unrealisedPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>

                  {/* Return % */}
                  <td className="py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                      returnPct >= 0 ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                    }`}>
                      {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
                    </span>
                  </td>

                  {/* Allocation % */}
                  <td className="py-2.5 text-center text-slate-300 font-extrabold">{allocationPct.toFixed(1)}%</td>

                  {/* AI Recommendation */}
                  <td className="py-2.5 text-center">
                    <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${getRecBadgeClass(rec.recommendation)}`}>
                      {rec.recommendation}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 text-right pr-2">
                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingSymbol(h.symbol)}
                        className="p-1 text-[#94A3B8] hover:text-slate-100 hover:bg-slate-900 rounded-lg cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExitConfirmSymbol(h.symbol)}
                        className="p-1 text-[#94A3B8] hover:text-rose-455 hover:bg-rose-955/10 rounded-lg cursor-pointer"
                        title="Remove Stock"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Editing dialog */}
      {editingSymbol && activeHoldingForEdit && (
        <PurchaseDialog
          symbol={editingSymbol}
          isOpen={true}
          onClose={() => setEditingSymbol(null)}
          onSave={handleSaveEdit}
          initialHolding={activeHoldingForEdit}
        />
      )}

      {/* exit confirm modal */}
      {exitConfirmSymbol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div 
            className="w-full max-w-sm bg-[#0d121f] border border-[#1E293B] rounded-2xl shadow-2xl p-5 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-2 text-rose-500">
              <span className="text-xl">⚠️</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Remove from Portfolio?</h3>
            </div>
            
            <p className="text-[10.5px] text-slate-400 leading-relaxed text-left">
              You are about to remove <b>{exitConfirmSymbol}</b> from your simulated holdings portfolio. Are you sure you want to proceed?
            </p>

            <div className="flex flex-col gap-2 pt-1 select-none">
              <button
                onClick={() => {
                  removePurchased(exitConfirmSymbol, 'none');
                  setExitConfirmSymbol(null);
                }}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[9.5px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Confirm Removal
              </button>
              <button
                onClick={() => setExitConfirmSymbol(null)}
                className="w-full bg-transparent hover:bg-slate-900 border border-[#1E293B] text-slate-450 hover:text-slate-350 text-[9.5px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
