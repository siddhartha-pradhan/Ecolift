import baseAxios from "axios";

// Base URL for the admin panel backend API
export const BASE_URL = "http://localhost:3001/api/v1";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}


// Create an Axios instance with default settings
const axios = baseAxios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  }
  
});

axios.interceptors.request.use(
  (config) => {
    const token = getCookie("_auth"); // ✅ Get JWT from cookie    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default axios;
