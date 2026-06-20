import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  FiBookOpen,
  FiCpu,
  FiTerminal,
  FiTrendingUp,
  FiChevronRight,
  FiAward,
  FiZap,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function Dashboard() {
  const { user } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await API.get("/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Failed to load dashboard metrics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <LoadingSkeleton className="md:col-span-8 h-80 rounded-3xl" />
          <LoadingSkeleton className="md:col-span-4 h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900">
        {error}
      </div>
    );
  }

  const examsCount = stats?.totalExams || 0;
  const interviewsCount = stats?.totalInterviews || 0;
  const codingCount = stats?.totalCodingChallenges || 0;
  const avgScore = stats?.averageScore || 0;

  const readinessScore = Math.min(
    100,
    Math.round(
      avgScore * 0.4 +
      Math.min(100, examsCount * 10) * 0.2 +
      Math.min(100, interviewsCount * 15) * 0.2 +
      Math.min(100, codingCount * 10) * 0.2
    )
  );

  let readinessLevel = "Developing Candidate (Level D)";
  let readinessColor = "text-rose-500 bg-rose-500/10 border border-rose-500/20";
  if (readinessScore >= 80) {
    readinessLevel = "Premium Elite (Level A)";
    readinessColor = "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
  } else if (readinessScore >= 60) {
    readinessLevel = "Highly Competitive (Level B)";
    readinessColor = "text-blue-500 bg-blue-500/10 border border-blue-500/20";
  } else if (readinessScore >= 40) {
    readinessLevel = "Job Ready (Level C)";
    readinessColor = "text-amber-500 bg-amber-500/10 border border-amber-500/20";
  }

  const statCards = [
    {
      title: "Exams Attempted",
      value: stats.totalExams,
      icon: <FiBookOpen className="w-6 h-6" />,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/10",
      link: "/exams"
    },
    {
      title: "Interviews Done",
      value: stats.totalInterviews,
      icon: <FiCpu className="w-6 h-6" />,
      color: "from-purple-500/20 to-pink-500/20 text-purple-500 border-purple-500/10",
      link: "/interviews"
    },
    {
      title: "Coding Submissions",
      value: stats.totalCodingChallenges,
      icon: <FiTerminal className="w-6 h-6" />,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/10",
      link: "/coding"
    },
    {
      title: "Average Score",
      value: `${stats.averageScore}%`,
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/10",
      link: "/analytics"
    }
  ];

  // Format activity logs as data points for Recharts (fallback if none)
  const chartData = stats.recentActivities
    .filter((a) => a.type === "exam")
    .map((a, i) => ({
      name: `Ex ${i + 1}`,
      score: parseInt(a.description.match(/\d+/)?.[0]) || 70
    }))
    .reverse();

  if (chartData.length === 0) {
    // Dummy chart points for empty states
    chartData.push(
      { name: "Start", score: 0 },
      { name: "Target", score: 100 }
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Hero */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white relative overflow-hidden shadow-lg shadow-primary-500/10">
        <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
            Placement Prep Mode
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h2>
          <p className="text-primary-100 max-w-xl text-sm font-medium">
            Your placement readiness profile is growing. Practice timed exams, solve coding reviews, and grade mock interviews with AI.
          </p>
        </div>
      </div>

      {/* Streak and Placement Readiness Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Rank Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Placement Readiness
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${readinessColor}`}>
              {readinessLevel}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              {readinessScore}%
            </span>
            <span className="text-xs text-slate-400 font-bold">estimated rank</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>

        {/* Learning Streak Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Practice Streak
            </h4>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-baseline gap-1">
              <span>{stats.learningStreak || 0}</span>
              <span className="text-xs text-slate-400 font-bold">days active</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              Practice daily to keep your learning momentum!
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold shadow-md shadow-amber-500/5">
            <FiZap className="w-7 h-7" />
          </div>
        </div>

        {/* Practice Hours & Topics Done */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Practice Investment
            </h4>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-baseline gap-1">
              <span>{stats.practiceHours || 0}</span>
              <span className="text-xs text-slate-400 font-bold">hours logged</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              Completed {stats.completedTopicsCount || 0} / 43 critical subtopics
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center font-bold shadow-md shadow-indigo-500/5">
            <FiClock className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Link key={idx} to={card.link}>
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex items-center justify-between hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  {card.value}
                </h3>
              </div>
              <div className={`p-4 rounded-2xl border bg-gradient-to-tr ${card.color}`}>
                {card.icon}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Graph Card */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
                Performance Score Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Calculated from your latest Mock Exam percentages
              </p>
            </div>
            <Link
              to="/analytics"
              className="text-xs text-primary-500 hover:text-primary-650 font-bold flex items-center space-x-1"
            >
              <span>Detailed Analytics</span>
              <FiChevronRight />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(30, 41, 59, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI recommended learning topics */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <div className="flex items-center space-x-2 text-primary-500 dark:text-primary-400">
            <FiAward className="w-5 h-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">
              AI Placement Coaching
            </h3>
          </div>

          <div className="space-y-4">
            {stats.recommendedTopics && stats.recommendedTopics.length > 0 ? (
              stats.recommendedTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm hover:border-primary-500/20 transition-all"
                >
                  {topic}
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                Complete a mock exam or interview to receive personalized suggestions.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">
          Recent Placement Activities
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {stats.recentActivities.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
              No recent activity found. Take a test or coding challenge to get started.
            </div>
          ) : (
            stats.recentActivities.map((act) => (
              <div key={act.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl ${
                      act.type === "exam"
                        ? "bg-blue-500/10 text-blue-500"
                        : act.type === "interview"
                        ? "bg-purple-500/10 text-purple-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {act.type === "exam" ? (
                      <FiBookOpen className="w-5 h-5" />
                    ) : act.type === "interview" ? (
                      <FiCpu className="w-5 h-5" />
                    ) : (
                      <FiTerminal className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {act.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-bold">
                  {new Date(act.date).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
