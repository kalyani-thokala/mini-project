import express from "express";
import { getLeaderboard, toggleOptIn } from "../controllers/leaderboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getLeaderboard);
router.post("/toggle", protect, toggleOptIn);

export default router;
