import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { FiCpu, FiPlay, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";

export default function InterviewsPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Java Developer",
    "Python Developer",
    "Data Analyst"
  ];

  const handleStartInterview = async () => {
    try {
      setLoading(true);
      const res = await API.post("/interviews/generate", {
        role,
        difficulty,
        count
      });

      toast.success("Interview questions prepared!");
      
      // Redirect to Interview Session Page, passing parameters
      navigate("/interviews/take", {
        state: {
          questions: res.data,
          role,
          difficulty
        }
      });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to generate interview questions. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          AI Mock Interviews
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Conduct a timed, text-based mock interview. Gemini evaluates responses to score your technical depth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Configurations form */}
        <div className="md:col-span-8 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center space-x-2">
            <FiCpu className="text-primary-500" />
            <span>Setup Mock Panel</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Target Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500"
              >
                <option value="easy">Entry Level (Junior)</option>
                <option value="medium">Mid Level (Associate)</option>
                <option value="hard">Senior Level (Tech Lead)</option>
              </select>
            </div>

            {/* Questions count */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Number of Interview Questions
              </label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500"
              >
                <option value={3}>3 Questions (Express Practice)</option>
                <option value={5}>5 Questions (Standard assessment)</option>
                <option value={7}>7 Questions (Full depth review)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiPlay />
                <span>Begin Simulated Interview</span>
              </>
            )}
          </button>
        </div>

        {/* Info panel */}
        <div className="md:col-span-4 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-blue-600 dark:text-blue-400 space-y-4">
          <h4 className="font-extrabold text-sm flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5" />
            <span>Interview Guide</span>
          </h4>
          <ul className="text-xs font-semibold space-y-2.5 leading-relaxed list-disc list-inside">
            <li>You will receive technical, behavioral, and HR questions sequentially.</li>
            <li>Take time to write concise, detailed technical explanations.</li>
            <li>Gemini evaluates based on technical accuracy, completeness, and clarity.</li>
            <li>Detailed grades and ideal responses will be available immediately after submission.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
