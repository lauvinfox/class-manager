import API from "../config/apiClient";
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

/** Get Current User Information
 * This function retrieves the current user's information from the API.
 * @returns Promise resolving to the API response for fetching the current user's information.
 */

export const getMe = async () => {
  return await API.get("/api/v1/users/me");
};

/** Sign Out Authentication
 * This function is used to log out the current user by sending a request to the API.
 * @returns Promise resolving to the API response for signing out.
 */
export const signOut = async () => {
  return await API.get("/auth/signout");
};

/** Verify Email
 * This function verifies a user's email using a verification code.
 * @param verificationCode - The code sent to the user's email for verification.
 * @returns Promise resolving to the API response for email verification.
 */
export const verifyEmail = async (verificationCode: string) => {
  return await API.get(`/auth/email/verify/${verificationCode}`);
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

/**
 *
 * @param
 * @returns
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

export const forgotPassword = async (email: string) => {
  return await API.post("/auth/password/forgot", { email });
};

export const resetPassword = async (
  password: string,
  verificationCode: string
) => {
  return await API.post("/auth/password/reset", {
    password,
    verificationCode,
  });
};

export const getUserNotifications = async () => {
  const response = await API.get(`/api/v1/notifications/`);
  return response;
};

export const markAllNotificationsAsRead = async () => {
  return await API.patch("/api/v1/notifications/markallread");
};

export const getFullUserInfo = async (username: string) => {
  const response = await API.get(`/api/v1/users/info-by-username/${username}`);
  return response;
};

// Class
export const createClass = async (name: string, description?: string) => {
  const response = await API.post("/api/v1/class/", { name, description });
  return response;
};

export const getClassByClassId = async (classid: string) => {
  const response = await API.get(`/api/v1/class/id/${classid}`);
  return response;
};

export const getClassByIds = async (ids: string[]) => {
  const response = await API.post("/api/v1/class/getbyids", { ids });
  return response;
};

export const getClassesByClassOwner = async () => {
  const response = await API.get("/api/v1/class/getbyclassowner");
  return response;
};

export const getSubjectByClassId = async (classId: string) => {
  return await API.get(`/api/v1/class/${classId}/subject/get`);
};
export const getClasses = async () => {
  return await API.get("/api/v1/users/class/get");
};

export const inviteInstructors = async (
  classId: string,
  invitees: { username: string; id: string }[]
) => {
  const response = await API.post(
    `/api/v1/class/${classId}/inviteinstructors`,

    invitees
  );
  return response;
};

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

export const getInstructorClass = async (classId: string) => {
  const response = await API.get(`/api/v1/class/${classId}/instructors`);
  return response;
};

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

export const addStudentsToClass = async (classId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return await API.post(`/api/v1/students/${classId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteStudentFromClass = async (classId: string, id: string) => {
  return await API.delete(`/api/v1/students/${classId}/delete-student`, {
    data: { id },
  });
};

export const getSubjectAttendanceSummary = async (classId: string) => {
  return await API.get(
    `/api/v1/journals/${classId}/attendance-summary/subject`
  );
};

export const getClassAttendanceSummary = async (classId: string) => {
  return await API.get(
    `/api/v1/journals/${classId}/attendance-summary/subjects`
  );
};

export const getSubjectAssignmentSummary = async (classId: string) => {
  return await API.get(
    `/api/v1/assignments/${classId}/subject-assignment-summary`
  );
};

export const deleteStudentsByClassId = async (classId: string) => {
  return await API.delete(`/api/v1/students/${classId}/delete`);
};

export const deleteClassByClassId = async (classId: string) => {
  return await API.delete(`/api/v1/class/${classId}`);
};

export const getClassSubjects = async (classId: string) => {
  return await API.get(`/api/v1/class/${classId}/subjects`);
};

export const addSubjectsToClass = async (
  classId: string,
  subjects: string[]
) => {
  return await API.post(`/api/v1/class/${classId}/subjects`, { subjects });
};

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

export const getAssignmentsByClass = async (classId: string) => {
  return await API.get(`/api/v1/assignments/${classId}/get-assignments`);
};

export const getAssignmentsBySubject = async (classId: string) => {
  return await API.get(
    `/api/v1/assignments/${classId}/subject-assignments/get`
  );
};

export const getAssignmentsSummaryBySubject = async (classId: string) => {
  return await API.get(`/api/v1/assignments/${classId}/get-score-by-subject`);
};

export const getAssignmentsSummaryBySubjects = async (classId: string) => {
  return await API.get(`/api/v1/assignments/${classId}/get-score-by-subjects`);
};

export const getAssignmentById = async (
  classId: string,
  assignmentId: string
) => {
  return await API.post(`/api/v1/assignments/${classId}/get-assignment`, {
    assignmentId,
  });
};

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

export const updateAssignmentGrades = async (
  classId: string,
  assignmentId: string,
  grades: { studentId: string; score: number; notes?: string }[]
) => {
  // PATCH endpoint, sesuaikan dengan backend
  return await API.patch(
    `/api/v1/assignments/${classId}/${assignmentId}/grades`,
    { grades }
  );
};

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

export const deleteAssignmentById = async (
  classId: string,
  assignmentId: string
) => {
  return await API.delete(`/api/v1/assignments/${classId}/${assignmentId}`);
};

export const getClassWeights = async (classId: string) => {
  return await API.get(`/api/v1/class/${classId}/weights`);
};

export const getClassWeightBySubject = async (
  classId: string,
  subject: string
) => {
  return await API.get(`/api/v1/class/${classId}/weights/${subject}`);
};

// Journal
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

export const getJournalsByClassId = async (classId: string) => {
  return await API.get(`/api/v1/journals/${classId}`);
};

export const getJournalsBySubject = async (classId: string) => {
  return await API.get(`/api/v1/journals/${classId}/subject/`);
};

export const getJournalById = async (classId: string, journalId: string) => {
  return await API.post(`/api/v1/journals/${classId}/get`, { journalId });
};

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

// OpenAI
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

// Assistance
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
export const getAssistanceByClassId = async (classId: string) => {
  return await API.get(`/api/v1/assistances/${classId}`);
};

export const getAssistanceByClassAndSubject = async (
  classId: string,
  subject: string
) => {
  return await API.post(`/api/v1/assistances/${classId}/subject`, { subject });
};

// Learning Plans
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

export const getLearningPlansByClass = async (classId: string) => {
  return await API.get(`/api/v1/learning-plans/${classId}/get`);
};

export const getLearningPlansByClassAndSubject = async (
  classId: string,
  subject: string
) => {
  return await API.get(
    `/api/v1/learning-plans/${classId}/subject/${subject}/get`
  );
};
