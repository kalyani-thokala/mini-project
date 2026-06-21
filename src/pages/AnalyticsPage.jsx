import React, { useState, useEffect } from "react";
import API from "../services/api";
import { FiTrendingUp, FiCpu, FiTerminal, FiInfo, FiActivity, FiZap, FiTarget, FiChevronsUp, FiStar, FiGrid } from "react-icons/fi";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/analytics");
        setData(res.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-64 rounded-3xl" />
          <LoadingSkeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 max-w-xl mx-auto">
        Failed to load analytical metrics.
      </div>
    );
  }

  // Calculate Placement Readiness Level styling
  const readiness = data.placementReadiness || "Beginner";
  let readinessColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
  let readinessDescription = "Keep practicing mock tests and coding to reach placement standards.";
  if (readiness === "Placement Ready") {
    readinessColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 animate-pulse";
    readinessDescription = "Excellent! Your statistics meet the requirements for premier placement opportunities.";
  } else if (readiness === "Advanced") {
    readinessColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";
    readinessDescription = "Great progress. Focus on weakest categories to cross the ready threshold.";
  } else if (readiness === "Intermediate") {
    readinessColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    readinessDescription = "Consistent efforts will push your scores into the competitive bracket.";
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Performance Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Data-driven metrics computed from your exam results, mock interviews, and coding submissions
        </p>
      </div>

      {/* Main Placement & Performance Analytics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Placement Readiness */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Placement Readiness
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${readinessColor}`}>
                {readiness}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-semibold mt-2">
              {readinessDescription}
            </p>
          </div>
          <FiTarget className="w-6 h-6 text-primary-500 self-end mt-4" />
        </div>

        {/* Learning Velocity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Velocity (Last 7 Days)
            </span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white mt-1">
              {data.learningVelocity || 0} items
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-2">
              Mock exams, interviews, and code solved recently.
            </p>
          </div>
          <FiZap className="w-6 h-6 text-amber-500 self-end mt-4" />
        </div>

        {/* Improvement Rate */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Improvement Rate
            </span>
            <h3 className={`text-2xl font-black mt-1 flex items-center gap-1 ${
              (data.improvementRate || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}>
              <span>{(data.improvementRate || 0) >= 0 ? "+" : ""}{data.improvementRate || 0}%</span>
              <span className="text-xs font-bold">trend</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-2">
              Change in average score from first half to second half.
            </p>
          </div>
          <FiChevronsUp className="w-6 h-6 text-emerald-500 self-end mt-4" />
        </div>

        {/* General Average Score */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Global Average Grade
            </span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white mt-1">
              {data.averageScore || 0}%
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-2">
              Calculated across all finished practice assessments.
            </p>
          </div>
          <FiStar className="w-6 h-6 text-amber-500 self-end mt-4" />
        </div>
      </div>

      {/* Recharts Graphical Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Performance BarChart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
            Category-wise Performance (Average Score)
          </h3>
          <div className="h-64 w-full">
            {data.categoryWisePerformance.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Attempt mock exams to display category graphs
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryWisePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Weekly Progress AreaChart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
            Weekly Progress Score Trend
          </h3>
          <div className="h-64 w-full">
            {data.weeklyProgress.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Attempt mock exams to track weekly scores
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Interview Performance LineChart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
            <FiCpu className="text-purple-500" />
            <span>Mock Interview Score History</span>
          </h3>
          <div className="h-64 w-full">
            {data.interviewPerformance.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete mock interviews to view trendlines
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.interviewPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Coding Performance LineChart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
            <FiTerminal className="text-emerald-500" />
            <span>Coding Challenge Review Scores</span>
          </h3>
          <div className="h-64 w-full">
            {data.codingPerformance.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Submit coding solutions to trace reviewer scores
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.codingPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Difficulty Mastery & Topic Mastery Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Difficulty Mastery progress bars */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
              Difficulty-wise Mastery
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Average grades grouped by problem severity
            </p>
          </div>
          <div className="space-y-4">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Easy Challenges</span>
                <span className="text-emerald-500">{data.difficultyMastery?.easy || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${data.difficultyMastery?.easy || 0}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Medium Challenges</span>
                <span className="text-blue-500">{data.difficultyMastery?.medium || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${data.difficultyMastery?.medium || 0}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Hard Challenges</span>
                <span className="text-rose-500">{data.difficultyMastery?.hard || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${data.difficultyMastery?.hard || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Subtopic Mastery */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
              Subtopic Mastery Tracking
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Individual topic mastery grades from your practice records
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3.5 pr-2">
            {data.topicMastery && data.topicMastery.length > 0 ? (
              data.topicMastery.map((topic, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                    <span className="truncate">{topic.topic} ({topic.attempts} attempts)</span>
                    <span className="text-primary-500">{topic.score}% Mastery</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full"
                      style={{ width: `${topic.score}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs font-semibold text-slate-500">
                <FiGrid className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p>No subtopics practiced yet.</p>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">Complete exams and coding problems to track individual topic mastery.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4">
        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center space-x-2">
          <FiTrendingUp className="text-primary-500" />
          <span>AI Placement Insights</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insights items */}
          <div className="space-y-4">
            {data.recommendations.map((tip, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-darkBorder text-xs font-semibold text-slate-700 dark:text-slate-400 leading-relaxed shadow-sm"
              >
                {tip}
              </div>
            ))}
          </div>

          {/* Strong / Weak summary lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strong Areas */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-450 space-y-2 text-xs">
              <h5 className="font-extrabold text-[10px] text-emerald-500 uppercase tracking-wider">
                Strong Areas (Avg &gt;= 75%)
              </h5>
              {data.strongAreas.length === 0 ? (
                <p className="text-slate-500">None logged yet.</p>
              ) : (
                <ul className="list-disc list-inside space-y-1 font-bold">
                  {data.strongAreas.map((cat) => (
                    <li key={cat}>{cat}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Weak Areas */}
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-455 space-y-2 text-xs">
              <h5 className="font-extrabold text-[10px] text-rose-500 uppercase tracking-wider">
                Weak Areas (Avg &lt; 60%)
              </h5>
              {data.weakAreas.length === 0 ? (
                <p className="text-slate-500">None logged yet.</p>
              ) : (
                <ul className="list-disc list-inside space-y-1 font-bold">
                  {data.weakAreas.map((cat) => (
                    <li key={cat}>{cat}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
