import React from 'react';
import { Bookmark, Briefcase, BellRing, PieChart } from 'lucide-react';

export default function AuthBenefitsList() {
  const benefits = [
    {
      icon: Bookmark,
      title: 'Add to Watchlist',
      description: 'Save and organize your favourite stocks.',
      iconColor: 'text-purple-400 bg-purple-400/10'
    },
    {
      icon: Briefcase,
      title: 'Mark as Purchased',
      description: 'Track holdings, buy prices, and portfolio returns.',
      iconColor: 'text-green-400 bg-green-400/10'
    },
    {
      icon: BellRing,
      title: 'Create Price Alerts',
      description: 'Receive alerts for price movements, earnings, and news.',
      iconColor: 'text-amber-400 bg-amber-400/10'
    },
    {
      icon: PieChart,
      title: 'Access Portfolio Features',
      description: 'Analyse allocation, risk, performance, and AI insights.',
      iconColor: 'text-blue-400 bg-blue-400/10'
    }
  ];

  return (
    <div className="bg-[#162039] border border-violet-500/20 rounded-2xl p-4 space-y-3.5">
      {benefits.map((benefit, idx) => {
        const Icon = benefit.icon;
        return (
          <div key={idx} className="flex items-center gap-3.5 select-none text-left">
            <div className={`p-2 rounded-xl flex-shrink-0 flex items-center justify-center ${benefit.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] font-black text-slate-100 leading-none">{benefit.title}</h4>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal font-medium">{benefit.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
