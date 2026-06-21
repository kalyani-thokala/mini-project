import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { FiTrendingUp, FiClock, FiCheck, FiX, FiInfo, FiChevronLeft } from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function ExamResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get(`/exams/${id}`);
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
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
        </div>
        <LoadingSkeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-6 text-center text-rose-500 font-bold bg-rose-50 dark:bg-rose-955/20 rounded-2xl border border-rose-100 max-w-xl mx-auto">
        Result record not found.
      </div>
    );
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs < 10 ? "0" : ""}${remainingSecs}s`;
  };

  // Recharts Pie Chart Data
  const chartData = [
    { name: "Correct Answers", value: result.correctAnswers, color: "#10b981" },
    { name: "Wrong Answers", value: result.wrongAnswers, color: "#f43f5e" },
    {
      name: "Unattempted",
      value: result.totalQuestions - (result.correctAnswers + result.wrongAnswers),
      color: "#94a3b8"
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Back to Exams Link */}
      <Link
        to="/exams"
        className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold"
      >
        <FiChevronLeft />
        <span>Back to Exams</span>
      </Link>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Exam Score Sheet
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Review your performance summary and AI-generated coach recommendations for {result.category}
        </p>
      </div>

      {/* Grid of Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Score percentage */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium text-center space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Overall Score
          </span>
          <h3 className="text-4xl font-extrabold text-primary-500">
            {result.percentage}%
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            {result.score} of {result.totalQuestions} questions correct
          </p>
        </div>

        {/* Card 2: Time Taken */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium text-center space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Time Taken
          </span>
          <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white flex items-center justify-center space-x-1.5">
            <FiClock className="w-8 h-8 text-slate-400" />
            <span>{formatTime(result.completionTime)}</span>
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            Against configured time limit
          </p>
        </div>

        {/* Card 3: Status */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium text-center space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Assessment Result
          </span>
          <h3
            className={`text-4xl font-extrabold ${
              result.percentage >= 70 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {result.percentage >= 70 ? "PASS" : "FAIL"}
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            Placement benchmark target: 70%
          </p>
        </div>
      </div>

      {/* Breakdown and Recharts Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Recharts Pie Chart panel */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col items-center justify-center space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white w-full text-left">
            Response Ratio Breakdown
          </h4>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex space-x-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span>Correct ({result.correctAnswers})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-rose-500" />
              <span>Wrong ({result.wrongAnswers})</span>
            </div>
          </div>
        </div>

        {/* AI Recommendations panel */}
        <div className="md:col-span-7 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
            <FiTrendingUp className="text-primary-500" />
            <span>AI Placement Recommendations</span>
          </h4>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/60 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
            {result.feedback}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <Link
              to="/exams"
              className="flex-1 text-center py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 dark:text-white rounded-2xl font-bold text-xs transition-all shadow-sm"
            >
              Re-attempt Category
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 text-center py-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-primary-500/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
