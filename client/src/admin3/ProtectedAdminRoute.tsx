import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const ProtectedAdminRoute: React.FC = () => {
  const { user } = useAuthStore();

  // If not logged in, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // If logged in but not admin, redirect to home
  if (!user.isAdmin) return <Navigate to="/" replace />;

  // If admin, render nested routes
  return <Outlet />;
};

export default ProtectedAdminRoute;
