import Exam from "../models/Exam.js";
import InterviewResult from "../models/InterviewResult.js";
import CodingSubmission from "../models/CodingSubmission.js";
import User from "../models/User.js";
import UserPerformance from "../models/UserPerformance.js";
import { getDashboardRecommendations } from "../services/aiService.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalExams,
      totalInterviews,
      totalCodingChallenges,
      exams,
      user,
      performances,
      recentExams,
      recentInterviews,
      recentCoding
    ] = await Promise.all([
      Exam.countDocuments({ userId }),
      InterviewResult.countDocuments({ userId }),
      CodingSubmission.countDocuments({ userId }),
      Exam.find({ userId }).lean(),
      User.findById(userId),
      UserPerformance.find({ userId }).lean(),
      Exam.find({ userId }).sort({ completedAt: -1 }).limit(3).lean(),
      InterviewResult.find({ userId }).sort({ submittedAt: -1 }).limit(3).lean(),
      CodingSubmission.find({ userId })
        .populate("problemId", "title")
        .sort({ submittedAt: -1 })
        .limit(3)
        .lean()
    ]);

    let averageScore = null;
    if (exams.length > 0) {
      const sum = exams.reduce((acc, curr) => acc + curr.percentage, 0);
      averageScore = Math.round(sum / exams.length);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.totalExams = totalExams;
    user.totalInterviews = totalInterviews;
    user.totalCodingChallenges = totalCodingChallenges;
    user.averageScore = averageScore ?? 0;
    
    // Calculate practice hours (e.g. 15m per exam, 30m per interview, 30m per code submission)
    const computedHours = Math.round((totalExams * 15 + totalInterviews * 30 + totalCodingChallenges * 30) / 60);
    user.practiceHours = computedHours;
    await user.save();

    const completedTopics = performances.filter(p => p.averageScore >= 60).map(p => p.topic);
    const completedTopicsCount = completedTopics.length;
    const totalTopicsCount = 43; // total subtopics across 10 categories
    const remainingTopicsCount = Math.max(0, totalTopicsCount - completedTopicsCount);

    const activities = [];

    recentExams.forEach((e) => {
      activities.push({
        id: e._id,
        type: "exam",
        title: `Completed ${e.category} Exam`,
        description: `Scored ${e.score}/${e.totalQuestions} (${e.percentage}%)`,
        date: e.completedAt
      });
    });

    recentInterviews.forEach((i) => {
      activities.push({
        id: i._id,
        type: "interview",
        title: `Completed ${i.role} Mock Panel`,
        description: `Evaluation Score: ${i.score}/100`,
        date: i.submittedAt || i.completedAt
      });
    });

    recentCoding.forEach((c) => {
      activities.push({
        id: c._id,
        type: "coding",
        title: `Code Review: ${c.problemId?.title || "Coding Challenge"}`,
        description: `Evaluation Grade: ${c.score}/10`,
        date: c.submittedAt || c.completedAt
      });
    });

    // Sort combined activities by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivities = activities.slice(0, 5);

    // Get category performance for AI recommendation engine
    const categoryStats = {};
    exams.forEach((e) => {
      if (!categoryStats[e.category]) {
        categoryStats[e.category] = [];
      }
      categoryStats[e.category].push(e.percentage);
    });

    const categoryPerformance = {};
    Object.keys(categoryStats).forEach((cat) => {
      const sum = categoryStats[cat].reduce((a, b) => a + b, 0);
      categoryPerformance[cat] = Math.round(sum / categoryStats[cat].length);
    });

    // Best and weakest categories
    let bestCategory = "None";
    let weakestCategory = "None";
    const catEntries = Object.entries(categoryPerformance);
    if (catEntries.length > 0) {
      catEntries.sort((a, b) => b[1] - a[1]);
      bestCategory = catEntries[0][0];
      weakestCategory = catEntries[catEntries.length - 1][0];
    }

    // Call Gemini for recommended topics
    let recommendations = [];
    const hasActivity = totalExams + totalInterviews + totalCodingChallenges > 0;
    if (hasActivity) {
      const recommendationFallback = [
        "Complete a focused mock exam in your weakest category.",
        "Solve one coding challenge under timed conditions.",
        "Schedule a mock interview and review the feedback afterward."
      ];

      try {
        recommendations = await Promise.race([
          getDashboardRecommendations({
            averageScore,
            totalExams,
            totalInterviews,
            totalCodingChallenges,
            categoryPerformance
          }),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Recommendation request timed out")), 6000);
          })
        ]);
      } catch {
        recommendations = recommendationFallback;
      }
    }

    res.json({
      totalExams,
      totalInterviews,
      totalCodingChallenges,
      averageScore,
      recentActivities,
      recommendedTopics: recommendations,
      learningStreak: user.learningStreak,
      practiceHours: user.practiceHours,
      completedTopicsCount,
      remainingTopicsCount,
      bestCategory,
      weakestCategory,
      achievements: user.achievements || []
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Dashboard metrics could not be loaded" });
  }
};
