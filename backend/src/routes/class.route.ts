import { Router } from "express";
import authenticate from "@middleware/authenticate";

import * as ClassController from "@controllers/class.controller";

const router = Router();

// All class routes are protected
router.use(authenticate);

// Get all classes
router.get("/", ClassController.getClasses);

// Get class by ID
router.get("/:id", ClassController.getClass);

// Get classes by instructor ID
router.get("/instructor/:instructorId", ClassController.getInstructorClasses);

// Create new class
router.post("/", ClassController.createNewClass);

// Update a class
router.put("/:id", ClassController.updateClassDetails);

// Add a student to a class
router.put("/:classId/students/:studentId", ClassController.addStudent);

// Remove a student from a class
router.delete("/:classId/students/:studentId", ClassController.removeStudent);

// Delete a class
router.delete("/:id", ClassController.removeClass);

export default router;
