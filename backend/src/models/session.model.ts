import { thirtyDaysFromNow } from "@utils/date";
import { Document, model, Schema, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema: Schema = new Schema<ISession>({
  userId: {
    ref: "User",
    type: Schema.Types.ObjectId,
    index: true,
  },
  userAgent: { type: String },
  expiresAt: { type: Date, default: thirtyDaysFromNow },
  createdAt: { type: Date, required: true, default: Date.now() },
});

export default model<ISession>("Session", SessionSchema);
