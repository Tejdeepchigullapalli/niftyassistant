import React, { useState, useEffect } from 'react';
import { Bell, X, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvestmentState, UserAlert } from '../../context/InvestmentStateContext';

interface AlertManagerDialogProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AlertTypeMeta {
  id: UserAlert['type'];
  label: string;
  hasValue: boolean;
  valPrefix?: string;
  valSuffix?: string;
}

const ALERT_TYPES: AlertTypeMeta[] = [
  { id: 'price_above', label: 'Price Above Target', hasValue: true, valPrefix: '₹' },
  { id: 'price_below', label: 'Price Below Target', hasValue: true, valPrefix: '₹' },
  { id: 'daily_change', label: 'Daily Move %', hasValue: true, valSuffix: '%' },
  { id: 'volume_spike', label: 'Unusual Volume Spike', hasValue: false },
  { id: 'news', label: 'Company News Feed', hasValue: false },
  { id: 'earnings', label: 'Earnings Event', hasValue: false },
  { id: 'dividend', label: 'Dividend Event', hasValue: false },
  { id: 'recommendation_change', label: 'AI Score Change', hasValue: false }
];

export default function AlertManagerDialog({
  symbol,
  isOpen,
  onClose
}: AlertManagerDialogProps) {
  const { getCompanyAlerts, createAlert, updateAlert, deleteAlert } = useInvestmentState();

  const [alertType, setAlertType] = useState<UserAlert['type']>('price_above');
  const [targetValue, setTargetValue] = useState('');
  const [error, setError] = useState('');

  const companyAlerts = getCompanyAlerts(symbol);
  const activeTypeMeta = ALERT_TYPES.find(t => t.id === alertType);

  useEffect(() => {
    setAlertType('price_above');
    setTargetValue('');
    setError('');
  }, [symbol, isOpen]);

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

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hasVal = activeTypeMeta?.hasValue;
    let targetNum: number | undefined = undefined;

    if (hasVal) {
      targetNum = parseFloat(targetValue);
      if (isNaN(targetNum) || targetNum <= 0) {
        setError('Please enter a valid positive target number');
        return;
      }
    }

    createAlert({
      id: String(Date.now()),
      symbol: symbol.toUpperCase(),
      type: alertType,
      targetValue: targetNum,
      enabled: true
    });

    setTargetValue('');
  };

  const getAlertDescription = (alert: UserAlert) => {
    const meta = ALERT_TYPES.find(t => t.id === alert.type);
    if (!meta) return alert.type;

    if (meta.hasValue && alert.targetValue !== undefined) {
      if (alert.type === 'daily_change') {
        return `Trigger when daily change exceeds ${alert.targetValue}%`;
      }
      return `Trigger when price goes ${alert.type === 'price_above' ? 'above' : 'below'} ₹${alert.targetValue.toLocaleString('en-IN')}`;
    }

    return meta.label;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/78 backdrop-blur-[8px]"
          />

          {/* Modal Container */}
          <motion.div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.18)] overflow-hidden flex flex-col max-h-[530px] z-10 text-slate-100"
          >
            {/* Top blue light beam glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent shadow-[0_0_20px_#3B82F6]" />

            {/* Header */}
            <div className="px-5 py-4 border-b border-[#152036] flex items-center justify-between bg-[#080c14]/50 select-none">
              <div className="flex items-center gap-2 text-[#3B82F6]">
                <Bell className="w-4 h-4 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <h3 id="alert-dialog-title" className="text-xs font-black uppercase tracking-wider text-slate-205">
                  Alert Manager · {symbol}
                </h3>
              </div>
              <motion.button 
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                className="text-slate-500 hover:text-slate-200 transition-colors p-1 hover:bg-slate-900 rounded-lg cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Scrollable Workspace */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
              {/* Create Alert Form */}
              <form onSubmit={handleAddAlert} className="bg-slate-950/40 border border-[#152036] p-4 rounded-xl space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none select-none">
                  <Plus className="w-3.5 h-3.5 text-[#3B82F6]" /> Create Custom Alert
                </h4>

                {error && (
                  <div className="text-[9.5px] font-bold text-rose-450 bg-rose-950/15 border border-rose-900/30 p-2.5 rounded-lg text-center select-none">
                    ⚠️ {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Type Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide select-none">Trigger Event</label>
                    <select
                      value={alertType}
                      onChange={(e) => {
                        setAlertType(e.target.value as any);
                        setTargetValue('');
                        setError('');
                      }}
                      className="w-full bg-[#111C31] border border-[#1E293B] focus:border-[#3B82F6] rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none cursor-pointer transition-colors"
                    >
                      {ALERT_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Value Input */}
                  {activeTypeMeta?.hasValue && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide select-none">
                        Threshold {activeTypeMeta.valSuffix ? `(${activeTypeMeta.valSuffix})` : ''}
                      </label>
                      <div className="relative">
                        {activeTypeMeta.valPrefix && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-extrabold select-none">
                            {activeTypeMeta.valPrefix}
                          </span>
                        )}
                        <input
                          type="number"
                          step="any"
                          placeholder={alertType === 'daily_change' ? 'e.g. 3.5' : 'e.g. 3000'}
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          className={`w-full bg-[#111C31] border border-[#1E293B] focus:border-[#3B82F6] rounded-xl py-2 text-xs text-slate-100 outline-none transition-colors ${
                            activeTypeMeta.valPrefix ? 'pl-6' : 'pl-3'
                          } pr-3`}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#60a5fa] hover:to-[#3b82f6] text-white text-[9.5px] font-black uppercase tracking-wider px-4.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-950/40 select-none"
                  >
                    Create Alert
                  </motion.button>
                </div>
              </form>

              {/* Active Alerts List */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  Configured Alerts ({companyAlerts.length})
                </h4>

                {companyAlerts.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-800/80 rounded-xl text-center text-slate-500 text-[10.5px]">
                    No alerts configured for {symbol}. Add one above.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {companyAlerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className="flex items-center justify-between p-3 bg-slate-950/20 border border-[#152036] rounded-xl group hover:border-[#1E293B] transition-colors"
                      >
                        <div className="leading-tight flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] mt-0.5 flex items-center justify-center flex-shrink-0">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10.5px] font-bold text-slate-200 block">
                              {getAlertDescription(alert)}
                            </span>
                            <span className="text-[7.5px] text-slate-500 block mt-0.5 font-bold uppercase select-none">
                              Created {new Date(alert.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Toggle Switch */}
                          <button
                            onClick={() => updateAlert(alert.id, { enabled: !alert.enabled })}
                            className={`w-7.5 h-4.5 rounded-full p-0.5 transition-colors duration-200 flex-shrink-0 cursor-pointer ${
                              alert.enabled ? 'bg-[#3B82F6]' : 'bg-slate-800'
                            }`}
                            title={alert.enabled ? 'Disable alert' : 'Enable alert'}
                            aria-label="Toggle alert active state"
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 transform ${
                              alert.enabled ? 'translate-x-3' : 'translate-x-0'
                            }`} />
                          </button>

                          {/* Delete */}
                          <motion.button
                            onClick={() => deleteAlert(alert.id)}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1 rounded text-slate-550 hover:text-rose-455 hover:bg-rose-950/10 transition-all cursor-pointer flex items-center justify-center"
                            title="Delete alert"
                            aria-label="Delete alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#152036] bg-[#080c14]/40 flex justify-end flex-shrink-0 select-none">
              <motion.button 
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-transparent hover:bg-slate-900 border border-[#1E293B] text-slate-300 text-[9.5px] font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer select-none"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
