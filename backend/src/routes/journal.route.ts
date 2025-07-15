import { Router } from "express";

import * as JournalController from "@controllers/journal.controller";

const router = Router();

// Create a journal for a class
router.post("/:classId", JournalController.createJournalByClassId);

// Give attendances and notes to a journal
router.patch("/:classId/givenotes", JournalController.giveAttendancesAndNotes);

// Get a journal by journal ID
router.post("/:classId/get", JournalController.getJournalById);

// Get journals by class ID
router.get("/:classId", JournalController.getJournalByClassId);

// Get journals by subject and class
router.get("/:classId/subject", JournalController.getJournalsBySubject);

// Get attendance summary for a class
router.get(
  "/:classId/attendance-summary",
  JournalController.getAttendanceSummary
);

// Get attendance summary by subjects
router.get(
  "/:classId/attendance-summary/subjects",
  JournalController.getAttendanceSummaryBySubjects
);

// Get attendance summary by subject
router.get(
  "/:classId/attendance-summary/subject",
  JournalController.getAttendanceSummaryBySubject
);

export default router;
