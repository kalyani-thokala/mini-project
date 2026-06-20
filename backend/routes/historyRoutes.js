import express from "express";
import {
  getExamHistory,
  getInterviewHistory,
  getCodingHistory,
  getInterviewFeedbackDetails,
  getCodingSubmissionDetails
} from "../controllers/historyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/exams", protect, getExamHistory);
router.get("/interviews", protect, getInterviewHistory);
router.get("/interviews/:id", protect, getInterviewFeedbackDetails);
router.get("/coding", protect, getCodingHistory);
router.get("/coding/:id", protect, getCodingSubmissionDetails);

export default router;
