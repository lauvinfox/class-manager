// controllers/auth.controller.ts
import { z } from "zod";

import { RequestHandler } from "express";
import catchError from "@utils/error";
import {
  SignUpSchema,
  SignInSchema,
  VerificationCodeSchema,
  ResetPasswordSchema,
} from "@schemas/auth.schema";
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

// ===============================
// 🟩 AUTH CONTROLLERS
// ===============================

export const signUp: RequestHandler = catchError(async (req, res) => {
  const parsed = SignUpSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const result = await createAccount(parsed);
  if (result instanceof Error) throw new Error(result.message);

  const { user, accessToken, refreshToken } = result;

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json({ message: "User data successfully saved", data: user });
});

export const signIn: RequestHandler = catchError(async (req, res) => {
  const parsed = SignInSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { accessToken, refreshToken } = await loginUser(parsed);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Login successful", data: accessToken });
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

export const refresh: RequestHandler = catchError(async (req, res) => {
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

export const verifyEmail: RequestHandler = catchError(async (req, res) => {
  const verificationCode = VerificationCodeSchema.parse(req.params.code);
  await verifyUserEmail(verificationCode);

  return res.status(OK).json({ message: "Email was successfully verified" });
});

export const forgotPassword: RequestHandler = catchError(async (req, res) => {
  const email = z.string().email().min(1).max(255).parse(req.body.email);
  await sendPasswordReset(email);

  return res.status(OK).json({ message: "Password reset email sent" });
});

export const resetPassword: RequestHandler = catchError(async (req, res) => {
  const parsed = ResetPasswordSchema.parse(req.body);
  await createNewPassword(parsed);

  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "Password reset successful" });
});
