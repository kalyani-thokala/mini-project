import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { FiTerminal, FiAward, FiChevronLeft, FiCheckCircle } from "react-icons/fi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function CodingReviewPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await API.get(`/code/submissions/${id}`);
        setSubmission(res.data);
      } catch (error) {
        console.error("Failed to load code review details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
        </div>
        <LoadingSkeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-6 text-center text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 max-w-xl mx-auto">
        Code review details not found.
      </div>
    );
  }

  const problem = submission.problemId || {};

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Back button */}
      <Link
        to="/coding"
        className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold"
      >
        <FiChevronLeft />
        <span>Back to Challenges</span>
      </Link>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          AI Code Review Report
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Review overall complexity feedback and model solution for "{problem.title || "Coding Challenge"}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left card stats */}
        <div className="md:col-span-4 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium text-center space-y-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Review Score
          </span>
          <h3 className="text-5xl font-extrabold text-primary-500">{submission.score}/10</h3>
          <p className="text-xs font-bold text-slate-400 uppercase">
            Language: {submission.language}
          </p>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
            Category: {problem.category}
          </div>
        </div>

        {/* Right review items card */}
        <div className="md:col-span-8 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-105 dark:border-darkBorder shadow-premium space-y-6">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
            <FiAward className="text-primary-500" />
            <span>AI Code Quality Review</span>
          </h4>

          {/* Strengths / Weaknesses / Improvements list */}
          <div className="space-y-4 text-xs font-semibold leading-relaxed">
            {/* Strengths */}
            <div className="space-y-2">
              <h5 className="font-bold text-[10px] text-emerald-500 uppercase tracking-wider">
                Strengths
              </h5>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                {submission.strengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="space-y-2">
              <h5 className="font-bold text-[10px] text-rose-500 uppercase tracking-wider">
                Weaknesses
              </h5>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                {submission.weaknesses.map((weak, idx) => (
                  <li key={idx}>{weak}</li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="space-y-2">
              <h5 className="font-bold text-[10px] text-amber-550 uppercase tracking-wider">
                Optimization Suggestions
              </h5>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                {submission.improvements.map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Ideal Solution Code */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-premium space-y-4">
        <h4 className="font-extrabold text-sm text-slate-200 flex items-center space-x-2">
          <FiTerminal className="text-emerald-400" />
          <span>Model Ideal Solution</span>
        </h4>
        <pre className="bg-slate-950 p-4 border border-slate-800 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
          <code>{submission.idealSolution}</code>
        </pre>
      </div>
    </div>
  );
}
