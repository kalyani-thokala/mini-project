import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  attemptedQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  wrongAnswers: {
    type: Number,
    required: true
  },
  completionTime: {
    type: Number, // In seconds
    required: true
  },
  feedback: {
    type: String, // Dynamic AI feedback
    default: ""
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Exam", examSchema);
