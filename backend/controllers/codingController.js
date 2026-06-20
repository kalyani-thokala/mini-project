import CodingProblem from "../models/CodingProblem.js";
import CodingSubmission from "../models/CodingSubmission.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { reviewCode } from "../services/aiService.js";
import { updateUserTopicPerformance } from "../services/performanceService.js";
import { checkAndUnlockAchievements } from "../services/achievementService.js";

// Get All Coding Problems
export const getCodingProblems = async (req, res) => {
  try {
    const problems = await CodingProblem.find({});
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Coding Problem
export const getCodingProblemDetails = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Coding problem not found" });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit Code for AI Review
export const submitCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { problemId, language, code } = req.body;

    const problem = await CodingProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(444).json({ message: "User not found" });
    }

    // Call Gemini AI review service
    let review;
    try {
      review = await reviewCode(problem.title, problem.description, language, code);
    } catch (err) {
      console.error("Gemini code review failed, using fallback:", err);
      review = {
        score: 7,
        strengths: ["Code submitted successfully"],
        weaknesses: ["AI review temporarily unavailable"],
        improvements: ["Try again later"],
        idealSolution: `// Fallback Solution for ${problem.title}\n// Check your implementation constraints manually.`,
        complexityAnalysis: "Time Complexity: O(N), Space Complexity: O(1) fallback estimation"
      };
    }

    // Save to Database
    const submission = await CodingSubmission.create({
      userId,
      problemId,
      language,
      code,
      score: review.score,
      strengths: review.strengths,
      weaknesses: review.weaknesses,
      improvements: review.improvements,
      idealSolution: review.idealSolution,
      complexityAnalysis: review.complexityAnalysis
    });

    // Update topic-wise user performance stats
    await updateUserTopicPerformance(
      userId,
      "Coding",
      problem.category,
      review.score >= 7,
      review.score * 10
    );

    // Update cumulative user scores
    user.totalCodingChallenges += 1;
    await user.save();

    // Create completed code review notification
    await Notification.create({
      userId,
      title: "Coding Review Completed",
      message: `Your solution for "${problem.title}" was reviewed. Grade: ${review.score}/10.`,
      type: "coding"
    });

    // Check and unlock achievements
    await checkAndUnlockAchievements(userId, "coding", review.score * 10);

    res.status(201).json(submission);
  } catch (error) {
    console.error("Submit Code Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Code Submissions History
export const getSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await CodingSubmission.find({ userId })
      .populate("problemId", "title difficulty category")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Code Submission Details
export const getSubmissionDetails = async (req, res) => {
  try {
    const submission = await CodingSubmission.findById(req.params.id)
      .populate("problemId", "title description constraints examples category difficulty");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
