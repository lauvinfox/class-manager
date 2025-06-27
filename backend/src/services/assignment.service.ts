import { NOT_FOUND } from "@constants/statusCodes";
import AssignmentModel from "@models/assignment.model";
import classModel from "@models/class.model";
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
  studentId,
  score,
  notes,
}: {
  studentId: string;
  score: number;
  notes?: string;
}) => {};
