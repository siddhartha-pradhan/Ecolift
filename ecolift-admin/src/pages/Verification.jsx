import React, { useState, useEffect } from "react";
import axios from "../utils/axios/axios";
import { BASE_URL } from "../utils/axios/axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import "./Verification.css";

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please register first.");
      navigate("/register");
    }
  }, [email, navigate]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerify = () => {
    if (otp.length !== 6 || isNaN(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    const data = {
      email,
      code: parseInt(otp, 10),
    };

    axios
      .post(`${BASE_URL}/auth/verify`, data)
      .then(() => {
        toast.success("OTP Verified Successfully!");
        navigate("/login");
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error("Incorrect OTP, please try again.");
      });
  };

  return (
    <div className="verification-container">
      <div className="verification-box">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/register")}
          aria-label="Back to register"
        >
          <FiChevronLeft />
        </button>

        <div className="header">
          <h2>Email Verification</h2>
        </div>

        <div className="otp-container">
          <label htmlFor="otp">Enter OTP</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={handleOtpChange}
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            className="input-field"
          />
        </div>

        <button
          type="button"
          className="verify-button"
          onClick={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
};

export default Verification;
