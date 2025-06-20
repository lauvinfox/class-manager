import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Document, model, Schema, Types } from "mongoose";
import { customAlphabet } from "nanoid";

interface IInstructor {
  instructorId: Types.ObjectId;
  role: string;
  status: string;
}

export interface IClass extends Document {
  classId: string;
  name: string;
  description?: string;
  classOwner: Types.ObjectId;
  instructors?: IInstructor[];
  roles?: string[];
  students?: Types.ObjectId[];
}

const InstructorSchema = new Schema<IInstructor>(
  {
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "pending", "denied"],
      required: true,
    },
  },
  { _id: false }
);

const ClassSchema: Schema = new Schema<IClass>(
  {
    classId: {
      type: String,
      unique: true,
      default: () =>
        customAlphabet(
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
          8
        )(),
      index: true,
    },
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
    classOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    instructors: [InstructorSchema],
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);
toJSONPlugin(ClassSchema);
// // Add index for faster queries
// ClassSchema.index({ name: 1 });
// ClassSchema.index({ instructor: 1 });

export default model<IClass>("Class", ClassSchema);
