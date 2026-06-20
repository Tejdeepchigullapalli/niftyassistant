import React from 'react';

export default function ReportSkeleton() {
  return (
    <div className="space-y-4 w-full select-none text-[#F8FAFC] animate-pulse">
      
      {/* Header skeleton */}
      <div className="h-[75px] bg-[#0F172A] border border-[#1E293B] rounded-2xl" />

      {/* Metrics Row skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-[85px] bg-[#0F172A] border border-[#1E293B] rounded-2xl" />
        ))}
      </div>

      {/* Main charts skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 h-[280px] bg-[#0F172A] border border-[#1E293B] rounded-2xl" />
        <div className="lg:col-span-4 h-[280px] bg-[#0F172A] border border-[#1E293B] rounded-2xl" />
      </div>

    </div>
  );
}
