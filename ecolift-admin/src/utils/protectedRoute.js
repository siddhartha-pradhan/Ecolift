import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

const ProtectedRoute = ({ allowedRoles }) => {
  const user = useAuthUser();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles.includes(user.role)) {
    return <Outlet />;
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
};

export default ProtectedRoute;
