import { RequestHandler } from "express";
import { z } from "zod";

import catchError from "@utils/error";
import {
  createAccount,
  createNewPassword,
  loginUser,
  refreshUserAccessToken,
  sendPasswordReset,
  verifyUserEmail,
} from "@services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "@constants/statusCodes";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "@utils/cookies";
import { AccessTokenPayload, verifyToken } from "@utils/jwt";
import sessionModel from "@models/session.model";
import appAssert from "@utils/appAssert";

const SignUpSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email().min(1).max(255),
    username: z.string().min(1),
    password: z.string().min(6).max(255),
    confirmPassword: z.string().min(6).max(255),
    dateOfBirth: z.string().refine(
      (value) => {
        return !isNaN(new Date(value).getTime());
      },
      {
        message: 'Invalid date format, expected "YYYY-MM-DD"',
      }
    ),
    userAgent: z.string().optional(),
  })
  .refine(
    (data) => data.password === data.confirmPassword, // Pastikan ini mengembalikan true atau false
    { message: "Password do not match", path: ["confirmPassword"] }
  );

const SignInSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(6).max(255),
  userAgent: z.string().optional(),
});

const VerificationCodeSchema = z.string().min(1).max(24); // Menyesuaikan object Id

const ResetPasswordSchema = z.object({
  password: z.string().min(6).max(255),
  verificationCode: VerificationCodeSchema,
});

export const signUp: RequestHandler = catchError(async (req, res) => {
  // validate request
  const request = SignUpSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  // call Service
  const result = await createAccount(request);

  if (result instanceof Error) {
    throw new Error(result.message);
  }

  const { user, accessToken, refreshToken } = result;

  // return response
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json({
      message: "User data successfully saved",
      data: user,
    });
});

export const signIn: RequestHandler = catchError(async (req, res) => {
  // validate
  const request = SignInSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  // call service
  const { accessToken, refreshToken } = await loginUser(request);

  // return
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Login successfull" });
});

export const signOut: RequestHandler = catchError(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  const { payload } = verifyToken<AccessTokenPayload>(accessToken || "");

  if (payload) {
    await sessionModel.findByIdAndDelete(payload.sessionId);
  }

  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "Logout successful" });
});

export const refresh = catchError(async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { accessToken, newRefreshToken } =
    await refreshUserAccessToken(refreshToken);

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions())
    .json({ message: "Access token refreshed" });
});

export const verifyEmail = catchError(async (req, res) => {
  const verificationCode = VerificationCodeSchema.parse(req.params.code);

  await verifyUserEmail(verificationCode);

  return res.status(OK).json({ message: "Email was successfully verified" });
});

export const forgotPassword = catchError(async (req, res) => {
  const email = z.string().email().min(1).max(255).parse(req.body.email);
  await sendPasswordReset(email);

  return res.status(OK).json({
    message: "Password reset email sent",
  });
});

export const resetPassword = catchError(async (req, res) => {
  const request = ResetPasswordSchema.parse(req.body);

  await createNewPassword(request);

  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "Password reset successful" });
});
