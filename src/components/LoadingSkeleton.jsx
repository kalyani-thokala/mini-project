import React from 'react';

export default function LoadingSkeleton({ message = "Consulting AI Engine..." }) {
  return (
    <div className="w-full space-y-6">
      {/* Dynamic spinner / status container */}
      <div className="flex flex-col items-center justify-center py-8 text-center bg-white dark:bg-darkCard rounded-3xl border border-slate-100 dark:border-darkBorder shadow-premium p-6 max-w-xl mx-auto">
        <div className="relative w-14 h-14">
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-slate-200 dark:border-slate-800" />
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-slate-800 dark:text-slate-200">Generating Placement Questions</h3>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">{message}</p>
      </div>

      {/* Flashing placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[1, 2, 3, 4].map((idx) => (
          <div 
            key={idx} 
            className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4 animate-pulse"
          >
            {/* Header Badge Row */}
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>

            {/* Question Line */}
            <div className="space-y-2 pt-2">
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>

            {/* Middle Divider */}
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 w-full my-4" />

            {/* Content line */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between pt-4">
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
