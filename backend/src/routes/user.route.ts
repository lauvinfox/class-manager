import { Router } from "express";

import * as UsersController from "@controllers/user.controller";

const router = Router();

// Protected routes
// preventing Express from treating "me" as a user ID and avoiding the CastError.
router.get("/me", UsersController.getMe);
router.post("/username", UsersController.searchUserByUsername);
router.get("/info", UsersController.getUserInfo);
router.get("/info-by-username/:username", UsersController.getUserByUsername);

// Public routes
router.get("/", UsersController.getUsers);
router.get("/:id", UsersController.getUser);
router.put("/:id", UsersController.updateUser);
router.delete("/:id", UsersController.deleteUser);

router.put("/username/change", UsersController.changeUsername);
export default router;
