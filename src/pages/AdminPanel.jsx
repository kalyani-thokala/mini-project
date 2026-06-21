import React, { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { FiShield, FiPlus, FiEdit, FiTrash, FiBookOpen, FiTerminal, FiGrid } from "react-icons/fi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Question Form State
  const [questionId, setQuestionId] = useState(null); // set if editing
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [qType, setQType] = useState("mcq");
  const [qCategory, setQCategory] = useState("Aptitude");
  const [qDifficulty, setQDifficulty] = useState("easy");
  const [qExplanation, setQExplanation] = useState("");

  // Problem Form State
  const [problemId, setProblemId] = useState(null); // set if editing
  const [probTitle, setProbTitle] = useState("");
  const [probDesc, setProbDesc] = useState("");
  const [probConstraints, setProbConstraints] = useState("");
  const [probCategory, setProbCategory] = useState("Arrays");
  const [probDifficulty, setProbDifficulty] = useState("easy");

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

  const codingCategories = ["Arrays", "Strings", "Linked Lists", "Stack", "Queue", "Trees", "Graphs"];

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await API.get("/admin/stats");
      setStats(statsRes.data);

      const qRes = await API.get("/admin/questions");
      setQuestions(qRes.data);

      const pRes = await API.get("/admin/problems");
      setProblems(pRes.data);
    } catch (error) {
      toast.error("Failed to load admin panel data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Question Submissions ---
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();

    const cleanedOptions = options.filter((o) => o.trim() !== "");
    if (cleanedOptions.length < 2) {
      return toast.error("Provide at least 2 options for the question.");
    }

    const payload = {
      questionText,
      options: cleanedOptions,
      correctAnswer,
      type: qType,
      category: qCategory,
      difficulty: qDifficulty,
      explanation: qExplanation
    };

    try {
      if (questionId) {
        // Edit Mode
        await API.put(`/admin/questions/${questionId}`, payload);
        toast.success("Question updated!");
      } else {
        // Create Mode
        await API.post("/admin/questions", payload);
        toast.success("Question created successfully!");
      }
      resetQuestionForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to save question.");
    }
  };

  const handleEditQuestion = (q) => {
    setQuestionId(q._id);
    setQuestionText(q.questionText);
    setOptions(q.options.concat(["", "", "", ""]).slice(0, 4)); // pad to 4 elements
    setCorrectAnswer(q.correctAnswer);
    setQType(q.type);
    setQCategory(q.category);
    setQDifficulty(q.difficulty);
    setQExplanation(q.explanation);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await API.delete(`/admin/questions/${qId}`);
      toast.success("Question deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete question.");
    }
  };

  const resetQuestionForm = () => {
    setQuestionId(null);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setQType("mcq");
    setQCategory("Aptitude");
    setQDifficulty("easy");
    setQExplanation("");
  };

  // --- Problem Submissions ---
  const handleProblemSubmit = async (e) => {
    e.preventDefault();

    const constraintsArr = probConstraints
      .split("\n")
      .filter((c) => c.trim() !== "");

    const payload = {
      title: probTitle,
      description: probDesc,
      constraints: constraintsArr,
      category: probCategory,
      difficulty: probDifficulty
    };

    try {
      if (problemId) {
        await API.put(`/admin/problems/${problemId}`, payload);
        toast.success("Coding problem updated!");
      } else {
        await API.post("/admin/problems", payload);
        toast.success("Coding problem created successfully!");
      }
      resetProblemForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to save problem.");
    }
  };

  const handleEditProblem = (p) => {
    setProblemId(p._id);
    setProbTitle(p.title);
    setProbDesc(p.description);
    setProbConstraints(p.constraints ? p.constraints.join("\n") : "");
    setProbCategory(p.category);
    setProbDifficulty(p.difficulty);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteProblem = async (pId) => {
    if (!window.confirm("Are you sure you want to delete this coding problem?")) return;
    try {
      await API.delete(`/admin/problems/${pId}`);
      toast.success("Coding problem deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete coding problem.");
    }
  };

  const resetProblemForm = () => {
    setProblemId(null);
    setProbTitle("");
    setProbDesc("");
    setProbConstraints("");
    setProbCategory("Arrays");
    setProbDifficulty("easy");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <LoadingSkeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center space-x-2">
          <FiShield className="text-rose-500" />
          <span>Admin Controls</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Manage questions bank and programming challenges for the PrepMaster AI platform
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-500 gap-6">
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-3 transition-colors ${
            activeTab === "stats" ? "text-primary-500 border-b-2 border-primary-500" : "hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Overview Stats
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`pb-3 transition-colors ${
            activeTab === "questions" ? "text-primary-500 border-b-2 border-primary-500" : "hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Manage Exam Questions
        </button>
        <button
          onClick={() => setActiveTab("problems")}
          className={`pb-3 transition-colors ${
            activeTab === "problems" ? "text-primary-500 border-b-2 border-primary-500" : "hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Manage Coding Problems
        </button>
      </div>

      {/* Tab: Overview Stats */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Platform Students</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {stats.totalUsers}
            </h3>
          </div>
          <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Exam Questions</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {stats.totalQuestions}
            </h3>
          </div>
          <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Coding Problems</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {stats.totalProblems}
            </h3>
          </div>
        </div>
      )}

      {/* Tab: Questions CRUD */}
      {activeTab === "questions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Add/Edit Form */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
              {questionId ? "Edit Exam Question" : "Add Exam Question"}
            </h3>

            <form onSubmit={handleQuestionSubmit} className="space-y-4 text-xs font-bold">
              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="text-slate-600 dark:text-slate-400">Question Text</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl font-semibold dark:text-white focus:outline-none h-24"
                  required
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="text-slate-600 dark:text-slate-400">Options</label>
                {options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[idx] = e.target.value;
                      setOptions(updated);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-xl font-semibold dark:text-white focus:outline-none"
                    required
                  />
                ))}
              </div>

              {/* Correct Answer */}
              <div className="space-y-1.5">
                <label className="text-slate-600 dark:text-slate-400">Correct Answer</label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Should match the correct option text exactly"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-darkBorder rounded-2xl font-semibold dark:text-white focus:outline-none"
                  required
                />
              </div>

              {/* Parameters: Type, Category, Difficulty */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase">Type</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold dark:text-white"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="boolean">T / F</option>
                    <option value="select">Multi-Select</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase">Category</label>
                  <select
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase">Diff</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold dark:text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <label className="text-slate-600 dark:text-slate-400">Explanation</label>
                <textarea
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl font-semibold dark:text-white focus:outline-none h-16"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold transition-all"
                >
                  Save Question
                </button>
                {questionId && (
                  <button
                    type="button"
                    onClick={resetQuestionForm}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List existing */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6 max-h-[600px] overflow-y-auto">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
              Questions Bank ({questions.length})
            </h3>
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {questions.map((q) => (
                <div key={q._id} className="pt-4 first:pt-0 flex items-start justify-between space-x-4">
                  <div className="flex-1 space-y-1.5">
                    <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 font-bold uppercase rounded-lg">
                      {q.category} • {q.difficulty}
                    </span>
                    <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                      {q.questionText}
                    </h5>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditQuestion(q)}
                      className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20"
                    >
                      <FiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Coding Problems CRUD */}
      {activeTab === "problems" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Add/Edit Form */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
              {problemId ? "Edit Coding Problem" : "Add Coding Problem"}
            </h3>

            <form onSubmit={handleProblemSubmit} className="space-y-4 text-xs font-bold">
              {/* Problem Title */}
              <div className="space-y-1.5">
                <label className="text-slate-600 dark:text-slate-400">Problem Title</label>
                <input
                  type="text"
                  value={probTitle}
                  onChange={(e) => setProbTitle(e.target.value)}
                  placeholder="e.g. Find Duplicates"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-darkBorder rounded-2xl font-semibold dark:text-white focus:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-slate-600 dark:text-slate-400">Description</label>
                <textarea
                  value={probDesc}
                  onChange={(e) => setProbDesc(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-darkBorder rounded-2xl font-semibold dark:text-white focus:outline-none h-28"
                  required
                />
              </div>

              {/* Constraints */}
              <div className="space-y-1.5">
                <label className="text-slate-600 dark:text-slate-400">Constraints (New line per constraint)</label>
                <textarea
                  value={probConstraints}
                  onChange={(e) => setProbConstraints(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-darkBorder rounded-2xl font-semibold dark:text-white focus:outline-none h-20"
                />
              </div>

              {/* Category & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase">Category</label>
                  <select
                    value={probCategory}
                    onChange={(e) => setProbCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold dark:text-white"
                  >
                    {codingCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase">Difficulty</label>
                  <select
                    value={probDifficulty}
                    onChange={(e) => setProbDifficulty(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold dark:text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold transition-all"
                >
                  Save Coding Problem
                </button>
                {problemId && (
                  <button
                    type="button"
                    onClick={resetProblemForm}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List existing */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6 max-h-[600px] overflow-y-auto">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
              Coding Challenges Bank ({problems.length})
            </h3>
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {problems.map((p) => (
                <div key={p._id} className="pt-4 first:pt-0 flex items-start justify-between space-x-4">
                  <div className="flex-1 space-y-1.5">
                    <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 font-bold uppercase rounded-lg">
                      {p.category} • {p.difficulty}
                    </span>
                    <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                      {p.title}
                    </h5>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditProblem(p)}
                      className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProblem(p._id)}
                      className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20"
                    >
                      <FiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
