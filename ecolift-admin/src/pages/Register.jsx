import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios/axios";
import { BASE_URL } from "../utils/axios/axios";
import { toast } from "react-toastify";
import { FiChevronLeft } from "react-icons/fi";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility((prev) => !prev);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: "Admin",
    };

    try {
      setIsSubmitting(true);
      await axios.post(`${BASE_URL}/auth/register`, userData);
      toast.success("Registration successful! OTP sent to your email.");
      navigate("/verify", { state: { email: formData.email } });
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/login")}
          aria-label="Back to login"
        >
          <FiChevronLeft />
        </button>

        <div className="header">
          <h2>Register</h2>
        </div>

        <form onSubmit={onSubmit} className="register-form">
          <div className="input-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Your Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@example.com"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
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

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                type={passwordVisibility ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
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

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="navigate-login">
          <button
            type="button"
            className="navigate-login-btn"
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
