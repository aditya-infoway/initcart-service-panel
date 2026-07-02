// src/components/layout/AppLayout.tsx
import React, { useState, useEffect, useRef } from "react";
import { FaBars } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../../utils/reuseable";
import { useAuthStore } from "../../store/authStore";
import Sidebar from "./Sidebar";
import { getMenuForVendorType, getVendorTypeDisplayName } from "./serviceMenuItems";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isIconOnly, setIsIconOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const [open, setOpen] = useState(false);
  const [vendorMenu, setVendorMenu] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { hasActiveSubscription } = useAuthStore();

  // Get all from auth store
  const { vendor, logout, isAuthenticated } = useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();

  // Debug vendor data
  useEffect(() => {
    console.log("=== DEBUG VENDOR DATA ===");
    console.log("Is authenticated:", isAuthenticated);
    console.log("Vendor object:", vendor);
    console.log("Vendor subtype:", vendor?.vendor_subtype);
    console.log("Vendor type:", vendor?.vendor_type);
    console.log("Business name:", vendor?.business_name);
    console.log("=== END DEBUG ===");
  }, [vendor, isAuthenticated]);

  // Get vendor specific menu
  useEffect(() => {
    // First check localStorage
    const localStorageVendor = localStorage.getItem("vendor");
    if (localStorageVendor) {
      try {
        const parsedVendor = JSON.parse(localStorageVendor);
        console.log("Vendor from localStorage:", parsedVendor);
      } catch (e) {
        console.error("Error parsing localStorage vendor:", e);
      }
    }

    if (vendor?.vendor_subtype) {
      const menu = getMenuForVendorType(vendor.vendor_subtype);
      setVendorMenu(menu);
      console.log("✅ Vendor type found:", vendor.vendor_subtype);
      console.log("✅ Menu loaded:", menu);
    } else if (vendor?.vendor_type === 'service' && !vendor.vendor_subtype) {
      console.log("⚠️ Vendor type is service but subtype is missing");
      const defaultMenu = getMenuForVendorType(undefined);
      setVendorMenu(defaultMenu);
    } else {
      console.log("❌ No vendor subtype found, using default menu");
      const defaultMenu = getMenuForVendorType(undefined);
      setVendorMenu(defaultMenu);
    }
  }, [vendor]);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
      setIsIconOnly(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update active menu
  useEffect(() => {
    const path = location.pathname;
    for (const category of vendorMenu) {
      for (const item of category.items) {
        if (item.to && item.to === path) {
          setActiveMenu(item.title);
          return;
        }
        if (item.submenu && item.submenu.length > 0) {
          const matchedSub = item.submenu.find((s: any) => s.to === path);
          if (matchedSub) {
            setActiveMenu(matchedSub.name);
            return;
          }
        }
      }
    }
  }, [location.pathname, vendorMenu]);

  const handleMenuClick = (title: string, path: string) => {
    setActiveMenu(title);
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleIconOnly = () => {
    setIsIconOnly((prev) => !prev);
  };

  // Get vendor display name - multiple fallbacks
  const getVendorDisplayName = () => {
    if (vendor?.vendor_subtype) {
      return getVendorTypeDisplayName(vendor.vendor_subtype);
    }

    // Check localStorage as fallback
    try {
      const storedVendor = localStorage.getItem("vendor");
      if (storedVendor) {
        const parsed = JSON.parse(storedVendor);
        if (parsed.vendor_subtype) {
          return getVendorTypeDisplayName(parsed.vendor_subtype);
        }
      }
    } catch (e) {
      console.error("Error parsing localStorage vendor:", e);
    }

    return "Service Vendor";
  };

  const vendorDisplayName = getVendorDisplayName();

  // If no vendor data, show loading
  if (isAuthenticated && !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen overflow-y-hidden">
      {/* Sidebar */}
      <Sidebar
        menuItems={vendorMenu}
        sidebarOpen={sidebarOpen}
        isIconOnly={isIconOnly}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        toggleIconOnly={toggleIconOnly}
        handleMenuClick={handleMenuClick}
        activeMenu={activeMenu}
      />

      <div
        className={`flex-1 flex flex-col min-h-screen overflow-y-hidden transition-all duration-300 
         ${isMobile && sidebarOpen ? "opacity-50" : ""}`}
      >
        {/* Header */}
        <div className="flex justify-between lg:justify-end items-center px-4 py-3 bg-white shadow">
          <div className="flex items-center lg:hidden">
            <button onClick={toggleSidebar} className="mr-3">
              <FaBars size={24} />
            </button>
            <div>
              <h1 className="font-bold text-gray-800">{vendorDisplayName} Dashboard</h1>
              {vendor?.business_name && (
                <p className="text-xs text-gray-600">{vendor.business_name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop Header */}
            <div className="hidden lg:block text-right">
              <h1 className="font-bold text-gray-800">{vendorDisplayName} Dashboard</h1>
              {vendor?.business_name && (
                <p className="text-sm text-gray-600">{vendor.business_name}</p>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
              >
                <div className="hidden lg:block text-right">
                  <p className="font-medium text-gray-900">{vendor?.owner_name || "Vendor"}</p>
                  <p className="text-xs text-gray-500">{vendor?.email || ""}</p>
                </div>
                <img
                  src={toAbsoluteUrl("media/icons/profile.jpg")}
                  height={40}
                  width={40}
                  alt="Profile"
                  className="rounded-full hover:ring-2 hover:ring-gray-300 transition-all duration-200"
                />
              </div>
              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{vendor?.owner_name || "Vendor"}</p>
                    <p className="text-xs text-gray-500 truncate">{vendor?.email || ""}</p>
                    <p className="text-xs text-blue-600 mt-1">{vendorDisplayName}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate(hasActiveSubscription ? "/profile" : "/subscription");
                      setOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition cursor-pointer border-b border-gray-100"
                  >
                    Profile Settings
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate("/login");
                    }}
                    className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`p-4 flex-1 ${isIconOnly ? "lg:ms-20" : "lg:ms-64"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;