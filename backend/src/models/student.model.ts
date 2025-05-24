import { model, Schema } from "mongoose";

export interface IStudent {
  name: string;
  birthOfDate: Date;
  studentId: number;
  classId: Schema.Types.ObjectId;
}

export const StudentSchema: Schema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      match: [/^[A-Za-z\s]+$/, "Name must contain only alphabets and spaces"],
      trim: true,
    },
    birthOfDate: {
      type: Date,
      required: [true, "Date of Birth is required"],
    },
    studentId: {
      type: Number,
      required: [true, "Student ID is required"],
      unique: [true, "Student Id has been taken."],
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  },
  { timestamps: true }
);

export default model<IStudent>("Student", StudentSchema);
