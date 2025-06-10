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
