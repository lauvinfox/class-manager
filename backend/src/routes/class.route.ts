import { Router } from "express";
import authenticate from "@middleware/authenticate";

import * as ClassController from "@controllers/class.controller";

const router = Router();

// Get class by ClassId
router.post("/getbyids", ClassController.getClassByIds);

// Get class by classOwner
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

export default router;
