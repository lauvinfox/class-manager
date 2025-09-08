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
  grades: { studentId: Types.ObjectId; score?: number; notes?: string }[];
  assignmentType: "homework" | "quiz" | "exam" | "project" | "finalExam";
  weights: {
    userId: Types.ObjectId;
    subject: string;
    assignmentWeight: {
      homework?: number;
      quiz?: number;
      exam?: number;
      project?: number;
      finalExam?: number;
    };
  }[];
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
      ref: "User",
      required: true,
    },
    assignmentDate: {
      type: Date,
      required: true,
    },
    grades: [
      {
        studentId: {
          type: Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        score: {
          type: Number,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: 500,
        },
        _id: false,
      },
    ],
    assignmentType: {
      type: String,
      enum: ["homework", "quiz", "exam", "project", "finalExam"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

AssignmentSchema.plugin(toJSONPlugin);
const AssignmentModel = model<IAssignment>("Assignment", AssignmentSchema);

export default AssignmentModel;
