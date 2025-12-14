import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// Assuming useAuthStore exports the actual User type for consistency
import { useAuthStore } from "../store/auth";

/*
// REMOVED: This local definition of User is likely redundant 
// and was causing the 'unused' warning and the 'missing property' error
// because the store's user type didn't match.

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean; 
}
*/

const ProtectedAdminRoute: React.FC = () => {
  const { user } = useAuthStore(); // If not logged in, redirect to login

  if (!user) return <Navigate to="/login" replace />; // FIX 1: Accessing 'isAdmin' safely and explicitly typing the check.
  // This ensures the check is safe even if 'user' is the wrong type
  // or if 'isAdmin' is optional/null.

  const adminCheck: boolean = !!(user as any).isAdmin; // Temporarily use 'as any' if you cannot update the store's type
  // If logged in but not admin, redirect to home

  // **BETTER FIX (Requires editing the store file):** // If your store's user type *already* includes isAdmin, no change is needed here.
  // If your store's user type *does not* include isAdmin, you must update the type in `../store/auth.ts`.

  if (!adminCheck) return <Navigate to="/" replace />; // If admin, render nested admin routes

  return <Outlet />;
};

export default ProtectedAdminRoute;
