import React from 'react';

export default function ResearchSkeleton() {
  return (
    <div className="space-y-4 w-full select-none text-[#F8FAFC] animate-pulse">
      
      {/* Dynamic ribbon bar skeleton */}
      <div className="h-9 w-full bg-[#0F172A] border border-[#1E293B] rounded-xl" />

      {/* Row 1: AI Score & Investment Thesis skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score Card */}
        <div className="h-[360px] bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-3 w-1/3 bg-slate-800 rounded" />
            <div className="h-2 w-1/4 bg-slate-800 rounded" />
          </div>
          <div className="h-14 w-full bg-[#0B1220] rounded-xl border border-[#1E293B]" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-2 w-1/4 bg-slate-800 rounded" />
                  <div className="h-2 w-1/12 bg-slate-800 rounded" />
                </div>
                <div className="h-2 w-full bg-[#0B1220] rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Thesis Card */}
        <div className="h-[360px] bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-3 w-1/3 bg-slate-800 rounded" />
            <div className="h-2 w-1/4 bg-slate-800 rounded" />
          </div>
          <div className="space-y-4 flex-1 mt-6">
            <div className="space-y-2">
              <div className="h-2 w-12 bg-slate-800 rounded" />
              <div className="h-10 w-full bg-[#0B1220] rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-20 bg-slate-800 rounded" />
              <div className="space-y-1">
                <div className="h-2 w-full bg-[#0B1220] rounded" />
                <div className="h-2 w-5/6 bg-[#0B1220] rounded" />
                <div className="h-2 w-4/5 bg-[#0B1220] rounded" />
              </div>
            </div>
          </div>
          <div className="h-8 w-full bg-[#0B1220] rounded-xl border border-[#1E293B]" />
        </div>

        {/* Confidence Card */}
        <div className="h-[360px] bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-3 w-1/3 bg-slate-800 rounded" />
            <div className="h-2 w-1/4 bg-slate-800 rounded" />
          </div>
          <div className="flex-1 flex flex-col justify-center items-center gap-4">
            <div className="h-24 w-24 bg-[#0B1220] rounded-full border border-[#1E293B] flex items-center justify-center">
              <div className="h-16 w-16 bg-slate-800 rounded-full" />
            </div>
            <div className="h-3 w-1/3 bg-slate-800 rounded" />
          </div>
        </div>
      </div>

      {/* Row 2: News & Sentiment + Peer comparison matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* News card */}
        <div className="xl:col-span-7 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-3 w-1/4 bg-slate-800 rounded" />
            <div className="h-2.5 w-1/3 bg-slate-800 rounded" />
          </div>
          <div className="space-y-2.5 my-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 w-full bg-[#0B1220] rounded-xl border border-[#1E293B]/60" />
            ))}
          </div>
          <div className="h-16 w-full bg-[#0B1220] rounded-xl border border-[#1E293B]" />
        </div>

        {/* Peer Matrix card */}
        <div className="xl:col-span-5 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-3 w-1/4 bg-slate-800 rounded" />
            <div className="h-2.5 w-1/3 bg-slate-800 rounded" />
          </div>
          <div className="space-y-2 my-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-full bg-[#0B1220] rounded-lg border border-[#1E293B]/40" />
            ))}
          </div>
          <div className="h-8 w-full bg-[#0B1220] rounded-xl border border-[#1E293B]" />
        </div>
      </div>

      {/* Row 3: Catalysts & Strategic Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[180px] bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 flex flex-col justify-between">
            <div className="h-3 w-1/3 bg-slate-800 rounded" />
            <div className="space-y-2 flex-1 mt-4">
              <div className="h-2.5 w-full bg-[#0B1220] rounded" />
              <div className="h-2.5 w-5/6 bg-[#0B1220] rounded" />
              <div className="h-2.5 w-4/5 bg-[#0B1220] rounded" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
