import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  totalExams: {
    type: Number,
    default: 0
  },
  totalInterviews: {
    type: Number,
    default: 0
  },
  totalCodingChallenges: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date
  },
  resetPasswordToken: {
    type: String,
    default: ""
  },
  resetPasswordExpires: {
    type: Date
  },
  leaderboardOptIn: {
    type: Boolean,
    default: false
  },
  learningStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: String,
    default: ""
  },
  practiceHours: {
    type: Number,
    default: 0
  },
  achievements: [
    {
      name: { type: String, required: true },
      unlockedAt: { type: Date, default: Date.now }
    }
  ],
  attemptedQuestions: [
    {
      questionId: { type: String, required: true },
      attemptedAt: { type: Date, default: Date.now },
      score: { type: Number, required: true },
      wasCorrect: { type: Boolean, required: true },
      category: { type: String },
      topic: { type: String }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);