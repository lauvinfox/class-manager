import { Router } from "express";
import * as OpenAIController from "@controllers/openai.controller";

const router = Router();

router.post("/handle-openai", OpenAIController.handleOpenAIRequest);

router.post(
  "/student-assignment-advice",
  OpenAIController.studentAssignmentAdvice
);

router.post("/class-learning-plan", OpenAIController.getClassLearningPlan);

export default router;
