import { Router } from "express";
import * as AssistanceController from "@controllers/assistance.controller";
const router = Router();

router.post("/:classId/create", AssistanceController.createClassAssistance);

// Get assistances by class ID
router.get("/:classId", AssistanceController.getClassAssistances);

// Get assistances by class ID and subject
router.post(
  "/:classId/subject",
  AssistanceController.getClassSubjectAssistances
);

export default router;
