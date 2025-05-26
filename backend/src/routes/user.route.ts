import { Router } from "express";

import * as UsersController from "@controllers/user.controller";

const router = Router();

// Protected routes
router.get("/", UsersController.getUsers);
router.get("/:id", UsersController.getUser);
router.put("/:id", UsersController.updateUser);
router.delete("/:id", UsersController.deleteUser);

export default router;
