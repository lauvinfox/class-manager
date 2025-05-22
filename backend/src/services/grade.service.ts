import GradeModel, { IGrade } from "@models/grade.model";
import { Types } from "mongoose";
import appAssert from "@utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "@constants/statusCodes";

export const createGrade = async (data: Partial<IGrade>) => {
  const grade = new GradeModel(data);
  return await grade.save();
};

export const getAllGrades = async () => {
  return await GradeModel.find().populate("student").populate("classroom");
};

export const getGradeById = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid grade ID");
  const grade = await GradeModel.findById(id)
    .populate("student")
    .populate("classroom");
  appAssert(grade, NOT_FOUND, "Grade not found");
  return grade;
};

export const updateGrade = async (id: string, update: Partial<IGrade>) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid grade ID");
  const updated = await GradeModel.findByIdAndUpdate(id, update, { new: true });
  appAssert(updated, NOT_FOUND, "Grade not found");
  return updated;
};

export const deleteGrade = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid grade ID");
  const deleted = await GradeModel.findByIdAndDelete(id);
  appAssert(deleted, NOT_FOUND, "Grade not found");
  return deleted;
};
