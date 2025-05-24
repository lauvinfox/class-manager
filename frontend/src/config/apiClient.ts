import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Fix: handle case when error.response is undefined
    if (!error.response) {
      return Promise.reject(error);
    }
    const { status, data } = error.response;
    return Promise.reject({ status, ...data });
  }
);

export default API;
