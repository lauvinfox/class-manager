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
