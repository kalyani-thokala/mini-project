import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { FiClock, FiCheck, FiArrowLeft, FiArrowRight, FiFlag } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ExamSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Load configuration from state or fallback
  const { questions, category, difficulty, duration } = location.state || {};

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [timeLeft, setTimeLeft] = useState(duration || 300);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef(null);

  // Redirect if state is empty (e.g. direct access)
  useEffect(() => {
    if (!questions || questions.length === 0) {
      toast.error("Invalid exam session. Select a category first.");
      navigate("/exams");
    }
  }, [questions, navigate]);

  // Restore progress if it matches the current session
  useEffect(() => {
    const cachedExam = localStorage.getItem("prepmaster_active_exam");
    if (cachedExam) {
      const parsed = JSON.parse(cachedExam);
      if (parsed.id === id) {
        setAnswers(parsed.answers || {});
        setMarkedForReview(parsed.markedForReview || []);
        setTimeLeft(parsed.timeLeft || duration);
        setCurrentIdx(parsed.currentIdx || 0);
      }
    }
  }, [id, duration]);

  // Cache progress
  useEffect(() => {
    if (questions && questions.length > 0) {
      localStorage.setItem(
        "prepmaster_active_exam",
        JSON.stringify({
          id,
          answers,
          markedForReview,
          timeLeft,
          currentIdx
        })
      );
    }
  }, [answers, markedForReview, timeLeft, currentIdx, id, questions]);

  // Ticking Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const handleAutoSubmit = () => {
    toast.error("Time is up! Submitting exam automatically...");
    submitExamResult();
  };

  const handleAnswerSelect = (optionValue) => {
    const question = questions[currentIdx];
    if (question.type === "select") {
      // Multi-select handling (Array of answers)
      const currentAnswers = answers[question._id] || [];
      let updated;
      if (currentAnswers.includes(optionValue)) {
        updated = currentAnswers.filter((a) => a !== optionValue);
      } else {
        updated = [...currentAnswers, optionValue];
      }
      setAnswers({ ...answers, [question._id]: updated });
    } else {
      // MCQ or Boolean (String answer)
      setAnswers({ ...answers, [question._id]: optionValue });
    }
  };

  const toggleMarkForReview = () => {
    const qId = questions[currentIdx]._id;
    if (markedForReview.includes(qId)) {
      setMarkedForReview(markedForReview.filter((id) => id !== qId));
    } else {
      setMarkedForReview([...markedForReview, qId]);
    }
  };

  const submitExamResult = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      clearInterval(timerRef.current);

      const elapsedSeconds = (duration || 300) - timeLeft;

      const res = await API.post("/exams/submit", {
        category,
        answers,
        completionTime: elapsedSeconds,
        questionsList: questions
      });

      // Clear cached progress
      localStorage.removeItem("prepmaster_active_exam");

      toast.success("Exam submitted successfully!");
      navigate(`/exams/result/${res.data._id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit exam paper. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIdx];

  const questionText =
    currentQuestion?.question ||
    currentQuestion?.questionText ||
    currentQuestion?.title ||
    "Question failed to load";

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Session Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-3xl shadow-premium gap-4">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-white">
            {category} Assessment
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold capitalize mt-0.5">
            Difficulty: {difficulty} • Question {currentIdx + 1} of {questions.length}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/10 rounded-2xl font-bold text-sm">
            <FiClock />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={submitExamResult}
            disabled={isSubmitting}
            className="px-5 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold shadow-md transition-all text-sm flex items-center space-x-1.5"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiCheck />
                <span>Submit Exam</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Question Pane */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <div className="space-y-4">
            {/* Header info / Badges */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold capitalize">
                {currentQuestion?.difficulty || difficulty || "medium"}
              </span>
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold capitalize">
                {currentQuestion?.category || category || "general"}
              </span>
              <span className="px-3 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-450 rounded-xl text-xs font-bold uppercase">
                {currentQuestion?.type === "select" ? "Multiple Select" : "Single Choice"}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
              {questionText}
            </h2>
          </div>

          {/* Options input list */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const qId = currentQuestion._id;
              const isSelected =
                currentQuestion.type === "select"
                  ? (answers[qId] || []).includes(option)
                  : answers[qId] === option;

              return (
                <div
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 text-sm font-semibold select-none ${
                    isSelected
                      ? "bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400"
                      : "bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border font-bold text-xs ${
                      isSelected
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {isSelected && (currentQuestion.type === "select" ? "✓" : "●")}
                  </div>
                  <span>{option}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 disabled:opacity-40 rounded-xl font-bold transition-all text-xs flex items-center space-x-1"
            >
              <FiArrowLeft />
              <span>Previous</span>
            </button>

            <button
              onClick={toggleMarkForReview}
              className={`px-4 py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center space-x-1 ${
                markedForReview.includes(currentQuestion._id)
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400"
              }`}
            >
              <FiFlag />
              <span>Mark For Review</span>
            </button>

            <button
              onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
              disabled={currentIdx === questions.length - 1}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 disabled:opacity-40 rounded-xl font-bold transition-all text-xs flex items-center space-x-1"
            >
              <span>Next</span>
              <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Right Side: Navigation Grid */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
            Questions Navigator
          </h3>

          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const isAttempted = answers[q._id] !== undefined && answers[q._id] !== "";
              const isMarked = markedForReview.includes(q._id);

              let styleClass =
                "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800";
              if (isAttempted) {
                styleClass = "bg-emerald-500/15 border-emerald-500/35 text-emerald-500 font-bold";
              }
              if (isMarked) {
                styleClass = "bg-amber-500/15 border-amber-500/35 text-amber-500 font-bold";
              }
              if (isCurrent) {
                styleClass = "bg-primary-600 border-primary-600 text-white font-extrabold shadow-md shadow-primary-500/10";
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-10 h-10 rounded-xl text-xs flex items-center justify-center transition-all ${styleClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded bg-primary-600 border border-primary-600" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded bg-emerald-500/15 border border-emerald-500/30" />
              <span>Attempted</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded bg-amber-500/15 border border-amber-500/30" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800" />
              <span>Unattempted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
