import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../pages/Dashboard.css"; // Import your CSS file for styling
import { Outlet } from "react-router-dom"; // This renders the child route components
import useSignOut from "react-auth-kit/hooks/useSignOut";

const getPageTitle = (pathname) => {
  const page = pathname.split("/")[1] || "Dashboard";
  return page.charAt(0).toUpperCase() + page.slice(1);
};

const AdminLayout = () => {
  const location = useLocation();
  const signOut = useSignOut();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const pageTitle = getPageTitle(location.pathname);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    // Handle logout logic
    signOut();
    navigate("/login");
  };

  return (
    <div className={`admin-panel ${darkMode ? "dark-theme" : ""}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="logo-container">
              <img src="/logo.png" alt="Ecolift Logo" className="logo" />
            </div>
            <h2 className="logo-text">Ecolift</h2>
          </div>

          <nav className="sidebar-nav">
            <ul>
              <li>
                <NavLink
                  to="/home"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <div className="nav-icon home-icon"></div>
                  <span>Home</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <div className="nav-icon dashboard-icon"></div>
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/users"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <div className="nav-icon users-icon"></div>
                  <span>Users</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/riders"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <div className="nav-icon riders-icon"></div>
                  <span>Riders</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                    to="/items"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <div className="nav-icon riders-icon"></div>
                  <span>Items</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="logout-section">
          <button className="logout-button" onClick={handleLogout}>
            <span className="logout-icon"></span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1 className="page-title">{pageTitle}</h1>

          <div className="header-controls">
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

            <div className="user-info">
              <span className="username">Admin</span>
              <div className="user-avatar-container">
                <FaUserCircle size={40} color={darkMode ? "#fff" : "#000"} />
              </div>
            </div>
          </div>
        </header>
        <div className="dashboard-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
