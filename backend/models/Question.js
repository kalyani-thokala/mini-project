import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be a string (MCQ/Boolean) or array of strings (multi-select)
    required: true
  },
  type: {
    type: String,
    enum: ["mcq", "boolean", "select"],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true
  },
  explanation: {
    type: String,
    default: ""
  }
});

export default mongoose.model("Question", questionSchema);
