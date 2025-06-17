import UserModel from "@models/user.model";
import VerificationModel from "@models/verificationCode.model";
import SessionModel from "@models/session.model";
import {
  fiveMinutesAgo,
  oneHourFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "@utils/date";
import { VerificationCodeType } from "@constants/verificationCodeType";
import env from "@utils/env";
import appAssert from "@utils/appAssert";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "@constants/statusCodes";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "@utils/jwt";
import { sendMail } from "@utils/sendMail";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from "@utils/emailTemplates";
import { hashValue } from "@utils/hash";

type CreateAccountParams = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  dateOfBirth: string;
  userAgent?: string;
};

type LoginUserParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  // verify existing user doesnt exist
  const existingUser = await UserModel.exists({ email: data.email });

  appAssert(!existingUser, CONFLICT, "Email already in use");

  const name = `${data.firstName} ${data.lastName}`;

  // create user
  const user = await UserModel.create({
    name,
    firstName: data.firstName,
    lastName: data.lastName,
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

  // send verification code
  const url = `${env.APP_ORIGIN}/email/verify/${verificationCode._id}`;

  const { error } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });

  if (error) console.log(error);

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
  appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

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

  const accessToken = signToken(
    { ...sessionInfo, userId: user._id },
    { expiresIn: "30d", secret: env.ACCESS_TOKEN_SECRET }
  );

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

  const accessToken = signToken(
    {
      userId: session.userId,
      sessionId: session._id,
    },
    { expiresIn: "30d", secret: env.ACCESS_TOKEN_SECRET }
  );

  return { accessToken, newRefreshToken };
};

export const verifyUserEmail = async (code: string) => {
  // get verification code
  const validCode = await VerificationModel.findOne({
    _id: code,
    type: VerificationCodeType.EMAIL_VERIFICATION,
    expiresAt: { $gt: new Date() },
  });

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  // update user to verified true
  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    { verified: true },
    { new: true }
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

  // Delete the old verification code
  await validCode.deleteOne();

  // return user
  return {
    user: updatedUser.omitPassword(),
  };
};

export const sendPasswordReset = async (email: string) => {
  // get the user
  const user = await UserModel.findOne({ email });
  appAssert(user, NOT_FOUND, "User not found");

  // check email rate limit
  const fiveMinAgo = fiveMinutesAgo();
  const count = await VerificationModel.countDocuments({
    userId: user._id,
    type: VerificationCodeType.PASSWORD_RESET,
    createdAt: { $gt: fiveMinAgo },
  });

  appAssert(count <= 1, TOO_MANY_REQUESTS, "Too many request");

  // create verification code
  const expiresAt = oneHourFromNow();

  const verificationCode = await VerificationModel.create({
    userId: user._id,
    type: VerificationCodeType.PASSWORD_RESET,
    expiresAt,
  });

  // send verification email
  const url = `${env.APP_ORIGIN}/password/reset?code=${verificationCode._id}&exp=${expiresAt.getTime()}`;

  const { data, error } = await sendMail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  });

  appAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name} - ${error?.message}`
  );

  // return success
  return {
    url,
    emailId: data.id,
  };
};

type ResetPasswordParams = {
  password: string;
  verificationCode: string;
};

export const createNewPassword = async ({
  verificationCode,
  password,
}: ResetPasswordParams) => {
  // get the verification code
  const validCode = await VerificationModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.PASSWORD_RESET,
    expiresAt: { $gt: new Date() },
  });

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  // update the password
  const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
    password: await hashValue(password),
  });

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to reset password");

  // delete the verification code
  await validCode.deleteOne();

  // delete all sessions
  await SessionModel.deleteMany({
    userId: updatedUser._id,
  });

  return {
    user: updatedUser.omitPassword(),
  };
};
