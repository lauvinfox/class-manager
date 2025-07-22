import ClassModel from "@models/class.model";
import UserModel from "@models/user.model";
import appAssert from "@utils/appAssert";
import {
  BAD_REQUEST,
  CONFLICT,
  NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
} from "@constants/statusCodes";
import { ObjectId, Schema, Types } from "mongoose";

import * as NotificationService from "@services/notification.service";
import * as UserService from "@services/user.service";
import * as StudentService from "@services/student.service";
import * as AssignmentService from "@services/assignment.service";
import * as JournalService from "@services/journal.service";

/**
 * Get all classes
 * @returns Array of classes
 */
export const getClassOwnedBy = async (userId: string) => {
  const users = await ClassModel.find({ classOwner: userId }).populate(
    "classOwner",
    "name username email"
  );

  return users;
};

/**
 * Get class info by ID
 * @param id - Class IDs
 * @returns Class document
 */
export const getClassInfoById = async (classId: string) => {
  const classDoc = await ClassModel.findOne({ classId })
    .populate("classOwner", "name username email")
    .populate("instructors.instructorId", "name username email")
    .populate("students", "name studentId birthDate birthPlace contact address")
    .exec();

  if (!classDoc) return null;

  // Format instructors to include only needed fields
  const instructors = (classDoc.instructors || []).map((inst: any) => ({
    instructorId: inst.instructorId?._id?.toString() ?? "",
    name: inst.instructorId?.name ?? "",
    username: inst.instructorId?.username ?? "",
    email: inst.instructorId?.email ?? "",
    status: inst.status,
    subject: inst.subject || "",
  }));

  const students = (classDoc.students || []).map((student: any) => ({
    id: student._id.toString(),
    studentId: student.studentId,
    name: student.name,
    birthDate: student.birthDate,
    birthPlace: student.birthPlace,
    contact: student.contact,
    address: student.address,
  }));

  // Return class info with formatted instructors
  return {
    ...classDoc.toObject(),
    instructors,
    students,
  };
};

export const getIdByClassId = async (classId: string) => {
  const classDoc = await ClassModel.findOne({ classId }).select("_id").lean();
  appAssert(classDoc, BAD_REQUEST, "Class not found");
  return classDoc._id as Schema.Types.ObjectId;
};

export const getClassByClassId = async (classId: string) => {
  return await ClassModel.findOne({ classId }).exec();
};

export const addJournalToClass = async (
  classId: string,
  journalId: Types.ObjectId
) => {
  const classDoc = await ClassModel.findOneAndUpdate(
    { classId },
    { $addToSet: { journals: journalId } },
    { new: true, runValidators: true }
  ).populate("journals", "title journalDate");

  return classDoc;
};

/**
 * Get class by IDs
 * @param id - Class IDs
 * @returns Class document
 */
export const getClassesInfoByIds = async (ids: string[]) => {
  appAssert(
    Array.isArray(ids) && ids.length > 0,
    BAD_REQUEST,
    "Class IDs are required"
  );
  ids.forEach((id) =>
    appAssert(
      Types.ObjectId.isValid(id),
      BAD_REQUEST,
      `Invalid class ID: ${id}`
    )
  );

  // Convert string IDs to ObjectId
  const objectIds = ids.map((id) => new Types.ObjectId(id));

  const classDocs = await ClassModel.find({ _id: { $in: objectIds } })
    .select("classId name description classOwner")
    .populate("classOwner", "name username email") // optional: populate owner info
    .exec();

  return classDocs;
};

export const removeAssignmentFromClass = async (
  classId: string,
  assignmentId: string
) => {
  // Validate classId and assignmentId
  appAssert(
    typeof classId === "string" && classId.length > 0,
    BAD_REQUEST,
    "classId is required"
  );
  appAssert(
    Types.ObjectId.isValid(assignmentId),
    BAD_REQUEST,
    "Invalid assignment ID"
  );

  // Find class and remove assignment
  const classDoc = await ClassModel.findOneAndUpdate(
    { classId },
    { $pull: { assignments: new Types.ObjectId(assignmentId) } },
    { new: true, runValidators: true }
  ).populate("assignments", "title description dueDate");

  appAssert(classDoc, NOT_FOUND, "Class not found");
  return classDoc;
};

