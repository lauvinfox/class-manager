import { Router } from "express";

import * as AssignmentController from "@controllers/assignment.controller";

const router = Router();

router.post("/:classId/create", AssignmentController.createAssignmentByClassId);
router.post("/:classId/givescore", AssignmentController.giveScore);
router.post(
  "/:classId/givescore/:assignmentId",
  AssignmentController.giveScores
);

router.get(
  "/:classId/get-assignments",
  AssignmentController.getAssignmentsByClass
);

router.post("/:classId/get-assignment", AssignmentController.getAssignmentById);

router.get(
  "/:classId/subject-assignments/get",
  AssignmentController.getAssignmentsBySubject
);

router.get(
  "/:classId/score/:studentId/get",
  AssignmentController.getStudentScore
);

router.delete(
  "/:classId/:assignmentId",
  AssignmentController.deleteAssignmentById
);

// Get assignment score summary by subject
router.get(
  "/:classId/get-score-by-subject",
  AssignmentController.getAssignmentsSummaryBySubject
);

// Get assignment score summary by subjects
router.get(
  "/:classId/get-score-by-subjects",
  AssignmentController.getAssignmentsSummaryBySubjects
);

router.get(
  "/:classId/get-assignments-by-student/:studentId",
  AssignmentController.getGradeByStudentId
);

export default router;
