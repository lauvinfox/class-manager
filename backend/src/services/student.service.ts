import StudentModel, { IStudent } from "@models/student.model";
import { Types } from "mongoose";
import appAssert from "@utils/appAssert";
import * as csv from "csv-parse";
import { BAD_REQUEST, NOT_FOUND } from "@constants/statusCodes";

export const createStudent = async (data: Partial<IStudent>) => {
  const student = new StudentModel(data);
  return await student.save();
};

export const getAllStudents = async () => {
  return await StudentModel.find().populate("classroom");
};

export const getStudentById = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid student ID");
  const student = await StudentModel.findById(id).populate("classroom");
  appAssert(student, NOT_FOUND, "Student not found");
  return student;
};

export const updateStudent = async (id: string, update: Partial<IStudent>) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid student ID");
  const updated = await StudentModel.findByIdAndUpdate(id, update, {
    new: true,
  });
  appAssert(updated, NOT_FOUND, "Student not found");
  return updated;
};

export const deleteStudent = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid student ID");
  const deleted = await StudentModel.findByIdAndDelete(id);
  appAssert(deleted, NOT_FOUND, "Student not found");
  return deleted;
};

/*
  Upload CSV file and save to database
*/
export type CreateStudentParams = {
  name: string;
  birthOfDate: Date;
  studentId: number;
};

export const processCSVAndSaveToDB = async (fileBuffer: Buffer) => {
  return new Promise<any[]>(async (resolve, reject) => {
    const results: any[] = [];

    // Parsing file CSV
    csv.parse(
      fileBuffer,
      { columns: true, delimiter: "," },
      async (err, data) => {
        if (err) {
          reject("Error parsing CSV file");
        }

        try {
          // Menyimpan data ke database
          for (const row of data) {
            const student = new StudentModel({
              name: row.name,
              birthOfDate: new Date(row.birthOfDate),
              studentId: parseInt(row.studentId, 10),
            });
            await student.save();
            results.push(student); // Simpan data yang disimpan ke dalam results
          }

          resolve(results);
        } catch (error) {
          reject("Error saving data to database");
        }
      }
    );
  });
};
