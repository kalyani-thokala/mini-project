import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportInterviewSetToPDF } from '../utils/pdfExport';
import QuestionList from '../components/QuestionList';
import { 
  FiFolder, FiChevronRight, FiCalendar, FiTrash2, 
  FiEye, FiDownload, FiInfo, FiEyeOff 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedInterviews() {
  const { username, savedSessions, deleteInterviewSet } = useApp();
  const [activeSessionId, setActiveSessionId] = useState(null);

  const handleDownloadPDF = (session) => {
    exportInterviewSetToPDF(session, username);
  };

  const handleToggleSession = (id) => {
    setActiveSessionId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-10 pb-16 pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Saved Sessions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Access your saved AI-generated interview question cards.</p>
        </div>
        
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <FiChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 dark:text-slate-200">Saved Sets</span>
        </div>
      </div>

      {savedSessions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-darkCard rounded-3xl border border-slate-100 dark:border-darkBorder shadow-premium max-w-xl mx-auto space-y-4">
          <FiFolder className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">No Saved Sessions</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            You haven't saved any generated interview sessions yet. Head over to the generator to create one!
          </p>
          <div className="pt-2">
            <Link to="/generate">
              <button className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                Generate Questions
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {savedSessions.map((session) => {
              const isOpened = activeSessionId === session.id;

              return (
                <div 
                  key={session.id} 
                  className={`rounded-3xl border transition-all duration-350 bg-white dark:bg-darkCard overflow-hidden shadow-premium ${
                    isOpened ? 'border-primary-500/30' : 'border-slate-100 dark:border-darkBorder'
                  }`}
                >
                  {/* Session Header Clickable Area */}
                  <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl flex-shrink-0 dark:bg-primary-950/20 dark:text-primary-400">
                        <FiFolder className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                          {session.role} Set
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          <span className="flex items-center space-x-1">
                            <FiCalendar className="w-3.5 h-3.5" />
                            <span>{session.date}</span>
                          </span>
                          <span>•</span>
                          <span>{session.questions?.length || 0} Questions</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {session.difficulty}
                          </span>
                          <span>•</span>
                          <span>{session.questionType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex items-center space-x-2 w-full md:w-auto justify-end border-t md:border-none pt-3 md:pt-0">
                      <button
                        onClick={() => handleToggleSession(session.id)}
                        className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          isOpened 
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-white' 
                            : 'bg-slate-50 dark:bg-darkBg border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isOpened ? (
                          <>
                            <FiEyeOff />
                            <span>Close Set</span>
                          </>
                        ) : (
                          <>
                            <FiEye />
                            <span>Reopen Set</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDownloadPDF(session)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-darkBg dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors"
                        title="Download PDF"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteInterviewSet(session.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 border border-rose-100/30 dark:border-rose-900/30 text-rose-500 hover:text-rose-600 transition-colors"
                        title="Delete Set"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Accordion collapsable list */}
                  <AnimatePresence initial={false}>
                    {isOpened && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-darkBg/10 p-6"
                      >
                        <QuestionList 
                          questions={session.questions} 
                          role={session.role} 
                          difficulty={session.difficulty} 
                          type={session.questionType} 
                          canSave={false} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
