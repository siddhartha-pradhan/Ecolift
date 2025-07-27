import { useEffect, useRef } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

import axios from "./axios";

const useAxiosAuth = () => {
  const authHeader = useAuthHeader();

  const interceptorRef = useRef(null);

  useEffect(() => {
    interceptorRef.current = axios.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = authHeader;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptorRef.current);
    };
  }, [authHeader]);

  return axios;
};

export default useAxiosAuth;
