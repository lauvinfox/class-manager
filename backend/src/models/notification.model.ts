import { model, Schema, Types } from "mongoose";

interface INotification {
  userId: Types.ObjectId;
  message: string;
  classId?: string;
  isRead: boolean;
  type: "invite" | "reminder" | "info" | "other";
  status?: "accepted" | "denied" | "pending";
  classOwner?: string;
  className?: string;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      required: true,
    },
    classId: { type: String, ref: "Class" },
    isRead: {
      type: Boolean,
      default: false,
      required: [true, "IsRead is required"],
    },
    type: {
      type: String,
      enum: ["invite", "reminder", "info", "other"], // enum string
      required: [true, "Type is required"],
    },
    status: {
      type: String,
      enum: ["accepted", "denied", "pending"], // enum string
      default: "pending",
    },
    classOwner: { type: String, ref: "User" },
    className: { type: String, ref: "Class" },
  },
  { timestamps: true }
);

export default model<INotification>("Notification", NotificationSchema);
