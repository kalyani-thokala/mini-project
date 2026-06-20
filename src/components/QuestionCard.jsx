import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function QuestionCard({
  question,
  idx,
  onAnswer,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (option) => {
    if (answered) return;

    setSelectedOption(option);
    setAnswered(true);

    const isCorrect =
      option === question.correctAnswer;

    if (onAnswer) {
      onAnswer(isCorrect);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-3xl p-6 shadow-premium"
    >
      {/* Question Number */}
      <div className="mb-4">
        <span className="px-3 py-1 rounded-xl bg-primary-50 text-primary-600 font-bold text-xs">
          Question {idx + 1}
        </span>
      </div>

      {/* Question */}
      {(() => {
        const questionText =
          question?.question ||
          question?.questionText ||
          question?.title ||
          "Question failed to load";
        return (
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
            {questionText}
          </h2>
        );
      })()}

      {/* Options */}
      <div className="space-y-3">
        {question.options?.map((option, index) => {
          let style =
            "border-slate-200 hover:border-primary-500";

          if (answered) {
            if (option === question.correctAnswer) {
              style =
                "border-emerald-500 bg-emerald-50";
            }

            if (
              option === selectedOption &&
              option !== question.correctAnswer
            ) {
              style =
                "border-red-500 bg-red-50";
            }
          }

          return (
            <button
              key={index}
              onClick={() =>
                handleSelect(option)
              }
              disabled={answered}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Result */}
      {answered && (
        <div className="mt-5">
          {selectedOption ===
          question.correctAnswer ? (
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <FiCheckCircle />
              Correct Answer
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <FiXCircle />
              Incorrect Answer
            </div>
          )}

          <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-semibold text-sm">
              Correct Answer:
            </p>

            <p className="text-primary-600 font-bold">
              {question.correctAnswer}
            </p>

            <p className="mt-3 text-sm text-slate-700">
              {question.explanation}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}