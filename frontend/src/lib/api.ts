import API from "../config/apiClient";

export const loginUser = async (email: string, password: string) => {
  const response = await API.post("/auth/signin", { email, password });
  return response;
};

export const registerUser = async (
  name: string,
  email: string,
  username: string,
  password: string,
  confirmPassword: string,
  dateOfBirth: string
) => {
  const response = await API.post("/auth/signup", {
    name,
    email,
    username,
    password,
    confirmPassword,
    dateOfBirth,
  });
  return response;
};
