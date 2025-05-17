import { Document, model, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IStudent } from "./student.model";

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  SICK = "sick",
  EXCUSED = "excused",
}

export interface IAttendanceRecord {
  studentId: Types.ObjectId;
  status: AttendanceStatus;
  notes?: string;
}

export interface IJournal extends Document {
  date: Date;
  className: string;
  subject: string;
  teacherId: Types.ObjectId;
  attendanceRecords: IAttendanceRecord[];
  classNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: [true, "Student ID is required"],
  },
  status: {
    type: String,
    enum: Object.values(AttendanceStatus),
    required: [true, "Attendance status is required"],
  },
  notes: {
    type: String,
    maxlength: [500, "Notes cannot exceed 500 characters"],
  },
});

const JournalSchema = new Schema<IJournal>(
  {
    date: {
      type: Date,
      required: [true, "Class date is required"],
      index: true,
    },
    className: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher ID is required"],
      index: true,
    },
    attendanceRecords: {
      type: [AttendanceRecordSchema],
      default: [],
    },
    classNotes: {
      type: String,
      required: [true, "Class notes are required"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient querying by class and date
JournalSchema.index({ className: 1, date: 1 });

export default model<IJournal>("Journal", JournalSchema);
