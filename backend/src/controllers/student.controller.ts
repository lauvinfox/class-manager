import { RequestHandler } from "express";
import * as StudentService from "@services/student.service";
import catchError from "@utils/error";
import { OK, CREATED, BAD_REQUEST } from "@constants/statusCodes";
import appAssert from "@utils/appAssert";

export const createStudent: RequestHandler = catchError(async (req, res) => {
  const student = await StudentService.createStudent(req.body);
  res.status(CREATED).json({
    message: "Student data successfully saved",
    data: student,
  });
});

export const getAllStudents: RequestHandler = catchError(async (req, res) => {
  const students = await StudentService.getAllStudents();
  res.status(OK).json({
    message: "Student data successfully fetch",
    data: students,
  });
});

export const getStudentById: RequestHandler = catchError(async (req, res) => {
  const student = await StudentService.getStudentById(req.params.id);
  res.status(OK).json({
    message: "Student data successfully fetch",
    data: student,
  });
});

export const updateStudent: RequestHandler = catchError(async (req, res) => {
  const student = await StudentService.updateStudent(req.params.id, req.body);
  res.status(CREATED).json({
    message: "Student data successfully updated",
    data: student,
  });
});

export const deleteStudent: RequestHandler = catchError(async (req, res) => {
  await StudentService.deleteStudent(req.params.id);
  res.status(OK).json({
    message: "Student data successfully deleted",
  });
});

export const uploadStudent: RequestHandler = catchError(async (req, res) => {
  appAssert(req.file, BAD_REQUEST, "File not uploaded!");

  const result = await StudentService.processCSVAndSaveToDB(req.file.buffer);

  // Mengirimkan respons setelah data diproses dan disimpan
  res.json({
    message: "File uploaded and data saved to database successfully",
    data: result,
  });
});
