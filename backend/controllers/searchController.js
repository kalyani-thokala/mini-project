import ExamQuestion from "../models/ExamQuestion.js";
import CodingProblem from "../models/CodingProblem.js";
import InterviewQuestion from "../models/InterviewQuestion.js";

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ exams: [], coding: [], interviews: [] });
    }

    const regex = new RegExp(q, "i");

    const [exams, coding, interviews] = await Promise.all([
      ExamQuestion.find({ question: regex }).limit(10),
      CodingProblem.find({
        $or: [{ title: regex }, { description: regex }]
      }).limit(10),
      InterviewQuestion.find({ question: regex }).limit(10)
    ]);

    res.json({ exams, coding, interviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
