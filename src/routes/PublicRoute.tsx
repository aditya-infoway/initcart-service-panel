// routes/PublicRoute.tsx - FIXED
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isRestoring = useAuthStore((s) => s.isRestoring);

  if (isRestoring) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Only redirect if authenticated AND trying to access login page
  if (isAuthenticated && window.location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  // ✅ If authenticated and trying to access any other public route, still allow
  // Don't redirect to home for all public routes
  return <Outlet />;
};

export default PublicRoute;