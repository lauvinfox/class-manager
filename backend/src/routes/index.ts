import Router from "express";

import StudentRouter from "@routes/student.route";
import UserRouter from "@routes/user.route";
import AuthRouter from "@routes/auth.route";
import authenticate from "@middleware/authenticate";

const router = Router();

// Auth API
router.use("/auth", AuthRouter);

// User API
router.use("/api/v1/users", authenticate, UserRouter);

// Student API
router.use("/api/v1/students", StudentRouter);

export default router;
