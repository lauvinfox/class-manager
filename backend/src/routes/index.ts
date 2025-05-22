import Router from "express";

import AuthRouter from "@routes/auth.route";
import UserRouter from "@routes/user.route";
import ClassRouter from "@routes/class.route";
import StudentRouter from "@routes/student.route";
import GradeRouter from "@routes/grade.route";
import JournalRouter from "@routes/journal.route";

const router = Router();

// Auth API
router.use("/auth", AuthRouter);

// User API
router.use("/api/v1/users", UserRouter);

// Class API
router.use("/api/v1/classes", ClassRouter);

// Student API
router.use("/api/v1/students", StudentRouter);

// Grade API
router.use("/api/v1/grades", GradeRouter);

// Journal API
router.use("/api/v1/journals", JournalRouter);

export default router;
