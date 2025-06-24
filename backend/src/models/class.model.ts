import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Document, model, Schema, Types } from "mongoose";
import { customAlphabet } from "nanoid";

interface IInstructor {
  instructorId: Types.ObjectId;
  subject?: string;
  status: string;
}

export interface IClass extends Document {
  classId: string;
  name: string;
  description?: string;
  classOwner: Types.ObjectId;
  assignments?: Types.ObjectId[];
  instructors?: IInstructor[];
  subjects?: string[];
  students?: Types.ObjectId[];
}

const InstructorSchema = new Schema<IInstructor>(
  {
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
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
    assignments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    subjects: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Subject name cannot exceed 100 characters"],
      },
    ],
  },
  { timestamps: true }
);
toJSONPlugin(ClassSchema);

export default model<IClass>("Class", ClassSchema);
