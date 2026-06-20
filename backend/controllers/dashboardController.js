import Exam from "../models/Exam.js";
import InterviewResult from "../models/InterviewResult.js";
import CodingSubmission from "../models/CodingSubmission.js";
import User from "../models/User.js";
import UserPerformance from "../models/UserPerformance.js";
import { getDashboardRecommendations } from "../services/aiService.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts
    const totalExams = await Exam.countDocuments({ userId });
    const totalInterviews = await InterviewResult.countDocuments({ userId });
    const totalCodingChallenges = await CodingSubmission.countDocuments({ userId });

    // Calculate Average Score across exams
    const exams = await Exam.find({ userId });
    let averageScore = 0;
    if (exams.length > 0) {
      const sum = exams.reduce((acc, curr) => acc + curr.percentage, 0);
      averageScore = Math.round(sum / exams.length);
    }

    // Update user record stats for cache consistency
    const user = await User.findById(userId);
    if (!user) {
      return res.status(444).json({ message: "User not found" });
    }

    user.totalExams = totalExams;
    user.totalInterviews = totalInterviews;
    user.totalCodingChallenges = totalCodingChallenges;
    user.averageScore = averageScore;
    
    // Calculate practice hours (e.g. 15m per exam, 30m per interview, 30m per code submission)
    const computedHours = Math.round((totalExams * 15 + totalInterviews * 30 + totalCodingChallenges * 30) / 60);
    user.practiceHours = computedHours;
    await user.save();

    // Calculate Completed Topics (averageScore >= 60 in UserPerformance)
    const performances = await UserPerformance.find({ userId });
    const completedTopics = performances.filter(p => p.averageScore >= 60).map(p => p.topic);
    const completedTopicsCount = completedTopics.length;
    const totalTopicsCount = 43; // total subtopics across 10 categories
    const remainingTopicsCount = Math.max(0, totalTopicsCount - completedTopicsCount);

    // Compile Recent Activities (latest 3 of each, merged and sorted by date)
    const recentExams = await Exam.find({ userId })
      .sort({ completedAt: -1 })
      .limit(3);
    const recentInterviews = await InterviewResult.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(3);
    const recentCoding = await CodingSubmission.find({ userId })
      .populate("problemId", "title")
      .sort({ submittedAt: -1 })
      .limit(3);

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
    let recommendations;
    try {
      recommendations = await getDashboardRecommendations({
        averageScore,
        totalExams,
        totalInterviews,
        totalCodingChallenges,
        categoryPerformance
      });
    } catch (err) {
      console.error("Failed to load Gemini recommendations:", err);
      recommendations = [
        "Complete a DBMS mock exam to improve database normalization performance.",
        "Solve a new Arrays challenge under Coding Reviews to build coding streak consistency.",
        "Re-attempt Frontend Developer interviews to test React Hooks understanding."
      ];
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
    res.status(500).json({ message: error.message });
  }
};
