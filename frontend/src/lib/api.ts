import API from "../config/apiClient";

/** Authentication API Module
 * This module provides functions to handle user authentication, including sign in, sign up, and user information retrieval.
 */

/** Sign In Authentication
 * This function is used to log in a user by sending their email and password to the API.
 * @param email - User's email
 * @param password - User's password
 * @returns Promise resolving to the API response
 */
export const loginUser = async (email: string, password: string) => {
  return await API.post("/auth/signin", { email, password });
};

/** Sign Up Authentication
 * This function is used to register a new user by sending their details to the API.
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param email - User's email
 * @param username - User's username
 * @param password - User's password
 * @param confirmPassword - Confirmation of the user's password
 * @param dateOfBirth - User's date of birth
 * @returns Promise resolving to the API response
 */
export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
  confirmPassword: string,
  dateOfBirth: string
) => {
  return await API.post("/auth/signup", {
    firstName,
    lastName,
    email,
    username,
    password,
    confirmPassword,
    dateOfBirth,
  });
};

/** Verify Email
 * This function verifies a user's email using a verification code.
 * @param verificationCode - The code sent to the user's email for verification.
 * @returns Promise resolving to the API response for email verification.
 */
export const verifyEmail = async (verificationCode: string) => {
  return await API.get(`/auth/email/verify/${verificationCode}`);
};

/**
 * Forgot Password
 * This function initiates the password recovery process for a user.
 * @param email - The email address of the user who forgot their password.
 * @returns Promise resolving to the API response for the password recovery request.
 */
export const forgotPassword = async (email: string) => {
  return await API.post("/auth/password/forgot", { email });
};

/** Reset Password
 * This function resets the user's password using a verification code and the new password.
 * @param password - The new password to be set.
 * @param verificationCode - The verification code sent to the user's email.
 * @returns Promise resolving to the API response for resetting the password.
 */
export const resetPassword = async (
  password: string,
  verificationCode: string
) => {
  return await API.post("/auth/password/reset", {
    password,
    verificationCode,
  });
};

/** Sign Out Authentication
 * This function is used to log out the current user by sending a request to the API.
 * @returns Promise resolving to the API response for signing out.
 */
export const signOut = async () => {
  return await API.get("/auth/signout");
};

/** User Information API Module
 * This module provides functions to retrieve and manage user information.
 */

/** Get Current User Information
 * This function retrieves the current user's information from the API.
 * @returns Promise resolving to the API response for fetching the current user's information.
 */

export const getMe = async () => {
  return await API.get("/api/v1/users/me");
};

/** Get User Information
 * This function retrieves the information of the currently logged-in user.
 * @returns Promise resolving to the API response for fetching user information.
 */
export const getUserInfo = async () => {
  return await API.get(`/api/v1/users/info`);
};

/** Get Users Information by Username
 * This function retrieves user information based on the provided username.
 * @param username - The username of the user to retrieve information for.
 * @returns Promise resolving to the API response for fetching user information by username.
 */
export const getUsersByUsername = async (username: string) => {
  return await API.post(`/api/v1/users/username`, { username });
};

/** Change Username
 * This function changes the username of the currently logged-in user.
 * @param password - The password of the user.
 * @param newUsername - The new username to be set.
 * @returns Promise resolving to the API response for changing the username.
 */
export const changeUsername = async ({
  password,
  newUsername,
}: {
  password: string;
  newUsername: string;
}) => {
  return await API.put(`/api/v1/users/username/change`, {
    password,
    newUsername,
  });
};

/** Get Full User Information
 * This function retrieves the full information of a user based on their username.
 * @param username - The username of the user to retrieve information for.
 * @returns Promise resolving to the API response for fetching full user information.
 */
export const getFullUserInfo = async (username: string) => {
  const response = await API.get(`/api/v1/users/info-by-username/${username}`);
  return response;
};

/** Get User Classes
 * This function retrieves the classes associated with the currently logged-in user.
 * @returns Promise resolving to the API response for fetching user classes.
 */
export const getClasses = async () => {
  return await API.get("/api/v1/users/class/get");
};

/** Notification API Module
 * This module provides functions to retrieve and manage user notifications.
 */

