import { Request, Response, Router } from "express";

import * as AuthController from "@controllers/auth.controller";

const router = Router();

// Register
router.post("/signup", AuthController.signUp);

// Login
router.post("/signin", AuthController.signIn);

// Logout
router.get("/signout", AuthController.signOut);

// Refresh
router.get("/refresh", AuthController.refresh);

// Verify email
router.get("/email/verify/:code", AuthController.verifyEmail);

// Forgot password
router.post("/password/forgot", AuthController.forgotPassword);

// Reset password
router.post("/password/reset", AuthController.resetPassword);

export default router;
