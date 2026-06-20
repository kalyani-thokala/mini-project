import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { FiChevronLeft, FiPlay, FiBookOpen, FiTerminal } from "react-icons/fi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function CodingWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Template functions for each language
  const templates = {
    javascript: `// Write your JavaScript solution below\n\nfunction solve(nums, target) {\n    // Write your code here\n    return [];\n}`,
    python: `# Write your Python solution below\n\ndef solve(nums, target):\n    # Write your code here\n    pass`,
    java: `// Write your Java solution below\n\nimport java.util.*;\n\npublic class Solution {\n    public int[] solve(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await API.get(`/code/problems/${id}`);
        setProblem(res.data);
      } catch (error) {
        console.error("Failed to load coding problem details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  // Sync code with selected language template
  useEffect(() => {
    if (problem) {
      setCode(templates[language]);
    }
  }, [language, problem]);

  const handleSubmitReview = async () => {
    if (code.trim().length < 20) {
      return toast.error("Please write a meaningful code solution before submitting.");
    }

    try {
      setSubmitting(true);
      const res = await API.post("/code/submit", {
        problemId: id,
        language,
        code
      });

      toast.success("AI Code Review completed successfully!");
      navigate(`/coding/review/${res.data._id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete AI review. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LoadingSkeleton className="h-96 rounded-3xl" />
          <LoadingSkeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-6 text-center text-rose-500 font-bold bg-rose-50 dark:bg-rose-955/20 rounded-2xl border border-rose-100 max-w-xl mx-auto">
        Problem not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Workspace Header */}
      <div className="flex justify-between items-center p-4 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-premium">
        <Link
          to="/coding"
          className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold"
        >
          <FiChevronLeft />
          <span>Back to Challenges</span>
        </Link>

        <div className="flex items-center space-x-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-xl text-xs font-bold dark:text-white focus:outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <button
            onClick={handleSubmitReview}
            disabled={submitting}
            className="px-5 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiPlay />
                <span>Submit AI Review</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Description */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6 max-h-[600px] overflow-y-auto">
          <div>
            <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-xl text-[10px] font-bold text-slate-500">
              {problem.category}
            </span>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-3">
              {problem.title}
            </h3>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Description
            </h4>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {problem.description}
            </p>
          </div>

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Constraints
              </h4>
              <ul className="text-xs font-bold space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Examples
              </h4>
              {problem.examples.map((ex, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2.5 text-xs font-semibold"
                >
                  <p className="text-primary-500 font-bold">Example {i + 1}</p>
                  <div>
                    <span className="text-slate-400 font-bold uppercase">Input:</span>{" "}
                    <code className="bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                      {ex.input}
                    </code>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase">Output:</span>{" "}
                    <code className="bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                      {ex.output}
                    </code>
                  </div>
                  {ex.explanation && (
                    <p className="text-slate-500 leading-relaxed">
                      <span className="font-bold text-slate-400 uppercase">Explanation:</span>{" "}
                      {ex.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Code Editor (Simple Textarea styled as IDE) */}
        <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-800 shadow-premium flex flex-col h-[600px] justify-between">
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center space-x-1.5">
                <FiTerminal />
                <span>Source Editor</span>
              </span>
              <span>UTF-8</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-slate-950/80 p-4 border border-slate-800 rounded-2xl text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-slate-700 resize-none leading-relaxed"
              style={{ tabSize: 4 }}
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-bold">
            <span>PrepMaster Compiler Emulator v1.0</span>
            <span>Tab: 4 spaces</span>
          </div>
        </div>
      </div>
    </div>
  );
}
