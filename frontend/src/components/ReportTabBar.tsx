import React from 'react';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Lock } from 'lucide-react';

interface ReportTabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ReportTabBar({ tabs, activeTab, onTabChange }: ReportTabBarProps) {
  const { isAuthenticated } = useRequireAuth();

  return (
    <div className="flex border-b border-[#1E293B] gap-1 overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-none select-none">
      {tabs.map((tab) => {
        const isProtected = ['Overview', 'Performance Reports', 'Portfolio Reports', 'Custom Reports'].includes(tab);
        const showLock = isProtected && !isAuthenticated;

        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            title={showLock ? "Sign in to access this report feature" : undefined}
            className={`px-3.5 py-2.5 text-[9.5px] font-black uppercase tracking-wider transition-all relative ${
              activeTab === tab
                ? 'text-violet-400 font-extrabold'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>{tab}</span>
              {showLock && <Lock className="w-2.5 h-2.5 text-slate-550" />}
            </span>
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-550 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
