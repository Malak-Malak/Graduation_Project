import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // عدلي حسب الباك
  withCredentials: true,
});

// 🔹 Register Request
export const sendRegisterRequest = async (data) => {
  const res = await API.post("/auth/register-request", data);
  return res.data;
};

// 🔹 Login
export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};