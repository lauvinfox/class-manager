import fs from "fs";
import * as csv from "csv-parse";

import StudentModel from "@models/student.model";
import { RequestHandler } from "express";
import appAssert from "@utils/appAssert";
import { BAD_REQUEST } from "@constants/statusCodes";
import catchError from "@utils/error";
import { processCSVAndSaveToDB } from "@services/student.service";

export const getStudents: RequestHandler = async (_req, res) => {
  const students = await StudentModel.find().exec();

  res.status(200).json({ data: students });
};

export const createStudent: RequestHandler = async (req, res) => {
  try {
    const { name, birthOfDate, studentId } = req.body;

    const newStudent = new StudentModel({
      name: name,
      birthOfDate: birthOfDate,
      studentId: studentId,
    });

    await newStudent.save();

    res.status(201).json({
      message: "Data successfully saved",
      data: newStudent,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export const getStudent: RequestHandler = async (req, res) => {
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
};

export const updateStudent: RequestHandler = async (req, res) => {
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
};

export const deleteStudent: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await StudentModel.deleteOne({ _id: id });

    if (result.deletedCount == 0) {
      res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Data has been deleted" });
  } catch (error) {
    console.error("Error occurred while deleting student:", error);

    if (error instanceof Error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message || "Something went wrong!",
      });
    }
  }
};

export const uploadStudent: RequestHandler = catchError(async (req, res) => {
  appAssert(req.file, BAD_REQUEST, "File not uploaded!");

  const result = await processCSVAndSaveToDB(req.file.buffer);

  // Mengirimkan respons setelah data diproses dan disimpan
  res.json({
    message: "File uploaded and data saved to database successfully",
    data: result,
  });
});
