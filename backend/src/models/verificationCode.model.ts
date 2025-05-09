import { Document, Schema, model, Types } from "mongoose";
import { VerificationCodeType } from "constants/verificationCodeType";

export interface IVerificationCode extends Document {
  userId: Types.ObjectId;
  type: VerificationCodeType;
  expiresAt: Date;
  createdAt: Date;
}

const VerificationCodeSchema: Schema = new Schema<IVerificationCode>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
  },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: Date.now() },
});

export default model<IVerificationCode>(
  "VerificationCode",
  VerificationCodeSchema,
  "verification_codes"
);
