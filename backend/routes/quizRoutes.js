import express from "express";
import {
  generateQuiz,
  generateFollowUp,
  generateTips
} from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/generate",
  protect,
  generateQuiz
);

router.post("/followup", protect, generateFollowUp);
router.post("/tips", protect, generateTips);

export default router;
