import { RequestHandler } from "express";
import { z } from "zod";

import catchError from "@utils/error";
import { CREATED, OK } from "@constants/statusCodes";
import {
  addStudentToClass,
  createClass,
  deleteClass,
  getAllClasses,
  getClassById,
  getClassesByInstructor,
  removeStudentFromClass,
  updateClass,
} from "@services/class.service";
import { ScheduleSchema, CreateClassSchema } from "@schemas/class.schema";

const UpdateClassSchema = CreateClassSchema.partial();

/**
 * Get all classes
 */
export const getClasses: RequestHandler = catchError(async (_req, res) => {
  const classes = await getAllClasses();
  res.status(OK).json({ data: classes });
});

/**
 * Get class by ID
 */
export const getClass: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;
  const classDoc = await getClassById(id);
  res.status(OK).json({ data: classDoc });
});

/**
 * Get classes by instructor ID
 */
export const getInstructorClasses: RequestHandler = catchError(
  async (req, res) => {
    const { instructorId } = req.params;
    const classes = await getClassesByInstructor(instructorId);
    res.status(OK).json({ data: classes });
  }
);

/**
 * Create a new class
 */
export const createNewClass: RequestHandler = catchError(async (req, res) => {
  const data = CreateClassSchema.parse(req.body);
  const newClass = await createClass(data);
  res.status(CREATED).json({
    message: "Class successfully created",
    data: newClass,
  });
});

/**
 * Update a class
 */
export const updateClassDetails: RequestHandler = catchError(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!; // From authenticate middleware
    const data = UpdateClassSchema.parse(req.body);

    const updatedClass = await updateClass(id, userId.toString(), data);

    res.status(OK).json({
      message: "Class successfully updated",
      data: updatedClass,
    });
  }
);

/**
 * Add a student to a class
 */
export const addStudent: RequestHandler = catchError(async (req, res) => {
  const { classId, studentId } = req.params;

  const updatedClass = await addStudentToClass(classId, studentId);

  res.status(OK).json({
    message: "Student added to class successfully",
    data: updatedClass,
  });
});

/**
 * Remove a student from a class
 */
export const removeStudent: RequestHandler = catchError(async (req, res) => {
  const { classId, studentId } = req.params;

  const updatedClass = await removeStudentFromClass(classId, studentId);

  res.status(OK).json({
    message: "Student removed from class successfully",
    data: updatedClass,
  });
});

/**
 * Delete a class
 */
export const removeClass: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId!; // From authenticate middleware

  await deleteClass(id, userId.toString());

  res.status(OK).json({
    message: "Class successfully deleted",
  });
});