export const removeJournalFromClass = async (
  classId: string,
  journalId: string
) => {
  // Validate classId and assignmentId
  appAssert(
    typeof classId === "string" && classId.length > 0,
    BAD_REQUEST,
    "classId is required"
  );
  appAssert(
    Types.ObjectId.isValid(journalId),
    BAD_REQUEST,
    "Invalid journal ID"
  );

  // Find class and remove journal
  const classDoc = await ClassModel.findOneAndUpdate(
    { classId },
    { $pull: { journals: new Types.ObjectId(journalId) } },
    { new: true, runValidators: true }
  ).populate("journals", "title journalDate");

  appAssert(classDoc, NOT_FOUND, "Class not found");
  return classDoc;
};

export const removeStudentFromClass = async (classId: string, id: string) => {
  // Find class and remove student
  const classDoc = await ClassModel.findOneAndUpdate(
    { classId },
    { $pull: { students: new Types.ObjectId(id) } },
    { new: true, runValidators: true }
  ).populate("students", "name studentId");
  return classDoc;
};

/**
 * Get subject name by Class ID and User ID
 * @param instructorId - User ID of instructor
 * @param classId - Class ID
 * @returns - Instructor's subject
 */
export const getSubjectByClassUserId = async (
  instructorId: string,
  classId: string
) => {
  appAssert(
    typeof classId === "string" && classId.length > 0,
    BAD_REQUEST,
    "classId is required"
  );
  appAssert(
    Types.ObjectId.isValid(instructorId),
    BAD_REQUEST,
    "Invalid instructor ID"
  );

  const classDoc = await ClassModel.findOne({ classId }).lean();
  appAssert(classDoc, NOT_FOUND, "Class not found");

  const instructor = (classDoc.instructors || []).find(
    (inst: {
      instructorId: Types.ObjectId;
      subject?: string;
      status: string;
    }) =>
      (inst.instructorId?.toString?.() ?? inst.instructorId) === instructorId &&
      inst.status === "accepted"
  );

  appAssert(instructor, NOT_FOUND, "Instructor not found in this class");

  return instructor.subject || null;
};

export const checkInstructor = async (classId: string, userId: string) => {
  const classDoc = await ClassModel.findOne({
    classId,
    "instructors.instructorId": userId,
  });
  return !!classDoc;
};

export const checkClassOwner = async (classId: string, userId: string) => {
  const classDoc = await ClassModel.findOne({ classId, classOwner: userId });

  return !!classDoc;
};

/**
 * Create a new class
 * @param data - Class data
 * @returns Created class document
 */
interface CreateClassParams {
  name: string;
  description?: string;
  classOwner: string;
}

export const createClass = async (data: CreateClassParams) => {
  // Validate instructor exists
  const instructor = await UserModel.findById(data.classOwner);
  appAssert(instructor, NOT_FOUND, "Instructor not found");

  // Tidak perlu cek nama unik, langsung create class
  const newClass = await ClassModel.create({
    name: data.name,
    description: data.description,
    classOwner: data.classOwner,
  });

  // Pastikan field classOwned pada user adalah array sebelum $addToSet
  await UserModel.updateOne(
    { _id: data.classOwner, classOwned: { $exists: false } },
    { $set: { classOwned: [] } }
  );

  // Update classOwner's classOwned field to include the new class
  await UserModel.findByIdAndUpdate(
    data.classOwner,
    {
      $addToSet: {
        classOwned: { id: newClass._id, classId: newClass.classId },
      },
    },
    { new: true }
  );

  const classId = newClass.classId;

  return { classId };
};

