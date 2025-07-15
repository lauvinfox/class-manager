import * as ClassService from "@services/class.service";
import * as JournalService from "@services/journal.service";

import { CREATED, NOT_FOUND, UNAUTHORIZED } from "@constants/statusCodes";

import catchError from "@utils/error";
import appAssert from "@utils/appAssert";
import { RequestHandler } from "express";

export const getJournalByClassId = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId } = req.params;

  const isOwner = await ClassService.checkClassOwner(classId, userId);
  appAssert(isOwner, UNAUTHORIZED, "You are not the owner of this class");

  const journals = await JournalService.getJournalsByClassId(classId);

  return res.status(200).json({
    message: "Journals retrieved successfully",
    data: journals,
  });
});

export const getJournalsBySubject = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId } = req.params;

  const subject = (await ClassService.getSubjectByClassUserId(
    userId,
    classId
  )) as string;

  const journals = await JournalService.getJournalsBySubject({
    classId,
    subject,
  });

  return res.status(200).json({
    message: "Journals by subject retrieved successfully",
    data: journals,
  });
});

export const createJournalByClassId = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId } = req.params;

  const { title, description, journalDate, startTime, endTime } = req.body;

  const isInstructor = await ClassService.checkInstructor(classId, userId);
  appAssert(isInstructor, UNAUTHORIZED, "Instructors Not Found");

  const subject = (await ClassService.getSubjectByClassUserId(
    userId,
    classId
  )) as string;

  const journal = await JournalService.createJournal({
    userId,
    classId,
    subject,
    title,
    description,
    journalDate,
    startTime,
    endTime,
  });

  return res
    .status(CREATED)
    .json({ message: "Journal has been created!", data: journal });
});

export const giveAttendancesAndNotes = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId } = req.params;
  const { journalId, journals } = req.body;

  const isInstructor = await ClassService.checkInstructor(classId, userId);
  appAssert(isInstructor, UNAUTHORIZED, "Instructors Not Found");

  const journal = await JournalService.addAttendancesAndNotes({
    journalId,
    journals,
  });

  return res.status(200).json({
    message: "Attendance and notes have been given!",
    data: journal,
  });
});

export const getJournalById: RequestHandler = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId } = req.params;

  const { journalId } = req.body;

  const isInstructor = await ClassService.checkInstructor(classId, userId);
  const isClassOwner = await ClassService.checkClassOwner(classId, userId);
  appAssert(isInstructor || isClassOwner, NOT_FOUND, "Instructors Not Found");

  const journal = await JournalService.getJournalById({
    journalId,
  });
  appAssert(journal, UNAUTHORIZED, "Journal not found");

  return res.status(200).json({
    message: "Journal retrieved successfully",
    data: journal,
  });
});

export const getAttendanceSummary: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId } = req.params;

    const isOwner = await ClassService.checkClassOwner(classId, userId);
    appAssert(isOwner, UNAUTHORIZED, "You are not the owner of this class");

    const attendanceSummary =
      await JournalService.getJournalsAttendanceSummary(classId);

    return res.status(200).json({
      message: "Attendance summary retrieved successfully",
      data: attendanceSummary,
    });
  }
);

export const getAttendanceSummaryBySubject: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId } = req.params;

    const isInstructor = await ClassService.checkInstructor(classId, userId);
    appAssert(
      isInstructor,
      UNAUTHORIZED,
      "You are not an instructor of this class"
    );

    const subject = await ClassService.getSubjectByClassUserId(userId, classId);
    appAssert(subject, NOT_FOUND, "Subject not found for this class");

    const attendanceSummary =
      await JournalService.getJournalsAttendanceSummaryBySubject(
        classId,
        subject
      );

    return res.status(200).json({
      message: "Attendance summary by subject retrieved successfully",
      data: attendanceSummary,
    });
  }
);

export const getAttendanceSummaryBySubjects: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId } = req.params;

    const isOwner = await ClassService.checkClassOwner(classId, userId);
    appAssert(isOwner, UNAUTHORIZED, "You are not the owner of this class");

    const subjects = await ClassService.getClassSubjects(classId);

    const attendanceSummary =
      await JournalService.getJournalsAttendanceSummaryBySubjects(
        classId,
        subjects
      );

    return res.status(200).json({
      message: "Attendance summary by subject retrieved successfully",
      data: attendanceSummary,
    });
  }
);
