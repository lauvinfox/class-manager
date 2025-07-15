import { Router } from "express";

import * as StudentsController from "@controllers/student.controller";
import authenticate from "@middleware/authenticate";
import { upload } from "@config/multer";

const router = Router();

// CREATE
router.post("/:classId/create", StudentsController.createStudent);

// GET ALL
router.get("/:classId/get", StudentsController.getStudentsClass);

// GET BY STUDENTID
router.get("/:id", StudentsController.getStudent);

// UPDATE
router.put("/:id", StudentsController.updateStudent);

// DELETE
router.delete("/:id", StudentsController.deleteStudent);

// Add a student to a class
router.post(
  "/:classId/students/:classId/create",
  StudentsController.createStudent
);

// Upload students from CSV
router.post(
  "/:classId/upload",
  upload.single("file"),
  StudentsController.uploadStudents
);

// Delete multiple students by ClassId
router.delete("/:classId/delete", StudentsController.deleteStudents);

// Delete a student by ClassId and Student _id
router.delete("/:classId/delete-student", StudentsController.deleteStudent);

export default router;
