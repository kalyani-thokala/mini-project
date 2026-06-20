import  { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  generateAIQuestions,
  generateAIRoleTips,
} from "../services/openai";

import { getMockQuestions, getMockTips } from "../data/mockQuestions";

import QuestionForm from "../components/QuestionForm";
import QuestionList from "../components/QuestionList";
import LoadingSkeleton from "../components/LoadingSkeleton";

import { FiChevronRight, FiBookOpen } from "react-icons/fi";

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function InterviewGenerator() {
  const { incrementGeneratedCount } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [questions, setQuestions] = useState([]);
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");
  const [tips, setTips] = useState([]);

  const handleFormSubmit = async (params) => {
    setIsLoading(true);

    setQuestions([]);
    setTips([]);

    setRole(params.role);
    setDifficulty(params.difficulty);
    setType(params.type);

    try {
      setLoadingMessage("Generating AI interview questions...");

      const aiQuestions = await generateAIQuestions(
        params.role,
        params.difficulty,
        params.type,
        params.count
      );

      setLoadingMessage("Generating preparation tips...");

      let aiTips = [];

      try {
        aiTips = await generateAIRoleTips(params.role);
      } catch (tipError) {
        console.error("Tips generation failed:", tipError);
        aiTips = getMockTips(params.role);
      }

      setQuestions(aiQuestions);
      setTips(aiTips);

      incrementGeneratedCount();

      toast.success("Interview questions generated successfully!");
    } catch (error) {
      console.error("AI Generation Error:", error);

      toast.error(
        "AI service unavailable. Loading offline interview database."
      );

      const localQuestions = getMockQuestions(
        params.role,
        params.difficulty,
        params.type,
        params.count
      );

      const localTips = getMockTips(params.role);

      setQuestions(localQuestions);
      setTips(localTips);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="space-y-8 pt-24"></div>
  <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
    AI Interview Generator
  </h1>

  <p className="mt-2 text-slate-500 dark:text-slate-400">
    Configure parameters to generate personalized interview preparation questions.
  </p>


        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary-500">
            Home
          </Link>

          <FiChevronRight className="w-3.5 h-3.5" />

          <span className="text-slate-800 dark:text-slate-200">
            Generator
          </span>
        </div>
      </div>

      {/* Form */}
      <QuestionForm
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      {/* Loading */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSkeleton message={loadingMessage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {!isLoading && questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Questions */}
          <div className="lg:col-span-8">
            <QuestionList
              questions={questions}
              role={role}
              difficulty={difficulty}
              type={type}
              canSave={true}
            />
          </div>

          {/* Tips */}
          {tips.length > 0 && (
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4">
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <FiBookOpen className="w-4 h-4" />
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Preparation Tips
                  </h3>
                </div>

                <div className="text-xs text-slate-400 dark:text-slate-500 leading-normal pb-2 border-b border-slate-100 dark:border-darkBorder">
                  Hiring suggestions compiled for{" "}
                  <strong>{role}</strong> roles.
                </div>

                <ul className="space-y-4">
                  {tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold font-mono">
                        {idx + 1}
                      </span>

                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}