// services/Api.jsx
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ React Native compatible storage
import { REACT_APP_API_URL } from "@env";

export const BASE_URL = REACT_APP_API_URL;

// Create an Axios instance with base URL including /api/v1
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`, // ✅ Updated base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically include token in headers if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token"); // ✅ Async way
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error reading token from storage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
