import axios from "axios";
import { auth } from "../firebase";

const normalizeApiBaseUrl = (url) => {
  if (!url) return "";
  return url.replace(/\/+$/, "");
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
  : "";
export const isApiConfigured = Boolean(API_BASE_URL || import.meta.env.DEV);

const API = axios.create({
  baseURL: API_BASE_URL || "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

API.interceptors.request.use(
  async (config) => {
    if (config._firebaseRetry) {
      return config;
    }

    const token = localStorage.getItem("prepmaster_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const firebaseToken = await firebaseUser.getIdToken();
      config.headers.Authorization = `Bearer ${firebaseToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message;

    if (status === 401 && !error.config?._firebaseRetry && auth.currentUser) {
      const firebaseToken = await auth.currentUser.getIdToken(true);
      localStorage.removeItem("prepmaster_token");
      error.config._firebaseRetry = true;
      error.config.headers.Authorization = `Bearer ${firebaseToken}`;
      return API(error.config);
    }

    if (!navigator.onLine) {
      error.userMessage = "You appear to be offline. Check your internet connection and retry.";
    } else if (!isApiConfigured) {
      error.userMessage =
        "The backend API URL is not configured. Set VITE_API_BASE_URL to your deployed backend API URL or provide a same-origin /api proxy.";
    } else if (status === 401) {
      error.userMessage = "Your session is valid in Firebase, but the backend rejected the metrics request. Please sign in again.";
    } else if (status === 403) {
      error.userMessage = "You do not have permission to load these dashboard metrics.";
    } else if (status >= 500) {
      error.userMessage = "The metrics server is temporarily unavailable. Please retry in a moment.";
    } else if (serverMessage) {
      error.userMessage = serverMessage;
    } else if (error.code === "ECONNABORTED") {
      error.userMessage = "The metrics request timed out. Please retry.";
    } else {
      error.userMessage = "Unable to reach the metrics server. Check the backend URL and CORS settings.";
    }

    return Promise.reject(error);
  }
);

export default API;
