import { generateMCQQuiz } from "../services/aiService.js";

export const generateQuiz = async (req, res) => {
  try {
    const { role, difficulty, count } = req.body;

    const questions = await generateMCQQuiz(
      role,
      difficulty,
      count
    );

    res.json(questions);

  } catch (error) {

    console.error(error);

    // Fallback questions
    const fallbackQuestions = [
      {
        question: "What is React?",
        options: [
          "Database",
          "JavaScript Library",
          "Programming Language",
          "Operating System"
        ],
        correctAnswer: "JavaScript Library",
        explanation:
          "React is a JavaScript library used for building user interfaces.",
        difficulty: "Beginner"
      },
      {
        question: "What is a component in React?",
        options: [
          "Database Table",
          "Reusable UI Block",
          "CSS File",
          "Browser Extension"
        ],
        correctAnswer: "Reusable UI Block",
        explanation:
          "Components are reusable building blocks of React applications.",
        difficulty: "Beginner"
      }
    ];

    res.json(fallbackQuestions);
  }
};