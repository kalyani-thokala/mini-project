import mongoose from "mongoose";

const interviewFeedbackSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewResult",
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  strengths: {
    type: String,
    default: ""
  },
  weaknesses: {
    type: String,
    default: ""
  },
  improvements: {
    type: String,
    default: ""
  },
  idealAnswer: {
    type: String,
    default: ""
  }
});

export default mongoose.model("InterviewFeedback", interviewFeedbackSchema, "interviewfeedbacks");
