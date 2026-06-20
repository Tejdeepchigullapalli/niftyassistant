import React from 'react';
import DynamicAlertsWorkspace from './DynamicAlertsWorkspace';

interface AlertsViewProps {
  quotes?: any[];
  onSymbolSelect?: (symbol: string) => void;
}

export default function AlertsView({ quotes = [], onSymbolSelect }: AlertsViewProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
          🔔 Active Alerts Workspace
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Configure real-time price alerts, daily volume spikes, or technical parameter crossings.
        </p>
      </div>

      {/* Main Alerts Workspace */}
      <DynamicAlertsWorkspace quotes={quotes} onSymbolSelect={onSymbolSelect} />
    </div>
  );
}
