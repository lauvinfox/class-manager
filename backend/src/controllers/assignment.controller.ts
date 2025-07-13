import catchError from "@utils/error";
import * as ClassService from "@services/class.service";
import * as AssignmentService from "@services/assignment.service";
import { CREATED, UNAUTHORIZED, OK, NOT_FOUND } from "@constants/statusCodes";
import appAssert from "@utils/appAssert";
import { RequestHandler } from "express";

export const createAssignmentByClassId = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId } = req.params;
  const {
    title,
    description,
    assignmentDate,
    assignmentType,
    startTime,
    endTime,
  } = req.body;

  const subject = (await ClassService.getSubjectByClassUserId(
    userId,
    classId
  )) as string;

  const assignment = await AssignmentService.createAssignment({
    userId,
    classId,
    subject,
    title,
    description,
    assignmentDate,
    assignmentType,
    startTime,
    endTime,
  });

  return res
    .status(CREATED)
    .json({ message: "Assignment has been created!", data: assignment });
});

export const giveScore = catchError(async (req, res) => {
  const userId = req.userId as string;
  appAssert(userId, UNAUTHORIZED, "User Not Authorized!");
  const { classId } = req.params;

  const isInstructor = await ClassService.checkInstructor(classId, userId);
  appAssert(isInstructor, NOT_FOUND, "Instructors Not Found");

  const { assignmentId, studentId, score, notes } = req.body;

  const assignment = await AssignmentService.giveStudentScore({
    assignmentId,
    studentId,
    score,
    notes,
  });

  return res.status(OK).json({
    message: "Score has been given!",
    data: assignment,
  });
});

export const giveScores = catchError(async (req, res) => {
  const userId = req.userId as string;
  appAssert(userId, UNAUTHORIZED, "User Not Authorized!");
  const { classId, assignmentId } = req.params;

  const isInstructor = await ClassService.checkInstructor(classId, userId);
  appAssert(isInstructor, NOT_FOUND, "Instructors Not Found");

  const { scoresData } = req.body;

  const assignment = await AssignmentService.giveStudentsScore({
    assignmentId,
    scoresData,
  });

  return res.status(OK).json({
    message: "Scores have been given!",
    data: assignment,
  });
});

export const getAssignmentById: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId } = req.params;
    const { assignmentId } = req.body;

    const isInstructor = await ClassService.checkInstructor(classId, userId);
    const isClassOwner = await ClassService.checkClassOwner(classId, userId);
    appAssert(isInstructor || isClassOwner, NOT_FOUND, "Instructors Not Found");

    const assignment = await AssignmentService.getAssignmentById(assignmentId);
    appAssert(assignment, NOT_FOUND, "Not found");

    return res.json({
      message: "Data retrieved successfully!",
      data: assignment,
    });
  }
);

export const getAssignmentsByClass: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId } = req.params;

    const isClassOwner = await ClassService.checkClassOwner(classId, userId);
    const isInstructor = await ClassService.checkInstructor(classId, userId);
    appAssert(isInstructor || isClassOwner, NOT_FOUND, "Instructors Not Found");

    const assignments = await AssignmentService.getAssignmentsByClass(classId);

    return res
      .status(OK)
      .json({ message: "Data retrieved successfully!", data: assignments });
  }
);

export const getAssignmentsBySubject: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId } = req.params;

    const subject = (await ClassService.getSubjectByClassUserId(
      userId,
      classId
    )) as string;

    const assignments = await AssignmentService.getAssignmentsBySubject(
      subject,
      classId
    );

    return res
      .status(OK)
      .json({ message: "Data retrieved successfully", data: assignments });
  }
);

export const getStudentScore: RequestHandler = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId, studentId } = req.params;

  const isClassOwner = await ClassService.checkClassOwner(classId, userId);
  appAssert(isClassOwner, NOT_FOUND, "You are not class owner!");

  const assignments = await AssignmentService.getAssignmentsByStudent({
    classId,
    studentId,
  });
  appAssert(assignments, NOT_FOUND, "Assignments data not found!");

  return res.status(OK).json({
    message: "Data retrieved sucessfully!",
    data: assignments,
  });
});

export const deleteAssignmentById: RequestHandler = catchError(
  async (req, res) => {
    const userId = req.userId as string;
    const { classId, assignmentId } = req.params;

    const isInstructor = await ClassService.checkInstructor(classId, userId);
    appAssert(isInstructor, NOT_FOUND, "Instructors Not Found");

    const assignment = await AssignmentService.deleteAssignmentById(
      classId,
      assignmentId
    );
    appAssert(assignment, NOT_FOUND, "Assignment not found!");

    return res.status(OK).json({
      message: "Assignment deleted successfully!",
      data: assignment,
    });
  }
);