export const inviteClassInstructor = async (
  classId: string,
  ownerId: string,
  invitees: { inviteeId: string }[]
) => {
  // Validasi class dan owner
  const classDoc = await ClassModel.findOne({ classId });
  appAssert(classDoc, NOT_FOUND, "Class not found");
  appAssert(
    classDoc.classOwner.toString() === ownerId,
    FORBIDDEN,
    "Only class owner can invite instructors"
  );

  // Validasi semua user yang diundang
  const inviteeIds = invitees.map((i) => i.inviteeId);
  const users = await UserModel.find({ _id: { $in: inviteeIds } });
  appAssert(
    users.length === inviteeIds.length,
    NOT_FOUND,
    "One or more users to invite not found"
  );

  // Tambahkan ke instructors dengan status pending
  const instructorsToAdd = inviteeIds.map((id) => ({
    instructorId: id,
    status: "pending",
  }));

  await ClassModel.updateOne(
    { classId },
    {
      $addToSet: {
        instructors: { $each: instructorsToAdd },
      },
    }
  );

  await NotificationService.createNotifications({
    inviteeIds,
    notificationType: "invite",
    message: `You have been invited to be an instructor in class "${classDoc.name}"`,
    classId: classDoc.classId,
    isRead: false,
  });
};

export const getClassInstructors = async (classId: string) => {
  // Validasi classId
  appAssert(
    typeof classId === "string" && classId.length > 0,
    BAD_REQUEST,
    "Invalid class ID"
  );
  const classDoc = await ClassModel.findOne({ classId });
  appAssert(classDoc, NOT_FOUND, "Class not found");
  // Populate instructors with their user info
  const instructors = await ClassModel.findOne({ classId }, { instructors: 1 })
    .populate("instructors.instructorId", "name username email")
    .lean()
    .exec();

  appAssert(instructors, NOT_FOUND, "Instructors not found for this class");

  const instructorList = (instructors.instructors ?? []).map(
    (instructor: any) => ({
      instructorId: instructor.instructorId._id.toString(),
      name: instructor.instructorId.name,
      username: instructor.instructorId.username,
      email: instructor.instructorId.email,
      status: instructor.status,
    })
  );

  // Map instructors to include their status
  return instructorList;
};

export const updateInstructorStatus = async ({
  classId,
  instructorId,
  status,
}: {
  classId: string;
  instructorId: string;
  status: "accepted" | "pending" | "denied";
}) => {
  // Cari
  const classDoc = await ClassModel.findOne({ classId });
  appAssert(classDoc, BAD_REQUEST, "Invitation not found");

  if (status === "denied") {
    // Hapus instructor dari array jika status denied
    await ClassModel.updateOne(
      { classId },
      {
        $pull: {
          instructors: { instructorId: new Types.ObjectId(instructorId) },
        },
      }
    );
  } else {
    // Update status instructor jika bukan denied
    await ClassModel.updateOne(
      { classId, "instructors.instructorId": new Types.ObjectId(instructorId) },
      { $set: { "instructors.$.status": status } }
    );

    await UserModel.updateOne(
      { _id: instructorId },
      {
        $addToSet: { classes: { id: classDoc._id, classId: classDoc.classId } },
      } // Tambahkan classId
    );
  }
};

export const addAssignmentToClass = async (
  classId: string,
  assignmentId: Types.ObjectId
) => {
  const classDoc = await ClassModel.findOneAndUpdate(
    { classId },
    { $addToSet: { assignments: assignmentId } },
    { new: true, runValidators: true }
  ).populate("assignments", "title description dueDate");

  return classDoc;
};

/**
 * Add a student to a class
 * @param classId - Class ID
 * @param studentId - Student ID
 * @returns Updated class document
 */
export const addStudentsToClass = async (
  classId: string,
  studentsId: ObjectId[]
) => {
  // Add student to class
  const updatedClassDocs = await ClassModel.findOneAndUpdate(
    { classId },
    { $addToSet: { students: { $each: studentsId } } },
    { new: true, runValidators: true }
  ).populate("students", "name studentId");

  appAssert(updatedClassDocs, NOT_FOUND, "Class not found");

  return updatedClassDocs;
};

/**
 * Add instructor subjects to a class
 * @param classId - Class ID
 * @param subjects - Array of subject names
 * @returns Updated class document
 */

