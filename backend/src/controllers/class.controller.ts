import { RequestHandler } from "express";
import { Types } from "mongoose";

import catchError from "@utils/error";
import { BAD_REQUEST, CREATED } from "@constants/statusCodes";
import * as ClassService from "@services/class.service";
import * as UserService from "@services/user.service";
import appAssert from "@utils/appAssert";

/**
 * Get all classes by class owner ID
 */
export const getClassesByClassOwnerID: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;

    const classes = await ClassService.getClassOwnedBy(userId);

    return res.json({
      message: "Data retrieved succcessfully!",
      data: classes,
    });
  }
);

/**
 * Get class by ClassIds
 */
export const getClassByIds: RequestHandler = catchError(async (req, res) => {
  const { classIds } = req.body;

  const classDoc = await ClassService.getClassesInfoByIds(classIds);
  return res.json({
    message: "Classes data retrieved succesfully",
    data: classDoc,
  });
});

/**
 * Get class Info by ClassId
 */
export const getClassByClassId: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId } = req.params;

    const classDoc = await ClassService.getClassInfoById(classId);
    let role = "";
    if (
      classDoc &&
      classDoc.classOwner &&
      classDoc.classOwner._id &&
      classDoc.classOwner._id.toString() === userId
    ) {
      role = "owner";
    } else if (
      classDoc &&
      Array.isArray(classDoc.instructors) &&
      classDoc.instructors.some(
        (instructor: any) =>
          instructor &&
          instructor.instructorId &&
          instructor.instructorId.toString() === userId &&
          instructor.status === "accepted"
      )
    ) {
      role = "member";
    } else {
      return res.json({
        message: "You are not member of this class!",
      });
    }

    return res.json({
      message: "Class data retrieved succesfully",
      data: { ...classDoc, role: role },
    });
  }
);

/**
 * Create a new class
 */
export const createNewClass: RequestHandler = catchError(async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.userId as string;

  // Validasi userId
  if (!Types.ObjectId.isValid(ownerId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  const newClass = await ClassService.createClass({
    name,
    description,
    classOwner: ownerId,
  });

  return res.status(CREATED).json({
    message: "Class successfully created",
    data: newClass,
  });
});

/**
 * Invite instructor to a class
 */
export const inviteInstructors: RequestHandler = catchError(
  async (req, res) => {
    const { classId } = req.params;
    const invitees: { username: string; id: string }[] = req.body;
    const ownerId = req.userId as string;

    // Pastikan invitees adalah array dan memiliki id
    if (!Array.isArray(invitees) || invitees.some((inv) => !inv.id)) {
      return res.status(400).json({ message: "Invalid invitees format" });
    }

    const result = await ClassService.inviteClassInstructor(
      classId,
      ownerId,
      invitees.map((invitee) => ({ inviteeId: invitee.id }))
    );

    return res.json({ message: "Invite user successfully", data: result });
  }
);

/**
 * Get instructors of a class
 */
export const getClassInstructors: RequestHandler = catchError(
  async (req, res) => {
    const { classId } = req.params;
    const instructors = await ClassService.getClassInstructors(classId);
    return res.json({
      message: "Instructors data retrieved successfully",
      data: instructors,
    });
  }
);

/**
 * Respond to an instructor invitation
 * Accept or deny an instructor's invitation to a class
 * @param classId - The ID of the class
 * @param inviteResponse - The response to the invitation, either "accepted" or "den
 */
export const respondInviteInstructor: RequestHandler = catchError(
  async (req, res) => {
    const { classId } = req.params;
    const userId = req.userId as string;
    const { inviteResponse } = req.body;

    // Validasi response
    if (!["accepted", "denied"].includes(inviteResponse)) {
      return res.status(400).json({ message: "Invalid response" });
    }

    await ClassService.updateInstructorStatus(classId, userId, inviteResponse);

    // Tambahkan class ke user
    const updatedUser = await UserService.addClassToUser(userId, classId);

    return res.json({ message: `Invitation ${inviteResponse}` });
  }
);

/**
 * Add subjects to an instructor in a class
 */
export const addSubjects: RequestHandler = catchError(async (req, res) => {
  const { classId } = req.params;
  const { subjects } = req.body;

  if (
    !Array.isArray(subjects) ||
    !subjects.every((s) => typeof s === "string")
  ) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "subjects must be an array of strings" });
  }

  const updatedClass = await ClassService.addClassSubjects(classId, subjects);

  return res.status(CREATED).json({
    message: "Subject added to class successfully",
    data: updatedClass,
    subjects: subjects,
  });
});

