import { Router } from "express";
import * as LearningPlanController from "@controllers/learningplan.controller";

const router = Router();

// Create learning plan for a class
router.post("/:classId/create", LearningPlanController.createClassLearningPlan);

// Get all learning plans for a class
router.get("/:classId/get", LearningPlanController.getClassLearningPlans);

// Get learning plans for a class by subject
router.get(
  "/:classId/subject/:subject/get",
  LearningPlanController.getClassSubjectLearningPlans
);

export default router;
