import { RequestHandler } from "express";
import * as UserService from "@services/user.services";
import catchError from "@utils/error";

export const getUsers: RequestHandler = catchError(async (_req, res) => {
  const users = await UserService.getAllUsers();
  res.status(200).json({ data: users });
});

export const getUser: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;
  const user = await UserService.getUserById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ data: user });
});

export const updateUser: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  const updatedUser = await UserService.updateUserById(id, updatedData);

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  res
    .status(200)
    .json({ data: updatedUser, message: "User updated successfully" });
});

export const deleteUser: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;

  await UserService.deleteUserById(id);
  res.status(200).json({ message: "User deleted successfully" });
});
