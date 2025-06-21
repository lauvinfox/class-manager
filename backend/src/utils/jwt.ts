import { ISession } from "@models/session.model";
import { IUser } from "@models/user.model";
import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import env from "./env";

export type RefreshTokenPayload = {
  sessionId: ISession["_id"];
};

export type AccessTokenPayload = {
  userId: IUser["_id"];
  sessionId: ISession["_id"];
};

type SignOptionsAndSecret = SignOptions & {
  secret: string;
};

const defaults: SignOptions = {
  audience: ["user"],
};

const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "15m",
  secret: env.ACCESS_TOKEN_SECRET,
};

export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "30d",
  secret: env.REFRESH_TOKEN_SECRET,
};

export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionsAndSecret
) => {
  const { secret, ...signOpts } = options || accessTokenSignOptions;

  return jwt.sign(payload, secret, { ...defaults, ...signOpts });
};

// export const verifyToken = <TPayload extends object = AccessTokenPayload>(
//   token: string,
//   options?: VerifyOptions & {
//     secret?: string;
//   }
// ) => {
//   const { secret = env.ACCESS_TOKEN_SECRET, ...verifyOpts } = options || {};
//   try {
//     const payload = jwt.verify(token, secret, {
//       ...defaults,
//       ...verifyOpts,
//     }) as TPayload;
//     return {
//       payload,
//     };
//   } catch (error: any) {
//     return {
//       error: error.message,
//     };
//   }
// };

const verifyDefaults: VerifyOptions = {
  audience: "user", // bisa juga array, sesuaikan dengan kebutuhan
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & {
    secret?: string;
  }
) => {
  const { secret = env.ACCESS_TOKEN_SECRET, ...verifyOpts } = options || {};

  try {
    const decoded = jwt.verify(token, secret, {
      ...verifyDefaults,
      ...verifyOpts,
    });

    if (typeof decoded === "object" && decoded !== null) {
      return {
        payload: decoded as TPayload,
      };
    }

    return {
      error: "Invalid token payload type",
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