/** Get User Notifications
 * This function retrieves all notifications for the currently logged-in user.
 * @returns Promise resolving to the API response for fetching user notifications.
 */
export const getUserNotifications = async () => {
  const response = await API.get(`/api/v1/notifications/`);
  return response;
};

/** Mark Notification as Read
 * This function marks a specific notification as read.
 * @returns Promise resolving to the API response for marking the notification as read.
 */
export const markAllNotificationsAsRead = async () => {
  return await API.patch("/api/v1/notifications/markallread");
};

/** Respond Invitation
 * Respond to an instructor invitation notification.
 * @param notificationId - The ID of the notification to respond to.
 * @param inviteResponse - The response to the invitation (e.g., accept or decline).
 * @returns Promise resolving to the API response for responding to the invitation.
 */
export const respondInviteInstructor = async ({
  notificationId,
  inviteResponse,
}: {
  notificationId: string;
  inviteResponse: string;
}) => {
  const response = await API.patch(
    `/api/v1/notifications/respond-invite/${notificationId}`,
    {
      inviteResponse,
    }
  );
  return response;
};

/** Class API Module
 *  This module provides functions to manage classes, including creating, retrieving, and updating class information.
 */

/** Create Class
 * Creates a new class with the specified name and optional description.
 * @param name
 * @param description
 * @returns Promise resolving to the API response for creating the class.
 */
export const createClass = async (name: string, description?: string) => {
  return await API.post("/api/v1/class/", { name, description });
};

/** Get Class by Class ID
 * Retrieves class information based on the provided class ID.
 * @param classid - The ID of the class to retrieve.
 * @returns Promise resolving to the API response for fetching class information.
 */
export const getClassByClassId = async (classid: string) => {
  return await API.get(`/api/v1/class/id/${classid}`);
};

/** Get Class by IDs
 *  Retrieves class information for multiple classes based on their IDs.
 * @param ids - The IDs of the classes to retrieve.
 * @returns Promise resolving to the API response for fetching class information
 */
export const getClassByIds = async (ids: string[]) => {
  return await API.post("/api/v1/class/getbyids", { ids });
};

/** Get Class by Class Owner
 *  Retrieves class information for classes owned by the currently logged-in user.
 * @returns Promise resolving to the API response for fetching class information.
 */
export const getClassesByClassOwner = async () => {
  return await API.get("/api/v1/class/getbyclassowner");
};

/** Get Subject by Class ID
 *  Retrieves the subject associated with a specific class ID.
 * @param classId - The ID of the class to retrieve the subject for.
 * @returns Promise resolving to the API response for fetching the subject information.
 */
export const getSubjectByClassId = async (classId: string) => {
  return await API.get(`/api/v1/class/${classId}/subject/get`);
};

/** Invite Instructors to Class
 *  This function invites instructors to a class by sending their usernames and IDs.
 * @param classId - The classId of class to which instructors will be invited.
 * @param invitees - An array of objects containing the usernames and IDs of the instructors to invite.
 * @returns Promise resolving to the API response for inviting instructors to the class.
 */
export const inviteInstructors = async (
  classId: string,
  invitees: { username: string; id: string }[]
) => {
  return await API.post(
    `/api/v1/class/${classId}/inviteinstructors`,

    invitees
  );
};

/** Get Instructor Class
 * This function retrieves the instructors associated with a specific class.
 * @param classId - The ID of the class for which instructors will be retrieved.
 * @returns Promise resolving to the API response for fetching instructor information.
 */
export const getInstructorClass = async (classId: string) => {
  return await API.get(`/api/v1/class/${classId}/instructors`);
};

/** Get Class Subjects
 *  This function retrieves the subjects associated with a specific class ID.
 * @param classId - The ID of the class for which subjects will be retrieved.
 * @returns Promise resolving to the API response for fetching class subjects.
 */
export const getClassSubjects = async (classId: string) => {
  return await API.get(`/api/v1/class/${classId}/subjects`);
};

