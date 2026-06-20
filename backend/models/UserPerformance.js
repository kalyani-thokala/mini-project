import mongoose from "mongoose";

const userPerformanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
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
  totalAttempts: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number, // Percentage 0 - 100
    default: 0
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  }
});

// Ensure uniqueness of (userId, category, topic)
userPerformanceSchema.index({ userId: 1, category: 1, topic: 1 }, { unique: true });

export default mongoose.model("UserPerformance", userPerformanceSchema, "userperformances");
