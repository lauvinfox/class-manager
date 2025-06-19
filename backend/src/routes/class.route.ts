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

// Update a class
// router.put("/:id", ClassController.updateClassDetails);

// Add a student to a class
// router.put("/:classId/students/:studentId", ClassController.addStudent);

// Remove a student from a class
// router.delete("/:classId/students/:studentId", ClassController.removeStudent);

// Delete a class
// router.delete("/:id", ClassController.removeClass);

export default router;
