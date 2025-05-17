import { Document, model, Schema, Types } from "mongoose";

export interface IClass extends Document {
  name: string;
  description?: string;
  instructor: Types.ObjectId;
  students: Types.ObjectId[];
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      maxlength: [100, "Class name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    schedule: [
      {
        day: {
          type: String,
          required: [true, "Day is required"],
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        startTime: {
          type: String,
          required: [true, "Start time is required"],
          match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use format HH:MM (24-hour)"],
        },
        endTime: {
          type: String,
          required: [true, "End time is required"],
          match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use format HH:MM (24-hour)"],
        },
      },
    ],
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add index for faster queries
ClassSchema.index({ name: 1 });
ClassSchema.index({ instructor: 1 });

export default model<IClass>("Class", ClassSchema);
