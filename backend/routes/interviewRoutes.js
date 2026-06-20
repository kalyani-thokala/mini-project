import express from "express";
import {
  generateQuestions,
  submitInterview,
  getInterviewHistory,
  getInterviewDetails
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateQuestions);
router.post("/submit", protect, submitInterview);
router.get("/history", protect, getInterviewHistory);
router.get("/:id", protect, getInterviewDetails);

export default router;
