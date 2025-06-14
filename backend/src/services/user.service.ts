import { NOT_FOUND } from "@constants/statusCodes";
import UserModel, { IUser } from "@models/user.model";
import appAssert from "@utils/appAssert";

export const getAllUsers = async (): Promise<IUser[]> => {
  return UserModel.find().select("-password").exec();
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  return UserModel.findById(id).select("-password").exec();
};

export const getUsersByUsername = async (
  username: string
): Promise<IUser[] | null> => {
  // Cari username yang mengandung string 'username' (case-insensitive)
  const users = await UserModel.find({
    username: { $regex: username, $options: "i" },
  })
    .select("username")
    .exec();

  return users;
};

export const getUserByUsername = async (
  username: string
): Promise<IUser | null> => {
  const user = await UserModel.findOne({ username: username })
    .select(
      "name firstName lastName username email dateOfBirth dateJoined verified"
    )
    .exec();

  return user;
};

export const getUserInfo = async (
  userId: string
): Promise<Pick<
  IUser,
  "name" | "username" | "email" | "firstName" | "lastName"
> | null> => {
  const user = await UserModel.findById(userId)
    .select("name username email firstName lastName")
    .exec();
  appAssert(user, NOT_FOUND, "User not found");
  return user;
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

export const checkGetMe = async (userId: string) => {
  // get the user
  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User not found");

  // return user without password
  return user.omitPassword();
};
