import Exam from "../models/Exam.js";
import InterviewResult from "../models/InterviewResult.js";
import CodingSubmission from "../models/CodingSubmission.js";
import InterviewFeedback from "../models/InterviewFeedback.js";

export const getExamHistory = async (req, res) => {
  try {
    const history = await Exam.find({ userId: req.user.id }).sort({ completedAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    const history = await InterviewResult.find({ userId: req.user.id }).sort({ submittedAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInterviewFeedbackDetails = async (req, res) => {
  try {
    const feedbacks = await InterviewFeedback.find({ interviewId: req.params.id });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCodingHistory = async (req, res) => {
  try {
    const history = await CodingSubmission.find({ userId: req.user.id })
      .populate("problemId", "title category difficulty")
      .sort({ submittedAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCodingSubmissionDetails = async (req, res) => {
  try {
    const submission = await CodingSubmission.findById(req.params.id)
      .populate("problemId", "title category difficulty description");
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
