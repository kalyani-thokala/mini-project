import React from 'react';
import MockInterview from '../components/MockInterview';
import { FiPlay, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function MockInterviewPage() {
  return (
    <div className="space-y-10 pb-16 pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Mock Interview Simulator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Practice responding to questions under timing constraints.</p>
        </div>
        
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <FiChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 dark:text-slate-200">Mock Simulator</span>
        </div>
      </div>

      {/* Simulator Container */}
      <div className="py-2">
        <MockInterview />
      </div>
    </div>
  );
}
