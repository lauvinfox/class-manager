import { Request, RequestHandler, Response } from "express";
import * as JournalService from "../services/journal.service";
import catchError from "@utils/error";
import { OK, CREATED } from "@constants/statusCodes";

export const createJournal: RequestHandler = catchError(async (req, res) => {
  const journal = await JournalService.createJournal(req.body);
  res.status(CREATED).json({
    message: "Journal data successfully saved",
    data: journal,
  });
});

export const getAllJournals: RequestHandler = catchError(async (_req, res) => {
  const journals = await JournalService.getAllJournals();
  res.status(OK).json({
    message: "Journal data successfully fetch",
    data: journals,
  });
});

export const getJournalById: RequestHandler = catchError(async (req, res) => {
  const journal = await JournalService.getJournalById(req.params.id);
  res.status(OK).json({
    message: "Journal data successfully fetch",
    data: journal,
  });
});

export const updateJournal: RequestHandler = catchError(async (req, res) => {
  const journal = await JournalService.updateJournal(req.params.id, req.body);
  res.status(CREATED).json({
    message: "Journal data successfully updated",
    data: journal,
  });
});

export const deleteJournal: RequestHandler = catchError(async (req, res) => {
  await JournalService.deleteJournal(req.params.id);
  res.status(OK).json({
    message: "Journal data successfully deleted",
  });
});
