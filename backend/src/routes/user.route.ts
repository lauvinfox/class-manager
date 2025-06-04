import { Router } from "express";

import * as UsersController from "@controllers/user.controller";

const router = Router();

// Protected routes
// preventing Express from treating "me" as a user ID and avoiding the CastError.
router.get("/me", UsersController.getMe);
router.get("/info", UsersController.getUserInfo);

// Public routes
router.get("/", UsersController.getUsers);
router.get("/:id", UsersController.getUser);
router.put("/:id", UsersController.updateUser);
router.delete("/:id", UsersController.deleteUser);

export default router;
