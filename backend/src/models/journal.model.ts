import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Schema, Types, model } from "mongoose";

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  SICK = "sick",
  EXCUSED = "excused",
  PENDING = "pending",
}

export interface IAttendanceEntry {
  studentId: Types.ObjectId;
  status: AttendanceStatus;
  notes?: string;
}

interface IJournal {
  createdBy: Types.ObjectId;
  classId: string;
  subject: string;
  attendances: IAttendanceEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceEntrySchema = new Schema<IAttendanceEntry>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PENDING,
      required: [true, "Attendance status is required"],
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  { _id: false }
);

const JournalSchema = new Schema<IJournal>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    classId: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    attendances: {
      type: [AttendanceEntrySchema],
      required: true,
    },
  },
  { timestamps: true }
);

JournalSchema.plugin(toJSONPlugin);
const JournalModel = model<IJournal>("Journal", JournalSchema);

export default JournalModel;

// import { toJSONPlugin } from "@utils/toJSONPlugin";
// import { Document, model, Schema, Types } from "mongoose";

// export enum AttendanceStatus {
//   PRESENT = "present",
//   ABSENT = "absent",
//   LATE = "late",
//   SICK = "sick",
//   EXCUSED = "excused",
// }

// export interface IAttendanceRecord {
//   studentId: Types.ObjectId;
//   status: AttendanceStatus;
//   notes?: string;
// }

// export interface IJournal extends Document {
//   date: Date;
//   classroom: Types.ObjectId;
//   teacher: Types.ObjectId;
//   subject: string;
//   attendanceRecords: IAttendanceRecord[];
//   classNotes: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
//   studentId: {
//     type: Schema.Types.ObjectId,
//     ref: "Student",
//     required: [true, "Student ID is required"],
//   },
//   status: {
//     type: String,
//     enum: Object.values(AttendanceStatus),
//     required: [true, "Attendance status is required"],
//   },
//   notes: {
//     type: String,
//     maxlength: [500, "Notes cannot exceed 500 characters"],
//   },
// });

// const JournalSchema = new Schema<IJournal>(
//   {
//     date: {
//       type: Date,
//       required: [true, "Class date is required"],
//       index: true,
//     },
//     teacher: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Teacher ID is required"],
//       index: true,
//     },
//     classroom: {
//       type: Schema.Types.ObjectId,
//       ref: "Class",
//       required: [true, "Class name is required"],
//       index: true,
//     },
//     subject: {
//       type: String,
//       required: [true, "Subject is required"],
//       trim: true,
//     },
//     attendanceRecords: {
//       type: [AttendanceRecordSchema],
//       default: [],
//     },
//     classNotes: {
//       type: String,
//       required: [true, "Class notes are required"],
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );
// toJSONPlugin(JournalSchema);

// // // Compound index for efficient querying by class and date
// // JournalSchema.index({ className: 1, date: 1 });

// export default model<IJournal>("Journal", JournalSchema);