export const addClassSubjects = async (classId: string, subjects: string[]) => {
  // Pastikan classId bertipe string dan subjects array of string
  appAssert(
    typeof classId === "string" && classId.length > 0,
    BAD_REQUEST,
    "classId is required"
  );
  appAssert(
    Array.isArray(subjects) && subjects.length > 0,
    BAD_REQUEST,
    "subjects must be a non-empty array"
  );

  // Pastikan classId ada di database
  const classDocExists = await ClassModel.findOne({ classId });
  appAssert(classDocExists, NOT_FOUND, "Class not found");

  // Update subjects
  const classDoc = await ClassModel.findOneAndUpdate(
    { classId },
    {
      $addToSet: { subjects: { $each: subjects } },
    },
    {
      new: true,
      runValidators: true,
      // Make sure to return plain object with all fields
    }
  ).lean();
  // Tambahkan entry weights untuk setiap subject yang baru ditambahkan
  const addedSubjects = subjects.filter(
    (subject) => !(classDocExists.subjects || []).includes(subject)
  );

  if (addedSubjects.length > 0) {
    const weightsToAdd = addedSubjects.map((subject) => ({
      subject,
      assignmentWeight: {},
    }));

    await ClassModel.updateOne(
      { classId },
      { $addToSet: { weights: { $each: weightsToAdd } } }
    );
  }
  appAssert(classDoc, INTERNAL_SERVER_ERROR, "Failed to update subjects");

  return classDoc;
};

/**
 * Give instructor subjects in a class
 * @param classId - Class ID
 * @param subject - Subject names
 * @returns Updated class document
 */

