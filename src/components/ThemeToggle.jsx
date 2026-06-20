import React from 'react';
import { useApp } from '../context/AppContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-darkCard dark:hover:bg-slate-800 dark:border dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-colors focus:outline-none"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <FiMoon className="w-5 h-5" />
      ) : (
        <FiSun className="w-5 h-5 text-amber-400" />
      )}
    </motion.button>
  );
}
