import { Router } from "express";

import * as UsersController from "@controllers/user.controller";

const router = Router();

// GET ALL
router.get("/", UsersController.getUsers);

// GET BY STUDENTID
router.get("/:id", UsersController.getUser);

// UPDATE
router.put("/:id", UsersController.updateUser);

// DELETE
router.delete("/:id", UsersController.deleteUser);

export default router;
