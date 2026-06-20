import React from 'react';
import { FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AchievementBadge({ badge, isUnlocked }) {
  return (
    <motion.div
      whileHover={{ scale: isUnlocked ? 1.03 : 1 }}
      className={`relative p-5 rounded-3xl border text-center flex flex-col items-center justify-between transition-all duration-300 h-full ${
        isUnlocked 
          ? 'bg-white dark:bg-darkCard border-primary-500/20 shadow-premium' 
          : 'bg-slate-50/50 dark:bg-darkCard/30 border-slate-200/50 dark:border-darkBorder/40 select-none opacity-60'
      }`}
    >
      {/* Grayscale filter for locked achievements */}
      <div className={`flex flex-col items-center space-y-3 ${!isUnlocked && 'filter grayscale'}`}>
        
        {/* Badge Icon bubble */}
        <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${badge.color || 'from-slate-400 to-slate-500'} flex items-center justify-center text-3xl shadow-lg relative`}>
          {badge.icon}
          
          {/* Unlocked light effect */}
          {isUnlocked && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-darkCard"></span>
            </span>
          )}
        </div>

        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{badge.title}</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[150px] mx-auto leading-relaxed">
            {badge.description}
          </p>
        </div>
      </div>

      {/* Lock Indicator or status pill */}
      <div className="mt-4 w-full">
        {isUnlocked ? (
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-100 dark:border-emerald-900/30">
            Unlocked
          </span>
        ) : (
          <div className="flex items-center justify-center space-x-1 text-slate-400 dark:text-slate-600 text-[10px] font-extrabold uppercase">
            <FiLock className="w-3.5 h-3.5" />
            <span>Locked</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
