import { Router } from "express";
import campaignRoutes from "./campaigns";
import groupQuestionRoutes from "./group-question";
import userRoutes from "./user";
import { verifyToken } from "../middleware/middleware";

const router = Router();

// Public Routes (e.g., login, signup, etc.)
router.use("/login", userRoutes); // Assuming userRoutes contains public routes (e.g., login)

// Protected Routes
router.use("/campaigns", verifyToken, campaignRoutes); // Protect all campaign routes
router.use("/groupQuestion", verifyToken, groupQuestionRoutes); // Protect all group question routes

export default router;
