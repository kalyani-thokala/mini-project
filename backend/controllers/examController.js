import ExamQuestion from "../models/ExamQuestion.js";
import Exam from "../models/Exam.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { generateExamRecommendations, generateExamQuestionsAi } from "../services/aiService.js";
import { updateUserTopicPerformance } from "../services/performanceService.js";
import { checkAndUnlockAchievements } from "../services/achievementService.js";

// Shuffle array helper
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Generate an exam using Adaptive Learning, Retake priority, Topic balancing, and Source configuration
export const generateExam = async (req, res) => {
  try {
    const { category, difficulty, count, source } = req.body;
    const userId = req.user.id;

    let targetCount = parseInt(count) || 10;
    if (targetCount < 10) targetCount = 10;
    if (targetCount > 20) targetCount = 20;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(444).json({ message: "User not found" });
    }

    const examSource = source || "database"; // database, ai, mixed

    let dbCount = targetCount;
    let aiCount = 0;

    if (examSource === "mixed") {
      dbCount = Math.round(targetCount * 0.7);
      aiCount = targetCount - dbCount;
    } else if (examSource === "ai") {
      dbCount = 0;
      aiCount = targetCount;
    }

    let finalQuestions = [];

    // 1. Fetch DB Questions using Retake Priority and Topic Balancing
    if (dbCount > 0) {
      let dbQuestions = await ExamQuestion.find({ category, difficulty });
      if (dbQuestions.length < dbCount) {
        dbQuestions = await ExamQuestion.find({ category });
      }

      if (dbQuestions.length > 0) {
        // Shuffle options for all candidate questions
        dbQuestions = dbQuestions.map(q => {
          const qJson = q.toJSON();
          qJson.options = shuffle(qJson.options);
          return qJson;
        });

        // Group past attempts
        const attemptsMap = {};
        (user.attemptedQuestions || []).forEach(att => {
          attemptsMap[att.questionId] = att;
        });

        // Split into Unseen, Incorrect, and Older
        const unseen = [];
        const incorrect = [];
        const older = [];

        dbQuestions.forEach(q => {
          const attempt = attemptsMap[q._id.toString()];
          if (!attempt) {
            unseen.push(q);
          } else if (!attempt.wasCorrect) {
            incorrect.push(q);
          } else {
            older.push({ q, attemptedAt: new Date(attempt.attemptedAt) });
          }
        });

        // Sort older by attemptedAt ascending (older first)
        older.sort((a, b) => a.attemptedAt - b.attemptedAt);
        const sortedOlder = older.map(o => o.q);

        // Group candidates by topic for balancing
        const topics = [...new Set(dbQuestions.map(q => q.topic))];
        const topicsMap = {};
        topics.forEach(t => {
          topicsMap[t] = { unseen: [], incorrect: [], older: [] };
        });

        unseen.forEach(q => topicsMap[q.topic]?.unseen.push(q));
        incorrect.forEach(q => topicsMap[q.topic]?.incorrect.push(q));
        sortedOlder.forEach(q => topicsMap[q.topic]?.older.push(q));

        // Draw questions keeping balanced distribution
        let selectedDb = [];
        let addedIds = new Set();

        // Target count per topic
        const targetPerTopic = Math.ceil(dbCount / topics.length);

        // First pass: Draw from Unseen & Incorrect per topic
        topics.forEach(topic => {
          const pool = [...topicsMap[topic].unseen, ...topicsMap[topic].incorrect];
          const drawn = pool.slice(0, targetPerTopic);
          drawn.forEach(q => {
            selectedDb.push(q);
            addedIds.add(q._id.toString());
          });
        });

        // Second pass: Fill up to dbCount using remaining priority lists
        if (selectedDb.length < dbCount) {
          const priorityPool = [...unseen, ...incorrect, ...sortedOlder];
          for (const q of priorityPool) {
            if (selectedDb.length >= dbCount) break;
            if (!addedIds.has(q._id.toString())) {
              selectedDb.push(q);
              addedIds.add(q._id.toString());
            }
          }
        }

        finalQuestions = selectedDb;
      }
    }

    // 2. Fetch AI-Generated Questions if selected
    if (aiCount > 0) {
      try {
        console.log(`Calling Gemini to generate ${aiCount} exam questions...`);
        const aiQuestions = await generateExamQuestionsAi(category, difficulty, aiCount);
        
        // Save generated questions to database for future caching
        const savedAI = await ExamQuestion.insertMany(
          aiQuestions.map(q => ({
            ...q,
            isTemplateGenerated: true
          }))
        );

        savedAI.forEach(q => {
          const qJson = q.toJSON();
          qJson.options = shuffle(qJson.options); // Shuffle options
          finalQuestions.push(qJson);
        });
      } catch (aiError) {
        console.error("Failed to generate AI questions, falling back to database questions:", aiError);
        // Fallback: fill the remaining capacity from database
        let fallbackDb = await ExamQuestion.find({ category });
        fallbackDb = shuffle(fallbackDb).slice(0, aiCount);
        fallbackDb.forEach(q => {
          const qJson = q.toJSON();
          qJson.options = shuffle(qJson.options);
          finalQuestions.push(qJson);
        });
      }
    }

    // Normalize responses: verify each object contains question, questionText, options, correctAnswer
    const normalizedQuestions = finalQuestions.map(q => {
      const qObj = typeof q.toJSON === "function" ? q.toJSON() : q;
      const text = qObj.question || qObj.questionText || qObj.title || "Question failed to load";
      return {
        ...qObj,
        question: text,
        questionText: text,
        options: Array.isArray(qObj.options) && qObj.options.length > 0 ? qObj.options : ["True", "False"],
        correctAnswer: qObj.correctAnswer || "",
        explanation: qObj.explanation || ""
      };
    });

    // Shuffle the final question order
    res.json(shuffle(normalizedQuestions).slice(0, targetCount));
  } catch (error) {
    console.error("Generate Exam error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Submit and Grade Mock Exam
export const submitExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, answers, completionTime, questionsList } = req.body;

    if (!questionsList || !answers) {
      return res.status(400).json({ message: "Invalid submission data" });
    }

    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;
    let attemptedCount = 0;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(444).json({ message: "User not found" });
    }

    const topicStats = {}; // To group scores by topic

    questionsList.forEach((q) => {
      const userAnswer = answers[q._id];
      const isAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";
      
      let isCorrect = false;
      if (isAttempted) {
        attemptedCount++;
        if (String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          correctAnswersCount++;
          isCorrect = true;
        } else {
          wrongAnswersCount++;
        }
      }

      // Initialize topicStats object
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0 };
      }
      topicStats[q.topic].total += 1;
      if (isCorrect) {
        topicStats[q.topic].correct += 1;
      }

      // Save question attempt record on user
      user.attemptedQuestions.push({
        questionId: q._id.toString(),
        attemptedAt: new Date(),
        score: isCorrect ? 100 : 0,
        wasCorrect: isCorrect,
        category: q.category,
        topic: q.topic
      });

      // Update topic-wise user performance stats
      updateUserTopicPerformance(userId, q.category, q.topic, isCorrect, isCorrect ? 100 : 0);
    });

    const totalQuestions = questionsList.length;
    const score = correctAnswersCount;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Calculate topic scores, strong areas, and weak areas
    const topicScores = {};
    const strongAreas = [];
    const weakAreas = [];

    Object.keys(topicStats).forEach(topic => {
      const stats = topicStats[topic];
      const topicPct = Math.round((stats.correct / stats.total) * 100);
      topicScores[topic] = topicPct;

      if (topicPct >= 75) {
        strongAreas.push(topic);
      } else if (topicPct < 60) {
        weakAreas.push(topic);
      }
    });

    // Call Gemini for qualitative feedback recommendations
    let aiFeedback;
    try {
      aiFeedback = await generateExamRecommendations(category, score, totalQuestions);
    } catch (err) {
      console.error("Gemini feedback failed, using fallback:", err);
      aiFeedback = `You scored ${percentage}% in ${category}. Practice core concepts, especially in ${weakAreas.join(", ") || "weaker areas"}.`;
    }

    const examResult = await Exam.create({
      userId,
      category,
      score,
      totalQuestions,
      percentage,
      attemptedQuestions: attemptedCount,
      correctAnswers: correctAnswersCount,
      wrongAnswers: totalQuestions - correctAnswersCount,
      completionTime,
      feedback: aiFeedback,
      topicScores,
      strongAreas,
      weakAreas
    });

    // Update cumulative user scores
    user.totalExams += 1;
    user.averageScore = Math.round(
      ((user.averageScore * (user.totalExams - 1)) + percentage) / user.totalExams
    );
    await user.save();

    // Create completed exam notification
    await Notification.create({
      userId,
      title: "Exam Completed",
      message: `You completed the ${category} Mock Exam and scored ${percentage}% (${score}/${totalQuestions}).`,
      type: "exam"
    });

    // Check and trigger achievements unlocks
    await checkAndUnlockAchievements(userId, "exam", percentage);

    res.status(201).json(examResult);
  } catch (error) {
    console.error("Submit Exam Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Exam History
export const getExamHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Exam.find({ userId }).sort({ completedAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Exam Result
export const getExamResult = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam result not found" });
    }

    if (exam.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
