import React, { useState, useEffect } from 'react';
import { Bell, X, Trash2, Plus } from 'lucide-react';
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div 
        className="w-full max-w-lg bg-[#0d121f] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#080c14] flex-shrink-0">
          <div className="flex items-center gap-2 text-blue-400">
            <Bell className="w-4 h-4" />
            <h3 id="alert-dialog-title" className="text-xs font-black uppercase tracking-wider text-slate-200">
              Manage Price & Event Alerts · {symbol}
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

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 chat-scrollbar">
          {/* Create Alert Form */}
          <form onSubmit={handleAddAlert} className="bg-slate-950/40 border border-[#1E293B] p-4 rounded-xl space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <Plus className="w-3.5 h-3.5 text-blue-400" /> Create Custom Alert
            </h4>

            {error && (
              <div className="text-[9.5px] font-bold text-rose-400 bg-rose-950/10 border border-rose-900/30 p-2 rounded-lg text-center">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Type Selection */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide">Trigger Event</label>
                <select
                  value={alertType}
                  onChange={(e) => {
                    setAlertType(e.target.value as any);
                    setTargetValue('');
                    setError('');
                  }}
                  className="w-full bg-[#080c14] border border-[#1E293B] focus:border-violet-500 rounded-xl px-2.5 py-1.8 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  {ALERT_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Target Value Input */}
              {activeTypeMeta?.hasValue && (
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide">
                    Target Threshold {activeTypeMeta.valSuffix ? `(${activeTypeMeta.valSuffix})` : ''}
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
                      className={`w-full bg-[#080c14] border border-[#1E293B] focus:border-violet-500 rounded-xl py-1.8 text-xs text-slate-100 outline-none transition-colors ${
                        activeTypeMeta.valPrefix ? 'pl-6' : 'pl-3'
                      } pr-3`}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-[9.5px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-950/20"
              >
                Create Alert
              </button>
            </div>
          </form>

          {/* Active Alerts List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Configured Alerts ({companyAlerts.length})
            </h4>

            {companyAlerts.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-[10.5px]">
                No alerts configured for {symbol}. Add one above.
              </div>
            ) : (
              <div className="space-y-2">
                {companyAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-slate-950/30 border border-slate-850 rounded-xl group hover:border-[#1E293B] transition-colors"
                  >
                    <div className="leading-tight flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10.5px] font-bold text-slate-200 block">
                          {getAlertDescription(alert)}
                        </span>
                        <span className="text-[8px] text-slate-500 block mt-0.5 font-bold uppercase">
                          Created {new Date(alert.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => updateAlert(alert.id, { enabled: !alert.enabled })}
                        className={`w-7.5 h-4.5 rounded-full p-0.5 transition-colors duration-200 flex-shrink-0 cursor-pointer ${
                          alert.enabled ? 'bg-blue-600' : 'bg-slate-800'
                        }`}
                        title={alert.enabled ? 'Disable alert' : 'Enable alert'}
                        aria-label="Toggle alert active state"
                      >
                        <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 transform ${
                          alert.enabled ? 'translate-x-3' : 'translate-x-0'
                        }`} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-1 rounded text-slate-550 hover:text-rose-400 hover:bg-rose-950/10 transition-all cursor-pointer flex items-center justify-center"
                        title="Delete alert"
                        aria-label="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#080c14] flex justify-end flex-shrink-0 select-none">
          <button 
            onClick={onClose}
            className="bg-transparent hover:bg-slate-900 border border-[#1E293B] text-slate-300 text-[9.5px] font-black uppercase tracking-wider px-5 py-2 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
