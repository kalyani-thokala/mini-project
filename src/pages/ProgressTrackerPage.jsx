import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FiCheckSquare, FiChevronRight, FiPercent, FiTrendingUp, 
  FiFileText, FiTrash2, FiAward, FiAlertTriangle 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProgressTrackerPage() {
  const { questionStatus, savedSessions, getStats, resetDatabase } = useApp();
  const stats = getStats();

  const totalAttempted = stats.completedCount + stats.practicingCount;
  const progressPercent = stats.totalGenerated > 0 
    ? Math.round((stats.completedCount / stats.totalGenerated) * 100) 
    : 0;

  // Let's compute progress per role dynamically
  let roleProgress = {};
  
  savedSessions.forEach(session => {
    const role = session.role;
    if (!roleProgress[role]) {
      roleProgress[role] = { total: 0, completed: 0, practicing: 0 };
    }
    
    session.questions?.forEach(q => {
      roleProgress[role].total += 1;
      const qStatus = questionStatus[q.id];
      if (qStatus === 'completed') {
        roleProgress[role].completed += 1;
      } else if (qStatus === 'practicing') {
        roleProgress[role].practicing += 1;
      }
    });
  });

  const rolesArray = Object.keys(roleProgress).map(role => ({
    name: role,
    ...roleProgress[role],
    percent: Math.round((roleProgress[role].completed / roleProgress[role].total) * 100)
  }));

  const handleReset = () => {
    if (window.confirm("Are you absolutely sure you want to reset all progress, bookmarks, and saved sessions? This action is irreversible.")) {
      resetDatabase();
    }
  };

  return (
    <div className="space-y-10 pb-16 pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Progress Journal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit overall question completion and role coverage stats.</p>
        </div>
        
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <FiChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 dark:text-slate-200">Progress</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Summary and Reset */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-primary-500/10 text-primary-500 rounded-xl">
                <FiPercent className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Overall Preparation Completion</h3>
            </div>

            {/* Circular representation or large text progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-slate-500 font-semibold">Total Progress</span>
                <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">{progressPercent}%</span>
              </div>
              
              {/* Progress Bar background */}
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-semibold pt-1">
                <span>Completed: {stats.completedCount} qns</span>
                <span>Generated pool: {stats.totalGenerated} qns</span>
              </div>
            </div>

            {/* Preparation state split stats */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
              <div className="p-3 bg-slate-50 dark:bg-darkBg rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wide">Not Started</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300 font-mono mt-1 block">
                  {Math.max(0, stats.totalGenerated - stats.completedCount - stats.practicingCount)}
                </span>
              </div>
              <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <span className="text-[10px] text-amber-600 dark:text-amber-500 block font-bold uppercase tracking-wide">Practicing</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 block">
                  {stats.practicingCount}
                </span>
              </div>
              <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-500 block font-bold uppercase tracking-wide">Completed</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                  {stats.completedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Reset Progress Panel */}
          <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 text-xs text-rose-800 dark:text-rose-400 space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-450 font-bold">
              <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Reset Platform Data</span>
            </div>
            <p className="leading-relaxed">
              Wipe all LocalStorage indices clean. This deletes saved sets, question completion status, bookmarks, and unlocks badges. Useful to reset before a demo.
            </p>
            <button
              onClick={handleReset}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all w-full shadow-md shadow-rose-600/10"
            >
              <FiTrash2 />
              <span>Format Database</span>
            </button>
          </div>
        </div>

        {/* Right Side: Role breakdown list */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <FiAward className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Coverage Breakdown by Job Role</h3>
            </div>

            {rolesArray.length === 0 ? (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                No roles generated yet. Practice questions to view details.
              </div>
            ) : (
              <div className="space-y-5">
                {rolesArray.map((role, idx) => (
                  <div key={idx} className="space-y-2 border-b border-slate-100 dark:border-darkBorder pb-4 last:border-none last:pb-0">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{role.name}</span>
                      <span className="font-bold text-primary-500 font-mono">{role.percent}% Completed</span>
                    </div>

                    {/* Progress Bar background */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${role.percent}%` }}
                        className="h-full bg-primary-500 rounded-full"
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                      <span>Completed: {role.completed} of {role.total} qns</span>
                      <span>Practicing: {role.practicing} qns</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
