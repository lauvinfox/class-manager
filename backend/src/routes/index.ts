import Router from "express";

import StudentRouter from "@routes/student.route";
import UserRouter from "@routes/user.route";
import AuthRouter from "@routes/auth.route";
import NotificationRouter from "@routes/notification.route";
import ClassRouter from "@routes/class.route";
import AssignmentRouter from "@routes/assignment.route";
import JournalRouter from "@routes/journal.route";
import OpenAIRouter from "@routes/openai.route";
import AssistanceRouter from "@routes/assistance.route";

import authenticate from "@middleware/authenticate";

const router = Router();

// Auth API
router.use("/auth", AuthRouter);

// User API
router.use("/api/v1/users", authenticate, UserRouter);

// Student API
router.use("/api/v1/students", authenticate, StudentRouter);

// Student API
router.use("/api/v1/notifications", NotificationRouter);

router.use("/api/v1/class", authenticate, ClassRouter);

router.use("/api/v1/assignments", authenticate, AssignmentRouter);

// Journal API
router.use("/api/v1/journals", authenticate, JournalRouter);

// OPENAI API
router.use("/api/v1/openai", OpenAIRouter);

// Assistance API
router.use("/api/v1/assistances", authenticate, AssistanceRouter);

export default router;
