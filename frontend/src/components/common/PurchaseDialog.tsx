import React, { useState, useEffect } from 'react';
import { Briefcase, X } from 'lucide-react';
import { Holding } from '../../context/InvestmentStateContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';

interface PurchaseDialogProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (holding: Holding) => void;
  initialHolding?: Holding;
}

export default function PurchaseDialog({
  symbol,
  isOpen,
  onClose,
  onSave,
  initialHolding
}: PurchaseDialogProps) {
  const { requireAuth } = useRequireAuth();
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (initialHolding) {
      setQuantity(String(initialHolding.quantity));
      setPrice(String(initialHolding.averageBuyPrice));
      setDate(initialHolding.purchaseDate);
      setNotes(initialHolding.notes || '');
    } else {
      setQuantity('');
      setPrice('');
      setDate(todayStr);
      setNotes('');
    }
    setError('');
  }, [initialHolding, isOpen, symbol, todayStr]);

  // Support for Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qtyNum = parseFloat(quantity);
    const priceNum = parseFloat(price);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Average Buy Price must be greater than 0');
      return;
    }
    if (!date) {
      setError('Purchase Date is required');
      return;
    }
    if (new Date(date) > new Date()) {
      setError('Purchase Date cannot be in the future');
      return;
    }

    requireAuth(() => {
      onSave({
        symbol: symbol.toUpperCase(),
        quantity: qtyNum,
        averageBuyPrice: priceNum,
        purchaseDate: date,
        notes: notes.trim() || undefined
      });
    }, 'purchase');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-md bg-[#0d121f] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-dialog-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#080c14]">
          <div className="flex items-center gap-2 text-emerald-400">
            <Briefcase className="w-4 h-4" />
            <h3 id="purchase-dialog-title" className="text-xs font-black uppercase tracking-wider text-slate-200">
              {initialHolding ? 'Edit Portfolio Position' : 'Mark as Purchased'} · {symbol}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1 hover:bg-slate-900 rounded-lg cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-[10px] font-bold text-rose-400 bg-rose-950/20 border border-rose-900/35 p-2 rounded-xl text-center">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-350 block">Quantity</label>
              <input 
                type="number" 
                step="any"
                min="0.0001"
                placeholder="e.g. 10" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#060b14] border border-[#1E293B] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-colors"
                required
              />
            </div>

            {/* Average Buy Price */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-350 block">Avg Buy Price (₹)</label>
              <input 
                type="number" 
                step="any"
                min="0.01"
                placeholder="e.g. 2936" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#060b14] border border-[#1E293B] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Purchase Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-350 block">Purchase Date</label>
            <input 
              type="date" 
              max={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#060b14] border border-[#1E293B] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none transition-colors cursor-pointer"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-350 block">Notes (Optional)</label>
            <textarea 
              placeholder="E.g. Purchased on dip, long-term holdings target" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#060b14] border border-[#1E293B] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none h-16 resize-none transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 pt-2 select-none">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-transparent hover:bg-slate-900 border border-[#1E293B] hover:border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-950/20 text-center"
            >
              {initialHolding ? 'Save Details' : 'Confirm Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
