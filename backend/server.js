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

// Security middlewares
import { securityHeaders, rateLimiter, sanitizeInput } from "./middleware/security.js";

dotenv.config();

connectDB();

const app = express();

// Set up security headers and rate limiter
app.use(securityHeaders);
app.use(rateLimiter);

app.use(cors());
app.use(express.json());

// Sanitize request inputs against NoSQL injection and XSS
app.use(sanitizeInput);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: Math.round(process.uptime()),
    database: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
    timestamp: new Date()
  });
});

// API Routes
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

// Fallback Route for non-existing endpoints
app.use("*", (req, res) => {
  res.status(404).json({ message: "API Route Not Found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});