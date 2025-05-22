import { RequestHandler } from "express";
import * as GradeService from "@services/grade.service";
import catchError from "@utils/error";
import { OK, CREATED } from "@constants/statusCodes";

export const createGrade: RequestHandler = catchError(async (req, res) => {
  const grade = await GradeService.createGrade(req.body);
  res.status(CREATED).json({
    message: "Grade data successfully saved",
    data: grade,
  });
});

export const getAllGrades: RequestHandler = catchError(async (_req, res) => {
  const grades = await GradeService.getAllGrades();
  res.status(OK).json({
    message: "Grade data successfully fetch",
    data: grades,
  });
});

export const getGradeById: RequestHandler = catchError(async (req, res) => {
  const grade = await GradeService.getGradeById(req.params.id);
  res.status(OK).json({
    message: "Grade data successfully fetch",
    data: grade,
  });
});

export const updateGrade: RequestHandler = catchError(async (req, res) => {
  const grade = await GradeService.updateGrade(req.params.id, req.body);
  res.status(OK).json({
    message: "Grade data successfully updated",
    data: grade,
  });
});

export const deleteGrade: RequestHandler = catchError(async (req, res) => {
  await GradeService.deleteGrade(req.params.id);
  res.status(OK).json({
    message: "Grade data successfully deleted",
  });
});
