import express from "express";
import {
  getAdminStats,
  getUsers,
  deleteUser,
  toggleUserAdmin,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getProblems,
  createCodingProblem,
  updateCodingProblem,
  deleteCodingProblem
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth and admin protections to all admin routes
router.use(protect);
router.use(admin);

router.get("/stats", getAdminStats);

// User Management
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", toggleUserAdmin);

// Template Management
router.get("/templates", getTemplates);
router.post("/templates", createTemplate);
router.put("/templates/:id", updateTemplate);
router.delete("/templates/:id", deleteTemplate);

// Question Management
router.get("/questions", getQuestions);
router.post("/questions", createQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

// Problem Management
router.get("/problems", getProblems);
router.post("/problems", createCodingProblem);
router.put("/problems/:id", updateCodingProblem);
router.delete("/problems/:id", deleteCodingProblem);

export default router;
