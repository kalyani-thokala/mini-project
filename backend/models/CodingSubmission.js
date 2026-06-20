import mongoose from "mongoose";

const codingSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CodingProblem",
    required: true
  },
  language: {
    type: String,
    enum: ["javascript", "python", "java"],
    required: true
  },
  code: {
    type: String,
    required: true
  },
  score: {
    type: Number, // Score out of 10
    required: true
  },
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  improvements: {
    type: [String],
    default: []
  },
  idealSolution: {
    type: String,
    default: ""
  },
  complexityAnalysis: {
    type: String,
    default: ""
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("CodingSubmission", codingSubmissionSchema);
