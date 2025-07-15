import StudentModel from "@models/student.model";
import { IStudent } from "@models/student.model";

import * as ClassService from "@services/class.service";
import * as JournalService from "@services/journal.service";
import * as AssignmentService from "@services/assignment.service";
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
  const studentData: Student = {
    name: student.name,
    studentId: student.studentId,
    classId: student.classId,
    birthDate: student.birthDate,
    birthPlace: student.birthPlace,
    contact: student.contact,
    address: student.address,
  };

  const studentDoc = await StudentModel.create(studentData);

  const studentId = studentDoc._id as Schema.Types.ObjectId;

  await ClassService.addStudentsToClass(studentData.classId, [studentId]);

  return studentDoc;
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

  // Filter out students that already exist (same studentId and classId)
  const filteredStudentData = [];
  for (const student of studentData) {
    const exists = await StudentModel.findOne({
      studentId: student.studentId,
      classId: student.classId,
    });
    if (!exists) {
      filteredStudentData.push(student);
    }
  }
  if (filteredStudentData.length === 0) {
    throw new Error("All students already exist in their respective classes");
  }
  // Use filteredStudentData for insertion
  studentData.length = 0;
  studentData.push(...filteredStudentData);

  const newStudents = await StudentModel.insertMany(studentData);
  const studentIds = newStudents.map(
    (student) => student._id as Schema.Types.ObjectId
  );

  // Tambahkan studentIds ke list students pada class, jika sudah ada maka append
  await ClassService.addStudentsToClass(studentData[0].classId, studentIds);

  return newStudents;
};

export const getStudentsByClassId = async (classId: string) => {
  return await StudentModel.find({ classId }).select(
    "-__v -updatedAt -classId"
  );
};

export const getStudentsIdsByClassId = async (classId: string) => {
  const students = await StudentModel.find({ classId }).select("studentId");
  return students.map((student) => student.studentId);
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

export const deleteStudentById = async (classId: string, id: string) => {
  await ClassService.removeStudentFromClass(classId, id);
  await AssignmentService.removeStudentFromAssignment(classId, id);
  await JournalService.removeStudentFromJournal(classId, id);

  return await StudentModel.findByIdAndDelete(id);
};

// Assignment
export const addAssignmentScore = async ({
  assignmentId,
  score,
  id,
}: {
  assignmentId: string;
  score: number;
  id: string;
}) => {
  const student = await StudentModel.findOneAndUpdate(
    { _id: id },
    { $push: { assignments: { assignmentId, score } } },
    { new: true }
  );
  return student;
};

export const deleteAllStudentsByClassId = async (classId: string) => {
  const result = await StudentModel.deleteMany({ classId });
  if (result.deletedCount === 0) {
    throw new Error("No students found for this class");
  }

  await ClassService.removeStudentsFromClass(classId);
  await AssignmentService.deleteStudentsByClassId(classId);
  return result;
};

export const getStudentNameAndId = async (studentId: string) => {
  const student = await StudentModel.findById(studentId)
    .select("name studentId")
    .lean();

  return {
    name: student?.name || "",
    studentId: student?.studentId || "",
  };
};

export const studentReport = async (classId: string, studentId: string) => {
  // Get student info
  const student = await StudentModel.findById(studentId).lean();
  if (!student) throw new Error("Student not found");

  // Get assignments for this student in this class
  const assignments = await AssignmentService.getAssignmentByClassAndStudent(
    classId,
    studentId
  );

  // Filter grades for this student
  const assignmentResults = assignments.map((assignment: any) => {
    const grade = (assignment.grades || []).find(
      (g: any) => g.studentId?._id?.toString() === studentId
    );
    return {
      assignmentId: assignment._id,
      title: assignment.title,
      subject: assignment.subject,
      assignmentType: assignment.assignmentType,
      assignmentDate: assignment.assignmentDate,
      score: grade?.score ?? null,
      notes: grade?.notes ?? "",
    };
  });

  // Get journals for this student in this class
  const journals = await JournalService.getJournalByClassAndStudent(
    classId,
    studentId
  );

  // Filter attendance for this student
  const journalResults = journals.map((journal: any) => {
    const attendance = (journal.journals || []).find(
      (j: any) => j.studentId?._id?.toString() === studentId
    );
    return {
      journalId: journal._id,
      title: journal.title,
      subject: journal.subject,
      journalDate: journal.journalDate,
      attendance: attendance?.status ?? "pending",
      note: attendance?.note ?? "",
    };
  });

  return {
    studentId,
    name: student.name,
    assignments: assignmentResults,
    journals: journalResults,
  };
};

export const studentsStatistics = async (classId: string) => {
  const students = await StudentModel.find({ classId }).select(
    "-__v -updatedAt -classId"
  );
};
