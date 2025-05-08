import { Request, Response, Router } from "express";

import * as AuthController from "@controllers/auth.controller";

const router = Router();

// Register
router.post("/signup", AuthController.signUp);

// Login
router.post("/signin", AuthController.signIn);

router.get("/", (_req: Request, res: Response) => {
  res.send({ data: [] });
});

export default router;
