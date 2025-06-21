import { Router } from "express";
import authenticate from "@middleware/authenticate";

import * as ClassController from "@controllers/class.controller";

const router = Router();

// Get all classes
// router.get("/", ClassController.getClasses);

// Get class by ClassId
router.post("/getbyids", ClassController.getClassByIds);

// Get class by classOwner
router.get("/getbyclassowner", ClassController.getClassesByClassOwnerID);

// Get classes by instructor ID
// router.get("/instructor/:instructorId", ClassController.getInstructorClasses);

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

// Update a class
// router.put("/:id", ClassController.updateClassDetails);

// Add a student to a class
// router.put("/:classId/students/:studentId", ClassController.addStudent);

// Remove a student from a class
// router.delete("/:classId/students/:studentId", ClassController.removeStudent);

// Delete a class
// router.delete("/:id", ClassController.removeClass);

export default router;
