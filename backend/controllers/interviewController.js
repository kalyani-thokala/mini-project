import { generateInterviewQuestions, evaluateInterview } from "../services/aiService.js";
import InterviewResult from "../models/InterviewResult.js";
import InterviewQuestion from "../models/InterviewQuestion.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { updateUserTopicPerformance } from "../services/performanceService.js";
import { checkAndUnlockAchievements } from "../services/achievementService.js";

// Shuffle helper
const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

// Generate Interview Questions using AI or Balanced Database Questions
export const generateQuestions = async (req, res) => {
  try {
    const { role, difficulty, count } = req.body;
    const targetCount = count || 3;

    // Smart Database Interview Question Engine
    let dbQuestions = await InterviewQuestion.find({ role, difficulty });
    if (dbQuestions.length < targetCount) {
      dbQuestions = await InterviewQuestion.find({ role });
    }
    if (dbQuestions.length < targetCount) {
      dbQuestions = await InterviewQuestion.find({});
    }

    let selectedQuestions = [];
    if (dbQuestions.length > 0) {
      // Group by topic for advanced topic balancing
      const topics = [...new Set(dbQuestions.map(q => q.topic))];
      const topicsMap = {};
      topics.forEach(t => { topicsMap[t] = []; });
      dbQuestions.forEach(q => topicsMap[q.topic].push(q));

      const targetPerTopic = Math.ceil(targetCount / topics.length);
      topics.forEach(topic => {
        const pool = topicsMap[topic];
        const drawn = shuffle(pool).slice(0, targetPerTopic);
        drawn.forEach(q => {
          selectedQuestions.push({
            questionText: q.question,
            type: q.topic
          });
        });
      });
    }

    // Ensure correct count
    selectedQuestions = shuffle(selectedQuestions).slice(0, targetCount);

    // If still empty or insufficient, call Gemini fallback
    if (selectedQuestions.length === 0) {
      try {
        selectedQuestions = await generateInterviewQuestions(role, difficulty, targetCount);
      } catch (err) {
        selectedQuestions = Array.from({ length: targetCount }, (_, i) => ({
          questionText: `Explain key concepts of your experience as a ${role} (${difficulty}).`,
          type: "Technical"
        }));
      }
    }

    res.json(selectedQuestions);
  } catch (error) {
    console.error("Generate interview questions error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const submitInterview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, difficulty, questions, answers, transcript, warningCount, timeSpent } = req.body;

    // Validate inputs
    let formattedQuestions = [];
    if (questions && Array.isArray(questions)) {
      formattedQuestions = questions.map((q, idx) => {
        const questionText = typeof q === "string" ? q : (q.questionText || q.question || "");
        const type = typeof q === "string" ? "Technical" : (q.type || "technical");
        const userAnswer = answers && Array.isArray(answers) ? (answers[idx] || "") : (q.userAnswer || "");
        const transVal = transcript && Array.isArray(transcript) ? (transcript[idx] || "") : (q.transcript || "");
        return {
          questionText,
          type,
          userAnswer,
          transcript: transVal
        };
      });
    } else if (req.body.questions && Array.isArray(req.body.questions)) {
      formattedQuestions = req.body.questions.map(q => ({
        questionText: q.questionText,
        type: q.type || "technical",
        userAnswer: q.userAnswer || "",
        transcript: q.transcript || ""
      }));
    }

    if (formattedQuestions.length === 0) {
      return res.status(400).json({ message: "No interview questions answered." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(444).json({ message: "User not found" });
    }

    // Call Gemini AI evaluation service
    let evaluation;
    try {
      evaluation = await evaluateInterview(role, difficulty, formattedQuestions);
    } catch (err) {
      console.error("Gemini Interview Eval error, using fallback:", err);
      // Failover fallback structure
      evaluation = {
        score: 70,
        confidenceScore: 70,
        communicationScore: 70,
        technicalScore: 70,
        feedback: "AI evaluation temporarily unavailable",
        strengths: ["Answer submitted successfully"],
        weaknesses: ["AI evaluation temporarily unavailable"],
        improvements: ["Try again later"],
        idealAnswer: "Evaluation unavailable",
        questions: formattedQuestions.map(q => ({
          questionText: q.questionText,
          type: q.type,
          userAnswer: q.userAnswer,
          transcript: q.transcript || "",
          score: 70,
          strengths: "Answer submitted successfully",
          weaknesses: "AI evaluation temporarily unavailable",
          improvements: "Try again later",
          idealAnswer: "Evaluation unavailable"
        }))
      };
    }

    // Ensure transcripts are persisted in evaluation questions
    if (evaluation.questions && Array.isArray(evaluation.questions)) {
      evaluation.questions = evaluation.questions.map((eq, idx) => {
        const transVal = formattedQuestions[idx]?.transcript || "";
        return {
          ...eq,
          transcript: eq.transcript || transVal
        };
      });
    }

    // Save result to MongoDB
    const result = await InterviewResult.create({
      userId,
      role,
      difficulty,
      score: evaluation.score || 70,
      confidenceScore: evaluation.confidenceScore || 70,
      communicationScore: evaluation.communicationScore || 70,
      technicalScore: evaluation.technicalScore || 70,
      warningCount: warningCount || 0,
      timeSpent: timeSpent || 0,
      feedback: evaluation.feedback || "",
      questions: evaluation.questions
    });

    // Populate question-by-question InterviewFeedback collection
    for (const q of evaluation.questions) {
      await InterviewFeedback.create({
        interviewId: result._id,
        question: q.questionText,
        answer: q.userAnswer,
        score: q.score,
        strengths: typeof q.strengths === "string" ? q.strengths : JSON.stringify(q.strengths),
        weaknesses: typeof q.weaknesses === "string" ? q.weaknesses : JSON.stringify(q.weaknesses),
        improvements: typeof q.improvements === "string" ? q.improvements : JSON.stringify(q.improvements),
        idealAnswer: q.idealAnswer
      });

      // Update topic performance stats
      await updateUserTopicPerformance(userId, "Interview", q.type, q.score >= 50, q.score);
    }

    // Update cumulative user scores
    user.totalInterviews += 1;
    await user.save();

    // Create completed interview notification
    await Notification.create({
      userId,
      title: "Interview Completed",
      message: `You completed the ${role} mock interview. Evaluated Score: ${evaluation.score}/100.`,
      type: "interview"
    });

    // Check and unlock achievements
    await checkAndUnlockAchievements(userId, "interview", evaluation.score);

    // Return properties as arrays/strings conforming to response expectations
    const resultJson = result.toJSON();
    resultJson.strengths = evaluation.strengths || [];
    resultJson.weaknesses = evaluation.weaknesses || [];
    resultJson.improvements = evaluation.improvements || [];
    resultJson.idealAnswer = evaluation.idealAnswer || "";

    res.status(201).json(resultJson);
  } catch (error) {
    console.error("Submit Interview Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Interview History
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await InterviewResult.find({ userId }).sort({ submittedAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Interview Details
export const getInterviewDetails = async (req, res) => {
  try {
    const interview = await InterviewResult.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview result not found" });
    }

    if (interview.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
