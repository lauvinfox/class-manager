import { RequestHandler } from "express";
import * as UserService from "@services/user.service";
import catchError from "@utils/error";
import userModel from "@models/user.model";
import appAssert from "@utils/appAssert";
import { BAD_REQUEST, UNAUTHORIZED } from "@constants/statusCodes";

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

export const getUserByUsername: RequestHandler = catchError(
  async (req, res) => {
    const username = req.params.username;
    const user = await UserService.getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ data: user });
  }
);

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
  return res.status(200).json({ message: "User deleted successfully" });
});

export const getUserInfo: RequestHandler = catchError(async (req, res) => {
  const userId = req.userId as string;

  const user = await UserService.getUserInfo(userId);
  appAssert(user, UNAUTHORIZED, "User not found");

  return res.status(200).json({
    message: "User info retrieved successfully",
    data: {
      username: user.username,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
});

export const getMe: RequestHandler = catchError(async (req, res) => {
  const userId = req.userId as string;
  appAssert(userId, UNAUTHORIZED, "User not authenticated");

  const user = await UserService.checkGetMe(userId);

  // req.user sudah diisi oleh middleware
  return res.json({
    message: "User data retrieved successfully",
    data: user,
  });
});

export const searchUserByUsername = catchError(async (req, res) => {
  const { username } = req.body;

  const users = await UserService.getUsersByUsername(username);

  return res.json({
    message: "User data retrieved successfully",
    data: users,
  });
});
