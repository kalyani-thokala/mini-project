import express from "express";
import {
  generateExam,
  submitExam,
  getExamHistory,
  getExamResult
} from "../controllers/examController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateExam);
router.post("/submit", protect, submitExam);
router.get("/history", protect, getExamHistory);
router.get("/:id", protect, getExamResult);

export default router;
