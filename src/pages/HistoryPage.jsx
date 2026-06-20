import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiPrinter, FiSearch, FiCalendar, FiAward, FiBook, FiCpu, FiCode, FiChevronRight, FiFilter } from "react-icons/fi";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("exams"); // exams, interviews, coding
  const [exams, setExams] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [coding, setCoding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all"); // all, high (>=80), mid (50-79), low (<50)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examsRes, interviewsRes, codingRes] = await Promise.all([
          API.get("/history/exams"),
          API.get("/history/interviews"),
          API.get("/history/coding")
        ]);
        setExams(examsRes.data);
        setInterviews(interviewsRes.data);
        setCoding(codingRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load your history logs.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFilteredData = () => {
    let baseList = [];
    if (activeTab === "exams") baseList = exams;
    else if (activeTab === "interviews") baseList = interviews;
    else baseList = coding;

    return baseList.filter((item) => {
      // 1. Search Query filter
      const title =
        activeTab === "exams"
          ? item.category || ""
          : activeTab === "interviews"
          ? `${item.role} ${item.topic}`
          : item.problemId?.title || "";
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Difficulty filter
      let matchesDifficulty = true;
      if (difficultyFilter !== "all" && item.difficulty) {
        matchesDifficulty = item.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
      }

      // 3. Score filter
      let matchesScore = true;
      if (scoreFilter !== "all") {
        const score = item.score !== undefined ? item.score : 0;
        if (scoreFilter === "high") matchesScore = score >= 80;
        else if (scoreFilter === "mid") matchesScore = score >= 50 && score < 80;
        else if (scoreFilter === "low") matchesScore = score < 50;
      }

      return matchesSearch && matchesDifficulty && matchesScore;
    });
  };

  const filteredData = getFilteredData();

  // Export to CSV Functionality
  const exportToCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `prepmaster_${activeTab}_report.csv`;

    if (activeTab === "exams") {
      headers = ["Category", "Total Questions", "Correct Answers", "Score (%)", "Date Completed"];
      rows = exams.map((item) => [
        item.category,
        item.totalQuestions,
        item.correctAnswers,
        item.score,
        new Date(item.completedAt).toLocaleString()
      ]);
    } else if (activeTab === "interviews") {
      headers = ["Role", "Topic", "Difficulty", "Score (%)", "Date Submitted"];
      rows = interviews.map((item) => [
        item.role,
        item.topic,
        item.difficulty,
        item.score,
        new Date(item.submittedAt).toLocaleString()
      ]);
    } else {
      headers = ["Problem Title", "Category", "Difficulty", "Score (%)", "Date Submitted"];
      rows = coding.map((item) => [
        item.problemId?.title || "Unknown",
        item.problemId?.category || "Unknown",
        item.problemId?.difficulty || "Unknown",
        item.score,
        new Date(item.submittedAt).toLocaleString()
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded successfully!");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 print:px-0 print:py-0 print:mx-0 print:max-w-none">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Practice History & Reports
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Track, filter, and download reports for your completed mock tests, interviews, and coding.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-white dark:bg-darkCard hover:bg-slate-50 border border-slate-200 dark:border-darkBorder rounded-xl text-xs font-bold text-slate-700 dark:text-white shadow-sm transition-all"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/10 transition-all"
          >
            <FiPrinter />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-slate-100 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-darkBorder/40 w-full sm:max-w-md print:hidden">
        <button
          onClick={() => setActiveTab("exams")}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === "exams"
              ? "bg-white dark:bg-darkCard text-slate-800 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FiBook className="w-4 h-4" />
          <span>Exams</span>
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
          <span>Interviews</span>
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
          <span>Coding</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-wrap items-center gap-4 print:hidden">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-xl text-xs font-semibold focus:outline-none dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <FiFilter className="text-slate-400 text-xs" />
            <span className="text-[11px] font-bold text-slate-400">Filters:</span>
          </div>

          {/* Difficulty */}
          <select
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none dark:text-white"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Score */}
          <select
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none dark:text-white"
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
          >
            <option value="all">All Scores</option>
            <option value="high">High (&gt;= 80%)</option>
            <option value="mid">Mid (50% - 79%)</option>
            <option value="low">Low (&lt; 50%)</option>
          </select>
        </div>
      </div>

      {/* Unified Table view */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium overflow-hidden print:shadow-none print:border-none">
        {/* Printable Title */}
        <div className="hidden print:block mb-8 text-center">
          <h1 className="text-2xl font-black text-slate-900 uppercase">PrepMaster AI Academic Report</h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Student learning history logs generated on {new Date().toLocaleDateString()}
          </p>
          <div className="border-b-2 border-slate-200 my-4" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400">Loading history items...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-darkBorder/40 pb-4 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-4">Activity Name</th>
                  {activeTab === "exams" && <th className="py-4 px-4">Correct / Total</th>}
                  {activeTab === "interviews" && <th className="py-4 px-4">Difficulty</th>}
                  {activeTab === "coding" && <th className="py-4 px-4">Category</th>}
                  <th className="py-4 px-4">Completed Date</th>
                  <th className="py-4 px-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/20">
                <AnimatePresence mode="wait">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => {
                      const title =
                        activeTab === "exams"
                          ? item.category
                          : activeTab === "interviews"
                          ? `${item.role} (${item.topic})`
                          : item.problemId?.title || "Unknown";

                      const date =
                        activeTab === "exams" ? item.completedAt : item.submittedAt;

                      const scoreColor =
                        item.score >= 80
                          ? "text-emerald-500 bg-emerald-500/10"
                          : item.score >= 50
                          ? "text-amber-500 bg-amber-500/10"
                          : "text-rose-500 bg-rose-500/10";

                      return (
                        <motion.tr
                          key={item._id || idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <span className="p-2 bg-primary-500/10 text-primary-500 rounded-xl">
                                {activeTab === "exams" ? (
                                  <FiBook />
                                ) : activeTab === "interviews" ? (
                                  <FiCpu />
                                ) : (
                                  <FiCode />
                                )}
                              </span>
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                                  {title}
                                </h5>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold capitalize">
                                  {activeTab === "coding"
                                    ? item.problemId?.difficulty
                                    : item.difficulty || "General"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {activeTab === "exams" && (
                            <td className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                              {item.correctAnswers} / {item.totalQuestions}
                            </td>
                          )}

                          {activeTab === "interviews" && (
                            <td className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">
                              {item.difficulty}
                            </td>
                          )}

                          {activeTab === "coding" && (
                            <td className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                              {item.problemId?.category || "Programming"}
                            </td>
                          )}

                          <td className="py-4 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span className="flex items-center space-x-1">
                              <FiCalendar />
                              <span>{new Date(date).toLocaleDateString()}</span>
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-extrabold ${scoreColor}`}>
                              {item.score}%
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-400 dark:text-slate-500">
                        <p className="text-xs font-bold">No history items found matching filters.</p>
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
