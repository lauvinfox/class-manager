import { Router } from "express";
import authenticate from "@middleware/authenticate";
import * as GradeController from "@controllers/grade.controller";

const router = Router();

// All grade routes are protected
router.use(authenticate);

// Add new grade
router.post("/", GradeController.createGrade);

// Get all grades
router.get("/", GradeController.getAllGrades);

// Get grade by ID
router.get("/:id", GradeController.getGradeById);

// Update a grade
router.put("/:id", GradeController.updateGrade);

// Delete a grade
router.delete("/:id", GradeController.deleteGrade);

export default router;
