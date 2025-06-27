import { NOT_FOUND } from "@constants/statusCodes";
import AssignmentModel from "@models/assignment.model";
import UserModel from "@models/user.model";
import * as NotificationService from "@services/notification.service";
import appAssert from "@utils/appAssert";

export const createAssignment = async ({
  userId,
  classId,
  subject,
  title,
  description,
  assignmentDate,
  startTime,
  endTime,
}: {
  userId: string;
  classId: string;
  subject: string;
  title: string;
  description: string;
  assignmentDate: string;
  startTime: string;
  endTime: string;
}) => {
  // Validate instructor exists
  const instructor = await UserModel.findById(userId);
  appAssert(instructor, NOT_FOUND, "Instructor not found");

  const assignmentDocs = await AssignmentModel.create({
    assignedBy: userId,
    classId,
    subject,
    title,
    description,
    assignmentDate,
    startTime,
    endTime,
  });

  // const assignmentDateObj = new Date(assignmentDate);
  // if (assignmentDateObj.getTime() > Date.now()) {
  //   await NotificationService.createNotification({
  //     userId,
  //     classId,
  //     type: "reminder",
  //     message: `Reminder: Assignment "${title}" is scheduled for ${assignmentDate}`,
  //   });
  // }

  return assignmentDocs;
};

export const getAssignmentsByClassId = async (classId: string) => {
  const assignmentsDocs = await AssignmentModel.find({ classId });
  appAssert(assignmentsDocs, NOT_FOUND, "Assignments not found!");
  return assignmentsDocs;
};

export const getAssignmentsBySubject = async (
  subject: string,
  classId: string
) => {
  const assignmentsDocs = await AssignmentModel.find({ classId, subject });
  appAssert(assignmentsDocs, NOT_FOUND, "Assignments not found!");

  return assignmentsDocs;
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
    { _id: assignmentId, "scores.studentId": studentId },
    {
      $set: {
        "scores.$.score": score,
        "scores.$.notes": notes,
      },
    },
    { new: true }
  );

  // If student score entry doesn't exist, push a new one
  if (!assignmentDocs) {
    return await AssignmentModel.findByIdAndUpdate(
      assignmentId,
      {
        $push: {
          scores: {
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
    } else {
      assignment.grades.push({
        studentId: new (require("mongoose").Types.ObjectId)(studentId),
        score,
        notes,
      });
    }
  }

  await assignment.save();
  return assignment;
};
