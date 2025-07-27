// utils/axiosInstance.js
import axios from 'axios';
import { getToken } from 'react-auth-kit';

const instance = axios.create({
  baseURL: 'http://localhost:3000', // or your actual API base URL
});

instance.interceptors.request.use(
  (config) => {
    const token = getToken(); // Get just the token string
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
