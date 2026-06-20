import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";
import AICache from "../models/AICache.js";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSy..." // placeholder fallback
);

// Helper to sanitize JSON response from Gemini
const sanitizeJSON = (text) => {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
};

// Caching helper functions
const getCache = async (type, payload) => {
  try {
    const rawString = type + "_" + JSON.stringify(payload);
    const hash = crypto.createHash("sha256").update(rawString).digest("hex");
    const cached = await AICache.findOne({ hash });
    if (cached) {
      console.log(`AICache HIT for type: ${type}`);
      return { cached: true, data: cached.response };
    }
    return { cached: false, hash };
  } catch (err) {
    console.error("Cache read error:", err);
    return { cached: false };
  }
};

const saveCache = async (hash, response, type) => {
  try {
    if (!hash) return;
    await AICache.create({ hash, response, type });
    console.log(`AICache stored for type: ${type}`);
  } catch (err) {
    console.error("Cache write error:", err);
  }
};

export async function generateInterviewQuestions(role, difficulty, count) {
  const cacheKey = { role, difficulty, count };
  const cacheLookup = await getCache("interview_questions", cacheKey);
  if (cacheLookup.cached) {
    return cacheLookup.data;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Generate exactly ${count} interview questions for a ${role} position at ${difficulty} difficulty.
Include a mix of "technical", "behavioral", and "hr" questions.

Return ONLY a valid JSON array of objects with the exact structure below. Do not output markdown, preambles, or postscripts.

[
  {
    "questionText": "Question description",
    "type": "technical" 
  },
  {
    "questionText": "Behavioral question description",
    "type": "behavioral"
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = sanitizeJSON(text);
    const parsed = JSON.parse(cleaned);
    await saveCache(cacheLookup.hash, parsed, "interview_questions");
    return parsed;
  } catch (error) {
    console.error("Gemini Interview Generation Error:", error);
    // Fallback interview questions
    return Array.from({ length: count }, (_, i) => ({
      questionText: `Sample ${difficulty} question #${i + 1} for ${role}. Explain key principles.`,
      type: i % 2 === 0 ? "technical" : "behavioral"
    }));
  }
}

export async function evaluateInterview(role, difficulty, QA_pairs) {
  const cacheKey = { role, difficulty, QA_pairs };
  const cacheLookup = await getCache("interview_eval", cacheKey);
  if (cacheLookup.cached) {
    return cacheLookup.data;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are an expert interviewer. Evaluate a user's mock interview responses for the role of ${role} (${difficulty} difficulty).
Below are the questions and user's answers:
${JSON.stringify(QA_pairs, null, 2)}

Evaluate each answer and provide:
1. An overall score (0 to 100).
2. A confidence score (0 to 100).
3. A communication score (0 to 100).
4. A technical score (0 to 100).
5. Overall feedback summary.
6. For each question: a score (0 to 100), key strengths, weaknesses, areas of improvement, and an ideal sample answer.

Return ONLY a valid JSON object matching this exact schema:
{
  "score": 85,
  "confidenceScore": 80,
  "communicationScore": 88,
  "technicalScore": 82,
  "feedback": "Overall summary feedback...",
  "questions": [
    {
      "questionText": "...",
      "type": "...",
      "userAnswer": "...",
      "score": 80,
      "strengths": "What they did well...",
      "weaknesses": "What was missing...",
      "improvements": "How to structure it better...",
      "idealAnswer": "Ideal sample answer text..."
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = sanitizeJSON(text);
    const parsed = JSON.parse(cleaned);
    await saveCache(cacheLookup.hash, parsed, "interview_eval");
    return parsed;
  } catch (error) {
    console.error("Gemini Interview Evaluation Error:", error);
    const evaluatedQuestions = QA_pairs.map((qa) => ({
      questionText: qa.questionText,
      type: qa.type,
      userAnswer: qa.userAnswer,
      score: 70,
      strengths: "Answer submitted successfully",
      weaknesses: "AI evaluation temporarily unavailable",
      improvements: "Try again later",
      idealAnswer: "Evaluation unavailable"
    }));
    return {
      score: 70,
      confidenceScore: 70,
      communicationScore: 70,
      technicalScore: 70,
      feedback: "AI evaluation temporarily unavailable",
      strengths: ["Answer submitted successfully"],
      weaknesses: ["AI evaluation temporarily unavailable"],
      improvements: ["Try again later"],
      idealAnswer: "Evaluation unavailable",
      questions: evaluatedQuestions
    };
  }
}

export async function reviewCode(problemTitle, problemDesc, language, code) {
  const cacheKey = { problemTitle, problemDesc, language, code };
  const cacheLookup = await getCache("code_review", cacheKey);
  if (cacheLookup.cached) {
    return cacheLookup.data;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are an AI Code Compiler and Reviewer. Evaluate the following coding solution:
Problem: ${problemTitle}
Description: ${problemDesc}
Language: ${language}
User's Code:
\`\`\`
${code}
\`\`\`

Perform a comprehensive review and check:
1. Logic correctness (does it solve the problem).
2. Code quality (readability, naming, best practices).
3. Time complexity (e.g. O(N log N)).
4. Space complexity (e.g. O(N)).
5. Potential bugs or edge cases.
6. Score out of 10 (integer).
7. List of strengths.
8. List of weaknesses.
9. Specific optimization suggestions.
10. A complete ideal solution code block.

Return ONLY a valid JSON object matching this exact schema:
{
  "score": 8,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improvements": ["Time complexity could be reduced using a hash map.", "..."],
  "idealSolution": "// Ideal code in the requested language...",
  "complexityAnalysis": "Time Complexity: O(N), Space Complexity: O(1)"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = sanitizeJSON(text);
    const parsed = JSON.parse(cleaned);
    await saveCache(cacheLookup.hash, parsed, "code_review");
    return parsed;
  } catch (error) {
    console.error("Gemini Code Review Error:", error);
    // Fallback code review
    return {
      score: 7,
      strengths: ["Code submitted successfully"],
      weaknesses: ["AI code review temporarily unavailable"],
      improvements: ["Try again later"],
      idealSolution: `// Sample Ideal solution for: ${problemTitle}\n// Language: ${language}\n// Implementation depends on actual constraints.`,
      complexityAnalysis: "Time Complexity: O(N), Space Complexity: O(1) fallback estimation"
    };
  }
}

export async function getDashboardRecommendations(stats) {
  const cacheKey = { stats };
  const cacheLookup = await getCache("dashboard_recommendations", cacheKey);
  if (cacheLookup.cached) {
    return cacheLookup.data;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Based on the student's current placement prep metrics:
- Average Exam Score: ${stats.averageScore}%
- Total Exams Completed: ${stats.totalExams}
- Total Interviews Completed: ${stats.totalInterviews}
- Total Coding Reviews: ${stats.totalCodingChallenges}
- Recent performance per category: ${JSON.stringify(stats.categoryPerformance || {})}

Formulate 3 brief, actionable placement recommendations (1-2 sentences each) for their dashboard.
Focus on weaker categories, balancing coding challenges with mock interview drills.

Return ONLY a JSON array of strings:
[
  "Your React score is consistently above 85%. Consider trying harder System Design questions.",
  "Your DBMS score is below 60%. Focus on normalization, Joins, and Indexing questions in mock exams.",
  "You haven't completed any backend coding challenges. Try solving Stack or Trees challenges."
]
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = sanitizeJSON(text);
    const parsed = JSON.parse(cleaned);
    await saveCache(cacheLookup.hash, parsed, "dashboard_recommendations");
    return parsed;
  } catch (error) {
    console.error("Gemini Dashboard Recommendations Error:", error);
    return [
      "Improve coding consistency by attempting 1 Easy array challenge daily.",
      "Your DBMS scores are below average. Focus on normalization concepts and query optimizations.",
      "Schedule a simulated Frontend mock interview to test your React components architectural knowledge."
    ];
  }
}

export async function generateExamRecommendations(category, score, totalQuestions) {
  const cacheKey = { category, score, totalQuestions };
  const cacheLookup = await getCache("exam_recommendations", cacheKey);
  if (cacheLookup.cached) {
    return cacheLookup.data;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const percentage = Math.round((score / totalQuestions) * 100);
  const prompt = `
Analyze a student's mock exam outcome:
- Category: ${category}
- Score: ${score}/${totalQuestions} (${percentage}%)

Provide a brief personal coaching feedback paragraph (max 3 sentences) with focus areas for improvement in ${category}.
Return plain text only, no JSON, no formatting, no intro.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    await saveCache(cacheLookup.hash, text, "exam_recommendations");
    return text;
  } catch (error) {
    console.error("Gemini Exam Recommendations Error:", error);
    return `You scored ${percentage}% in ${category}. Keep practicing core concepts, especially under timed pressure, and review explanations of any missed answers.`;
  }
}

// AI Question Generator for Exams
export async function generateExamQuestionsAi(category, difficulty, count) {
  const cacheKey = { category, difficulty, count };
  const cacheLookup = await getCache("exam_questions_ai", cacheKey);
  if (cacheLookup.cached) {
    return cacheLookup.data;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Generate exactly ${count} exam questions for the category "${category}" at "${difficulty}" difficulty.
For each question, provide:
1. The question text.
2. An array of exactly 4 options.
3. The correct answer (must match exactly one of the 4 options).
4. A brief explanation of the correct answer.

Return ONLY a valid JSON array of objects matching this exact schema:
[
  {
    "question": "Question text here...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Explanation here..."
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = sanitizeJSON(text);
    const parsed = JSON.parse(cleaned);
    const formatted = parsed.map((q, i) => ({
      ...q,
      category,
      difficulty,
      topic: "AI Generated"
    }));
    await saveCache(cacheLookup.hash, formatted, "exam_questions_ai");
    return formatted;
  } catch (error) {
    console.error("Gemini Exam Questions Generation Error:", error);
    throw error;
  }
}