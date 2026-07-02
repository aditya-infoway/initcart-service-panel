// routes/PrivateRouteWithSubscription.tsx - Update path saving
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import AppLayout from "../components/layout/AppLayout";
import { useEffect, useState, useRef } from "react";
import apiClient from "../api/apiClient";

const PrivateRouteWithSubscription = () => {
  const { 
    isAuthenticated, 
    vendor, 
    setSubscriptionStatus, 
    resetInactivityTimer, 
    isRestoring,
    access 
  } = useAuthStore();
  
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const checkPerformedRef = useRef(false);
  
  const currentPath = location.pathname;
  const isSubscriptionPage = currentPath === "/subscription";


  // ✅ Check cache synchronously first
// Cache check block replace karo
useEffect(() => {
  const localStorageSub = localStorage.getItem("hasActiveSubscription") === 'true';
  const endDateStr = localStorage.getItem("subscriptionEndDate");
  
  if (localStorageSub) {
    // ✅ endDate hai toh validate karo, nahi hai toh trust karo
    if (endDateStr) {
      const endDate = new Date(endDateStr);
      const today = new Date();
      if (endDate > today) {
        setHasActiveSubscription(true);
        setSubscriptionStatus(true);
        setLoading(false);
        checkPerformedRef.current = true;
        return;
      } else {
        // Expired — clear karo aur API se check karo
        localStorage.removeItem("hasActiveSubscription");
        localStorage.removeItem("subscriptionEndDate");
        localStorage.removeItem("subscriptionType");
      }
    } else {
      // ✅ endDate nahi hai but flag hai — API se verify karo, redirect mat karo abhi
      // Fall through to API check
    }
  }

  const checkSubscription = async () => {
    if (!isAuthenticated || !vendor) {
      setHasActiveSubscription(false);
      setLoading(false);
      checkPerformedRef.current = true;
      return;
    }

    try {
      const res = await apiClient.get("/ecommerce/vendor-subscriptions/check/");
      const hasSubscription = res.data.has_active_subscription;
      
      setHasActiveSubscription(hasSubscription);
      setSubscriptionStatus(hasSubscription);
      
      if (hasSubscription) {
        localStorage.setItem("hasActiveSubscription", "true");
        
        // ✅ end_date nested se bhi nikalo
        const endDate = 
          res.data.end_date || 
          res.data.current_subscription?.end_date;
        
        if (endDate) {
          localStorage.setItem("subscriptionEndDate", endDate);
        } else {
          // Fallback: 1 saal baad expire
          localStorage.setItem(
            "subscriptionEndDate", 
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          );
        }
      } else {
        localStorage.removeItem("hasActiveSubscription");
        localStorage.removeItem("subscriptionEndDate");
      }
    } catch (error) {
      console.error("Subscription check error:", error);
      // ✅ API fail hone pe cached value trust karo
      const cached = localStorage.getItem("hasActiveSubscription") === 'true';
      setHasActiveSubscription(cached ? true : false);
      setSubscriptionStatus(cached ? true : false);
    } finally {
      setLoading(false);
      checkPerformedRef.current = true;
    }
  };

  if (!checkPerformedRef.current) {
    checkSubscription();
  }
}, [isAuthenticated, vendor, setSubscriptionStatus]);

  // ✅ Activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handleActivity = () => resetInactivityTimer();

    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [isAuthenticated, resetInactivityTimer]);

  if (isRestoring || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isSubscriptionPage) {
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
    );
  }

  // ✅ Only redirect if definitely no subscription
  if (hasActiveSubscription === false) {
    return <Navigate to="/subscription" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default PrivateRouteWithSubscription;