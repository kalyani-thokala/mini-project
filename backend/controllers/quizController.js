import {
  generateMCQQuiz,
  generateInterviewFollowUp,
  generateRoleTips
} from "../services/aiService.js";

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

export const generateFollowUp = async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ message: "Question and answer are required" });
  }

  const followUp = await generateInterviewFollowUp(question, answer);
  return res.json({ followUp });
};

export const generateTips = async (req, res) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  const tips = await generateRoleTips(role);
  return res.json({ tips });
};
