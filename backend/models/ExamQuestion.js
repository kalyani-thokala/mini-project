import mongoose from "mongoose";

const examQuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ""
  },
  isTemplateGenerated: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("ExamQuestion", examQuestionSchema, "examquestions");
