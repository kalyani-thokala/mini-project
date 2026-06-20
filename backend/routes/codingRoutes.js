import express from "express";
import {
  getCodingProblems,
  getCodingProblemDetails,
  submitCode,
  getSubmissions,
  getSubmissionDetails
} from "../controllers/codingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/problems", protect, getCodingProblems);
router.get("/problems/:id", protect, getCodingProblemDetails);
router.post("/submit", protect, submitCode);
router.get("/submissions", protect, getSubmissions);
router.get("/submissions/:id", protect, getSubmissionDetails);

export default router;
