import { Router } from "express";
import authenticate from "@middleware/authenticate";
import * as StudentsController from "@controllers/student.controller";
import { upload } from "@config/multer";

const router = Router();

// All student routes are protected
router.use(authenticate);

// Add new student
router.post("/", StudentsController.createStudent);

// Get all students
router.get("/", StudentsController.getAllStudents);

// Get student by ID
router.get("/:id", StudentsController.getStudentById);

// Get students by class ID
router.put("/:id", StudentsController.updateStudent);

// Update student by ID
router.delete("/:id", StudentsController.deleteStudent);

// Upload student data
router.post("/upload", upload.single("file"), StudentsController.uploadStudent);

export default router;
