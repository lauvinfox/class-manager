import { CONFLICT, NOT_FOUND, UNAUTHORIZED } from "@constants/statusCodes";
import userModel from "@models/user.model";
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
  "name" | "username" | "email" | "firstName" | "lastName" | "_id"
> | null> => {
  const user = await UserModel.findById(userId)
    .select("name username email firstName lastName _id")
    .exec();
  appAssert(user, NOT_FOUND, "User not found");
  return user;
};

export const getNotificationsById = async (userId: string) => {
  const userNotifs = await UserModel.findById(userId)
    .select("notifications")
    .exec();

  appAssert(userNotifs, NOT_FOUND, "User not found");

  return userNotifs.notifications;
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

  return user.omitPassword();
};

// Classes
export const getAllClassesId = async (userId: string) => {
  const user = await UserModel.findById(userId).select("classes").exec();

  return user;
};

export const getClassesOwnedByIds = async (userId: string) => {
  const user = await UserModel.findById(userId).select("classOwned").exec();

  return user;
};

export const updateUsername = async ({
  userId,
  password,
  newUsername,
}: {
  userId: string;
  password: string;
  newUsername: string;
}) => {
  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User not found");

  const isValid = await user.comparePassword(password);
  appAssert(isValid, UNAUTHORIZED, "Invalid password");

  const exists = await UserModel.exists({ username: newUsername });
  appAssert(!exists, CONFLICT, "Username already taken");

  user.username = newUsername;
  await user.save();

  return user.omitPassword();
};

export const addClassToUser = async (userId: string, classId: string) => {
  const user = await UserModel.findById(userId);
  appAssert(user, NOT_FOUND, "User not found");

  if (user.classes.includes(classId)) {
    throw new Error("Class already exists in user's classes");
  }

  user.classes.push(classId);
  await user.save();

  return user.omitPassword();
};
