import { NOT_FOUND } from "@constants/statusCodes";
import AssignmentModel from "@models/assignment.model";
import * as NotificationService from "@services/notification.service";
import * as StudentService from "@services/student.service";

import UserModel from "@models/user.model";
import appAssert from "@utils/appAssert";
import { Types } from "mongoose";
import cron from "node-cron";

export const createAssignment = async ({
  userId,
  classId,
  subject,
  title,
  description,
  assignmentDate,
  startTime,
  endTime,
  assignmentType,
}: {
  userId: string;
  classId: string;
  subject: string;
  title: string;
  description: string;
  assignmentDate: string;
  assignmentType: string;
  startTime: string;
  endTime: string;
}) => {
  // Validate instructor exists
  const instructor = await UserModel.findById(userId);
  appAssert(instructor, NOT_FOUND, "Instructor not found");

  const startTimeString = `${assignmentDate}T${startTime}`;
  const endTimeString = `${assignmentDate}T${endTime}`;

  const now = new Date();

  if (new Date(assignmentDate) > now) {
    // Tugas datang setelah hari ini, atur pengingat setiap jam 6 pagi WIB

    // Mengatur jadwal pengingat dengan cron (jam 6 pagi WIB)
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

  const grades = students.map((student: any) => ({
    studentId: student._id,
    // score dan notes bisa dikosongkan, nanti diisi saat penilaian
  }));

  const assignmentDocs = await AssignmentModel.create({
    assignedBy: userId,
    classId,
    subject,
    title,
    description,
    assignmentDate,
    startTime: startTimeString,
    endTime: endTimeString,
    grades,
    assignmentType,
  });

  return assignmentDocs;
};

export const getAssignmentsByClassId = async (classId: string) => {
  const assignmentsDocs = await AssignmentModel.find({ classId }).lean();
  appAssert(assignmentsDocs, NOT_FOUND, "Assignments not found!");
  return { assignmentsDocs };
};

type AssignmentsBySubject = {
  classId: string;
  subject: string;
  assignedBy: Types.ObjectId;
  assignments: {
    assignmentsDate: Date;
    title: string;
    description: string;
    grades: {
      studentId: Types.ObjectId;
      score?: number;
      notes?: string;
    }[];
  }[];
};

export const getAssignmentsBySubject = async (
  subject: string,
  classId: string
) => {
  const assignmentsDocs = await AssignmentModel.find({ classId, subject });
  appAssert(assignmentsDocs, NOT_FOUND, "Assignments not found!");

  const result = assignmentsDocs.reduce<AssignmentsBySubject[]>(
    (acc, assignment) => {
      // Mencari apakah classId dan subject sudah ada dalam hasil
      const existingClass = acc.find(
        (item) =>
          item.classId === assignment.classId &&
          item.subject === assignment.subject
      );

      // Jika sudah ada, tambahkan assignment ke dalam assignments array
      if (existingClass) {
        existingClass.assignments.push({
          assignmentsDate: assignment.assignmentDate,
          title: assignment.title,
          description: assignment.description,
          grades: assignment.grades,
        });
      } else {
        // Jika belum ada, buat entri baru
        acc.push({
          classId: assignment.classId,
          subject: assignment.subject,
          assignedBy: assignment.assignedBy,
          assignments: [
            {
              assignmentsDate: assignment.assignmentDate,
              title: assignment.title,
              description: assignment.description,
              grades: assignment.grades,
            },
          ],
        });
      }

      return acc;
    },
    []
  );

  return result;
};

export const giveStudentScore = async ({
  assignmentId,
  studentId,
  score,
  notes,
}: {
  assignmentId: string;
  studentId: string;
  score: number;
  notes?: string;
}) => {
  const assignmentDocs = await AssignmentModel.findOneAndUpdate(
    { _id: assignmentId, "grades.studentId": studentId },
    {
      $set: {
        "grades.$.score": score,
        "grades.$.notes": notes,
      },
    },
    { new: true, runValidators: true }
  );

  // If student score entry doesn't exist, push a new one
  if (!assignmentDocs) {
    return await AssignmentModel.findByIdAndUpdate(
      assignmentId,
      {
        $push: {
          grades: {
            studentId,
            score,
            notes,
          },
        },
      },
      { new: true }
    );
  }

  return assignmentDocs;
};

export const giveStudentsScore = async ({
  assignmentId,
  scoresData,
}: {
  assignmentId: string;
  scoresData: {
    studentId: string;
    score: number;
    notes?: string;
  }[];
}) => {
  const assignment = await AssignmentModel.findById(assignmentId);
  appAssert(assignment, NOT_FOUND, "Assignment not found!");

  for (const { studentId, score, notes } of scoresData) {
    const existingScore = assignment.grades.find(
      (s: any) => s.studentId.toString() === studentId
    );
    if (existingScore) {
      existingScore.score = score;
      existingScore.notes = notes;
    }
  }

  await assignment.save();
  return assignment;
};

export const deleteStudentsByClassId = async (classId: string) => {
  const result = await AssignmentModel.updateMany(
    { classId },
    { $set: { grades: [] } }
  );
  return result;
};

export const getAssignmentById = async (assignmentId: string) => {
  const assignment = await AssignmentModel.findById(assignmentId)
    .populate("grades.studentId", "name")
    .populate("assignedBy", "name")
    .lean();
  appAssert(assignment, NOT_FOUND, "Assignment Not Found!");
  return assignment;
};

export const getAssignmentsByClass = async (classId: string) => {
  const assignmentsDocs = await AssignmentModel.find(
    { classId },
    { title: 1, subject: 1, grades: 1, assignmentDate: 1 }
  )
    .populate("grades.studentId", "name")
    .lean();

  // Mengelompokkan berdasarkan subject
  const groupedBySubject = assignmentsDocs.reduce(
    (acc: any, assignment: any) => {
      // Memastikan ada entry untuk subject yang sesuai
      if (!acc[assignment.subject]) {
        acc[assignment.subject] = [];
      }

      // Masukkan tugas ke dalam grup yang sesuai dengan subject
      acc[assignment.subject].push({
        assignmentId: assignment._id,
        title: assignment.title,
        assignmentDate: assignment.assignmentDate,
        assignmentType: assignment.assignmentType,
        grades: (assignment.grades || []).map((g: any) => ({
          studentId: g.studentId._id,
          name: g.studentId.name,
          score: g.score,
          notes: g.notes,
        })),
      });

      return acc;
    },
    {}
  );

  // Hasil setelah dikelompokkan
  return groupedBySubject;
};

// Mengelompokkan data berdasarkan classId dan studentId
type StudentAssignment = {
  classId: string;
  studentId: string;
  assignments: {
    assignmentId: Types.ObjectId;
    title: string;
    subject: string;
    score?: number;
    notes?: string;
  }[];
};

export const getAssignmentsByStudent = async ({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) => {
  const assignmentsDocs = await AssignmentModel.find(
    {
      classId,
      "grades.studentId": studentId,
    },
    { classId: 1, title: 1, subject: 1, grades: 1 }
  )
    .populate("grades.studentId", "name")
    .lean();

  // Cari nama student dari salah satu assignment yang ditemukan
  let studentName = "";
  for (const assignment of assignmentsDocs) {
    const grade = assignment.grades.find(
      (g: any) =>
        (g.studentId?._id?.toString?.() || g.studentId?.toString?.()) ===
        studentId
    );
    if (
      grade &&
      grade.studentId &&
      typeof grade.studentId === "object" &&
      "name" in grade.studentId
    ) {
      studentName = (grade.studentId as { name: string }).name;
      break;
    }
  }

  // Susun assignments
  const assignments = assignmentsDocs.map((assignment) => {
    const grade = assignment.grades.find(
      (g: any) =>
        (g.studentId?._id?.toString?.() || g.studentId?.toString?.()) ===
        studentId
    );
    return {
      assignmentId: assignment._id,
      title: assignment.title,
      subject: assignment.subject,
      score: grade?.score,
      notes: grade?.notes,
    };
  });

  // Return sesuai format permintaan
  return [
    {
      classId,
      studentId,
      name: studentName,
      assignments,
    },
  ];
};

export const deleteAssignmentsByClassId = async (classId: string) => {
  const result = await AssignmentModel.deleteMany({ classId });
  if (result.deletedCount === 0) {
    throw new Error("No assignments found for the given classId");
  }
  return result;
};
