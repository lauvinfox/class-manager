import ClassModel, { IClass } from "@models/class.model";
import UserModel from "@models/user.model";
import appAssert from "@utils/appAssert";
import {
  BAD_REQUEST,
  CONFLICT,
  NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
} from "@constants/statusCodes";
import { ObjectId, Types } from "mongoose";
import NotificationModel from "@models/notification.model";

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

/**
 * Get classes by instructor ID
 * @param instructorId - User ID of instructor
 * @returns Array of classes
 */
// export const getClassesByInstructor = async (instructorId: string) => {
//   appAssert(
//     Types.ObjectId.isValid(instructorId),
//     BAD_REQUEST,
//     "Invalid instructor ID"
//   );

//   return ClassModel.find({ instructor: instructorId })
//     .populate("students", "name studentId")
//     .exec();
// };

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

  // Check if class with same name already exists
  const existingClass = await ClassModel.findOne({ name: data.name });
  appAssert(!existingClass, CONFLICT, "Class with this name already exists");

  // Create class
  const newClass = await ClassModel.create({
    name: data.name,
    description: data.description,
    classOwner: data.classOwner,
  });

  // Update classOwner's classOwned field to include the new class
  await UserModel.findByIdAndUpdate(
    data.classOwner,
    { $addToSet: { classOwned: newClass.classId } },
    { new: true }
  );

  const classId = newClass.classId;

  return { classId };
};

/**
 * Update a class
 * @param id - Class ID
 * @param userId - User ID making the request (for authorization)
 * @param data - Updated class data
 * @returns Updated class document
 */
// export const updateClass = async (
//   id: string,
//   userId: string,
//   data: UpdateClassParams
// ) => {
//   appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid class ID");

//   const classDoc = await ClassModel.findById(id);
//   appAssert(classDoc, NOT_FOUND, "Class not found");

//   // Ensure only the instructor can update the class
//   appAssert(
//     classDoc.classOwner.toString() === userId,
//     FORBIDDEN,
//     "Only the instructor can update this class"
//   );

//   // If updating instructor
//   if (data.instructorId) {
//     const instructor = await UserModel.findById(data.instructorId);
//     appAssert(instructor, NOT_FOUND, "New instructor not found");
//   }

//   // Check if class name is being changed and if it conflicts
//   if (data.name && data.name !== classDoc.name) {
//     const existingClass = await ClassModel.findOne({ name: data.name });
//     appAssert(
//       !existingClass,
//       CONFLICT,
//       "Another class with this name already exists"
//     );
//   }

//   // Update the class
//   const updateData: any = { ...data };
//   if (data.instructorId) {
//     updateData.instructor = data.instructorId;
//     delete updateData.instructorId;
//   }

//   const updatedClass = await ClassModel.findByIdAndUpdate(id, updateData, {
//     new: true,
//     runValidators: true,
//   })
//     .populate("instructor", "name email")
//     .populate("students", "name studentId");

//   return updatedClass;
// };

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

  // Buat notifikasi ke setiap user yang diundang
  const notifications = inviteeIds.map((id) => ({
    userId: id,
    type: "invite",
    message: `You have been invited to be an instructor in class "${classDoc.name}"`,
    classId: classDoc.classId,
    isRead: false,
    createdAt: new Date(),
  }));

  await NotificationModel.insertMany(notifications);
};

export const getClassInstructors = async (classId: string) => {
  // Validasi classId
  appAssert(Types.ObjectId.isValid(classId), BAD_REQUEST, "Invalid class ID");
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

export const updateInstructorStatus = async (
  classId: string,
  instructorId: string,
  status: "accepted" | "pending" | "denied"
) => {
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
      { $addToSet: { classes: classId } } // Tambahkan classId
    );
  }
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
  const classDoc = await ClassModel.findOneAndUpdate(
    { classId, "instructors.instructorId": instructorId },
    {
      $set: { "instructors.$.subject": subject },
    },
    {
      new: true,
      runValidators: true,
    }
  );

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

/**
 * Remove a student from a class
 * @param classId - Class ID
 * @param studentId - Student ID
 * @returns Updated class document
 */
// export const removeStudentFromClass = async (
//   classId: string,
//   studentId: string
// ) => {
//   appAssert(Types.ObjectId.isValid(classId), BAD_REQUEST, "Invalid class ID");
//   appAssert(
//     Types.ObjectId.isValid(studentId),
//     BAD_REQUEST,
//     "Invalid student ID"
//   );

//   // Check if class exists
//   const classDoc = await ClassModel.findById(classId);
//   appAssert(classDoc, NOT_FOUND, "Class not found");

//   // Check if student is in class
//   const isStudentInClass = classDoc.students.some(
//     (id) => id.toString() === studentId
//   );
//   appAssert(isStudentInClass, NOT_FOUND, "Student is not in this class");

//   // Remove student from class
//   classDoc.students = classDoc.students.filter(
//     (id) => id.toString() !== studentId
//   );
//   await classDoc.save();

//   return ClassModel.findById(classId)
//     .populate("instructor", "name email")
//     .populate("students", "name studentId");
// };

/**
 * Delete a class
 * @param id - Class ID
 * @param userId - User ID making the request (for authorization)
 */
// export const deleteClass = async (id: string, userId: string) => {
//   appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid class ID");

//   const classDoc = await ClassModel.findById(id);
//   appAssert(classDoc, NOT_FOUND, "Class not found");

//   // Ensure only the instructor can delete the class
//   appAssert(
//     classDoc.instructor.toString() === userId,
//     FORBIDDEN,
//     "Only the instructor can delete this class"
//   );

//   await classDoc.deleteOne();
//   return { success: true };
// };
