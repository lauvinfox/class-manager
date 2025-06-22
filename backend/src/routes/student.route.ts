import { Router } from "express";

import * as StudentsController from "@controllers/student.controller";
import authenticate from "@middleware/authenticate";
import { upload } from "@config/multer";

const router = Router();

// CREATE
router.post("/", StudentsController.createStudent);

// GET ALL
router.get("/", authenticate, StudentsController.getStudents);

// GET BY STUDENTID
router.get("/:id", StudentsController.getStudent);

// UPDATE
router.put("/:id", StudentsController.updateStudent);

// DELETE
router.delete("/:id", StudentsController.deleteStudent);

// Upload
router.post(
  "/:classId/upload",
  upload.single("file"),
  StudentsController.uploadStudents
);

export default router;
