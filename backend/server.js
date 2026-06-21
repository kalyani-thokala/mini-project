import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import codingRoutes from "./routes/codingRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

import { securityHeaders, rateLimiter, sanitizeInput } from "./middleware/security.js";

dotenv.config();
await connectDB();

const app = express();

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://kalyani-thokala.github.io"
];

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOrigins = allowedOrigins.length ? allowedOrigins : defaultAllowedOrigins;

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

app.use(express.json());
app.use(securityHeaders);
app.use(rateLimiter);
app.use(sanitizeInput);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
    time: new Date()
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/code", codingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/quiz", quizRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "API Route Not Found" });
});

app.use((error, req, res, next) => {
  if (error?.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: error.message });
  }

  return next(error);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
