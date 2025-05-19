import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Document, model, Schema, Types } from "mongoose";

export interface IClass extends Document {
  name: string;
  description?: string;
  homeroomTeacher: Types.ObjectId;
  teachers: Types.ObjectId[];
  students: Types.ObjectId[];
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
    homeroomTeacher: {
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
  },
  { timestamps: true }
);
toJSONPlugin(ClassSchema);
// // Add index for faster queries
// ClassSchema.index({ name: 1 });
// ClassSchema.index({ instructor: 1 });

export default model<IClass>("Class", ClassSchema);
