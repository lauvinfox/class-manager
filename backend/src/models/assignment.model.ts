import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Schema, model } from "mongoose";

interface IAssignment {
  classId: string;
  title: string;
  description: string;
  questions?: string[];
  assignedBy: string;
  grades?: Record<string, number>;
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
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    assignedBy: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

AssignmentSchema.plugin(toJSONPlugin);
const AssignmentModel = model<IAssignment>("Assignment", AssignmentSchema);
export default AssignmentModel;
