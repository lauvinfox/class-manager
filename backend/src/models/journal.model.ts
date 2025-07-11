import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Schema, Types, model } from "mongoose";

interface IJournal {
  createdBy: Types.ObjectId;
  classId: string;
  subject: string;
  title: string;
  description?: string;
  journals: {
    studentId: Types.ObjectId;
    status: "present" | "absent" | "late" | "sick" | "excused" | "pending";
    note?: string;
  }[];
  journalDate: Date;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    journalDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    journals: [
      {
        studentId: {
          type: Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        status: {
          type: String,
          enum: ["present", "absent", "late", "sick", "excused", "pending"],
          default: "pending",
        },
        note: {
          type: String,
          trim: true,
          maxlength: [500, "Note cannot exceed 500 characters"],
        },
      },
    ],
  },
  { timestamps: true }
);

JournalSchema.plugin(toJSONPlugin);
const JournalModel = model<IJournal>("Journal", JournalSchema);

export default JournalModel;
