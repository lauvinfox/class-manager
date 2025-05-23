import UserModel, { IUser } from "@models/user.model";

export const getAllUsers = async (): Promise<IUser[]> => {
  return UserModel.find().select("-password").exec();
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  return UserModel.findById(id).select("-password").exec();
};

export const updateUserById = async (
  id: string,
  updatedData: Partial<IUser>
): Promise<IUser | null> => {
  return UserModel.findByIdAndUpdate(id, updatedData, { new: true }).exec();
};

export const deleteUserById = async (id: string): Promise<void> => {
  await UserModel.findByIdAndDelete(id).exec();
};
