import React from 'react';

interface LoadingSkeletonProps {
  layout?: 'overview' | 'financials' | 'technicals' | 'news' | 'peers' | 'forecast' | 'insights';
}

export default function LoadingSkeleton({ layout = 'overview' }: LoadingSkeletonProps) {
  const Shimmer = () => (
    <div className="animate-pulse bg-slate-800/40 rounded-2xl border border-slate-800/80 p-5 h-full w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '1.5s' }} />
      <div className="h-4 w-1/3 bg-slate-800 rounded-md mb-4" />
      <div className="space-y-3">
        <div className="h-3 w-full bg-slate-800 rounded-md" />
        <div className="h-3 w-5/6 bg-slate-800 rounded-md" />
        <div className="h-3 w-4/6 bg-slate-800 rounded-md" />
      </div>
    </div>
  );

  return (
    <div className="w-full text-[#94A3B8]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {layout === 'overview' && (
          <>
            <div className="md:col-span-8 h-[460px]">
              <Shimmer />
            </div>
            <div className="md:col-span-4 space-y-4">
              <div className="h-[220px]"><Shimmer /></div>
              <div className="h-[220px]"><Shimmer /></div>
            </div>
          </>
        )}
        {layout === 'financials' && (
          <>
            <div className="md:col-span-4 h-[350px]"><Shimmer /></div>
            <div className="md:col-span-8 h-[350px]"><Shimmer /></div>
            <div className="md:col-span-12 h-[200px]"><Shimmer /></div>
          </>
        )}
        {layout === 'technicals' && (
          <>
            <div className="md:col-span-7 h-[450px]"><Shimmer /></div>
            <div className="md:col-span-5 space-y-4">
              <div className="h-[210px]"><Shimmer /></div>
              <div className="h-[220px]"><Shimmer /></div>
            </div>
          </>
        )}
        {layout === 'news' && (
          <>
            <div className="md:col-span-4 h-[400px]"><Shimmer /></div>
            <div className="md:col-span-8 h-[400px]"><Shimmer /></div>
          </>
        )}
        {layout === 'peers' && (
          <div className="md:col-span-12 h-[450px]">
            <Shimmer />
          </div>
        )}
        {layout === 'forecast' && (
          <>
            <div className="md:col-span-8 h-[450px]"><Shimmer /></div>
            <div className="md:col-span-4 h-[450px]"><Shimmer /></div>
          </>
        )}
        {layout === 'insights' && (
          <>
            <div className="md:col-span-12 h-[150px]"><Shimmer /></div>
            <div className="md:col-span-6 h-[300px]"><Shimmer /></div>
            <div className="md:col-span-6 h-[300px]"><Shimmer /></div>
          </>
        )}
      </div>
    </div>
  );
}
