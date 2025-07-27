import React, { useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";

import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/axios/axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import "./Login.css"; // 💡 Imported external CSS

const Login = () => {
  const signIn = useSignIn();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility((prevVisibility) => !prevVisibility);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${BASE_URL}/auth/login`, formData)
      .then((response) => {
        if (
          signIn({
            auth: {
              token: response.data.token,
              type: "Bearer",
            },
            userState: response.data.user,
          })
        ) {
          navigate("/home"); // ✅ Redirect to Home for all users
        } else {
          toast.error("Login Failed.");
        }
      })
      .catch((e) => {
        toast.error(e.response.data.error);
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="header">
          <h2>Login</h2>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Your Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Your Password</label>
            <div className="input-wrapper">
              <input
                type={passwordVisibility ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="**********"
                className="input-field"
              />
              <button
                type="button"
                className="eye-button"
                onClick={togglePasswordVisibility}
                aria-label={
                  passwordVisibility ? "Hide password" : "Show password"
                }
                tabIndex="-1"
              >
                {passwordVisibility ? <AiFillEyeInvisible /> : <AiFillEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-button">
            Login
          </button>
        </form>

        <div className="navigate-register">
          <button
            type="button"
            className="navigate-register-btn"
            onClick={() => navigate("/register")}
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
