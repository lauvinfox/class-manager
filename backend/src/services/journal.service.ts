import cron from "node-cron";

import { NOT_FOUND } from "@constants/statusCodes";
import appAssert from "@utils/appAssert";

import JournalModel from "@models/journal.model";

import * as StudentService from "@services/student.service";
import * as NotificationService from "@services/notification.service";

enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  SICK = "sick",
  EXCUSED = "excused",
  PENDING = "pending",
}

export const createJournal = async ({
  userId,
  classId,
  subject,
  title,
  description,
  journalDate,
  startTime,
  endTime,
}: {
  userId: string;
  classId: string;
  subject: string;
  title: string;
  description?: string;
  journalDate: string;
  startTime: string;
  endTime: string;
}) => {
  const startTimeString = `${journalDate}T${startTime}`;
  const endTimeString = `${journalDate}T${endTime}`;

  const now = new Date();

  if (new Date(journalDate) > now) {
    const timezone = "Asia/Jakarta"; // WIB timezone
    cron.schedule(
      "0 6 * * *",
      async () => {
        await NotificationService.createNotification({
          userId,
          message: "Reminder: You have an upcoming assignment!",
          type: "reminder",
          classId,
        });
      },
      {
        timezone: timezone,
      }
    );
  }

  const students = await StudentService.getStudentsByClassId(classId);

  const journals = students.map((student: any) => ({
    studentId: student._id,
    status: "pending",
  }));

  const journalDocs = await JournalModel.create({
    createdBy: userId,
    classId,
    subject,
    title,
    description,
    journals,
    journalDate: journalDate,
    startTime: startTimeString,
    endTime: endTimeString,
  });

  return journalDocs;
};

export const getJournalById = async ({ journalId }: { journalId: string }) => {
  const journal = await JournalModel.findById(journalId)
    .populate("createdBy", "name")
    .populate("journals.studentId", "name")
    .lean();
  appAssert(journal, NOT_FOUND, "Journal not found!");
  return journal;
};

export const addAttendancesAndNotes = async ({
  journalId,
  journals,
}: {
  journalId: string;
  journals: {
    studentId: string;
    status?: AttendanceStatus;
    note?: string;
  }[];
}) => {
  const journal = await JournalModel.findById(journalId);
  appAssert(journal, NOT_FOUND, "Journal not found!");

  // Update attendance records
  for (const { studentId, status, note } of journals) {
    const existingAttendance = journal.journals.find(
      (a) => a.studentId.toString() === studentId
    );

    if (existingAttendance) {
      existingAttendance.status = status as AttendanceStatus;
      existingAttendance.note = note;
    }
  }

  await journal.save();
  return journal;
};

export const getJournalByClassAndStudent = async (
  classId: string,
  studentId: string
) => {
  const journalDocs = await JournalModel.find({
    classId,
    "journals.studentId": studentId,
  })
    .select("title subject journalDate journals")
    .populate("journals.studentId", "name")
    .lean();

  return journalDocs;
};

export const getJournalsByClassId = async (classId: string) => {
  const journalsDocs = await JournalModel.find({ classId })
    .populate("journals.studentId", "name")
    .sort({ createdAt: -1 })
    .lean();
  appAssert(journalsDocs, NOT_FOUND, "Journals not found!");

  const result = journalsDocs.map((journal: any) => ({
    journalId: journal._id.toString(),
    title: journal.title,
    subject: journal.subject,
    createdBy:
      journal.createdBy?._id?.toString?.() || journal.createdBy?.toString?.(),
    createdByName: journal.createdBy?.name || "",
    description: journal.description,
    journalDate: journal.journalDate,
    journals: (journal.journals || []).map((j: any) => ({
      studentId: j.studentId?._id?.toString?.() || j.studentId?.toString?.(),
      name: j.studentId?.name || "",
      status: j.status,
      note: j.note,
    })),
  }));

  return result;
};

export const getJournalsBySubject = async ({
  classId,
  subject,
}: {
  classId: string;
  subject: string;
}) => {
  const journalsDocs = await JournalModel.find({
    classId,
    subject,
  }).sort({ createdAt: -1 });

  appAssert(journalsDocs, NOT_FOUND, "Journals not found!");
  return journalsDocs;
};
