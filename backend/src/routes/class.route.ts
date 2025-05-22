import { Router } from "express";
import authenticate from "@middleware/authenticate";
import * as ClassController from "@controllers/class.controller";

const router = Router();

// All class routes are protected
router.use(authenticate);

// Create new class
router.post("/", ClassController.createClass);

// Get all classes
router.get("/", ClassController.getAllClasses);

// Get class by ID
router.get("/:id", ClassController.getClassById);

// Update a class
router.put("/:id", ClassController.updateClass);

// Delete a class
router.delete("/:id", ClassController.deleteClass);

// // Get classes by instructor ID
// router.get("/instructor/:instructorId", ClassController.getInstructorClasses);

// // Add a student to a class
// router.put("/:classId/students/:studentId", ClassController.addStudent);

// // Remove a student from a class
// router.delete("/:classId/students/:studentId", ClassController.removeStudent);

export default router;
