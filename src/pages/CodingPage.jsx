import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { FiTerminal, FiAward, FiBookmark, FiChevronRight } from "react-icons/fi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function CodingPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["Arrays", "Strings", "Linked Lists", "Stack", "Queue", "Trees", "Graphs"];

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await API.get("/code/problems");
        setProblems(res.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter((prob) => {
    const diffMatch = selectedDifficulty === "all" || prob.difficulty === selectedDifficulty;
    const catMatch = selectedCategory === "all" || prob.category === selectedCategory;
    return diffMatch && catMatch;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
          <LoadingSkeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Coding Challenges
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Solve data structure problems in JavaScript, Python, or Java and receive instant AI-driven code quality reviews
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-premium flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 bg-slate-55/60 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-xl text-xs font-semibold dark:text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="p-2 bg-slate-55/60 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-xl text-xs font-semibold dark:text-white focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filteredProblems.length} challenges
        </span>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProblems.length === 0 ? (
          <div className="md:col-span-2 text-center p-12 text-slate-500 dark:text-slate-400 font-semibold bg-white dark:bg-darkCard rounded-3xl border border-slate-100 dark:border-darkBorder">
            No coding challenges found matching these filters.
          </div>
        ) : (
          filteredProblems.map((prob) => {
            const diffColors = {
              easy: "bg-emerald-500/10 text-emerald-550 border-emerald-500/10",
              medium: "bg-amber-500/10 text-amber-550 border-amber-500/10",
              hard: "bg-rose-500/10 text-rose-550 border-rose-500/10"
            };

            return (
              <motion.div
                key={prob._id}
                whileHover={{ y: -3 }}
                className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-105 dark:border-darkBorder shadow-premium hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-xl text-[10px] font-bold text-slate-500">
                      {prob.category}
                    </span>

                    <span
                      className={`px-2.5 py-1 border rounded-xl text-[10px] font-bold capitalize ${
                        diffColors[prob.difficulty] || ""
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {prob.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                  <Link
                    to={`/coding/solve/${prob._id}`}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-200 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Solve Challenge</span>
                    <FiChevronRight />
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
