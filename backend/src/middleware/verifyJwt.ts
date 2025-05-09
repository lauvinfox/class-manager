import jwt, { decode } from "jsonwebtoken";
import env from "@utils/env";
import { NextFunction, Request, Response } from "express";

interface CustomRequest extends Request {
  user?: { [key: string]: any };
}

export const verifyJwt = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "Unauthorized" });
    } else {
      console.log(authHeader);
    }

    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.json({ message: "Token not found!" });
    }

    if (token === undefined) {
      return;
    }

    const verifyToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
      [key: string]: any;
    };
    req.user = verifyToken;
    next();
  } catch (error) {
    res.status(500).json({ error });
  }
};
