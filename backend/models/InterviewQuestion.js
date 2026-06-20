import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema({
  role: {
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
  }
});

export default mongoose.model("InterviewQuestion", interviewQuestionSchema, "interviewquestions");
