import ClassModel, { IClass } from "@models/class.model";
import StudentModel from "@models/student.model";
import UserModel from "@models/user.model";
import appAssert from "@utils/appAssert";
import {
  BAD_REQUEST,
  CONFLICT,
  NOT_FOUND,
  FORBIDDEN,
} from "@constants/statusCodes";
import { Types } from "mongoose";
import { CreateClassParams, UpdateClassParams } from "@schemas/class.schema";

/**
 * Get all classes
 * @returns Array of classes
 */
export const getAllClasses = async () => {
  return ClassModel.find()
    .populate("instructor", "name email")
    .populate("students", "name studentId")
    .exec();
};

/**
 * Get class by ID
 * @param id - Class ID
 * @returns Class document
 */
export const getClassById = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid class ID");

  const classDoc = await ClassModel.findById(id)
    .populate("instructor", "name email")
    .populate("students", "name studentId")
    .exec();

  appAssert(classDoc, NOT_FOUND, "Class not found");

  return classDoc;
};

/**
 * Get classes by instructor ID
 * @param instructorId - User ID of instructor
 * @returns Array of classes
 */
export const getClassesByInstructor = async (instructorId: string) => {
  appAssert(
    Types.ObjectId.isValid(instructorId),
    BAD_REQUEST,
    "Invalid instructor ID"
  );

  return ClassModel.find({ instructor: instructorId })
    .populate("students", "name studentId")
    .exec();
};

/**
 * Create a new class
 * @param data - Class data
 * @returns Created class document
 */
export const createClass = async (data: CreateClassParams) => {
  // Validate instructor exists
  const instructor = await UserModel.findById(data.instructorId);
  appAssert(instructor, NOT_FOUND, "Instructor not found");

  // Check if class with same name already exists
  const existingClass = await ClassModel.findOne({ name: data.name });
  appAssert(!existingClass, CONFLICT, "Class with this name already exists");

  // Create class
  const newClass = await ClassModel.create({
    name: data.name,
    description: data.description,
    instructor: data.instructorId,
    students: [],
    schedule: data.schedule,
    capacity: data.capacity,
    isActive: true,
  });

  return newClass;
};

/**
 * Update a class
 * @param id - Class ID
 * @param userId - User ID making the request (for authorization)
 * @param data - Updated class data
 * @returns Updated class document
 */
export const updateClass = async (
  id: string,
  userId: string,
  data: UpdateClassParams
) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid class ID");

  const classDoc = await ClassModel.findById(id);
  appAssert(classDoc, NOT_FOUND, "Class not found");

  // Ensure only the instructor can update the class
  appAssert(
    classDoc.instructor.toString() === userId,
    FORBIDDEN,
    "Only the instructor can update this class"
  );

  // If updating instructor
  if (data.instructorId) {
    const instructor = await UserModel.findById(data.instructorId);
    appAssert(instructor, NOT_FOUND, "New instructor not found");
  }

  // Check if class name is being changed and if it conflicts
  if (data.name && data.name !== classDoc.name) {
    const existingClass = await ClassModel.findOne({ name: data.name });
    appAssert(
      !existingClass,
      CONFLICT,
      "Another class with this name already exists"
    );
  }

  // Update the class
  const updateData: any = { ...data };
  if (data.instructorId) {
    updateData.instructor = data.instructorId;
    delete updateData.instructorId;
  }

  const updatedClass = await ClassModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("instructor", "name email")
    .populate("students", "name studentId");

  return updatedClass;
};

/**
 * Add a student to a class
 * @param classId - Class ID
 * @param studentId - Student ID
 * @returns Updated class document
 */
export const addStudentToClass = async (classId: string, studentId: string) => {
  appAssert(Types.ObjectId.isValid(classId), BAD_REQUEST, "Invalid class ID");
  appAssert(
    Types.ObjectId.isValid(studentId),
    BAD_REQUEST,
    "Invalid student ID"
  );

  // Check if class exists
  const classDoc = await ClassModel.findById(classId);
  appAssert(classDoc, NOT_FOUND, "Class not found");

  // Check if student exists
  const student = await StudentModel.findById(studentId);
  appAssert(student, NOT_FOUND, "Student not found");

  // Check if class is at capacity
  appAssert(
    classDoc.students.length < classDoc.capacity,
    CONFLICT,
    "Class is at full capacity"
  );

  // Check if student is already in class
  const isStudentInClass = classDoc.students.some(
    (id) => id.toString() === studentId
  );
  appAssert(!isStudentInClass, CONFLICT, "Student is already in this class");

  // Add student to class
  classDoc.students.push(new Types.ObjectId(studentId));
  await classDoc.save();

  return ClassModel.findById(classId)
    .populate("instructor", "name email")
    .populate("students", "name studentId");
};

/**
 * Remove a student from a class
 * @param classId - Class ID
 * @param studentId - Student ID
 * @returns Updated class document
 */
export const removeStudentFromClass = async (
  classId: string,
  studentId: string
) => {
  appAssert(Types.ObjectId.isValid(classId), BAD_REQUEST, "Invalid class ID");
  appAssert(
    Types.ObjectId.isValid(studentId),
    BAD_REQUEST,
    "Invalid student ID"
  );

  // Check if class exists
  const classDoc = await ClassModel.findById(classId);
  appAssert(classDoc, NOT_FOUND, "Class not found");

  // Check if student is in class
  const isStudentInClass = classDoc.students.some(
    (id) => id.toString() === studentId
  );
  appAssert(isStudentInClass, NOT_FOUND, "Student is not in this class");

  // Remove student from class
  classDoc.students = classDoc.students.filter(
    (id) => id.toString() !== studentId
  );
  await classDoc.save();

  return ClassModel.findById(classId)
    .populate("instructor", "name email")
    .populate("students", "name studentId");
};

/**
 * Delete a class
 * @param id - Class ID
 * @param userId - User ID making the request (for authorization)
 */
export const deleteClass = async (id: string, userId: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid class ID");

  const classDoc = await ClassModel.findById(id);
  appAssert(classDoc, NOT_FOUND, "Class not found");

  // Ensure only the instructor can delete the class
  appAssert(
    classDoc.instructor.toString() === userId,
    FORBIDDEN,
    "Only the instructor can delete this class"
  );

  await classDoc.deleteOne();
  return { success: true };
};
