// services/Api.jsx
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ React Native compatible storage

//const token = await AsyncStorage.getItem("token");

//console.log("📦 Retrieved token from axios:", token);

export const BASE_URL = "http://192.168.1.67:3001";

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
