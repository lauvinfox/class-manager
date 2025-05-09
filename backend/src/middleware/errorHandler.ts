import AppError from "@utils/appError";
import { clearAuthCookies } from "@utils/cookies";
import { BAD_REQUEST } from "constants/statusCodes";
import { ErrorRequestHandler, Response } from "express";
import { ZodError } from "zod";

const handleZodError = (res: Response, error: ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  return res.status(BAD_REQUEST).json({
    message: "Bad Request",
    errors,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  return res
    .status(error.statusCode)
    .json({ message: error.message, errorCode: error.errorCode });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);

  if (req.path === "/auth/refresh") {
    clearAuthCookies(res);
  }
  if (error instanceof ZodError) {
    handleZodError(res, error);
    return;
  }

  if (error instanceof AppError) {
    handleAppError(res, error);
    return;
  }

  res.status(500).json({ message: "Internal Server Error" });
};

export default errorHandler;
