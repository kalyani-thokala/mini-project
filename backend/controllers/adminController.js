import ExamQuestion from "../models/ExamQuestion.js";
import CodingProblem from "../models/CodingProblem.js";
import QuestionTemplate from "../models/QuestionTemplate.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import InterviewResult from "../models/InterviewResult.js";
import CodingSubmission from "../models/CodingSubmission.js";
import AICache from "../models/AICache.js";

// Get Platform Stats for Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalQuestions = await ExamQuestion.countDocuments({});
    const totalProblems = await CodingProblem.countDocuments({});
    const totalExams = await Exam.countDocuments({});
    const totalInterviews = await InterviewResult.countDocuments({});
    const totalCodingSubmissions = await CodingSubmission.countDocuments({});

    // Dynamic Daily Active Users and AI Usage monitor
    const dailyActiveUsers = await User.countDocuments({
      lastActiveDate: new Date().toDateString()
    });
    const aiUsage = await AICache.countDocuments({});

    res.json({
      totalUsers,
      totalQuestions,
      totalProblems,
      totalExams,
      totalInterviews,
      totalCodingSubmissions,
      dailyActiveUsers,
      aiUsage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- User Management ---
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();
    res.json({ message: "User role toggled successfully", role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- QuestionTemplate CRUD ---
export const getTemplates = async (req, res) => {
  try {
    const templates = await QuestionTemplate.find({});
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { category, topic, difficulty, template, variables, explanationTemplate } = req.body;
    const item = await QuestionTemplate.create({
      category,
      topic,
      difficulty,
      template,
      variables,
      explanationTemplate
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const item = await QuestionTemplate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const item = await QuestionTemplate.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Question CRUD ---
export const getQuestions = async (req, res) => {
  try {
    const questions = await ExamQuestion.find({});
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty, explanation, topic } = req.body;
    const examQ = await ExamQuestion.create({
      question,
      options,
      correctAnswer,
      category,
      difficulty,
      explanation,
      topic
    });
    res.status(201).json(examQ);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await ExamQuestion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await ExamQuestion.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Coding Problem CRUD ---
export const getProblems = async (req, res) => {
  try {
    const problems = await CodingProblem.find({});
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCodingProblem = async (req, res) => {
  try {
    const { title, description, constraints, examples, category, difficulty, solution } = req.body;
    const problem = await CodingProblem.create({
      title,
      description,
      constraints,
      examples,
      category,
      difficulty,
      solution
    });
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCodingProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!problem) {
      return res.status(404).json({ message: "Coding problem not found" });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCodingProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findByIdAndDelete(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Coding problem not found" });
    }
    res.json({ message: "Coding problem deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
