import { type FC } from "react";
import { MdOutlinePendingActions } from "react-icons/md";
import { FaUserTie, FaRegBell } from "react-icons/fa";
import { AiOutlineCheckCircle, AiOutlineSend } from "react-icons/ai";
import { TbTruckDelivery } from "react-icons/tb";
import { EarningCard } from "./EarningCard";
// import { MdOutlineAttachMoney } from "react-icons/md";
// import { FaMoneyCheckAlt, FaCashRegister } from "react-icons/fa";
// import { GiReceiveMoney } from "react-icons/gi";
import { BsCurrencyExchange } from "react-icons/bs";

// ===========================
// SERVICE VENDOR STATS
// ===========================
const serviceStats = [
  {
    label: "Service Count",
    count: 12,
    icon: <AiOutlineCheckCircle size={22} />,
    bgColor: "from-blue-500 to-indigo-500",
  },
  {
    label: "Approved Services",
    count: 9,
    icon: <FaUserTie size={22} />,
    bgColor: "from-green-400 to-emerald-500",
  },
  {
    label: "Pending Services",
    count: 3,
    icon: <MdOutlinePendingActions size={22} />,
    bgColor: "from-yellow-400 to-amber-500",
  },
  {
    label: "Total Inquiries",
    count: 25,
    icon: <TbTruckDelivery size={22} />,
    bgColor: "from-purple-500 to-pink-500",
  },
  {
    label: "Active Inquiries",
    count: 5,
    icon: <AiOutlineSend size={22} />,
    bgColor: "from-indigo-400 to-blue-500",
  },
  {
    label: "Completed Inquiries",
    count: 18,
    icon: <AiOutlineCheckCircle size={22} />,
    bgColor: "from-green-500 to-teal-500",
  },
];

// ===========================
// SERVICE VENDOR WALLET
// ===========================
const vendorWallet = [
  {
    label: "Earnings (Monthly, Yearly)",
    count: "₹42,500",
    icon: <BsCurrencyExchange size={22} />,
    textColor: "text-indigo-600",
  },
  {
    label: "Follow-ups Due Today",
    count: 2,
    icon: <MdOutlinePendingActions size={22} />,
    textColor: "text-yellow-600",
  },
  {
    label: "Overall Rating",
    count: "4.7 ★",
    icon: <AiOutlineCheckCircle size={22} />,
    textColor: "text-green-600",
  },
  {
    label: "Last Login",
    count: "09 Oct 2025, 11:45 AM",
    icon: <FaUserTie size={22} />,
    textColor: "text-gray-700",
  },
  {
    label: "Account Status",
    count: "Active",
    icon: <AiOutlineCheckCircle size={22} />,
    textColor: "text-blue-600",
  },
];

// ===========================
// BUSINESS ANALYTICS COMPONENT
// ===========================
const BusinessAnalytics: FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center text-gray-900 font-semibold text-xl tracking-wide">
          <FaUserTie className="mr-2 text-blue-600" /> Service Vendor Overview
        </h2>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
          <FaRegBell className="text-yellow-500 animate-pulse" />
          <span className="text-sm text-gray-600 font-medium">
            New inquiry from Ramesh Kumar
          </span>
        </div>
      </div>

      {/* Service Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
        {serviceStats.map((stat) => (
          <div
            key={stat.label}
            className="relative bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-gray-500 font-medium">{stat.label}</p>
              <p className="text-gray-900 text-2xl font-extrabold mt-1">
                {stat.count}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor} text-white shadow-sm`}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Earning Card */}
      <EarningCard
        className="w-full"
        onFilterChange={(value) => console.log("Filter changed to:", value)}
      />

      {/* Vendor Wallet */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Vendor Performance & Wallet Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {vendorWallet.map((stat) => (
            <div
              key={stat.label}
              className="group bg-gradient-to-br from-gray-50 to-white hover:from-indigo-50 hover:to-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-gray-600 font-medium mb-1">{stat.label}</p>
              <div
                className={`font-bold text-lg ${stat.textColor} group-hover:scale-110 transform transition-transform duration-300`}
              >
                {stat.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalytics;
