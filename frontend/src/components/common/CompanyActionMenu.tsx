import React, { useState, useEffect, useRef } from 'react';
import { Heart, Check, Star, Bell, ChevronDown, Plus, Info, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { useInvestmentState, Holding } from '../../context/InvestmentStateContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import PurchaseDialog from './PurchaseDialog';
import AlertManagerDialog from './AlertManagerDialog';

interface CompanyActionMenuProps {
  symbol: string;
  className?: string;
  align?: 'left' | 'right';
}

export default function CompanyActionMenu({ symbol, className = '', align = 'right' }: CompanyActionMenuProps) {
  const { 
    getCompanyRecord, 
    getCompanyAlerts,
    markPurchased, 
    updateHolding,
    removePurchased, 
    addToWatchlist, 
    removeFromWatchlist,
    setCompanyNotes
  } = useInvestmentState();

  const { requireAuth } = useRequireAuth();

  const record = getCompanyRecord(symbol);
  const alerts = getCompanyAlerts(symbol);

  const [isOpen, setIsOpen] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      if (record.watchlisted) {
        removeFromWatchlist(symbol);
      } else {
        addToWatchlist(symbol);
      }
    }, 'watchlist');
  };

  const handleOpenAlerts = (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      setShowAlertDialog(true);
      setIsOpen(false);
    }, 'alerts');
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`} ref={menuRef}>
      {/* 1. Star Watchlist Toggle Button next to main button */}
      <button
        onClick={handleToggleWatchlist}
        className={`rounded-xl border p-2 flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer ${
          record.watchlisted
            ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/20 hover:border-[#F59E0B]/50'
            : 'bg-[#080c14] border-[#152036] text-slate-500 hover:text-slate-350 hover:border-slate-700'
        }`}
        title={record.watchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
      >
        <Star className={`w-3.5 h-3.5 ${record.watchlisted ? 'fill-[#F59E0B]' : ''}`} />
      </button>

      {/* 2. Main Position Status Dropdown Button */}
      <div className="relative">
        <button
          onClick={() => {
            requireAuth(() => {
              setIsOpen(!isOpen);
            }, 'purchase');
          }}
          className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-md cursor-pointer ${
            record.positionStatus === 'purchased'
              ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/20 hover:border-[#22C55E]/50'
              : 'bg-[#080c14] border-[#152036] text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          {record.positionStatus === 'purchased' ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Heart className="w-3.5 h-3.5 text-slate-550" />
          )}
          <span>
            {record.positionStatus === 'purchased'
              ? 'Purchased'
              : 'Manage Position'}
          </span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div 
            className={`absolute mt-1.5 w-48 rounded-xl bg-[#0F172A] border border-[#1E293B] p-1 shadow-2xl z-40 select-none ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {record.positionStatus !== 'purchased' && (
              <>
                <button
                  onClick={() => { setShowPurchaseDialog(true); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[9.5px] font-bold text-slate-350 hover:text-slate-100 hover:bg-[#0B1220] rounded-lg flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark as Purchased</span>
                </button>
              </>
            )}

            {record.positionStatus === 'purchased' && (
              <>
                <button
                  onClick={() => { setShowPurchaseDialog(true); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[9.5px] font-bold text-slate-350 hover:text-slate-100 hover:bg-[#0B1220] rounded-lg flex items-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5 text-sky-400" />
                  <span>Edit Purchase Details</span>
                </button>
                <button
                  onClick={() => { setShowExitConfirm(true); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[9.5px] font-bold text-rose-455 hover:bg-rose-950/10 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove from Portfolio</span>
                </button>
              </>
            )}

            <div className="h-px bg-[#1E293B] my-1" />

            {/* Common watchlist toggles inside menu */}
            <button
              onClick={(e) => { handleToggleWatchlist(e); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-[9.5px] font-bold text-slate-350 hover:text-slate-100 hover:bg-[#0B1220] rounded-lg flex items-center gap-2"
            >
              <Star className={`w-3.5 h-3.5 text-[#F59E0B] ${record.watchlisted ? 'fill-[#F59E0B]' : ''}`} />
              <span>{record.watchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
            </button>

            {/* Alerts */}
            <button
              onClick={handleOpenAlerts}
              className="w-full text-left px-3 py-2 text-[9.5px] font-bold text-slate-350 hover:text-slate-100 hover:bg-[#0B1220] rounded-lg flex items-center gap-2"
            >
              <Bell className="w-3.5 h-3.5 text-blue-400 fill-blue-500/10" />
              <span>{alerts.length > 0 ? 'Manage Alerts' : 'Create Price Alert'}</span>
            </button>

            {/* Note Editor */}
            <button
              onClick={() => {
                setIsOpen(false);
                const exNotes = record.notes || '';
                const note = prompt(`📝 Enter note for ${symbol}:`, exNotes);
                if (note !== null) {
                  setCompanyNotes(symbol, note.trim());
                }
              }}
              className="w-full text-left px-3 py-2 text-[9.5px] font-bold text-slate-350 hover:text-slate-100 hover:bg-[#0B1220] rounded-lg flex items-center gap-2"
            >
              <Edit className="w-3.5 h-3.5 text-amber-500" />
              <span>{record.notes ? 'Edit Notes' : 'Add Note'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Alerts Bell indicator toggle next to position button */}
      <button
        onClick={handleOpenAlerts}
        className={`rounded-xl border p-2 flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer relative ${
          alerts.length > 0
            ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/20 hover:border-[#3B82F6]/50'
            : 'bg-[#080c14] border-[#152036] text-slate-500 hover:text-slate-350 hover:border-slate-700'
        }`}
        title={alerts.length > 0 ? `${alerts.length} active alerts` : 'Configure Alerts'}
      >
        <Bell className="w-3.5 h-3.5" />
        {alerts.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#3B82F6] text-white text-[7.5px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-[#0d121f]">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Purchase dialog */}
      <PurchaseDialog
        symbol={symbol}
        isOpen={showPurchaseDialog}
        onClose={() => setShowPurchaseDialog(false)}
        onSave={(holding) => {
          markPurchased(symbol, holding);
          setShowPurchaseDialog(false);
        }}
        initialHolding={record.holding}
      />

      {/* Alerts Manager */}
      <AlertManagerDialog
        symbol={symbol}
        isOpen={showAlertDialog}
        onClose={() => setShowAlertDialog(false)}
      />

      {/* exit confirm modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div 
            className="w-full max-w-sm bg-[#0d121f] border border-[#1E293B] rounded-2xl shadow-2xl p-5 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-2 text-rose-500">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Remove from Portfolio?</h3>
            </div>
            
            <p className="text-[10.5px] text-slate-400 leading-relaxed text-left">
              You are about to remove <b>{symbol}</b> from your simulated holdings portfolio. Are you sure you want to proceed?
            </p>

            <div className="flex flex-col gap-2 pt-1 select-none">
              <button
                onClick={() => {
                  removePurchased(symbol, 'none');
                  setShowExitConfirm(false);
                }}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[9.5px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Confirm Removal
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
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
