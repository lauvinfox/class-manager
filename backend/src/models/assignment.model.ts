import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Schema, Types, model } from "mongoose";

interface IAssignment {
  assignedBy: Types.ObjectId;
  classId: string;
  subject: string;
  title: string;
  description: string;
  questions?: string[];
  assignmentDate: Date;
  startTime: Date;
  endTime: Date;
  grades: { studentId: Types.ObjectId; score?: number; notes?: string }[];
  assignmentType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    classId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    assignmentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

AssignmentSchema.plugin(toJSONPlugin);
const AssignmentModel = model<IAssignment>("Assignment", AssignmentSchema);

export default AssignmentModel;
