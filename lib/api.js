// lib/api.js
import axios from "axios";

// Base API instance
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://gas-backend-qlfc.onrender.com",
});

// Add Authorization header if token exists
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("supabaseToken"); // Store this after login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ---------- AUTH ----------
export const login = (email, password) =>
  API.post("/auth/login", { email, password });

export const register = (fullName, email, password) =>
  API.post("/auth/register", { fullName, email, password });

export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });

// ---------- CORRESPONDENCE ----------
export const getCorrespondence = () => API.get("/correspondence");

export const getCorrespondenceById = (id) =>
  API.get(`/correspondence/${id}`);

export const createCorrespondence = (formData) =>
  API.post("/correspondence", formData);

export const updateCorrespondence = (id, formData) =>
  API.put(`/correspondence/${id}`, formData);

export const deleteCorrespondence = (id) =>
  API.delete(`/correspondence/${id}`);

// ---------- USERS (Admin) ----------
export const getUsers = () => API.get("/users");

export const createUser = (formData) => API.post("/users", formData);

export const updateUser = (id, formData) =>
  API.put(`/users/${id}`, formData);

export const deleteUser = (id) => API.delete(`/users/${id}`);

export default API;
