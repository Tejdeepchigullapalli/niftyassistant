import React from 'react';

interface ReportTabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ReportTabBar({ tabs, activeTab, onTabChange }: ReportTabBarProps) {
  return (
    <div className="flex border-b border-[#1E293B] gap-1 overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-none select-none">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-3.5 py-2.5 text-[9.5px] font-black uppercase tracking-wider transition-all relative ${
            activeTab === tab
              ? 'text-violet-400 font-extrabold'
              : 'text-[#64748B] hover:text-[#94A3B8]'
          }`}
        >
          {tab}
          {activeTab === tab && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-550 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
