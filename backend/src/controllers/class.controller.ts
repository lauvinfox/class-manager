import { RequestHandler } from "express";

import catchError from "@utils/error";
import { CREATED, OK } from "@constants/statusCodes";
import * as ClassService from "@services/class.service";
import { ScheduleSchema, CreateClassSchema } from "@schemas/class.schema";
import { Types } from "mongoose";

const UpdateClassSchema = CreateClassSchema.partial();

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
    const { classId } = req.params;

    const classDoc = await ClassService.getClassInfoById(classId);

    return res.json({
      message: "Class data retrieved succesfully",
      data: classDoc,
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
 * Update a class
 */
// export const updateClassDetails: RequestHandler = catchError(
//   async (req, res) => {
//     const { id } = req.params;
//     const userId = req.userId!; // From authenticate middleware
//     const data = UpdateClassSchema.parse(req.body);

//     const updatedClass = await updateClass(id, userId.toString(), data);

//     res.status(OK).json({
//       message: "Class successfully updated",
//       data: updatedClass,
//     });
//   }
// );

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

    return res.json({ message: `Invitation ${inviteResponse}` });
  }
);

/**
 * Add a student to a class
 */
// export const addStudent: RequestHandler = catchError(async (req, res) => {
//   const { classId, studentId } = req.params;

//   const updatedClass = await addStudentToClass(classId, studentId);

//   res.status(OK).json({
//     message: "Student added to class successfully",
//     data: updatedClass,
//   });
// });

/**
 * Remove a student from a class
 */
// export const removeStudent: RequestHandler = catchError(async (req, res) => {
//   const { classId, studentId } = req.params;

//   const updatedClass = await removeStudentFromClass(classId, studentId);

//   res.status(OK).json({
//     message: "Student removed from class successfully",
//     data: updatedClass,
//   });
// });

/**
 * Delete a class
 */
// export const removeClass: RequestHandler = catchError(async (req, res) => {
//   const { id } = req.params;
//   const userId = req.userId!; // From authenticate middleware

//   await deleteClass(id, userId.toString());

//   res.status(OK).json({
//     message: "Class successfully deleted",
//   });
// });
