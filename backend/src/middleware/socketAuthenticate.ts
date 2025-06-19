import { verifyToken, AccessTokenPayload } from "@utils/jwt";
import env from "@utils/env";

import { Socket } from "socket.io";

// Extend the Socket interface to include userId and sessionId
declare module "socket.io" {
  interface Socket {
    userId?: string;
    sessionId?: string;
  }
}

const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Authentication error: No token provided"));

  // Verifikasi token JWT seperti authenticate.ts
  const { error, payload } = verifyToken<AccessTokenPayload>(token, {
    secret: env.ACCESS_TOKEN_SECRET,
  });

  if (!payload) {
    return next(
      new Error(error === "jwt expired" ? "Token expired" : "Invalid token")
    );
  }

  // Set userId dan sessionId ke socket
  const { userId, sessionId } = payload as AccessTokenPayload;
  socket.userId = typeof userId === "string" ? userId : undefined;
  socket.sessionId = typeof sessionId === "string" ? sessionId : undefined;
  next();
};

export default authenticateSocket;
