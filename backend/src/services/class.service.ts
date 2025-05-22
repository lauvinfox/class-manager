import ClassModel, { IClass } from "@models/class.model";
import { Types } from "mongoose";
import appAssert from "@utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "@constants/statusCodes";

export const createClass = async (classData: Partial<IClass>) => {
  const newClass = new ClassModel(classData);
  return await newClass.save();
};

export const getAllClasses = async () => {
  return await ClassModel.find().populate("teacher").populate("students");
};

export const getClassById = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid ID");
  const classDoc = await ClassModel.findById(id)
    .populate("teacher")
    .populate("students");
  appAssert(classDoc, NOT_FOUND, "Class not found");
  return classDoc;
};

export const updateClass = async (id: string, updateData: Partial<IClass>) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid ID");
  const updated = await ClassModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  appAssert(updated, NOT_FOUND, "Class not found");
  return updated;
};

export const deleteClass = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid ID");
  const deleted = await ClassModel.findByIdAndDelete(id);
  appAssert(deleted, NOT_FOUND, "Class not found");
  return deleted;
};
