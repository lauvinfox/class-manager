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

router.get("/", (_req: Request, res: Response) => {
  res.send({ data: [] });
});

export default router;