/**
 * Give subject to an instructor in a class
 */
export const giveSubjectToInstructor: RequestHandler = catchError(
  async (req, res) => {
    const { classId, instructorId } = req.params;
    const { subject } = req.body;
    appAssert(subject, BAD_REQUEST, "subjectName");

    const updatedClass = await ClassService.giveInstructorSubjects(
      classId,
      instructorId,
      subject
    );

    return res.json({
      message: "Subject given to instructor successfully",
      data: updatedClass,
    });
  }
);

/**
 * Get all subjects in a class
 */

export const getClassSubjects: RequestHandler = catchError(async (req, res) => {
  const { classId } = req.params;

  const subjects = await ClassService.getClassSubjects(classId);

  return res.json({
    message: "Subjects data retrieved successfully",
    data: subjects,
  });
});

export const updateSubjectWeights: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId } = req.params;
    const { subject, assignmentWeight } = req.body;

    const isInstructor = await ClassService.checkInstructor(classId, userId);
    appAssert(
      isInstructor,
      BAD_REQUEST,
      "You are not an instructor of this class"
    );

    const result = await ClassService.updateClassWeights(classId, {
      userId,
      subject,
      assignmentWeights: assignmentWeight,
    });

    return res.json({
      message: "Subject weights updated successfully",
      data: result,
    });
  }
);

export const getClassWeights: RequestHandler = catchError(async (req, res) => {
  const userId = req.userId as string;

  const { classId } = req.params;

  const isOwner = await ClassService.checkClassOwner(classId, userId);
  appAssert(isOwner, BAD_REQUEST, "You are not the owner of this class");

  const weights = await ClassService.getClassWeights(classId);

  return res.json({
    message: "Subject weights retrieved successfully",
    data: weights,
  });
});

export const getClassWeightBySubject: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId, subject } = req.params;

    const isInstructor = await ClassService.checkInstructor(classId, userId);
    appAssert(
      isInstructor,
      BAD_REQUEST,
      "You are not the instructor of this class"
    );

    const weight = await ClassService.getClassWeightBySubject(classId, subject);

    return res.json({
      message: "Subject weight retrieved successfully",
      data: weight,
    });
  }
);

export const deleteClass: RequestHandler = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId } = req.params;

  // Validasi userId
  if (!Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  const isOwner = await ClassService.checkClassOwner(classId, userId);
  appAssert(isOwner, BAD_REQUEST, "You are not the owner of this class");

  const result = await ClassService.deleteClass(userId, classId);

  return res.json({
    message: "Class deleted successfully",
    result,
  });
});

export const getSubject: RequestHandler = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId } = req.params;

  const subject = await ClassService.getSubjectByClassUserId(userId, classId);
  appAssert(subject, BAD_REQUEST, "You are not a member of this class");

  return res.json({
    message: "Subject retrieved successfully",
    data: subject,
  });
});

export const getStudentReport: RequestHandler = catchError(async (req, res) => {
  const { classId, studentId } = req.params;
  const { note } = req.body;

  const report = await ClassService.createStudentReport(
    classId,
    studentId,
    note
  );

  return res.json({
    message: "Student report retrieved successfully",
    data: report,
  });
});
