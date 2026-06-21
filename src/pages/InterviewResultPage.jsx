import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import {
  FiAward,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiClock,
  FiAlertTriangle,
  FiCpu,
  FiTrendingUp,
  FiThumbsUp,
  FiTarget,
  FiMessageSquare,
  FiBookOpen
} from "react-icons/fi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function InterviewResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(0);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get(`/interviews/${id}`);
        setResult(res.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
        </div>
        <LoadingSkeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-6 text-center text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 max-w-xl mx-auto">
        Interview assessment record not found.
      </div>
    );
  }

  // Format spent duration
  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${remainingSecs} seconds`;
    return `${mins}m ${remainingSecs}s`;
  };

  // Compile overall lists from questions feedback
  const compileItems = (field) => {
    return result.questions
      .map((q) => q[field])
      .filter((val) => val && val.trim() !== "");
  };

  const strengthsList = compileItems("strengths");
  const weaknessesList = compileItems("weaknesses");
  const recommendationsList = compileItems("improvements");

  // Score color helper
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500 bg-emerald-500/5";
    if (score >= 60) return "text-indigo-500 border-indigo-500 bg-indigo-500/5";
    return "text-rose-500 border-rose-500 bg-rose-500/5";
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 px-4">
      {/* Back link */}
      <Link
        to="/interviews"
        className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold"
      >
        <FiChevronLeft />
        <span>Back to Panels</span>
      </Link>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          AI Interview Performance Report
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Review your overall panel ratings, integrity metrics, and comprehensive SWOT summary analysis.
        </p>
      </div>

      {/* Main Score Dashboard: 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-center items-center text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <FiAward className="text-primary-500" />
            <span>Overall Score</span>
          </span>
          <span className="text-3xl font-black text-primary-500">{result.score}%</span>
        </div>

        {/* Technical Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-center items-center text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <FiCpu className="text-indigo-500" />
            <span>Technical Score</span>
          </span>
          <span className="text-3xl font-black text-indigo-500">{result.technicalScore || 70}%</span>
        </div>

        {/* Communication Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-center items-center text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <FiMessageSquare className="text-emerald-500" />
            <span>Communication</span>
          </span>
          <span className="text-3xl font-black text-emerald-500">{result.communicationScore || 70}%</span>
        </div>

        {/* Confidence Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-center items-center text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <FiTrendingUp className="text-amber-500" />
            <span>Confidence</span>
          </span>
          <span className="text-3xl font-black text-amber-500">{result.confidenceScore || 70}%</span>
        </div>
      </div>

      {/* Auxiliary Metadata Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Spent Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
              <FiClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Spent</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-white mt-0.5">
                {formatDuration(result.timeSpent || 0)}
              </h4>
            </div>
          </div>
        </div>

        {/* Integrity Warning Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warning Count</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-white mt-0.5">
                {result.warningCount || 0} Warnings
              </h4>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            result.warningCount === 0 
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10" 
              : "bg-rose-500/10 text-rose-500 border border-rose-500/10 animate-pulse"
          }`}>
            {result.warningCount === 0 ? "Excellent Gaze Integrity" : "Warnings Logged"}
          </span>
        </div>
      </div>

      {/* AI Examiner overall summary */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
          <FiAward className="text-primary-500 w-4 h-4" />
          <span>General Performance Overview</span>
        </h4>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
          {result.feedback || "Feedback summary completed successfully."}
        </p>
      </div>

      {/* SWOT Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4">
          <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiThumbsUp className="text-emerald-500 w-4 h-4" />
            <span>Key Strengths</span>
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {strengthsList.length === 0 ? (
              <li className="italic text-slate-400">No strengths compiled</li>
            ) : (
              strengthsList.map((strength, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{strength}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4">
          <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiTarget className="text-rose-500 w-4 h-4" />
            <span>Weaknesses</span>
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {weaknessesList.length === 0 ? (
              <li className="italic text-slate-400">No weaknesses compiled</li>
            ) : (
              weaknessesList.map((weakness, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4">
          <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiBookOpen className="text-indigo-500 w-4 h-4" />
            <span>Suggested Improvements</span>
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {recommendationsList.length === 0 ? (
              <li className="italic text-slate-400">No recommendations compiled</li>
            ) : (
              recommendationsList.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
          Itemized Question breakdown
        </h3>

        <div className="space-y-4">
          {result.questions.map((q, idx) => {
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-premium overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <span className="px-2 py-0.5 bg-primary-500/10 text-primary-500 border border-primary-500/10 rounded-full text-[9px] font-extrabold uppercase">
                      Question {idx + 1} ({q.type || "Technical"})
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2 truncate">
                      {q.questionText}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${getScoreColor(q.score)}`}>
                      Score: {q.score}%
                    </span>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="p-6 space-y-6 text-xs font-semibold leading-relaxed">
                        
                        {/* User Response & Voice Transcript Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <h5 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                              Submitted Answer
                            </h5>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-350 min-h-[100px]">
                              {q.userAnswer || <span className="italic text-slate-400">No response text submitted</span>}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                              Speech-To-Text Audio Transcript
                            </h5>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-350 min-h-[100px]">
                              {q.transcript || <span className="italic text-slate-400">No speech recorded for this response</span>}
                            </div>
                          </div>
                        </div>

                        {/* SWOT Point Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Strengths */}
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl space-y-1">
                            <h6 className="font-bold text-[10px] uppercase tracking-wider text-emerald-500">
                              Strengths
                            </h6>
                            <p>{q.strengths || "Adequate articulation."}</p>
                          </div>

                          {/* Weaknesses */}
                          <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-455 rounded-2xl space-y-1">
                            <h6 className="font-bold text-[10px] uppercase tracking-wider text-rose-500">
                              Weaknesses
                            </h6>
                            <p>{q.weaknesses || "Detailing could be improved."}</p>
                          </div>

                          {/* Improvements */}
                          <div className="p-4 bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl space-y-1">
                            <h6 className="font-bold text-[10px] uppercase tracking-wider text-amber-550">
                              Suggested Improvements
                            </h6>
                            <p>{q.improvements || "Provide structural patterns/examples."}</p>
                          </div>
                        </div>

                        {/* Model Template Answer */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-[10px] text-primary-500 uppercase tracking-wider">
                            Model Sample Ideal Answer
                          </h5>
                          <div className="p-4 bg-primary-500/5 dark:bg-primary-950/10 border border-primary-500/10 text-primary-650 dark:text-primary-400 rounded-2xl">
                            {q.idealAnswer || "Ideal answer sample not provided."}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
