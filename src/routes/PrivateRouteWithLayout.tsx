// routes/PrivateRouteWithLayout.tsx - FIXED
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import AppLayout from "../components/layout/AppLayout";
import { useEffect } from "react";

const PrivateRouteWithLayout = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const resetInactivityTimer = useAuthStore((s) => s.resetInactivityTimer);
  const isRestoring = useAuthStore((s) => s.isRestoring);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handleActivity = () => resetInactivityTimer();

    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [isAuthenticated, resetInactivityTimer]);

  // ✅ Show loading while restoring
  if (isRestoring) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Not authenticated - save attempted path and redirect to login
  if (!isAuthenticated) {
    // Save the path user was trying to access
    sessionStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <AppLayout><Outlet /></AppLayout>;
};

export default PrivateRouteWithLayout;