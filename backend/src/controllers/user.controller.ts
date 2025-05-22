import { RequestHandler } from "express";
import * as UserService from "@services/user.services";
import catchError from "@utils/error";
import { OK, CREATED } from "@constants/statusCodes";

export const createUser: RequestHandler = catchError(async (req, res) => {
  const user = await UserService.createUser(req.body);
  res.status(CREATED).json({
    message: "User data successfully saved",
    data: user,
  });
});

export const getAllUsers: RequestHandler = catchError(async (req, res) => {
  const users = await UserService.getAllUsers();
  res.status(OK).json({
    message: "User data successfully fetch",
    data: users,
  });
});

export const getUserById: RequestHandler = catchError(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  res.status(OK).json({
    message: "User data successfully fetch",
    data: user,
  });
});

export const updateUser: RequestHandler = catchError(async (req, res) => {
  const user = await UserService.updateUser(req.params.id, req.body);
  res.status(CREATED).json({
    message: "User data successfully updated",
    data: user,
  });
});

export const deleteUser: RequestHandler = catchError(async (req, res) => {
  await UserService.deleteUser(req.params.id);
  res.status(OK).json({
    message: "User data successfully deleted",
  });
});
