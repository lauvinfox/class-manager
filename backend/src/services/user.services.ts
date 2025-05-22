import UserModel, { IUser } from "@models/user.model";
import { Types } from "mongoose";
import appAssert from "@utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "@constants/statusCodes";

export const createUser = async (userData: Partial<IUser>) => {
  const user = new UserModel(userData);
  return await user.save();
};

export const getAllUsers = async () => {
  return await UserModel.find();
};

export const getUserById = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid ID");
  const user = await UserModel.findById(id);
  appAssert(user, NOT_FOUND, "User not found");
  return user;
};

export const updateUser = async (id: string, updateData: Partial<IUser>) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid ID");
  const updated = await UserModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  appAssert(updated, NOT_FOUND, "User not found");
  return updated;
};

export const deleteUser = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid ID");
  const deleted = await UserModel.findByIdAndDelete(id);
  appAssert(deleted, NOT_FOUND, "User not found");
  return deleted;
};
