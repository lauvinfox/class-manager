import { RequestHandler } from "express";
import * as ClassService from "@services/class.service";
import catchError from "@utils/error";
import { OK, CREATED } from "@constants/statusCodes";

export const createClass: RequestHandler = catchError(async (req, res) => {
  const newClass = await ClassService.createClass(req.body);
  res.status(CREATED).json({
    message: "Class data successfully saved",
    data: newClass,
  });
});

export const getAllClasses: RequestHandler = catchError(async (_req, res) => {
  const classes = await ClassService.getAllClasses();
  res.status(OK).json({
    message: "Class data successfully fetch",
    data: classes,
  });
});

export const getClassById: RequestHandler = catchError(async (req, res) => {
  const classData = await ClassService.getClassById(req.params.id);
  res.status(OK).json({
    message: "Class data successfully fetch",
    data: classData,
  });
});

export const updateClass: RequestHandler = catchError(async (req, res) => {
  const updated = await ClassService.updateClass(req.params.id, req.body);
  res.status(CREATED).json({
    message: "Class data successfully updated",
    data: updated,
  });
});

export const deleteClass: RequestHandler = catchError(async (req, res) => {
  await ClassService.deleteClass(req.params.id);
  res.status(OK).json({
    message: "Class data successfully deleted",
  });
});
