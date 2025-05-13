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

// import mongoose from "mongoose";

// declare global {
//   namespace Express {
//     interface Request {
//       userId: mongoose.Types.ObjectID; // Harusnya mongoose.Types.ObjectID tapi karena error terpaksa dijadiin any
//       sessionId: mongoose.Types.ObjectID;
//     }
//     interface Response {
//       userId: mongoose.Types.ObjectID; // Harusnya mongoose.Types.ObjectID tapi karena error terpaksa dijadiin any
//       sessionId: mongoose.Types.ObjectID;
//     }
//   }
// }
// export {};
