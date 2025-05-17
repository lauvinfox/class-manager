import { z } from "zod";
import { AttendanceStatus } from "@models/journal.model";
import e from "express";

// Schema for validating attendance status
export const AttendanceStatusSchema = z.nativeEnum(AttendanceStatus);

// Schema for attendance record
export const AttendanceRecordSchema = z.object({
  studentId: z.string().min(1),
  status: AttendanceStatusSchema,
  notes: z.string().max(500).optional(),
});

// Schema for creating a journal entry
export const CreateJournalSchema = z.object({
  date: z.string().refine((value) => !isNaN(new Date(value).getTime()), {
    message: 'Invalid date format, expected "YYYY-MM-DD"',
  }),
  className: z.string().min(1).max(100),
  subject: z.string().min(1).max(100),
  teacherId: z.string().min(1),
  attendanceRecords: z.array(AttendanceRecordSchema),
  classNotes: z.string().min(1),
});

// Schema for updating a journal entry (all fields optional)
export const UpdateJournalSchema = CreateJournalSchema.partial();

// Schema for updating a student's attendance
export const UpdateAttendanceSchema = z.object({
  studentId: z.string().min(1),
  status: AttendanceStatusSchema,
  notes: z.string().max(500).optional(),
});

// Schema for query parameters
export const QueryParamsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(10),
  className: z.string().optional(),
  teacherId: z.string().optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: "Invalid startDate format",
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: "Invalid endDate format",
    }),
});

export type CreateJournalParams = z.infer<typeof CreateJournalSchema>;
export type UpdateJournalParams = z.infer<typeof UpdateJournalSchema>;
export type UpdateAttendanceParams = z.infer<typeof UpdateAttendanceSchema>;
