import API from "../config/apiClient";

export const loginUser = async (email: string, password: string) => {
  const response = await API.post("/auth/signin", { email, password });
  return response;
};

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
  confirmPassword: string,
  dateOfBirth: string
) => {
  const response = await API.post("/auth/signup", {
    firstName,
    lastName,
    email,
    username,
    password,
    confirmPassword,
    dateOfBirth,
  });
  return response;
};

export const getMe = async () => {
  return await API.get("/api/v1/users/me");
};

export const getUserInfo = async () => {
  const response = await API.get(`/api/v1/users/info`);
  return response;
};

export const getUsersByUsername = async (username: string) => {
  const response = await API.post(`/api/v1/users/username`, { username });
  return response;
};

export const changeUsername = async ({
  password,
  newUsername,
}: {
  password: string;
  newUsername: string;
}) => {
  const response = await API.put(`/api/v1/users/username/change`, {
    password,
    newUsername,
  });
  return response;
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

export const signOut = async () => {
  return await API.get("/auth/signout");
};

export const verifyEmail = async (verificationCode: string) => {
  const response = await API.get(`/auth/email/verify/${verificationCode}`);
  return response;
};

export const forgotPassword = async (email: string) => {
  const response = await API.post("/auth/password/forgot", { email });
  return response;
};

export const resetPassword = async (
  password: string,
  verificationCode: string
) => {
  const response = await API.post("/auth/password/reset", {
    password,
    verificationCode,
  });
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
  classId,
  inviteResponse,
}: {
  classId: string;
  inviteResponse: string;
}) => {
  const response = await API.post(`/api/v1/class/${classId}/invite/`, {
    inviteResponse,
  });
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
