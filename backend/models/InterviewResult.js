import mongoose from "mongoose";

const interviewResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  confidenceScore: {
    type: Number,
    default: 70
  },
  communicationScore: {
    type: Number,
    default: 70
  },
  technicalScore: {
    type: Number,
    default: 70
  },
  warningCount: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String, // Overall summary feedback
    default: ""
  },
  questions: [
    {
      questionText: String,
      type: String, // technical, behavioral, HR
      userAnswer: String,
      transcript: String,
      score: Number,
      strengths: String,
      weaknesses: String,
      improvements: String,
      idealAnswer: String
    }
  ],
  completedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("InterviewResult", interviewResultSchema);
