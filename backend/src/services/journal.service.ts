import { Types } from "mongoose";
import JournalModel, {
  AttendanceStatus,
  IAttendanceRecord,
  IJournal,
} from "@models/journal.model";
import StudentModel from "@models/student.model";
import UserModel from "@models/user.model";
import appAssert from "@utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "@constants/statusCodes";
import {
  CreateJournalParams,
  UpdateJournalParams,
  UpdateAttendanceParams,
} from "@schemas/journal.schema";

/**
 * Create a new journal entry
 */
export const createJournal = async (
  data: CreateJournalParams
): Promise<IJournal> => {
  // Validate teacher exists
  const teacherExists = await UserModel.exists({ _id: data.teacherId });
  appAssert(teacherExists, BAD_REQUEST, "Teacher not found");

  // Validate each student exists
  for (const record of data.attendanceRecords) {
    const studentExists = await StudentModel.exists({ _id: record.studentId });
    appAssert(
      studentExists,
      BAD_REQUEST,
      `Student with ID ${record.studentId} not found`
    );
  }

  // Create journal entry
  const journal = await JournalModel.create({
    date: new Date(data.date),
    className: data.className,
    subject: data.subject,
    teacherId: new Types.ObjectId(data.teacherId),
    attendanceRecords: data.attendanceRecords.map((record) => ({
      studentId: new Types.ObjectId(record.studentId),
      status: record.status,
      notes: record.notes,
    })),
    classNotes: data.classNotes,
  });

  return journal;
};

/**
 * Get all journal entries with pagination
 */
export const getJournals = async (
  page: number = 1,
  limit: number = 10,
  className?: string,
  teacherId?: string,
  startDate?: string,
  endDate?: string
): Promise<{
  journals: IJournal[];
  total: number;
  page: number;
  pages: number;
}> => {
  const query: any = {};

  if (className) {
    query.className = className;
  }

  if (teacherId) {
    query.teacherId = new Types.ObjectId(teacherId);
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  const skip = (page - 1) * limit;
  const total = await JournalModel.countDocuments(query);
  const pages = Math.ceil(total / limit);

  const journals = await JournalModel.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .populate("teacherId", "name email username")
    .exec();

  return {
    journals,
    total,
    page,
    pages,
  };
};

/**
 * Get a journal entry by ID
 */
export const getJournalById = async (id: string): Promise<IJournal> => {
  const journal = await JournalModel.findById(id)
    .populate("teacherId", "name email username")
    .exec();

  appAssert(journal, NOT_FOUND, "Journal entry not found");

  return journal;
};

/**
 * Update a journal entry
 */
export const updateJournal = async (
  id: string,
  data: UpdateJournalParams
): Promise<IJournal> => {
  const journal = await JournalModel.findById(id);
  appAssert(journal, NOT_FOUND, "Journal entry not found");

  // If updating teacherId, validate teacher exists
  if (data.teacherId) {
    const teacherExists = await UserModel.exists({ _id: data.teacherId });
    appAssert(teacherExists, BAD_REQUEST, "Teacher not found");
  }

  // If updating attendance records
  if (data.attendanceRecords) {
    // Validate each student exists
    for (const record of data.attendanceRecords) {
      const studentExists = await StudentModel.exists({
        _id: record.studentId,
      });
      appAssert(
        studentExists,
        BAD_REQUEST,
        `Student with ID ${record.studentId} not found`
      );
    }

    // Map to proper format
    data.attendanceRecords = data.attendanceRecords.map((record) => ({
      studentId: record.studentId,
      status: record.status,
      notes: record.notes,
    }));
  }

  // Convert date string to Date object if provided
  if (data.date) {
    data.date = new Date(data.date).toISOString();
  }

  const updatedJournal = await JournalModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).populate("teacherId", "name email username");

  appAssert(updatedJournal, NOT_FOUND, "Failed to update journal");

  return updatedJournal;
};

/**
 * Delete a journal entry
 */
export const deleteJournal = async (id: string): Promise<void> => {
  const result = await JournalModel.deleteOne({ _id: id });
  appAssert(result.deletedCount > 0, NOT_FOUND, "Journal entry not found");
};

/**
 * Update attendance for a specific student in a journal
 */
export const updateAttendance = async (
  journalId: string,
  data: UpdateAttendanceParams
): Promise<IJournal> => {
  const journal = await JournalModel.findById(journalId);
  appAssert(journal, NOT_FOUND, "Journal entry not found");

  const studentExists = await StudentModel.exists({ _id: data.studentId });
  appAssert(studentExists, BAD_REQUEST, "Student not found");

  // Find the attendance record for this student
  const studentIdObj = new Types.ObjectId(data.studentId);
  const recordIndex = journal.attendanceRecords.findIndex((record) =>
    record.studentId.equals(studentIdObj)
  );

  if (recordIndex === -1) {
    // Add new record if student doesn't have one yet
    journal.attendanceRecords.push({
      studentId: studentIdObj,
      status: data.status,
      notes: data.notes,
    });
  } else {
    // Update existing record
    journal.attendanceRecords[recordIndex].status = data.status;
    if (data.notes !== undefined) {
      journal.attendanceRecords[recordIndex].notes = data.notes;
    }
  }

  await journal.save();
  return journal;
};

/**
 * Get attendance records for a specific student across all journals
 */
export const getStudentAttendance = async (
  studentId: string,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  journals: IJournal[];
  total: number;
  page: number;
  pages: number;
}> => {
  const query: any = {
    "attendanceRecords.studentId": new Types.ObjectId(studentId),
  };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  const skip = (page - 1) * limit;
  const total = await JournalModel.countDocuments(query);
  const pages = Math.ceil(total / limit);

  const journals = await JournalModel.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .populate("teacherId", "name email username")
    .exec();

  return {
    journals,
    total,
    page,
    pages,
  };
};
