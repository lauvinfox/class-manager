import { Router } from "express";

import * as ClassController from "@controllers/class.controller";

const router = Router();

// Get class by ClassId
router.post("/getbyids", ClassController.getClassByIds);

// Get class by classOwner
/**
 * @swagger
 * /api/v1/class/getbyclassowner:
 *   get:
 *     summary: Get all classes owned by the authenticated user
 *     tags: [Class]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 */
router.get("/getbyclassowner", ClassController.getClassesByClassOwnerID);

// Create new class
router.post("/", ClassController.createNewClass);

// Get class info by Id
router.get("/id/:classId", ClassController.getClassByClassId);

// Invite instructors
router.post("/:classId/inviteinstructors", ClassController.inviteInstructors);

// Get class instructors
router.get("/:classId/instructors", ClassController.getClassInstructors);

// Respond to class invitation
router.post("/:classId/invite/", ClassController.respondInviteInstructor);

// Get class subjects
router.get("/:classId/subjects", ClassController.getClassSubjects);

// Add a subject to a class
router.post("/:classId/subjects", ClassController.addSubjects);

// Give a subject to an instructor
router.post(
  "/:classId/instructors/:instructorId/subjects",
  ClassController.giveSubjectToInstructor
);

// Update class weights
router.patch("/:classId/weights", ClassController.updateSubjectWeights);

// Get class weights
router.get("/:classId/weights", ClassController.getClassWeights);

// Get class weights by subject
router.get(
  "/:classId/weights/:subject",
  ClassController.getClassWeightBySubject
);

// Get subject
router.get("/:classId/subject/get", ClassController.getSubject);

// Delete class
router.delete("/:classId", ClassController.deleteClass);

// Get full student report
router.post(
  "/:classId/student-report/:studentId",
  ClassController.getStudentReport
);

// Get student report by date range
router.post(
  "/:classId/student-report/:studentId/date-range",
  ClassController.getStudentReportByDateRange
);

export default router;
