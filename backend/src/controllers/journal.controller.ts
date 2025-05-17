import { RequestHandler } from "express";
import { z } from "zod";

import catchError from "@utils/error";
import { AttendanceStatus } from "@models/journal.model";
import { CREATED, OK } from "@constants/statusCodes";
import {
  createJournal,
  deleteJournal,
  getJournalById,
  getJournals,
  getStudentAttendance,
  updateAttendance,
  updateJournal,
} from "@services/journal.service";
import {
  CreateJournalSchema,
  UpdateJournalSchema,
  UpdateAttendanceSchema,
  QueryParamsSchema,
} from "@schemas/journal.schema";

/**
 * Create a new journal entry
 */
export const create: RequestHandler = catchError(async (req, res) => {
  const validatedData = CreateJournalSchema.parse(req.body);

  const journal = await createJournal(validatedData);

  return res.status(CREATED).json({
    message: "Journal entry created successfully",
    data: journal,
  });
});

/**
 * Get all journal entries with pagination and filtering
 */
export const getAll: RequestHandler = catchError(async (req, res) => {
  const { page, limit, className, teacherId, startDate, endDate } =
    QueryParamsSchema.parse(req.query);

  const result = await getJournals(
    page,
    limit,
    className,
    teacherId,
    startDate,
    endDate
  );

  return res.status(OK).json({
    message: "Journal entries retrieved successfully",
    data: result.journals,
    meta: {
      total: result.total,
      page: result.page,
      pages: result.pages,
    },
  });
});

/**
 * Get a single journal entry by ID
 */
export const getById: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;

  const journal = await getJournalById(id);

  return res.status(OK).json({
    message: "Journal entry retrieved successfully",
    data: journal,
  });
});

/**
 * Update a journal entry
 */
export const update: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;
  const validatedData = UpdateJournalSchema.parse(req.body);

  const updatedJournal = await updateJournal(id, validatedData);

  return res.status(OK).json({
    message: "Journal entry updated successfully",
    data: updatedJournal,
  });
});

/**
 * Delete a journal entry
 */
export const remove: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;

  await deleteJournal(id);

  return res.status(OK).json({
    message: "Journal entry deleted successfully",
  });
});

/**
 * Update attendance for a specific student in a journal
 */
export const updateStudentAttendance: RequestHandler = catchError(
  async (req, res) => {
    const { id } = req.params;
    const validatedData = UpdateAttendanceSchema.parse(req.body);

    const updatedJournal = await updateAttendance(id, validatedData);

    return res.status(OK).json({
      message: "Attendance updated successfully",
      data: updatedJournal,
    });
  }
);

/**
 * Get attendance records for a specific student
 */
export const getStudentAttendanceRecords: RequestHandler = catchError(
  async (req, res) => {
    const { studentId } = req.params;
    const { page, limit, startDate, endDate } = QueryParamsSchema.parse(
      req.query
    );

    const result = await getStudentAttendance(
      studentId,
      startDate,
      endDate,
      page,
      limit
    );

    return res.status(OK).json({
      message: "Student attendance records retrieved successfully",
      data: result.journals,
      meta: {
        total: result.total,
        page: result.page,
        pages: result.pages,
      },
    });
  }
);
