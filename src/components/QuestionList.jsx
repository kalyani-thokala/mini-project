import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import { exportInterviewSetToPDF } from '../utils/pdfExport';
import { useApp } from '../context/AppContext';
import { 
  FiSearch, FiFilter, FiDownload, FiCopy, FiCheck, 
  FiSave, FiBookmark, FiSmile 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestionList({ questions, role, difficulty, type, canSave = false }) {
  const { username, saveInterviewSet, savedSessions } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [copiedAll, setCopiedAll] = useState(false);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);

  // Check if this current set is already saved
  useEffect(() => {
    if (questions?.length > 0) {
      const match = savedSessions.some(session => 
        session.role === role && 
        session.difficulty === difficulty && 
        session.questions?.length === questions.length &&
        session.questions[0]?.question === questions[0]?.question
      );
      setIsAlreadySaved(match);
    }
  }, [questions, savedSessions, role, difficulty]);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-darkCard rounded-3xl border border-slate-100 dark:border-darkBorder shadow-premium max-w-xl mx-auto mt-6">
        <FiSmile className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200">No Questions Found</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select your parameters and hit generate to get started.</p>
      </div>
    );
  }

  // Filter logic
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (q.keyConcepts && q.keyConcepts.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDiff = diffFilter === 'All' || 
                        (q.difficultyLevel || q.difficulty || '').toLowerCase() === diffFilter.toLowerCase();
    
    // In some cases we might not have a clean 'type' on each question. Let's handle fallback.
    const matchesType = typeFilter === 'All' || 
                        !q.type || 
                        q.type.toLowerCase() === typeFilter.toLowerCase();
                        
    return matchesSearch && matchesDiff && matchesType;
  });

  const handleCopyEntireSet = () => {
    let formattedText = `INTERVIEW ACE AI - PREPARATION SET\n`;
    formattedText += `Role: ${role} | Difficulty: ${difficulty}\n`;
    formattedText += `Date: ${new Date().toLocaleDateString()}\n`;
    formattedText += `--------------------------------------------------\n\n`;

    questions.forEach((q, idx) => {
      formattedText += `Q${idx + 1}: ${q.question}\n`;
      formattedText += `Model Answer: ${q.modelAnswer || q.expectedAnswer}\n`;
      if (q.tips) formattedText += `Tips: ${q.tips}\n`;
      formattedText += `--------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(formattedText);
    setCopiedAll(true);
    toast.success("Entire interview set copied to clipboard!");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSaveSet = () => {
    if (isAlreadySaved) {
      toast.error("This interview session is already saved in your library!");
      return;
    }
    saveInterviewSet(role, difficulty, type, questions);
    setIsAlreadySaved(true);
  };

  const handleDownloadPDF = () => {
    exportInterviewSetToPDF({
      role,
      difficulty,
      questionType: type,
      date: new Date().toLocaleDateString(),
      questions
    }, username);
  };

  return (
    <div className="space-y-6">
      {/* Session Controls bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white dark:bg-darkCard p-4 rounded-2xl border border-slate-100 dark:border-darkBorder shadow-premium">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
            {role} Set <span className="text-slate-400 font-semibold text-sm">({questions.length} Questions)</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Parameters: {difficulty} • {type}</p>
        </div>

        {/* Global Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canSave && !isAlreadySaved && (
            <button
              onClick={handleSaveSet}
              className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 bg-slate-50 dark:bg-darkBg rounded-xl text-xs font-bold transition-all"
            >
              <FiSave />
              <span>Save Set</span>
            </button>
          )}

          {isAlreadySaved && (
            <div className="flex items-center space-x-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
              <FiCheck />
              <span>Saved to Library</span>
            </div>
          )}

          <button
            onClick={handleCopyEntireSet}
            className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 bg-slate-50 dark:bg-darkBg rounded-xl text-xs font-bold transition-all"
          >
            {copiedAll ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
            <span>Copy Full Set</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/10 transition-colors"
          >
            <FiDownload />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="relative md:col-span-6">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search questions or key concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="relative md:col-span-3">
          <div className="flex items-center space-x-1 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder px-3 py-1.5 rounded-xl">
            <FiFilter className="text-slate-400 w-3.5 h-3.5" />
            <select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
              className="w-full bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Type Filter */}
        <div className="relative md:col-span-3">
          <div className="flex items-center space-x-1 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder px-3 py-1.5 rounded-xl">
            <FiFilter className="text-slate-400 w-3.5 h-3.5" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-transparent text-slate-700 dark:text-slate-300 text-xs font-bold border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Showing indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-semibold px-1">
        <span>Showing {filteredQuestions.length} of {questions.length} questions</span>
        {searchTerm && <span>Search active</span>}
      </div>

      {/* Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredQuestions.map((q, index) => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              idx={index} 
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-darkCard rounded-3xl border border-slate-100 dark:border-darkBorder shadow-premium max-w-xl mx-auto">
          <FiSearch className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">No Matches Found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try broadening your search term or updating filters.</p>
        </div>
      )}
    </div>
  );
}
