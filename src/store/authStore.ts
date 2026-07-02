// store/authStore.ts - COMPLETE FIXED VERSION (No TypeScript Errors)
import { create } from "zustand";
import Swal from "sweetalert2";
import { isTokenExpired } from "../utils/tockenUtils";

interface AuthState {
  isAuthenticated: boolean;
  isRestoring: boolean;
  access: string | null;
  refresh: string | null;
  vendor: any | null;
  inactivityTimer: number | undefined;  // ✅ Changed from null to undefined
  hasActiveSubscription: boolean | null;

  login: (data: any) => void;
  logout: () => void;
  logoutAndRedirect: () => void;
  setNewAccess: (token: string) => void;
  setSubscriptionStatus: (status: boolean) => void;
  loadSessionFromStorage: () => void;
  startTimers: () => void;
  clearTimers: () => void;
  resetInactivityTimer: () => void;
}

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour

const clearStorage = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("vendor");
  localStorage.removeItem("hasActiveSubscription");
  localStorage.removeItem("subscriptionEndDate");
  localStorage.removeItem("subscriptionType");
  sessionStorage.removeItem("pv_active");
};

const showSessionAlert = (message: string, onConfirm: () => void) => {
  Swal.fire({
    title: "Session Expired",
    text: message,
    icon: "warning",
    confirmButtonText: "OK",
    allowOutsideClick: false,
  }).then(onConfirm);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isRestoring: true,
  access: null,
  refresh: null,
  vendor: null,
  inactivityTimer: undefined,  // ✅ Changed from null to undefined
  hasActiveSubscription: null,

loadSessionFromStorage: () => {
  // ✅ "sv_active" — same key jo main.tsx mein set hoti hai
  const isPageRefresh = sessionStorage.getItem("sv_active");

  if (isPageRefresh) {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    const vendorStr = localStorage.getItem("vendor");

    // Subscription cache check
    let cachedSubscription = false;
    const endDateStr = localStorage.getItem("subscriptionEndDate");
    if (endDateStr) {
      const endDate = new Date(endDateStr);
      if (endDate > new Date()) {
        cachedSubscription = true;
      } else {
        localStorage.removeItem("hasActiveSubscription");
        localStorage.removeItem("subscriptionEndDate");
        localStorage.removeItem("subscriptionType");
      }
    }

    if (access && vendorStr && !isTokenExpired(access)) {
      try {
        const vendor = JSON.parse(vendorStr);
        set({
          isAuthenticated: true,
          isRestoring: false,
          access,
          refresh,
          vendor,
          hasActiveSubscription: cachedSubscription,
        });
        get().startTimers();
        return;
      } catch (e) {
        console.error("Session restore error:", e);
      }
    }
  }

  // ✅ Tab close hua tha — localStorage clear karo
  clearStorage();
  set({ isAuthenticated: false, isRestoring: false, hasActiveSubscription: null });
},

  login: (data) => {
    clearStorage();
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("vendor", JSON.stringify(data.vendor));
    sessionStorage.setItem("pv_active", "true");

    set({
      isAuthenticated: true,
      isRestoring: false,
      access: data.access,
      refresh: data.refresh,
      vendor: data.vendor,
    });

    get().startTimers();
  },

  setNewAccess: (token) => {
    localStorage.setItem("access", token);
    set({ access: token });
  },

  setSubscriptionStatus: (status) => {
    set({ hasActiveSubscription: status });
  },

  logout: () => {
    get().clearTimers();
    clearStorage();
    set({
      isAuthenticated: false,
      isRestoring: false,
      access: null,
      refresh: null,
      vendor: null,
      hasActiveSubscription: null,
      inactivityTimer: undefined,  // ✅ Reset to undefined
    });
  },

  logoutAndRedirect: () => {
    get().clearTimers();
    clearStorage();
    set({
      isAuthenticated: false,
      isRestoring: false,
      access: null,
      refresh: null,
      vendor: null,
      hasActiveSubscription: null,
      inactivityTimer: undefined,  // ✅ Reset to undefined
    });
    window.location.href = "/servicevendor/login";
  },

  startTimers: () => {
    get().clearTimers();

    const inactivityTimer = window.setTimeout(() => {  // ✅ Use window.setTimeout explicitly
      if (window.location.pathname !== "/servicevendor/login") {
        showSessionAlert(
          "You were inactive for 1 hour. Please login again.",
          () => get().logoutAndRedirect()
        );
      }
    }, INACTIVITY_TIMEOUT);

    set({ inactivityTimer });
  },

  clearTimers: () => {
    const { inactivityTimer } = get();
    if (inactivityTimer !== undefined) {  // ✅ Check for undefined, not null
      clearTimeout(inactivityTimer);
    }
    set({ inactivityTimer: undefined });
  },

  resetInactivityTimer: () => {
    if (!get().isAuthenticated) return;
    
    const { inactivityTimer } = get();
    if (inactivityTimer !== undefined) {
      clearTimeout(inactivityTimer);
    }

    const newTimer = window.setTimeout(() => {
      if (window.location.pathname !== "/servicevendor/login") {
        showSessionAlert(
          "You were inactive for 1 hour. Please login again.",
          () => get().logoutAndRedirect()
        );
      }
    }, INACTIVITY_TIMEOUT);

    set({ inactivityTimer: newTimer });
  },
}));