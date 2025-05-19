import StudentModel from "@models/student.model";
import { IStudent } from "@models/student.model";

import * as csv from "csv-parse";

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

export const findAllStudents = async () => {
  return await StudentModel.find();
};

export const findStudentById = async (id: string) => {
  return await StudentModel.findById(id);
};

export const createStudent = async (data: IStudent) => {
  const newStudent = new StudentModel(data);
  return await newStudent.save();
};

export const updateStudentById = async (
  id: string,
  data: Partial<IStudent>
) => {
  return await StudentModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteStudentById = async (id: string) => {
  return await StudentModel.findByIdAndDelete(id);
};
