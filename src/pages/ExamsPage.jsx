import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { FiBookOpen, FiPlay, FiClock, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ExamsPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Aptitude");
  const [difficulty, setDifficulty] = useState("easy");
  const [count, setCount] = useState(10); // Default to 10 questions minimum
  const [loading, setLoading] = useState(false);

  const categories = [
    "Aptitude",
    "Logical Reasoning",
    "Verbal Ability",
    "Java",
    "Python",
    "React",
    "JavaScript",
    "DBMS",
    "Operating Systems",
    "Computer Networks"
  ];

  const handleStartExam = async () => {
    try {
      setLoading(true);
      const res = await API.post("/exams/generate", {
        category,
        difficulty,
        count
      });

      toast.success("Exam paper generated!");
      
      // Redirect to Exam Session Page, passing questions list, category, and duration
      // Duration is automatically set to 1 minute per question (count * 60 seconds)
      navigate(`/exams/take/${Date.now()}`, {
        state: {
          questions: res.data,
          category,
          difficulty,
          duration: count * 60
        }
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to generate exam. Seed the DB first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Placement Mock Exams
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Simulate actual campus drive assessments with timed category-specific test papers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left card form options */}
        <div className="md:col-span-8 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center space-x-2">
            <FiBookOpen className="text-primary-500" />
            <span>Configure Assessment Paper</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Exam Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Difficulty Tier
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500"
              >
                <option value="easy">Easy (Fundamentals)</option>
                <option value="medium">Medium (Intermediate)</option>
                <option value="hard">Hard (Advanced)</option>
              </select>
            </div>

            {/* Number of questions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Number of Questions
              </label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500"
              >
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            {/* Time duration display (Locked to 1 minute per question) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Exam Duration
              </label>
              <div className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300">
                {count} Minutes (1 min/question)
              </div>
            </div>
          </div>

          <button
            onClick={handleStartExam}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiPlay />
                <span>Initialize Exam Paper</span>
              </>
            )}
          </button>
        </div>

        {/* Right Info Box */}
        <div className="md:col-span-4 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400 space-y-4">
          <h4 className="font-extrabold text-sm flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5" />
            <span>General Instructions</span>
          </h4>
          <ul className="text-xs font-semibold space-y-2.5 leading-relaxed list-disc list-inside">
            <li>Ensure a stable network connection before starting.</li>
            <li>The timer is running in the background and will trigger auto-submission when it hits zero.</li>
            <li>You can mark complex questions for "review" and revisit them using the navigation grid.</li>
            <li>Questions include single-choice (MCQs), True/False, and Multi-select types.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
