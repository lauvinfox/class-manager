import StudentModel from "@models/student.model";
import { RequestHandler } from "express";
import appAssert from "@utils/appAssert";
import { BAD_REQUEST } from "@constants/statusCodes";
import catchError from "@utils/error";
import * as StudentService from "@services/student.service";
import * as csv from "csv-parse";

export const getStudents: RequestHandler = catchError(async (req, res) => {
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

  try {
    const student = await StudentModel.findOne({ _id: id }).exec();

    if (!student) {
      res.status(404).json({ message: "Student not found" });
    }

    res.status(200).send({ message: "Student found", data: student });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
});

export const updateStudent: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;
  const updatedStudent = req.body;

  try {
    await StudentModel.updateOne({ _id: id }, updatedStudent);
    res
      .status(200)
      .json({ message: "Data updated successfully", data: updatedStudent });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Unable to update the contact" });
    }
  }
});

export const deleteStudent: RequestHandler = catchError(async (req, res) => {
  const { id } = req.params;

  try {
    const student = await StudentModel.findOne({ _id: id }).exec();

    if (!student) {
      res.status(404).json({ message: "Student not found" });
    }

    res.status(200).send({ message: "Student found", data: student });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
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
  let inserted: any[] = [];

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

    // Insert to DB
    inserted = await StudentService.addStudents(students);
  } else {
    return res.status(400).json({ message: "Unsupported file type" });
  }

  res.json({
    message: "File uploaded and data saved to database successfully",
    data: inserted,
  });
});
