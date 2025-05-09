import jwt from "jsonwebtoken";

import UserModel from "@models/user.model";
import VerificationModel from "@models/verificationCode.model";
import SessionModel from "@models/session.model";
import { ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "@utils/date";
import { VerificationCodeType } from "@constants/verificationCodeType";
import env from "@utils/env";
import appAssert from "@utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "@constants/statusCodes";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "@utils/jwt";

export type CreateAccountParams = {
  name: string;
  email: string;
  username: string;
  password: string;
  dateOfBirth: string;
  userAgent?: string;
};

export type LoginUserParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  // verify existing user doesnt exist
  const existingUser = await UserModel.exists({ email: data.email });

  appAssert(!existingUser, CONFLICT, "Email already in use");

  // create user
  const user = await UserModel.create({
    name: data.name,
    email: data.email,
    username: data.username,
    password: data.password,
    dateOfBirth: data.dateOfBirth,
  });

  const userId = user._id;

  // create verification code
  const verificationCode = await VerificationModel.create({
    userId: userId,
    type: VerificationCodeType.EMAIL_VERIFICATION,
    expiresAt: oneYearFromNow(),
  });

  // create session
  const session = await SessionModel.create({
    userId: userId,
    userAgent: data.userAgent,
  });

  // sign access token and refresh token
  const refreshToken = signToken(
    { sessionId: session._id },
    refreshTokenSignOptions
  );

  const accessToken = signToken({ userId: userId, sessionId: session._id });

  // return user and token
  return { user: user.omitPassword(), accessToken, refreshToken };
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginUserParams) => {
  // get the user
  const user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  // validate password
  const isValid = await user.comparePassword(password);
  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  const userId = user._id;
  // create session
  const session = await SessionModel.create({
    userId,
    userAgent,
  });

  const sessionInfo = {
    sessionId: session._id,
  };

  // sign access token & refresh token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({ ...sessionInfo, userId: user._id });

  // return user tokens
  return { user: user.omitPassword(), accessToken, refreshToken };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await SessionModel.findById(payload.sessionId);

  appAssert(
    session && session.expiresAt.getTime() > Date.now(),
    UNAUTHORIZED,
    "Session expired"
  );

  // refresh session if expires in 24 hours
  session.expiresAt = thirtyDaysFromNow();
  await session.save();
  //   const sessionNeedRefresh =
  //     session.expiresAt.getTime() - Date.now() <= ONE_DAY_MS;

  //   if (sessionNeedRefresh) {

  //   }

  const newRefreshToken = signToken(
    {
      sessionId: session._id,
    },
    refreshTokenSignOptions
  );

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });

  return { accessToken, newRefreshToken };
};
