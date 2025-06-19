import { model, Schema, Types } from "mongoose";

interface INotification {
  userId: Types.ObjectId;
  message: string;
  isRead: boolean;
  type: "invite" | "reminder" | "info" | "other";
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
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
  },
  { timestamps: true }
);

export default model<INotification>("Notification", NotificationSchema);
