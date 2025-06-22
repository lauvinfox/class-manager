import { RequestHandler } from "express";
import appAssert from "@utils/appAssert";
import { BAD_REQUEST } from "@constants/statusCodes";
import catchError from "@utils/error";
import * as StudentService from "@services/student.service";
import * as csv from "csv-parse";

export const getStudentsClass: RequestHandler = catchError(async (req, res) => {
  const { classId } = req.params;

  const students = await StudentService.getStudentsByClassId(classId);
  if (!students || students.length === 0) {
    return res
      .status(404)
      .json({ message: "No students found for this class" });
  }
  return res.status(200).json({
    message: "Students retrieved successfully",
    data: students,
  });
});

export const getStudent: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;
  const student = await StudentService.getStudentById(id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  return res.status(200).json({
    message: "Student retrieved successfully",
    data: student,
  });
});

export const updateStudent: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;
  const updatedStudent = req.body;

  const result = await StudentService.updateStudentById(id, updatedStudent);

  if (!result) {
    return res.status(404).json({ message: "Student not found" });
  }
  return res.status(200).json({
    message: "Student updated successfully",
    data: result,
  });
});

export const deleteStudent: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;

  const deletedStudent = await StudentService.deleteStudentById(id);
  if (!deletedStudent) {
    return res.status(404).json({ message: "Student not found" });
  }
  return res.status(200).json({
    message: "Student deleted successfully",
    data: deletedStudent,
  });
});

interface Student {
  studentId: number;
  classId: string;
  name: string;
  birthDate: string;
  birthPlace: string;
  contact: string;
  address: string;
}

export const createStudent: RequestHandler = catchError(async (req, res) => {
  const { name, studentId, birthDate, birthPlace, contact, address } = req.body;
  const { classId } = req.params;

  const student = await StudentService.addStudent({
    name,
    studentId,
    birthDate,
    birthPlace,
    contact,
    address,
    classId,
  });

  return res.json({
    message: "Student created successfully",
    data: student,
  });
});

export const uploadStudents: RequestHandler = catchError(async (req, res) => {
  appAssert(req.file, BAD_REQUEST, "File not uploaded!");

  const fileBuffer = req.file.buffer;
  const fileName = req.file.originalname;
  const { classId } = req.params;
  appAssert(classId, BAD_REQUEST, "Class ID is required");

  let students: Student[] = [];
  let result: any = {};

  if (fileName.endsWith(".csv")) {
    // CSV parsing
    students = await new Promise<Student[]>((resolve, reject) => {
      csv.parse(fileBuffer, { columns: true, delimiter: "," }, (err, data) => {
        if (err) return reject("Error parsing CSV file");
        try {
          // Map data to Student[] with classId injected
          const mapped: Student[] = data.map((row: any) => ({
            studentId: parseInt(row.studentId, 10),
            classId: classId,
            name: row.name,
            birthDate: row.birthDate,
            birthPlace: row.birthPlace,
            contact: row.contact,
            address: row.address,
          }));
          resolve(mapped);
        } catch (error) {
          reject("Error mapping data");
        }
      });
    });

    // Insert to DB (bulk)
    result = await StudentService.addStudents(students);
  } else {
    return res.status(400).json({ message: "Unsupported file type" });
  }

  // Jika ada duplikat, kembalikan info sukses & gagal
  if (result.duplicates && result.duplicates.length > 0) {
    return res.status(207).json({
      message: "Some students could not be added due to duplicates.",
      inserted: result.inserted,
      duplicates: result.duplicates,
    });
  }

  return res.json({
    message: "File uploaded and data saved to database successfully",
    data: result.inserted,
  });
});
