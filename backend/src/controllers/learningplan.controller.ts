import * as LearningPlanService from "@services/learningplan.service";
import catchError from "@utils/error";
import { RequestHandler } from "express";

export const createClassLearningPlan: RequestHandler = catchError(
  async (req, res) => {
    const { classId } = req.params;
    const { subject, topic, level, duration, learningStyle, learningPlan } =
      req.body;
    const learning_plan = await LearningPlanService.createLearningPlan(
      classId,
      subject,
      topic,
      level,
      duration,
      learningStyle,
      learningPlan
    );

    return res.status(201).json({
      message: "Learning plan created successfully",
      data: learning_plan,
    });
  }
);

export const updateClassLearningPlan: RequestHandler = catchError(
  async (req, res) => {
    const { learningPlanId } = req.params;
    const { learningPlan } = req.body;

    const updatedLearningPlan = await LearningPlanService.updateLearningPlan(
      learningPlanId,
      learningPlan
    );

    return res.status(200).json({
      message: "Learning plan updated successfully",
      data: updatedLearningPlan,
    });
  }
);

export const getClassLearningPlans: RequestHandler = catchError(
  async (req, res) => {
    const { classId } = req.params;
    const learning_plans =
      await LearningPlanService.getLearningPlansByClass(classId);

    res.status(200).json({
      message: "Learning plans retrieved successfully",
      data: learning_plans,
    });
  }
);

export const getClassSubjectLearningPlans: RequestHandler = catchError(
  async (req, res) => {
    const { classId, subject } = req.params;
    const learning_plans =
      await LearningPlanService.getLearningPlansByClassAndSubject(
        classId,
        subject
      );

    res.status(200).json({
      message: "Learning plans retrieved successfully",
      data: learning_plans,
    });
  }
);
