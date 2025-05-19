import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Document, model, Schema, Types } from "mongoose";

export interface IGrade extends Document {
  description: string;
  subject: string;
  student: Types.ObjectId;
  classroom: Types.ObjectId;
  teacher: Types.ObjectId;
  grade: number;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema: Schema = new Schema<IGrade>(
  {
    description: { type: String, required: true },
    subject: { type: String, required: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    grade: { type: Number, required: true },
  },
  { timestamps: true }
);
toJSONPlugin(GradeSchema);

export default model<IGrade>("Grade", GradeSchema);
