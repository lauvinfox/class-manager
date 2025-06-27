import { Router } from "express";

import * as AssignmentController from "@controllers/assignment.controller";

const router = Router();

router.post("/:classId/create", AssignmentController.createAssignmentByClassId);
router.post("/:classId/give-score", AssignmentController.giveScore);

router.get("/:classId/get-assignments", AssignmentController.getScoreByClass);
router.get(
  "/:classId/subject-assignments/get",
  AssignmentController.getScoreBySubject
);

export default router;
