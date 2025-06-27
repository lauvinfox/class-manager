import catchError from "@utils/error";
import * as ClassService from "@services/class.service";
import * as AssignmentService from "@services/assignment.service";
import { CREATED } from "@constants/statusCodes";

export const createAssignmentByClassId = catchError(async (req, res) => {
  const userId = req.userId as string;
  const { classId } = req.params;
  const { title, description, assignmentDate, startTime, endTime } = req.body;

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
    startTime,
    endTime,
  });

  return res
    .status(CREATED)
    .json({ message: "Assignment has been created!", data: assignment });
});
