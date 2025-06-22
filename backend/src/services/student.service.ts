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

  try {
    // Allow partial success: continue inserting even if some are duplicates
    const resultDocs = await StudentModel.insertMany(studentData, {
      ordered: false,
    });
    const studentIds = resultDocs.map(
      (doc) => doc._id as Schema.Types.ObjectId
    );
    try {
      await ClassService.addStudentsToClass(studentData[0].classId, studentIds);
    } catch (err) {
      // log error dan throw error spesifik
      console.error("Error adding students to class:", err);
      throw new Error("Failed to add students to class");
    }
    return { inserted: resultDocs, duplicates: [] };
  } catch (err: any) {
    // Tangani duplikat (MongoBulkWriteError)
    if (
      err.code === 11000 ||
      err.name === "BulkWriteError" ||
      err.writeErrors
    ) {
      // Ambil data yang berhasil diinsert
      const insertedDocs = err.insertedDocs || [];
      // Ambil info duplikat
      const duplicates = (err.writeErrors || []).map((e: any) => {
        const key = Object.keys(e.err.keyValue)[0];
        return {
          index: e.index,
          key,
          value: e.err.keyValue[key],
          message: e.err.errmsg || e.err.message,
        };
      });
      // Tetap tambahkan yang berhasil ke class
      const studentIds = insertedDocs.map((doc: any) => doc._id);
      if (studentIds.length > 0) {
        try {
          await ClassService.addStudentsToClass(
            studentData[0].classId,
            studentIds
          );
        } catch (err) {
          console.error("Error adding students to class:", err);
        }
      }
      return { inserted: insertedDocs, duplicates };
    }
    throw err;
  }
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
