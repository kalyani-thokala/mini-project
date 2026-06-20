import { useState, useEffect } from "react";
import API from "../services/api";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiAward, FiTrendingUp, FiCheckCircle, FiXCircle, FiCpu, FiCode, FiGrid, FiBookOpen } from "react-icons/fi";

export default function Leaderboard() {
  const { user, updateUserProfile } = useApp();
  const [activeTab, setActiveTab] = useState("exams"); // exams, interviews, coding
  const [leaderboardData, setLeaderboardData] = useState({
    topExams: [],
    topInterviews: [],
    topCoding: []
  });
  const [loading, setLoading] = useState(true);
  const [togglingOpt, setTogglingOpt] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leaderboard");
      setLeaderboardData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load leaderboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleToggleOpt = async () => {
    try {
      setTogglingOpt(true);
      const res = await API.post("/leaderboard/toggle");
      updateUserProfile({
        ...user,
        leaderboardOptIn: res.data.leaderboardOptIn
      });
      toast.success(
        res.data.leaderboardOptIn
          ? "You are now visible on the Leaderboard!"
          : "You have been hidden from the Leaderboard."
      );
      fetchLeaderboard(); // refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to update leaderboard preference");
    } finally {
      setTogglingOpt(false);
    }
  };

  const currentList =
    activeTab === "exams"
      ? leaderboardData.topExams
      : activeTab === "interviews"
      ? leaderboardData.topInterviews
      : leaderboardData.topCoding;

  const getRankBadge = (index) => {
    if (index === 0) return "bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20";
    if (index === 1) return "bg-slate-300 text-slate-800 shadow-md shadow-slate-300/20";
    if (index === 2) return "bg-amber-600 text-white shadow-md shadow-amber-600/20";
    return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
  };

  const getMetricValue = (item) => {
    if (activeTab === "exams") return `${item.averageScore || 0}% avg`;
    if (activeTab === "interviews") return `${item.totalInterviews || 0} sessions`;
    return `${item.totalCodingChallenges || 0} solved`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <FiAward className="text-amber-500 animate-pulse" />
            <span>PrepMaster Leaderboard</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
            See how you rank against peers across mock exams, interview sessions, and coding submissions.
          </p>
        </div>

        {/* Opt-In Indicator and Toggle button */}
        <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex items-center justify-between gap-6 md:w-auto">
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400">Your Status</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {user?.leaderboardOptIn ? (
                <span className="text-emerald-500 text-xs font-extrabold flex items-center">
                  <FiCheckCircle className="mr-1" /> Opted In (Visible)
                </span>
              ) : (
                <span className="text-rose-500 text-xs font-extrabold flex items-center">
                  <FiXCircle className="mr-1" /> Opted Out (Hidden)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleToggleOpt}
            disabled={togglingOpt}
            className={`py-2 px-3.5 rounded-xl font-bold transition-all text-xs flex items-center ${
              user?.leaderboardOptIn
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
            }`}
          >
            {togglingOpt ? "Updating..." : user?.leaderboardOptIn ? "Opt Out" : "Opt In Now"}
          </button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex bg-slate-100 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-darkBorder/40 w-full sm:max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("exams")}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === "exams"
              ? "bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FiBookOpen className="w-4 h-4" />
          <span>Exams Mastery</span>
        </button>
        <button
          onClick={() => setActiveTab("interviews")}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === "interviews"
              ? "bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FiCpu className="w-4 h-4" />
          <span>AI Interviews</span>
        </button>
        <button
          onClick={() => setActiveTab("coding")}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === "coding"
              ? "bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FiCode className="w-4 h-4" />
          <span>Coding Solved</span>
        </button>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400">Loading top performers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-darkBorder/40 pb-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-4 w-20">Rank</th>
                  <th className="py-4 px-4">User</th>
                  <th className="py-4 px-4">Performance Rank</th>
                  <th className="py-4 px-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/20">
                <AnimatePresence mode="wait">
                  {currentList.length > 0 ? (
                    currentList.map((item, index) => {
                      const isCurrentUser = item.email === user?.email;
                      return (
                        <motion.tr
                          key={item.email}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                            isCurrentUser ? "bg-primary-500/5 dark:bg-primary-500/10 font-bold" : ""
                          }`}
                        >
                          {/* Rank column */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankBadge(index)}`}>
                              {index + 1}
                            </span>
                          </td>

                          {/* Profile details */}
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0 border border-slate-200 dark:border-darkBorder">
                                {item.avatar ? (
                                  <img src={item.avatar} alt={item.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  item.fullName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                  <span>{item.fullName}</span>
                                  {isCurrentUser && (
                                    <span className="bg-primary-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold">{item.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Subtitles / categories info */}
                          <td className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                            {activeTab === "exams" && (
                              <span>Exams Completed: {item.totalExams || 0}</span>
                            )}
                            {activeTab === "interviews" && (
                              <span>Interviews Complete</span>
                            )}
                            {activeTab === "coding" && (
                              <span>Solutions Logged</span>
                            )}
                          </td>

                          {/* Value metrics */}
                          <td className="py-4 px-4 text-right">
                            <span className="text-xs font-extrabold text-primary-500">
                              {getMetricValue(item)}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-slate-400 dark:text-slate-500">
                        <FiGrid className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="text-xs font-bold">No users are ranked in this category yet.</p>
                        <p className="text-[10px] font-semibold mt-0.5">Opt into the leaderboard to showcase your progress!</p>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
