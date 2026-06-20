import React, { useState } from 'react';
import { FiBriefcase, FiCpu, FiTrendingUp, FiSliders, FiCompass } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ROLES = [
  "Frontend Developer",
  "React Developer",
  "Java Developer",
  "Python Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Cyber Security Analyst",
  "Software Engineer"
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const TYPES = ["Technical", "HR", "Mixed"];
const COUNTS = [5, 10, 15, 20];

export default function QuestionForm({ onSubmit, isLoading }) {
  const [role, setRole] = useState(ROLES[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]); // default Intermediate
  const [type, setType] = useState(TYPES[0]); // default Technical
  const [count, setCount] = useState(COUNTS[0]); // default 5

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ role, difficulty, type, count });
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="p-6 md:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-500">
          <FiSliders className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Setup Generation Parameters</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize your tailored placement interview session.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Role Dropdown */}
        <div className="space-y-2">
          <label htmlFor="role-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <FiBriefcase className="text-slate-400 dark:text-slate-500" />
            <span>Target Job Role</span>
          </label>
          <div className="relative">
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none cursor-pointer disabled:opacity-60"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Difficulty Level Dropdown */}
        <div className="space-y-2">
          <label htmlFor="difficulty-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <FiTrendingUp className="text-slate-400 dark:text-slate-500" />
            <span>Difficulty Level</span>
          </label>
          <div className="relative">
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none cursor-pointer disabled:opacity-60"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Question Type Selector */}
        <div className="space-y-2">
          <label htmlFor="type-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <FiCpu className="text-slate-400 dark:text-slate-500" />
            <span>Question Category</span>
          </label>
          <div className="relative">
            <select
              id="type-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none cursor-pointer disabled:opacity-60"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Number of Questions Selector */}
        <div className="space-y-2">
          <label htmlFor="count-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <FiCompass className="text-slate-400 dark:text-slate-500" />
            <span>Question Quantity</span>
          </label>
          <div className="relative">
            <select
              id="count-select"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none cursor-pointer disabled:opacity-60"
            >
              {COUNTS.map((c) => (
                <option key={c} value={c}>{c} Questions</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Submit Button */}
      <div className="pt-4 flex justify-end">
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center space-x-2 text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Session...</span>
            </>
          ) : (
            <span>Generate Interview Set</span>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
