// src/pages/dashboard/Dashboard.tsx
import React from "react";
import { ServiceStatistics } from "../../components/ServiceStatistics";
import BusinessAnalytics from "../../components/BusinessAnalytics";
import { RecentActivityLog } from "../../components/RecentActivityLog";
import { useAuthStore } from "../../store/authStore";
import { getVendorTypeDisplayName } from "../../components/layout/serviceMenuItems";

const Dashboard = () => {
  const { vendor } = useAuthStore();
  const vendorType = getVendorTypeDisplayName(vendor?.vendor_subtype);

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-6 bg-gradient-to-r bg-blue-900 rounded-xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome to {vendorType} Dashboard
        </h1>
        <p className="text-blue-100 opacity-90">
          Manage your {vendor?.business_name || "business"} efficiently
        </p>
      </div>

      <div className="mb-5">
        <BusinessAnalytics />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full mt-5">
        <div className="w-full flex">
          <ServiceStatistics
            className="shadow-lg border border-gray-200 rounded-2xl w-full"
            chartColor="primary"
            chartHeight="100%"
          />
        </div>

        <div className="w-full">
          <RecentActivityLog />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;