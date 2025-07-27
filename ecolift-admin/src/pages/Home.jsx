import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import "./Home.css";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../utils/axios/axios";
import useSignOut from 'react-auth-kit/hooks/useSignOut';



const Home = () => {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const user = useAuthUser();
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [darkMode]);

  const handleLogout = () => {
        signOut();
        navigate("/login");
  };

  const handleRoleClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className={`home-container ${darkMode ? "dark-theme" : ""}`}>
      {/* Navigation bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="brand">
            <div className="logo-container">
              <img src="/logo.png" alt="Ecolift Logo" className="logo" />
            </div>
            <span className="brand-name">Ecolift</span>
          </div>

          <div className="nav-controls">
            {user && (
              <>
                <div className="user-nav-info">
                  <span className="welcome-text">
                    Welcome, <span className="user-name">{user.name}</span>
                  </span>
                  <span
                    className={`user-badge ${user.role.toLowerCase()}-badge`}
                    onClick={handleRoleClick}
                    style={{ cursor: "pointer" }}
                  >
                    {user.role}
                  </span>
                </div>

                {user.role === "Admin" && (
                  <button
                    className="dashboard-btn"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </button>
                )}
              </>
            )}

            {/* Theme Toggle Button */}
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className={`toggle-slider ${darkMode ? "active" : ""}`}>
                <div className="toggle-circle">
                  <div
                    className={`toggle-icon ${darkMode ? "moon" : "sun"}`}
                  ></div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="main-wrapper">
        <div className="hero-section">
          <h1 className="main-title">Welcome to Ecolift</h1>
          <p className="subtitle">
            Your eco-friendly ride-sharing solution for a greener tomorrow.
          </p>
        </div>

        {/* About section */}
        <div className="about-section">
          <div className="section-header">
            <h2 className="section-title">About Ecolift</h2>
            <div className="title-underline"></div>
          </div>

          <p className="about-text">
            Ecolift is your eco-friendly ride-sharing solution. Whether you're
            commuting, traveling, or just heading out, we're here to connect
            drivers and passengers efficiently while helping reduce your carbon
            footprint. Join our community today and be part of the green
            transportation revolution!
          </p>

          {/* Features */}
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon safe-icon"></div>
              <h3 className="feature-title">Safe Rides</h3>
              <p className="feature-description">
                Verified drivers and secure payment options
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon eco-icon"></div>
              <h3 className="feature-title">Eco-Friendly</h3>
              <p className="feature-description">
                Reduce emissions with shared transportation
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon cost-icon"></div>
              <h3 className="feature-title">Cost Effective</h3>
              <p className="feature-description">
                Save money while saving the planet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for User Info */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalOverlayClick}>
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeModal}>
              ×
            </button>
            <h2 className="role-title teal-header">
              You're a {user.role} user.
            </h2>
            <div className={`role-info ${user.role.toLowerCase()}`}>
              <div className={`icon ${user.role.toLowerCase()}-icon`}></div>
              <p>
                {user.role === "Admin"
                  ? "You are an admin. You have full access to all features."
                  : user.role === "Premium"
                  ? "You are a premium user. Enjoy enhanced features and benefits."
                  : "You are a regular user. Access basic features."}
              </p>
            </div>
            <button onClick={handleLogout} className="logout-button">
              <span className="logout-icon"></span>
              Logout
            </button>
            <button className="close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-sections">
            <div className="footer-brand">
              <div className="footer-logo-container">
                <img
                  src="/logo.png"
                  alt="Ecolift Logo"
                  className="footer-logo"
                />
              </div>
              <span className="footer-brand-name">Ecolift</span>
            </div>

            <div className="footer-links">
              <a href="/home" className="footer-link">
                Home
              </a>
              <a href="/home" className="footer-link">
                About
              </a>
              <a href="/home" className="footer-link">
                Services
              </a>
              <a href="/home" className="footer-link">
                Contact
              </a>
            </div>

            <div className="social-links">
              <a
                href="https://www.facebook.com/IslingtonCollege/"
                className="social-link facebook"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/islingtoncollege/"
                className="social-link instagram"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://x.com/islington1996/"
                className="social-link twitter"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">
              &copy; {new Date().getFullYear()} Ecolift. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
