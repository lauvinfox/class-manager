import { Router } from "express";
import authenticate from "@middleware/authenticate";
import * as UsersController from "@controllers/user.controller";

const router = Router();

// Protected routes
router.use(authenticate);

// Create new user
router.post("/", UsersController.createUser);

// Get all users
router.get("/", UsersController.getAllUsers);

// Get user by ID
router.get("/:id", UsersController.getUserById);

// Update user
router.put("/:id", UsersController.updateUser);

// Delete user
router.delete("/:id", UsersController.deleteUser);

export default router;
