import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Verification from "../pages/Verification";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Riders from "../pages/Riders";
import ProtectedRoute from "./protectedRoute";
import AdminLayout from "../layout/AdminLayout";
import Items from "../pages/Items";
// import Riders from "../pages/Riders";

const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<Verification />} />
      <Route element={<ProtectedRoute allowedRoles={["Admin", "Normal"]} />}>
        <Route path="/home" element={<Home />} />
      </Route>

      {/* Dashboard route */}
      <Route element={<ProtectedRoute allowedRoles={["Admin", "Normal"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/users" element={<Users />} />
          <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/riders" element={<Riders />} />
            <Route path="/items" element={<Items />} />

        </Route>
      </Route>
    </Routes>
  );
};

export default Routing;