/** Add Subjects to a Class
 * This function add s subjects to a class by sending the class ID and an array of subject IDs to the API.
 * @param classId - The ID of the class to which subjects will be added.
 * @param subjects - An array of subject IDs to be added to the class.
 * @returns Promise resolving to the API response for adding subjects to the class.
 */
export const addSubjectsToClass = async (
  classId: string,
  subjects: string[]
) => {
  return await API.post(`/api/v1/class/${classId}/subjects`, { subjects });
};

/** Give Subject to Instructor
 * This function assigns a subject to an instructor in a specific class.
 * @param classId - The ID of the class to which the instructor will be added.
 * @param instructorId - The ID of the instructor to whom the subject will be assigned.
 * @param subject - The subject to be assigned to the instructor.
 * @returns Promise resolving to the API response for assigning the subject to the instructor.
 */
export const giveSubjectToInstructor = async (
  classId: string,
  instructorId: string,
  subject: string
) => {
  return await API.post(
    `/api/v1/class/${classId}/instructors/${instructorId}/subjects`,
    { subject }
  );
};

/** Give Subject Weights
 * This function assigns weights to different types of assignments for a specific subject in a class.
 * @param subjectWeightsData - An object containing the class ID, subject, and assignment weights.
 * @returns Promise resolving to the API response for assigning the subject weights.
 */
export const giveSubjectWeights = async ({
  classId,
  subject,
  assignmentWeight,
}: {
  classId: string;
  subject: string;
  assignmentWeight: {
    homework?: number;
    quiz?: number;
    exam?: number;
    project?: number;
    finalExam?: number;
  };
}) => {
  return await API.patch(`/api/v1/class/${classId}/weights`, {
    subject,
    assignmentWeight,
  });
};

/** Get Class Weights
 * This function retrieves the weights assigned to different types of assignments for a specific class.
 * @param classId - The ID of the class for which weights will be retrieved.
 * @returns Promise resolving to the API response for fetching class weights.
 */
export const getClassWeights = async (classId: string) => {
  return await API.get(`/api/v1/class/${classId}/weights`);
};

/** Get Class Weight by Subject
 * This function retrieves the weights assigned to different types of assignments for a specific subject in a class.
 * @param classId - The ID of the class for which weights will be retrieved.
 * @param subject - The subject for which weights will be retrieved.
 * @returns Promise resolving to the API response for fetching class weight by subject.
 */
export const getClassWeightBySubject = async (
  classId: string,
  subject: string
) => {
  return await API.get(`/api/v1/class/${classId}/weights/${subject}`);
};

/** Get Full Student Report
 * This function retrieves a full report for a student in a specific class, including their assignments and grades.
 * @param classId - The ID of the class for which the report will be generated.
 * @param studentId - The ID of the student for whom the report will be generated.
 * @param note - An optional note to include in the report.
 * @returns Promise resolving to the API response for fetching the full student report.
 */
export const getFullStudentReport = async (
  classId: string,
  studentId: string,
  note: string
) => {
  return await API.post(
    `/api/v1/class/${classId}/student-report/${studentId}`,
    { note }
  );
};

/** Get Student Report by Date Range
 * This function retrieves a report for a student in a specific class within a date range.
 * @param studentReportData - An object containing the class ID, student ID, start date, end date, and optional note.
 * @returns Promise resolving to the API response for fetching the student report by date range.
 */
export const getStudentReportByDateRange = async ({
  classId,
  studentId,
  startDate,
  endDate,
  note,
}: {
  classId: string;
  studentId: string;
  startDate: string;
  endDate: string;
  note: string;
}) => {
  return await API.post(
    `/api/v1/class/${classId}/student-report/${studentId}/date-range`,
    { startDate: startDate, endDate: endDate, note: note }
  );
};

/** Delete Class by Class ID
 *  This function deletes a class based on its class ID.
 * @param classId - The classId to be deleted.
 * @returns Promise resolving to the API response for deleting the class.
 */
export const deleteClassByClassId = async (classId: string) => {
  return await API.delete(`/api/v1/class/${classId}`);
};

/** Student API Module
 *  This module provides functions to manage students, including adding, updating, and deleting students in a class.
 */

/** Add Student to Class
 * This function adds a student to a class by sending the student's details to the API.
 * @param classId
 * @param student
 * @returns Promise resolving to the API response for adding the student to the class.
 */
