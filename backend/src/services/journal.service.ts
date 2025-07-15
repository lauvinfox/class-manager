import cron from "node-cron";

import { NOT_FOUND } from "@constants/statusCodes";
import appAssert from "@utils/appAssert";

import JournalModel from "@models/journal.model";

import * as StudentService from "@services/student.service";
import * as NotificationService from "@services/notification.service";
import * as ClassService from "@services/class.service";

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

  await ClassService.addJournalToClass(classId, journalDocs._id);

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

export const getJournalsAttendanceSummary = async (classId: string) => {
  const journalsDocs = await JournalModel.find({ classId })
    .select("journals")
    .populate("journals.studentId", "name")
    .lean();

  // Map studentId => { present: n, absent: n, ... }
  const studentSummary: Record<string, Record<string, number>> = {};

  journalsDocs.forEach((journal) => {
    if (Array.isArray(journal.journals)) {
      journal.journals.forEach((entry) => {
        const studentId =
          entry.studentId._id?.toString?.() || String(entry.studentId);
        if (!studentSummary[studentId]) {
          studentSummary[studentId] = {
            present: 0,
            absent: 0,
            late: 0,
            sick: 0,
            excused: 0,
            pending: 0,
          };
        }
        if (studentSummary[studentId][entry.status] !== undefined) {
          studentSummary[studentId][entry.status]++;
        }
      });
    }
  });

  return studentSummary;
};

export const getJournalsAttendanceSummaryBySubject = async (
  classId: string,
  subject: string
) => {
  const journalsDocs = await JournalModel.find({ classId, subject })
    .select("journals subject")
    .populate("journals.studentId", "name")
    .lean();

  // Map studentId => { name, studentId, attendances: { present, ... } }
  const studentAttendance: Record<
    string,
    { name: string; studentId: any; attendances: Record<string, number> }
  > = {};
  for (const journal of journalsDocs) {
    for (const entry of journal.journals || []) {
      const studentObj = entry.studentId;
      const studentId = studentObj._id?.toString?.() || String(studentObj);
      const name =
        typeof studentObj === "object" && "name" in studentObj
          ? (studentObj as any).name
          : "";
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          name,
          studentId: studentObj._id || studentObj,
          attendances: {
            present: 0,
            absent: 0,
            late: 0,
            sick: 0,
            excused: 0,
            pending: 0,
          },
        };
      }
      if (
        studentAttendance[studentId].attendances[entry.status] !== undefined
      ) {
        studentAttendance[studentId].attendances[entry.status]++;
      }
    }
  }

  return {
    subject,
    totalJournals: journalsDocs.length,
    attendancesSummary: Object.values(studentAttendance),
  };
};

export const getJournalsAttendanceSummaryBySubjects = async (
  classId: string,
  subjects: string[]
) => {
  // Ambil semua journals untuk classId dan subjects
  const journalsDocs = await JournalModel.find({
    classId,
    subject: { $in: subjects },
  })
    .select("journals subject")
    .populate("journals.studentId", "name")
    .lean();

  // Kelompokkan journals per subject
  const subjectMap: Record<string, any[]> = {};
  for (const journal of journalsDocs) {
    if (!subjectMap[journal.subject]) subjectMap[journal.subject] = [];
    subjectMap[journal.subject].push(journal);
  }

  // Susun hasil akhir
  const result = Object.entries(subjectMap).map(([subject, journals]) => {
    // Map studentId => { name, studentId, attendances: { present, ... } }
    const studentAttendance: Record<
      string,
      { name: string; studentId: any; attendances: Record<string, number> }
    > = {};
    for (const journal of journals) {
      for (const entry of journal.journals || []) {
        const studentObj = entry.studentId;
        const studentId = studentObj._id?.toString?.() || String(studentObj);
        const name = studentObj.name || "";
        if (!studentAttendance[studentId]) {
          studentAttendance[studentId] = {
            name,
            studentId: studentObj._id || studentObj,
            attendances: {
              present: 0,
              absent: 0,
              late: 0,
              sick: 0,
              excused: 0,
              pending: 0,
            },
          };
        }
        if (
          studentAttendance[studentId].attendances[entry.status] !== undefined
        ) {
          studentAttendance[studentId].attendances[entry.status]++;
        }
      }
    }
    return {
      subject,
      totalJournals: journals.length,
      attendancesSummary: Object.values(studentAttendance),
    };
  });

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

export const removeStudentFromJournal = async (classId: string, id: string) => {
  const journalsDocs = await JournalModel.updateMany(
    { classId, "journals.studentId": id },
    { $pull: { journals: { studentId: id } } }
  );

  return journalsDocs;
};

export const getAttendanceByStudentId = async (
  classId: string,
  studentId: string
) => {
  // Fetch all journals for the class and student
  const journalsDocs = await JournalModel.find({
    classId,
    "journals.studentId": studentId,
  })
    .select("subject journals")
    .lean();

  // Group attendance by subject
  const subjectMap: Record<string, Record<string, number>> = {};
  for (const journal of journalsDocs) {
    const subject = journal.subject;
    if (!subjectMap[subject]) {
      subjectMap[subject] = {
        present: 0,
        absent: 0,
        late: 0,
        sick: 0,
        excused: 0,
        pending: 0,
      };
    }
    for (const entry of journal.journals || []) {
      const entryStudentId =
        entry.studentId?._id?.toString?.() ||
        entry.studentId?.toString?.() ||
        String(entry.studentId);
      if (
        entryStudentId === studentId &&
        subjectMap[subject][entry.status] !== undefined
      ) {
        subjectMap[subject][entry.status]++;
      }
    }
  }

  // Build result array
  const result = Object.entries(subjectMap).map(([subject, attendance]) => ({
    subject,
    attendance,
  }));

  return result;
};
