import { Router } from "express";

import * as AssignmentController from "@controllers/assignment.controller";

const router = Router();

router.post("/:classId/create", AssignmentController.createAssignmentByClassId);
router.post("/:classId/give-score", AssignmentController.giveScore);

router.get(
  "/:classId/get-assignments",
  AssignmentController.getAssignmentsByClass
);

router.post("/:classId/get-assignment", AssignmentController.getAssignmentById);

router.get(
  "/:classId/subject-assignments/get",
  AssignmentController.getScoreBySubject
);
router.get(
  "/:classId/score/:studentId/get",
  AssignmentController.getStudentScore
);

export default router;
