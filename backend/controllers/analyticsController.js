import Exam from "../models/Exam.js";
import InterviewResult from "../models/InterviewResult.js";
import CodingSubmission from "../models/CodingSubmission.js";
import UserPerformance from "../models/UserPerformance.js";
import { getDashboardRecommendations } from "../services/aiService.js";

export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all records
    const exams = await Exam.find({ userId }).sort({ completedAt: 1 }); // chronological order
    const interviews = await InterviewResult.find({ userId }).sort({ submittedAt: 1 });
    const codingSubmissions = await CodingSubmission.find({ userId }).populate("problemId", "title category difficulty").sort({ submittedAt: 1 });

    const totalExams = exams.length;
    const totalInterviews = interviews.length;
    const totalCodingChallenges = codingSubmissions.length;

    // 2. Average Score calculation
    let averageScore = 0;
    if (totalExams > 0) {
      const sum = exams.reduce((acc, curr) => acc + curr.percentage, 0);
      averageScore = Math.round(sum / totalExams);
    }

    // 3. Category-wise Performance
    const categoryScores = {};
    exams.forEach((e) => {
      if (!categoryScores[e.category]) {
        categoryScores[e.category] = [];
      }
      categoryScores[e.category].push(e.percentage);
    });

    const categoryWisePerformance = [];
    const strongAreas = [];
    const weakAreas = [];

    Object.keys(categoryScores).forEach((category) => {
      const scores = categoryScores[category];
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      categoryWisePerformance.push({
        category,
        average: avg,
        count: scores.length
      });

      if (avg >= 75) {
        strongAreas.push(category);
      } else if (avg < 60) {
        weakAreas.push(category);
      }
    });

    // 4. Progress charts (Weekly/Monthly)
    const monthlyProgressMap = {};
    const weeklyProgressMap = {};

    const getWeekNumber = (date) => {
      const oneJan = new Date(date.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
      return Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
    };

    exams.forEach((e) => {
      const date = new Date(e.completedAt);
      const month = date.toLocaleString("default", { month: "short" }) + " " + date.getFullYear();
      const week = `Week ${getWeekNumber(date)}`;

      if (!monthlyProgressMap[month]) monthlyProgressMap[month] = { count: 0, sum: 0 };
      monthlyProgressMap[month].count++;
      monthlyProgressMap[month].sum += e.percentage;

      if (!weeklyProgressMap[week]) weeklyProgressMap[week] = { count: 0, sum: 0 };
      weeklyProgressMap[week].count++;
      weeklyProgressMap[week].sum += e.percentage;
    });

    const monthlyProgress = Object.keys(monthlyProgressMap).map((month) => ({
      name: month,
      score: Math.round(monthlyProgressMap[month].sum / monthlyProgressMap[month].count)
    }));

    const weeklyProgress = Object.keys(weeklyProgressMap).map((week) => ({
      name: week,
      score: Math.round(weeklyProgressMap[week].sum / weeklyProgressMap[week].count)
    }));

    // 5. Interview role performance
    const interviewPerformance = interviews.map((i) => ({
      role: i.role,
      score: i.score,
      date: new Date(i.submittedAt || i.completedAt).toLocaleDateString()
    }));

    // 6. Coding challenge performance
    const codingPerformance = codingSubmissions.map((c) => ({
      title: c.problemId?.title || "Coding Challenge",
      category: c.problemId?.category || "General",
      score: c.score * 10,
      date: new Date(c.submittedAt || c.completedAt).toLocaleDateString()
    }));

    // 7. Topic Mastery from UserPerformance
    const performances = await UserPerformance.find({ userId });
    const topicMastery = performances.map(p => ({
      topic: p.topic,
      score: p.averageScore,
      attempts: p.totalAttempts
    }));

    // 8. Difficulty Mastery
    const diffScores = { easy: [], medium: [], hard: [] };
    exams.forEach(e => {
      // Assuming exams difficulty was set (can fallback to medium)
      const diff = e.difficulty || "medium";
      if (diffScores[diff]) diffScores[diff].push(e.percentage);
    });
    codingSubmissions.forEach(c => {
      const diff = c.problemId?.difficulty || "medium";
      if (diffScores[diff]) diffScores[diff].push(c.score * 10);
    });

    const difficultyMastery = {
      easy: diffScores.easy.length > 0 ? Math.round(diffScores.easy.reduce((a,b)=>a+b, 0) / diffScores.easy.length) : 0,
      medium: diffScores.medium.length > 0 ? Math.round(diffScores.medium.reduce((a,b)=>a+b, 0) / diffScores.medium.length) : 0,
      hard: diffScores.hard.length > 0 ? Math.round(diffScores.hard.reduce((a,b)=>a+b, 0) / diffScores.hard.length) : 0
    };

    // 9. Learning Velocity (Items completed in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const examsLastWeek = exams.filter(e => new Date(e.completedAt) >= sevenDaysAgo).length;
    const interviewsLastWeek = interviews.filter(i => new Date(i.submittedAt || i.completedAt) >= sevenDaysAgo).length;
    const codingLastWeek = codingSubmissions.filter(c => new Date(c.submittedAt || c.completedAt) >= sevenDaysAgo).length;
    const learningVelocity = examsLastWeek + interviewsLastWeek + codingLastWeek;

    // 10. Improvement Rate
    let improvementRate = 0;
    if (exams.length >= 2) {
      const mid = Math.floor(exams.length / 2);
      const firstHalf = exams.slice(0, mid);
      const secondHalf = exams.slice(mid);
      const firstHalfAvg = firstHalf.reduce((a, b) => a + b.percentage, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((a, b) => a + b.percentage, 0) / secondHalf.length;
      improvementRate = Math.round(secondHalfAvg - firstHalfAvg);
    }

    // 11. Predicted Placement Readiness
    let placementReadiness = "Beginner";
    if (averageScore >= 85) {
      placementReadiness = "Placement Ready";
    } else if (averageScore >= 70) {
      placementReadiness = "Advanced";
    } else if (averageScore >= 50) {
      placementReadiness = "Intermediate";
    }

    // 12. Recommendations fallback
    let recommendations;
    try {
      recommendations = await getDashboardRecommendations({
        averageScore,
        totalExams,
        totalInterviews,
        totalCodingChallenges,
        categoryPerformance: categoryScores
      });
    } catch (err) {
      recommendations = [
        "Focus on category weak spots like DBMS Normalization and Operating System Deadlocks.",
        "Your weekly practice speed is strong. Complete another coding challenge to lock in details.",
        "Practice Entry Level (Junior) interview sets to consolidate core language details."
      ];
    }

    res.json({
      averageScore,
      totalExams,
      totalInterviews,
      totalCodingChallenges,
      categoryWisePerformance,
      strongAreas,
      weakAreas,
      weeklyProgress,
      monthlyProgress,
      interviewPerformance,
      codingPerformance,
      recommendations,
      topicMastery,
      difficultyMastery,
      learningVelocity,
      improvementRate,
      placementReadiness
    });
  } catch (error) {
    console.error("Analytics Calculation Error:", error);
    res.status(500).json({ message: error.message });
  }
};
