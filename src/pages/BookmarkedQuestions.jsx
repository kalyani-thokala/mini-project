import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import QuestionCard from '../components/QuestionCard';
import { FiBookmark, FiChevronRight, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookmarkedQuestions() {
  const { bookmarkedQuestions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter bookmarked list
  const filteredBookmarks = bookmarkedQuestions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.keyConcepts && q.keyConcepts.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 pb-16 pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Bookmarked Questions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review specific questions you flagged for study attention.</p>
        </div>
        
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <FiChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 dark:text-slate-200">Bookmarks</span>
        </div>
      </div>

      {bookmarkedQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-darkCard rounded-3xl border border-slate-100 dark:border-darkBorder shadow-premium max-w-xl mx-auto space-y-4">
          <FiBookmark className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">Vault is Empty</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            You haven't bookmarked any individual questions. Click the bookmark icon on any question card during study sessions!
          </p>
          <div className="pt-2">
            <Link to="/generate">
              <button className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                Browse Questions
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search box */}
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FiSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search your bookmarked cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all"
            />
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Showing {filteredBookmarks.length} of {bookmarkedQuestions.length} bookmarks
          </div>

          {/* Bookmarks list grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredBookmarks.map((q, index) => (
                <QuestionCard 
                  key={q.id} 
                  question={q} 
                  idx={index} 
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredBookmarks.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-darkCard rounded-3xl border border-slate-100 dark:border-darkBorder shadow-premium max-w-xl mx-auto">
              <FiSearch className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">No Matches Found</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try broadening your search term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
