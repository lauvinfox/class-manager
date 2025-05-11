import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      userId: mongoose.Types.ObjectID; // Harusnya mongoose.Types.ObjectID tapi karena error terpaksa dijadiin any
      sessionId: mongoose.Types.ObjectID;
    }
    interface Response {
      userId: mongoose.Types.ObjectID; // Harusnya mongoose.Types.ObjectID tapi karena error terpaksa dijadiin any
      sessionId: mongoose.Types.ObjectID;
    }
  }
}
export {};
