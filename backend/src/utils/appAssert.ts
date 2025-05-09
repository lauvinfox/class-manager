import assert from "node:assert";
import AppError from "./appError";
import { HttpStatusCode } from "@constants/statusCodes";
import AppErrorCode from "@constants/appErrorCode";

type AppAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition;

/**
 * Assert a condition and throws an AppError if the condition is falsy
 */

const appAssert: AppAssert = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));

export default appAssert;
