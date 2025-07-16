import * as AssistanceService from "@services/assistance.service";
import catchError from "@utils/error";
import { RequestHandler } from "express";

export const createClassAssistance: RequestHandler = catchError(
  async (req, res) => {
    const { classId } = req.params;

    const {
      studentName,
      subject,
      assignmentId,
      assignmentDescription,
      assistantResponse,
      assignmentName,
    } = req.body;

    const assistanceDoc = await AssistanceService.createAssistance({
      studentName,
      classId,
      subject,
      assignmentId,
      assignmentDescription,
      assistantResponse,
      assignmentName,
    });

    res.status(201).json({
      message: "Assistance created successfully",
      data: assistanceDoc,
    });
  }
);

export const getClassAssistances: RequestHandler = catchError(
  async (req, res) => {
    const { classId } = req.params;
    const assistances = await AssistanceService.getAssistancesByClass(classId);

    res.status(200).json({
      message: "Assistances retrieved successfully",
      data: assistances,
    });
  }
);

export const getClassSubjectAssistances: RequestHandler = catchError(
  async (req, res) => {
    const { classId } = req.params;
    const { subject } = req.body;
    const assistances = await AssistanceService.getAssistancesByClassAndSubject(
      classId,
      subject
    );

    res.status(200).json({
      message: "Assistances retrieved successfully",
      data: assistances,
    });
  }
);
