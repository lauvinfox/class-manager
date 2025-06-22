import { NOT_FOUND } from "@constants/statusCodes";
import StudentModel from "@models/student.model";
import { IStudent } from "@models/student.model";

import * as ClassService from "@services/class.service";
import appAssert from "@utils/appAssert";
import app from "app";
import { Schema } from "mongoose";

type Student = {
  studentId: number;
  classId: string;
  name: string;
  birthDate: string;
  birthPlace: string;
  contact: string;
  address: string;
};

export const addStudent = async (student: Student) => {
  const studentData = {
    name: student.name,
    studentId: student.studentId,
    classId: student.classId,
    birthDate: student.birthDate,
    birthPlace: student.birthPlace,
    contact: student.contact,
    address: student.address,
  };

  const newStudent = new StudentModel(studentData);
  const resultDoc = await newStudent.save();
  const studentId = resultDoc._id as Schema.Types.ObjectId;

  try {
    await ClassService.addStudentsToClass(studentData.classId, [studentId]);
  } catch (err) {
    // log error dan throw error spesifik
    console.error("Error adding student to class:", err);
    throw new Error("Failed to add student to class");
  }

  return resultDoc;
};

export const addStudents = async (students: Student[]) => {
  const studentData = students.map((student: Student) => ({
    name: student.name,
    studentId: student.studentId,
    classId: student.classId,
    birthDate: student.birthDate,
    birthPlace: student.birthPlace,
    contact: student.contact,
    address: student.address,
  }));

  const newStudents = await StudentModel.insertMany(studentData);
  const studentIds = newStudents.map(
    (student) => student._id as Schema.Types.ObjectId
  );

  await ClassService.addStudentsToClass(studentData[0].classId, studentIds);

  return newStudents;
};

export const getStudentsByClassId = async (classId: string) => {
  return await StudentModel.find({ classId }).select(
    "-__v -updatedAt -classId"
  );
};

export const getStudentById = async (id: string) => {
  return await StudentModel.findById(id);
};

export const findAllStudents = async () => {
  return await StudentModel.find();
};

export const updateStudentById = async (
  id: string,
  data: Partial<IStudent>
) => {
  return await StudentModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteStudentById = async (id: string) => {
  return await StudentModel.findByIdAndDelete({ id });
};
