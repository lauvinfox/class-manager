import { IUser } from "@models/user.model";
import { ISession } from "@models/session.model";

declare global {
  namespace Express {
    interface Request {
      userId?: IUser["_id"];
      sessionId?: ISession["_id"];
    }
  }
}