export const addStudentToClass = async (
  classId: string,
  student: {
    studentId: number;
    name: string;
    birthDate: string;
    birthPlace: string;
    contact: string;
    address: string;
  }
) => {
  return await API.post(`/api/v1/students/${classId}/create`, {
    name: student.name,
    studentId: student.studentId,
    birthDate: student.birthDate,
    birthPlace: student.birthPlace,
    contact: student.contact,
    address: student.address,
  });
};

/** Add Students to Class
 * This function adds multiple students to a class by sending their details to the API.
 * @param classId - The ID of the class to which students will be added.
 * @param file - The file containing student details to be uploaded.
 * @returns Promise resolving to the API response for adding the students to the class.
 */
export const addStudentsToClass = async (classId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return await API.post(`/api/v1/students/${classId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/** Update Student by ID
 * This function updates a student's information in a specific class by their ID.
 * @param id - The ID of the student to be updated.
 * @param classId - The ID of the class in which the student is enrolled.
 * @param updatedStudent - An object containing the updated student information.
 * @returns Promise resolving to the API response for updating the student.
 */
export const updateStudentById = async (
  id: string,
  classId: string,
  updatedStudent: {
    name?: string;
    studentId?: number;
    birthDate?: string;
    birthPlace?: string;
    contact?: string;
    address?: string;
  }
) => {
  return await API.put(`/api/v1/students/${id}/update/${classId}`, {
    ...updatedStudent,
  });
};

/**
 * Delete Student from Class
 * This function removes a student from a class by sending the student's ID to the API.
 * @param classId - The ID of the class from which the student will be removed.
 * @param id - The ID of the student to be removed.
 * @returns Promise resolving to the API response for removing the student from the class.
 */
export const deleteStudentFromClass = async (classId: string, id: string) => {
  return await API.delete(`/api/v1/students/${classId}/delete-student/${id}`);
};

/** Delete Students by Class ID
 * This function deletes all students associated with a specific class ID.
 * @param classId - The ID of the class for which students will be deleted.
 * @returns Promise resolving to the API response for deleting students from the class.
 */
export const deleteStudentsByClassId = async (classId: string) => {
  return await API.delete(`/api/v1/students/${classId}/delete`);
};

/** Journal API Module
 *  This module provides functions to manage journals, including creating, retrieving, and updating journal entries.
 */

/** Get Subject Attendance Summary
 *  This function retrieves the attendance summary for a specific subject in a class.
 * @param classId
 * @returns Promise resolving to the API response for fetching subject attendance summary.
 */
export const getSubjectAttendanceSummary = async (classId: string) => {
  return await API.get(
    `/api/v1/journals/${classId}/attendance-summary/subject`
  );
};

/** Get Class Attendance Summary
 *  This function retrieves the attendance summary for a class.
 * @param classId - The ID of the class for which the attendance summary will be retrieved.
 * @returns Promise resolving to the API response for fetching class attendance summary.
 */
export const getClassAttendanceSummary = async (classId: string) => {
  return await API.get(
    `/api/v1/journals/${classId}/attendance-summary/subjects`
  );
};

/** Delete Journal by ID
 * This function deletes a journal entry by its ID in a specific class.
 * @param classId  - The ID of the class from which the journal will be deleted.
 * @param journalId - The ID of the journal entry to be deleted.
 * @returns Promise resolving to the API response for deleting the journal entry.
 */
export const deleteJournalById = async (classId: string, journalId: string) => {
  return await API.delete(`/api/v1/journals/${classId}/${journalId}`);
};

/** Assignments API Module
 * This module provides functions to manage assignments, including creating, retrieving, and updating assignments.
 */

/** Get Subject Assignment Summary
 * This function retrieves a summary of assignments for each subject in a class.
 * @param classId - The ID of the class for which the assignment summary will be retrieved.
 * @returns Promise resolving to the API response for fetching the subject assignment summary.
 */
export const getSubjectAssignmentSummary = async (classId: string) => {
  return await API.get(
    `/api/v1/assignments/${classId}/subject-assignment-summary`
  );
};

/** Get Assignments by Class
 * This function retrieves all assignments for a specific class.
 * @param classId - The ID of the class for which assignments will be retrieved.
 * @returns Promise resolving to the API response for fetching assignments by class.
 */
export const getAssignmentsByClass = async (classId: string) => {
  return await API.get(`/api/v1/assignments/${classId}/get-assignments`);
};

/** Get Assignments by Subject
 * This function retrieves all assignments for a specific subject in a class.
 * @param classId - The ID of the class for which subject assignments will be retrieved.
 * @returns Promise resolving to the API response for fetching assignments by subject.
 */
export const getAssignmentsBySubject = async (classId: string) => {
  return await API.get(
    `/api/v1/assignments/${classId}/subject-assignments/get`
  );
};

/** Get Assignments Summary by Subject
 * This function retrieves a summary of assignments for a specific subject in a class.
 * @param classId - The ID of the class for which the assignment summary will be retrieved.
 * @returns Promise resolving to the API response for fetching the assignments summary by subject.
 */
export const getAssignmentsSummaryBySubject = async (classId: string) => {
  return await API.get(`/api/v1/assignments/${classId}/get-score-by-subject`);
};

/** Get Assignments Summary by Subjects
 * This function retrieves a summary of assignments for multiple subjects in a class.
 * @param classId - The ID of the class for which the assignments summary will be retrieved.
 * @returns Promise resolving to the API response for fetching the assignments summary by subjects.
 */
export const getAssignmentsSummaryBySubjects = async (classId: string) => {
  return await API.get(`/api/v1/assignments/${classId}/get-score-by-subjects`);
};

/** Get Assignment by ID
 * This function retrieves a specific assignment by its ID in a class.
 * @param classId - The ID of the class to which the assignment belongs.
 * @param assignmentId - The ID of the assignment to retrieve.
 * @returns Promise resolving to the API response for fetching the assignment by ID.
 */
export const getAssignmentById = async (
  classId: string,
  assignmentId: string
) => {
  return await API.post(`/api/v1/assignments/${classId}/get-assignment`, {
    assignmentId,
  });
};

/** Create Assignment by Class ID
 * This function creates a new assignment for a specific class.
 * @param classId - The ID of the class for which the assignment will be created.
 * @param assignment - An object containing the assignment details, including title, description, assignment date, type, start time, and end time.
 * @returns Promise resolving to the API response for creating the assignment.
 */
export const createAssignmentByClassId = async (
  classId: string,
  assignment: {
    title: string;
    description: string;
    assignmentDate: string;
    assignmentType: "homework" | "quiz" | "exam" | "project" | "finalExam";
    startTime: string;
    endTime: string;
  }
) => {
  return await API.post(`/api/v1/assignments/${classId}/create`, assignment);
};

/** Update Assignment by Class ID
 * This function updates an existing assignment for a specific class.
 * @param classId - The ID of the class for which the assignment will be updated.
 * @param assignmentId - The ID of the assignment to update.
 * @param grades - An array of grade objects containing student IDs and their corresponding scores.
 * @returns Promise resolving to the API response for updating the assignment.
 */
export const updateAssignmentGrades = async (
  classId: string,
  assignmentId: string,
  grades: { studentId: string; score: number; notes?: string }[]
) => {
  return await API.patch(
    `/api/v1/assignments/${classId}/${assignmentId}/grades`,
    { grades }
  );
};

/** Give Scores to Students
 * This function assigns scores to students for a specific assignment in a class.
 * @param classId - The ID of the class for which scores will be given.
 * @param assignmentId  - The ID of the assignment for which scores will be given.
 * @param scoresData - An array of objects containing student IDs, scores, and optional notes.
 * @returns Promise resolving to the API response for giving scores to students.
 */
export const giveScores = async (
  classId: string,
  assignmentId: string,
  scoresData: { studentId: string; score: number; notes?: string }[]
) => {
  return await API.post(
    `/api/v1/assignments/${classId}/givescore/${assignmentId}`,
    {
      scoresData: scoresData,
    }
  );
};

/** Delete Assignment by ID
 * This function deletes a specific assignment by its ID in a class.
 * @param classId - The ID of the class to which the assignment belongs.
 * @param assignmentId - The ID of the assignment to delete.
 * @returns Promise resolving to the API response for deleting the assignment.
 */
export const deleteAssignmentById = async (
  classId: string,
  assignmentId: string
) => {
  return await API.delete(`/api/v1/assignments/${classId}/${assignmentId}`);
};

/** Journal API Module
 * This module provides functions to manage journals, including creating, retrieving, and updating journal entries.
 */

/** Create Journal
 * This function creates a new journal entry for a specific class.
 * @param journalData - The parameters for creating the journal entry.
 * @returns Promise resolving to the API response for creating the journal entry.
 */
export const createJournal = async ({
  classId,
  title,
  description,
  journalDate,
  startTime,
  endTime,
}: {
  classId: string;
  title: string;
  description: string | undefined;
  journalDate: string;
  startTime: string;
  endTime: string;
}) => {
  return await API.post(`/api/v1/journals/${classId}`, {
    title,
    description,
    journalDate,
    startTime,
    endTime,
  });
};

/** Get Journals by Class ID
 * This function retrieves all journals for a specific class.
 * @param classId - The ID of the class for which journals will be retrieved.
 * @returns Promise resolving to the API response for fetching journals by class ID.
 */
export const getJournalsByClassId = async (classId: string) => {
  return await API.get(`/api/v1/journals/${classId}`);
};

/** Get Journals by Subject
 * This function retrieves all journals for a specific class and subject.
 * @param classId - The ID of the class for which journals will be retrieved.
 * @returns Promise resolving to the API response for fetching journals by subject.
 */
export const getJournalsBySubject = async (classId: string) => {
  return await API.get(`/api/v1/journals/${classId}/subject/`);
};

/** Get Journal by ID
 * This function retrieves a specific journal entry by its ID in a class.
 * @param classId - The ID of the class to which the journal belongs.
 * @param journalId - The ID of the journal entry to retrieve.
 * @returns Promise resolving to the API response for fetching the journal by ID.
 */
export const getJournalById = async (classId: string, journalId: string) => {
  return await API.post(`/api/v1/journals/${classId}/get`, { journalId });
};

/** Give Attendances and Notes
 * This function assigns attendance statuses and optional notes to students for a specific journal entry in a class
 * @param classId - The ID of the class for which attendance and notes will be given.
 * @param journalId - The ID of the journal entry for which attendance and notes will be given.
 * @param journals - An array of objects containing student IDs, their attendance status, and optional notes.
 * @returns Promise resolving to the API response for updating the journal entry.
 */
export const giveAttendancesAndNotes = async ({
  classId,
  journalId,
  journals,
}: {
  classId: string;
  journalId: string;
  journals: { studentId: string; status: string; note?: string }[];
}) => {
  return await API.patch(`/api/v1/journals/${classId}/givenotes`, {
    journalId,
    journals,
  });
};

/** Open AI API Module
 * This module provides functions to interact with OpenAI's API for educational purposes, such as generating assignment advice and learning plans.
 */

/** Get Assignment Advice
 * This function retrieves advice for a student's assignment based on their score and the average score of the class.
 * @param studentName - The name of the student
 * @param studentScore - The score of the student
 * @param averageScore - The average score of the class
 * @param description - The description of the assignment
 * @param note - Any additional notes
 * @returns The assignment advice
 */
export const getAssignmentAdvice = async (
  studentName: string,
  studentScore: number,
  averageScore: number,
  description: string,
  note?: string
) => {
  return await API.post("/api/v1/openai/student-assignment-advice", {
    studentName,
    studentScore,
    averageScore,
    description,
    note,
  });
};

/** * Get Learning Plan
 * This function retrieves a learning plan for a class based on the provided parameters.
 * @param learningPlanData - The parameters for retrieving the learning plan
 * @returns The learning plan for the specified class
 */
export const getLearningPlan = async ({
  classId,
  subject,
  topic,
  level,
  duration,
  learningStyle,
}: {
  classId: string;
  subject: string;
  topic: string;
  level: string;
  duration: number;
  learningStyle: string;
}) => {
  return await API.post(`/api/v1/openai/class-learning-plan`, {
    classId,
    subject,
    topic,
    level,
    duration,
    learningStyle,
  });
};

/** Assistance API Module
 * This module provides functions to manage assistance requests, including creating, retrieving, and updating assistance requests.
 */

/** Create a new assistance request
 * This function creates a new assistance request for a class.
 * @param assistanceData - The assistance request details
 * @returns The created assistance request
 */
export const createAssistance = async ({
  studentName,
  classId,
  subject,
  assignmentId,
  assignmentName,
  assignmentDescription,
  assistantResponse,
}: {
  studentName: string;
  classId: string;
  subject: string;
  assignmentId: string;
  assignmentName: string;
  assignmentDescription: string;
  assistantResponse: string;
}) => {
  return await API.post(`/api/v1/assistances/${classId}/create`, {
    studentName,
    subject,
    assignmentId,
    assignmentName,
    assignmentDescription,
    assistantResponse,
  });
};

/** Get Assistance by Class ID
 * This function retrieves all assistance requests for a specific class.
 * @param classId - The ID of the class for which assistance requests will be retrieved.
 * @returns The list of assistance requests for the specified class.
 */
export const getAssistanceByClassId = async (classId: string) => {
  return await API.get(`/api/v1/assistances/${classId}`);
};

/** Get Assistance by Class ID and Subject
 * This function retrieves all assistance requests for a specific class and subject.
 * @param classId - The ID of the class for which assistance requests will be retrieved.
 * @param subject - The subject for which assistance requests will be retrieved.
 * @returns The list of assistance requests for the specified class and subject.
 */
export const getAssistanceByClassAndSubject = async (
  classId: string,
  subject: string
) => {
  return await API.post(`/api/v1/assistances/${classId}/subject`, { subject });
};

/** Update Assistance
 * This function updates an existing assistance request.
 * @param assistanceId - The ID of the assistance request to update.
 * @param assistantResponse - The updated response from the assistant.
 * @returns The updated assistance request.
 */
export const updateAssistance = async (
  assistanceId: string,
  assistantResponse: string
) => {
  return await API.put(`/api/v1/assistances/${assistanceId}/update`, {
    assistantResponse,
  });
};

/** Create Class Learning Plan
 * This function creates a new learning plan for a class.
 * @param learningPlanData - The learning plan details
 * @returns The created learning plan
 */
export const createClassLearningPlan = async ({
  classId,
  subject,
  topic,
  level,
  duration,
  learningStyle,
  learningPlan,
}: {
  classId: string;
  subject: string;
  topic: string;
  level: string;
  duration: number;
  learningStyle: string;
  learningPlan: string;
}) => {
  return await API.post(`/api/v1/learning-plans/${classId}/create`, {
    subject,
    topic,
    level,
    duration,
    learningStyle,
    learningPlan,
  });
};

/** Get Learning Plans by Class ID
 * This function retrieves all learning plans for a specific class.
 * @param classId - The ID of the class for which learning plans will be retrieved.
 * @returns The list of learning plans for the specified class.
 */
export const getLearningPlansByClass = async (classId: string) => {
  return await API.get(`/api/v1/learning-plans/${classId}/get`);
};

/** Get Learning Plans by Class ID and Subject
 * This function retrieves all learning plans for a specific class and subject.
 * @param classId - The ID of the class for which learning plans will be retrieved.
 * @param subject - The subject for which learning plans will be retrieved.
 * @returns The list of learning plans for the specified class and subject.
 */
export const getLearningPlansByClassAndSubject = async (
  classId: string,
  subject: string
) => {
  return await API.get(
    `/api/v1/learning-plans/${classId}/subject/${subject}/get`
  );
};

/** Update Learning Plan
 * This function updates an existing learning plan.
 * @param learningPlanId - The ID of the learning plan to update.
 * @param learningPlan - The updated learning plan details.
 * @returns The updated learning plan.
 */
export const updateLearningPlan = async (
  learningPlanId: string,
  learningPlan: string
) => {
  return await API.put(`/api/v1/learning-plans/${learningPlanId}/update`, {
    learningPlan,
  });
};