export const giveInstructorSubjects = async (
  classId: string,
  instructorId: string,
  subject: string
) => {
  // Update subject pada instructor tertentu di array instructors
  await ClassModel.findOneAndUpdate(
    { classId, "instructors.instructorId": instructorId },
    {
      $set: { "instructors.$.subject": subject },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  await ClassModel.updateOne(
    { classId, "weights.subject": subject },
    {
      $set: {
        "weights.$.userId": instructorId,
      },
    }
  );
  const classDoc = await ClassModel.findOne({ classId }).lean();

  return classDoc;
};

/**
 * Give instructor subjects in a class
 * @param classId - Class ID
 * @returns Updated class document
 */

export const getClassSubjects = async (classId: string) => {
  const classDoc = await ClassModel.findOne({ classId }, { subjects: 1 })
    .lean()
    .exec();
  appAssert(classDoc, NOT_FOUND, "Class not found");
  return classDoc.subjects || [];
};

export const updateClassWeights = async (
  classId: string,
  {
    userId,
    subject,
    assignmentWeights,
  }: {
    userId: string; // Optional userId for specific user weights
    subject: string;
    assignmentWeights: {
      homework: number;
      quiz: number;
      exam: number;
      project: number;
      finalExam: number;
    };
  }
) => {
  // Cek apakah ada entri dengan userId dan subject yang sesuai
  const classDoc = await ClassModel.findOneAndUpdate(
    { classId, "weights.userId": userId, "weights.subject": subject },
    {
      // Jika ada, update assignmentWeights untuk userId dan subject yang cocok
      $set: {
        "weights.$.assignmentWeight": assignmentWeights,
      },
    },
    { new: true, runValidators: true }
  )
    .select("weights")
    .lean();

  return classDoc;
};

/**
 * Get class weights for a specific class
 * @param classId - Class ID
 * @returns Array of class weights
 */
export const getClassWeights = async (
  classId: string
): Promise<
  {
    subject: string;
    weights: Record<string, number>;
  }[]
> => {
  const classDoc = await ClassModel.findOne({ classId }, { weights: 1 })
    .lean()
    .exec();
  appAssert(classDoc, NOT_FOUND, "Class not found");

  // Map to desired structure
  const weightsArr = (classDoc.weights || []).map((w: any) => ({
    subject: w.subject,
    weights: w.assignmentWeight || {
      homework: 0,
      quiz: 0,
      exam: 0,
      project: 0,
      finalExam: 0,
    },
  }));
  return weightsArr;
};

/**
 * Get class weight for a specific subject
 * @param classId - Class ID
 * @param subject - Subject name
 * @returns Class weight for the subject
 */
export const getClassWeightBySubject = async (
  classId: string,
  subject: string
) => {
  const classDoc = await ClassModel.findOne(
    { classId, "weights.subject": subject },
    { weights: 1 }
  )
    .populate("weights.userId", "name username email")
    .lean()
    .exec();
  appAssert(classDoc, NOT_FOUND, "Class not found or subject not found");

  // Filter weights sesuai subject
  const weightItem = (classDoc.weights || []).find(
    (w: any) => w.subject === subject
  );

  return weightItem || null;
};

/**
 * Remove a student from a class
 * @param classId - Class ID
 * @param studentId - Student ID
 * @returns Updated class document
 */
export const removeStudentsFromClass = async (classId: string) => {
  appAssert(
    typeof classId === "string" && classId.length > 0,
    BAD_REQUEST,
    "Invalid class ID"
  );

  // Remove all students from the class with the given classId
  const updatedClass = await ClassModel.findOneAndUpdate(
    { classId },
    { $set: { students: [] } },
    { new: true }
  ).populate("classOwner", "name username email");

  appAssert(updatedClass, NOT_FOUND, "Class not found");

  return updatedClass;
};

/**
 * Delete a class
 * @param classId - Class ID to delete
 * @param userId - User ID making the request (for authorization)
 */
export const deleteClass = async (userId: string, classId: string) => {
  // Delete field classOwned dari user yang memiliki class ini
  await UserService.removeClassOwned(userId, classId);

  const instructors = await ClassModel.findOne(
    { classId },
    { "instructors.instructorId": 1, _id: 0 }
  ).lean();

  const instructorIds = (instructors?.instructors || []).map(
    (inst: any) => inst.instructorId
  );

  // Delete field classes dari user yang memiliki class ini
  await UserService.removeClasses(instructorIds, classId);

  // Delete all students associated with this class
  await StudentService.deleteAllStudentsByClassId(classId);

  // Delete assignments and grades associated with this class
  await AssignmentService.deleteAssignmentsByClassId(classId);

  const result = await ClassModel.deleteOne({ classId });

  return result;
};

/**
 * Students statistics by subject
 * @param classId - Class ID to delete
 * @param subject
 * @returns Array of students with their statistics
 */
export const getStatisticsByClass = async (classId: string) => {
  const classDoc = await ClassModel.find({ classId });
  return classDoc;
};

// export const studentsAttendance = async (classId: string) => {
//   // Ambil semua journal untuk classId
//   const JournalModel = require("@models/journal.model").default;
//   const journals = await JournalModel.find({ classId }).lean();

//   const students = await StudentService.getStudentsIdsByClassId(classId);
//   // Inisialisasi counter untuk setiap status
//   const statusCount = {
//     present: 0,
//     absent: 0,
//     late: 0,
//     sick: 0,
//     excused: 0,
//     pending: 0,
//   };

//   // Loop semua journals dan hitung status
//   for (const journal of journals) {
//     for (const j of journal.journals || []) {
//       if (j.status && statusCount.hasOwnProperty(j.status)) {
//         statusCount[j.status]++;
//       }
//     }
//   }

//   return statusCount;
// };

export const getFinalScore = async (classId: string, studentId: string) => {
  const scoresObj = await AssignmentService.getScoresAndWeightsByStudentId(
    classId,
    studentId
  );

  const finalScores: Record<string, number>[] = [];

  for (const grade of scoresObj.grades) {
    const subjectScores = grade.scores;
    const subjectWeights = grade.weights;

    const homeworkScore =
      subjectScores.homework.length > 0
        ? ((subjectScores.homework.reduce((a, b) => a + b, 0) /
            subjectScores.homework.length) *
            subjectWeights.homework) /
          100
        : 0;
    const quizScore =
      subjectScores.quiz.length > 0
        ? ((subjectScores.quiz.reduce((a, b) => a + b, 0) /
            subjectScores.quiz.length) *
            subjectWeights.quiz) /
          100
        : 0;
    const examScore =
      subjectScores.exam.length > 0
        ? ((subjectScores.exam.reduce((a, b) => a + b, 0) /
            subjectScores.exam.length) *
            subjectWeights.exam) /
          100
        : 0;
    const projectScore =
      subjectScores.project.length > 0
        ? ((subjectScores.project.reduce((a, b) => a + b, 0) /
            subjectScores.project.length) *
            subjectWeights.project) /
          100
        : 0;
    const finalExamScore =
      subjectScores.finalExam.length > 0
        ? ((subjectScores.finalExam.reduce((a, b) => a + b, 0) /
            subjectScores.finalExam.length) *
            subjectWeights.finalExam) /
          100
        : 0;

    const subjectFinalScore =
      homeworkScore + quizScore + examScore + projectScore + finalExamScore;

    finalScores.push({ [grade.subject]: subjectFinalScore });
  }

  return finalScores;
};

export const getFinalScoreInTimeRange = async (
  classId: string,
  studentId: string,
  startDate: string,
  endDate: string
) => {
  const scoresObj =
    await AssignmentService.getScoresAndWeightsByStudentIdInTimeRange(
      classId,
      studentId,
      startDate,
      endDate
    );

  const finalScores: Record<string, number>[] = [];

  for (const grade of scoresObj.grades) {
    const subjectScores = grade.scores;
    const subjectWeights = grade.weights;

    const homeworkScore =
      subjectScores.homework.length > 0
        ? ((subjectScores.homework.reduce((a, b) => a + b, 0) /
            subjectScores.homework.length) *
            subjectWeights.homework) /
          100
        : 0;
    const quizScore =
      subjectScores.quiz.length > 0
        ? ((subjectScores.quiz.reduce((a, b) => a + b, 0) /
            subjectScores.quiz.length) *
            subjectWeights.quiz) /
          100
        : 0;
    const examScore =
      subjectScores.exam.length > 0
        ? ((subjectScores.exam.reduce((a, b) => a + b, 0) /
            subjectScores.exam.length) *
            subjectWeights.exam) /
          100
        : 0;
    const projectScore =
      subjectScores.project.length > 0
        ? ((subjectScores.project.reduce((a, b) => a + b, 0) /
            subjectScores.project.length) *
            subjectWeights.project) /
          100
        : 0;
    const finalExamScore =
      subjectScores.finalExam.length > 0
        ? ((subjectScores.finalExam.reduce((a, b) => a + b, 0) /
            subjectScores.finalExam.length) *
            subjectWeights.finalExam) /
          100
        : 0;

    const subjectFinalScore =
      homeworkScore + quizScore + examScore + projectScore + finalExamScore;

    finalScores.push({ [grade.subject]: subjectFinalScore });
  }

  return finalScores;
};

export const getAverageScorePerSubjectInTimeRange = async (
  classId: string,
  studentId: string,
  startDate: string,
  endDate: string
) => {
  const scoresObj =
    await AssignmentService.getScoresAndWeightsByStudentIdInTimeRange(
      classId,
      studentId,
      startDate,
      endDate
    );

  const subjectAvgScores: Record<
    string,
    {
      homework: number;
      quiz: number;
      exam: number;
      project: number;
      finalExam: number;
    }
  >[] = [];

  for (const grade of scoresObj.grades) {
    const scores = grade.scores;

    const homeworkAvg =
      scores.homework.length > 0
        ? scores.homework.reduce((a, b) => a + b, 0) / scores.homework.length
        : 0;
    const quizAvg =
      scores.quiz.length > 0
        ? scores.quiz.reduce((a, b) => a + b, 0) / scores.quiz.length
        : 0;
    const examAvg =
      scores.exam.length > 0
        ? scores.exam.reduce((a, b) => a + b, 0) / scores.exam.length
        : 0;
    const projectAvg =
      scores.project.length > 0
        ? scores.project.reduce((a, b) => a + b, 0) / scores.project.length
        : 0;
    const finalExamAvg =
      scores.finalExam.length > 0
        ? scores.finalExam.reduce((a, b) => a + b, 0) / scores.finalExam.length
        : 0;

    const avgScores = {
      homework: homeworkAvg,
      quiz: quizAvg,
      exam: examAvg,
      project: projectAvg,
      finalExam: finalExamAvg,
    };

    subjectAvgScores.push({ [grade.subject]: avgScores });
  }

  return subjectAvgScores;
};

export const getAverageScorePerSubject = async (
  classId: string,
  studentId: string
): Promise<
  Record<
    string,
    {
      homework: number;
      quiz: number;
      exam: number;
      project: number;
      finalExam: number;
    }
  >[]
> => {
  const scoresObj = await AssignmentService.getScoresAndWeightsByStudentId(
    classId,
    studentId
  );

  const subjectAvgScores: Record<
    string,
    {
      homework: number;
      quiz: number;
      exam: number;
      project: number;
      finalExam: number;
    }
  >[] = [];

  for (const grade of scoresObj.grades) {
    const scores = grade.scores;

    const homeworkAvg =
      scores.homework.length > 0
        ? scores.homework.reduce((a, b) => a + b, 0) / scores.homework.length
        : 0;
    const quizAvg =
      scores.quiz.length > 0
        ? scores.quiz.reduce((a, b) => a + b, 0) / scores.quiz.length
        : 0;
    const examAvg =
      scores.exam.length > 0
        ? scores.exam.reduce((a, b) => a + b, 0) / scores.exam.length
        : 0;
    const projectAvg =
      scores.project.length > 0
        ? scores.project.reduce((a, b) => a + b, 0) / scores.project.length
        : 0;
    const finalExamAvg =
      scores.finalExam.length > 0
        ? scores.finalExam.reduce((a, b) => a + b, 0) / scores.finalExam.length
        : 0;

    const avgScores = {
      homework: homeworkAvg,
      quiz: quizAvg,
      exam: examAvg,
      project: projectAvg,
      finalExam: finalExamAvg,
    };

    subjectAvgScores.push({ [grade.subject]: avgScores });
  }

  return subjectAvgScores;
};

export const createStudentReport = async (
  classId: string,
  studentId: string,
  note: string = ""
) => {
  // Get class info and student info
  const classDoc = await ClassModel.findOne({ classId })
    .populate("classOwner", "name")
    .populate("students", "name studentId")
    .lean();

  // Find student in class
  const student = await StudentService.getStudentNameAndId(studentId);

  const studentName = student?.name || "";
  const studentIdValue = student?.studentId || "";

  const className = classDoc?.name || "";
  const homeroom =
    typeof classDoc?.classOwner === "object" &&
    "name" in (classDoc.classOwner || {})
      ? (classDoc.classOwner as { name?: string }).name || ""
      : "";

  // Get attendances per subject
  const attendancesRaw = await JournalService.getAttendanceByStudentId(
    classId,
    studentId
  );

  // Get weights, grades, and scores
  const weights = await getClassWeights(classId);
  const finalScores = await getFinalScore(classId, studentId);
  const averageScores = await getAverageScorePerSubject(classId, studentId);

  // Gabungkan finalScores dan averageScores ke dalam satu array dengan struktur yang diinginkan
  const grades = weights.map((w, idx) => {
    const subject = w.subject;
    const avgScoreObj = averageScores[idx]?.[subject] || {
      homework: 0,
      quiz: 0,
      exam: 0,
      project: 0,
      finalExam: 0,
    };
    const finalScoreObj = finalScores[idx]?.[subject] ?? 0;

    return {
      subject,
      homework: avgScoreObj.homework,
      quiz: avgScoreObj.quiz,
      exam: avgScoreObj.exam,
      project: avgScoreObj.project,
      finalExam: avgScoreObj.finalExam,
      finalScore: finalScoreObj,
    };
  });

  // Attendances per subject
  const attendances = weights.map((w) => {
    // Find attendance for subject, fallback to default
    const att = Array.isArray(attendancesRaw)
      ? attendancesRaw.find((a: any) => a.subject === w.subject)
      : undefined;
    return {
      subject: w.subject,
      attendance: att?.attendance || {
        present: 0,
        absent: 0,
        late: 0,
        sick: 0,
        excused: 0,
        pending: 0,
      },
    };
  });

  // Weights per subject
  const weightsArr = weights.map((w) => ({
    subject: w.subject,
    weight: w.weights,
  }));

  // Average score (rata-rata finalScore semua subject)
  const averageScore =
    grades.length > 0
      ? Math.round(
          (grades.reduce((sum, g) => sum + (g.finalScore || 0), 0) /
            grades.length) *
            100
        ) / 100
      : 0;

  // Build report object
  return {
    [studentName]: {
      studentId: studentIdValue,
      className,
      homeroom,
      grades,
      attendances,
      weights: weightsArr,
      averageScore,
      note,
    },
  };
};

export const createStudentReportInTimeRange = async (
  classId: string,
  studentId: string,
  startDate: string,
  endDate: string,
  note: string = ""
) => {
  // Get class info and student info
  const classDoc = await ClassModel.findOne({ classId })
    .populate("classOwner", "name")
    .populate("students", "name studentId")
    .lean();

  // Find student in class
  const student = await StudentService.getStudentNameAndId(studentId);

  const studentName = student?.name || "";
  const studentIdValue = student?.studentId || "";

  const className = classDoc?.name || "";
  const homeroom =
    typeof classDoc?.classOwner === "object" &&
    "name" in (classDoc.classOwner || {})
      ? (classDoc.classOwner as { name?: string }).name || ""
      : "";

  // Get attendances per subject
  const attendancesRaw =
    await JournalService.getAttendanceByStudentIdInTimeRange(
      classId,
      studentId,
      startDate,
      endDate
    );

  // Get weights, grades, and scores
  const weights = await getClassWeights(classId);
  const finalScores = await getFinalScoreInTimeRange(
    classId,
    studentId,
    startDate,
    endDate
  );
  const averageScores = await getAverageScorePerSubjectInTimeRange(
    classId,
    studentId,
    startDate,
    endDate
  );

  // Gabungkan finalScores dan averageScores ke dalam satu array dengan struktur yang diinginkan
  const grades = weights.map((w, idx) => {
    const subject = w.subject;
    const avgScoreObj = averageScores[idx]?.[subject] || {
      homework: 0,
      quiz: 0,
      exam: 0,
      project: 0,
      finalExam: 0,
    };
    const finalScoreObj = finalScores[idx]?.[subject] ?? 0;

    return {
      subject,
      homework: avgScoreObj.homework,
      quiz: avgScoreObj.quiz,
      exam: avgScoreObj.exam,
      project: avgScoreObj.project,
      finalExam: avgScoreObj.finalExam,
      finalScore: finalScoreObj,
    };
  });

  // Attendances per subject
  const attendances = weights.map((w) => {
    // Find attendance for subject, fallback to default
    const att = Array.isArray(attendancesRaw)
      ? attendancesRaw.find((a: any) => a.subject === w.subject)
      : undefined;
    return {
      subject: w.subject,
      attendance: att?.attendance || {
        present: 0,
        absent: 0,
        late: 0,
        sick: 0,
        excused: 0,
        pending: 0,
      },
    };
  });

  // Weights per subject
  const weightsArr = weights.map((w) => ({
    subject: w.subject,
    weight: w.weights,
  }));

  // Average score (rata-rata finalScore semua subject)
  const averageScore =
    grades.length > 0
      ? Math.round(
          (grades.reduce((sum, g) => sum + (g.finalScore || 0), 0) /
            grades.length) *
            100
        ) / 100
      : 0;

  // Build report object
  return {
    [studentName]: {
      studentId: studentIdValue,
      className,
      homeroom,
      grades,
      attendances,
      weights: weightsArr,
      averageScore,
      note,
    },
  };
};
