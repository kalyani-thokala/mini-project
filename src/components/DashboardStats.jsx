import React from 'react';
import { FiTrendingUp, FiCheckCircle, FiBookmark, FiDatabase, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function DashboardStats({ stats }) {
  const { totalGenerated, completedCount, practicingCount, bookmarksCount, savedSessionsCount } = stats;

  const totalAttempted = completedCount + practicingCount;
  const progressPercent = totalGenerated > 0 ? Math.round((completedCount / totalGenerated) * 100) : 0;

  const items = [
    {
      title: "Total Generated",
      value: totalGenerated,
      icon: <FiDatabase className="w-5 h-5" />,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/15",
      delay: 0.1
    },
    {
      title: "Completed",
      value: completedCount,
      icon: <FiCheckCircle className="w-5 h-5" />,
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/15",
      delay: 0.2
    },
    {
      title: "In Practice",
      value: practicingCount,
      icon: <FiTrendingUp className="w-5 h-5" />,
      color: "bg-amber-500/10 text-amber-500 border-amber-500/15",
      delay: 0.3
    },
    {
      title: "Bookmarks",
      value: bookmarksCount,
      icon: <FiBookmark className="w-5 h-5" />,
      color: "bg-rose-500/10 text-rose-500 border-rose-500/15",
      delay: 0.4
    },
    {
      title: "Saved Sessions",
      value: savedSessionsCount,
      icon: <FiAward className="w-5 h-5" />,
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/15",
      delay: 0.5
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: item.delay }}
          className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.title}</span>
            <div className={`p-2 rounded-xl border ${item.color}`}>
              {item.icon}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">
              {item.value}
            </h3>
            {item.title === "Completed" && totalGenerated > 0 && (
              <span className="text-[10px] font-semibold text-slate-400 block mt-1.5">
                {progressPercent}% of generated pool
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
