// src/components/layout/serviceMenuItems.tsx
import {
  MdDashboard,
  MdRealEstateAgent,
  MdHealthAndSafety,
  MdOutlinePendingActions,
} from "react-icons/md";
import {
  FaUserTie,
  FaHotel,
  FaSchool,
  FaPlane,
  FaMoneyCheckAlt,
  FaCheckCircle,
  FaClipboardList,
  FaUserClock,
} from "react-icons/fa";
import { GiWeightLiftingUp, GiScissors } from "react-icons/gi";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { PiHandWithdrawFill } from "react-icons/pi";
import React from "react";

// ==================== INTERFACES ====================
export interface SubMenu {
  name: string;
  to: string;
  submenu?: SubMenu[];
}

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
  to?: string;
  submenu?: SubMenu[];
}

export interface MenuCategory {
  category?: string;
  items: MenuItem[];
}

// ==================== COMMON MENUS (ALL VENDORS) ====================
const commonMenus: MenuCategory[] = [
  {
    category: "Main",
    items: [
      {
        title: "Dashboard",
        icon: <MdDashboard size={20} />,
        to: "/",
        submenu: [],
      },
    ],
  },
  {
    category: "Business",
    items: [
      {
        title: "Approved Services",
        icon: <FaCheckCircle size={20} />,
        to: "/approvedservices",
        submenu: [],
      },
      {
        title: "Pending Services",
        icon: <MdOutlinePendingActions size={20} />,
        to: "/pendingapproval",
        submenu: [],
      },
      {
        title: "Rejected Services",
        icon: <MdOutlinePendingActions size={20} />,
        to: "/rejectedservices",
        submenu: [],
      },
      {
        title: "Inquiry Page",
        icon: <FaClipboardList size={20} />,
        to: "/inquiries",
        submenu: [],
      },
      {
        title: "Follow-ups Page",
        icon: <FaUserClock size={20} />,
        to: "/followups",
        submenu: [],
      },
    ],
  },
  {
    category: "Finance",
    items: [
      {
        title: "Withdraws",
        icon: <PiHandWithdrawFill size={20} />,
        to: "/withdraws",
        submenu: [],
      },
    ],
  },
];

// ==================== VENDOR-SPECIFIC MENUS ====================
const vendorSpecificMenus: Record<string, MenuCategory[]> = {
  real_estate: [
    {
      category: "Property Management",
      items: [
        {
          title: "My Properties",
          icon: <MdRealEstateAgent size={20} />,
          to: "/myproperties",
          submenu: [],
        },
      ],
    },
  ],
  gym: [
    {
      category: "Gym Management",
      items: [
        {
          title: "Gym Services",
          icon: <GiWeightLiftingUp size={20} />,
          to: "/mygym",
          submenu: [],
        },
      ],
    },
  ],
  salon: [
    {
      category: "Salon Management",
      items: [
        {
          title: "Salon Services",
          icon: <GiScissors size={20} />,
          to: "/mysaloon",
          submenu: [],
        },
      ],
    },
  ],
  travel_agency: [
    {
      category: "Travel Management",
      items: [
        {
          title: "Travel Packages",
          icon: <FaPlane size={20} />,
          to: "/mypackages",
          submenu: [],
        },
      ],
    },
  ],
  finance: [
    {
      category: "Finance Management",
      items: [
        {
          title: "Loan Offers",
          icon: <FaMoneyCheckAlt size={20} />,
          to: "/myfinanceservices",
          submenu: [],
        },
      ],
    },
  ],
  tech: [
    {
      category: "Tech Management",
      items: [
        {
          title: "Tech Services",
          icon: <FaUserTie size={20} />,
          to: "/mytechservices",
          submenu: [],
        },
      ],
    },
  ],
  tech_industry: [
    {
      category: "Tech Management",
      items: [
        {
          title: "Tech Services",
          icon: <FaUserTie size={20} />,
          to: "/mytechservices",
          submenu: [],
        },
      ],
    },
  ],
  hotel: [
    {
      category: "Hotel Management",
      items: [
        {
          title: "Hotel Services",
          icon: <FaHotel size={20} />,
          to: "/hotelservices",
          submenu: [],
        },
      ],
    },
  ],
  healthcare: [
    {
      category: "Healthcare Management",
      items: [
        {
          title: "Healthcare Services",
          icon: <MdHealthAndSafety size={20} />,
          to: "/haelthcare",
          submenu: [],
        },
      ],
    },
  ],
  education: [
    {
      category: "Education Management",
      items: [
        {
          title: "Education Services",
          icon: <FaSchool size={20} />,
          to: "/myeducationservices",
          submenu: [],
        },
      ],
    },
  ],
  professional: [
    {
      category: "Professional Services",
      items: [
        {
          title: "Professional Services",
          icon: <FaUserTie size={20} />,
          to: "/myprofessionalservices",
          submenu: [],
        },
      ],
    },
  ],

  restaurant: [
    {
      category: "Restaurant",
      items: [
        {
          title: "Restaurant Services",
          icon: <RiShoppingBag3Fill size={20} />,
          to: "/restaurantservices",
          submenu: [],
        },
      ],
    },
  ],
};

// ==================== UTILITY FUNCTIONS ====================
export function getMenuForVendorType(vendorType: string | undefined): MenuCategory[] {
  if (!vendorType) {
    return commonMenus;
  }
  
  const vendorMenus = vendorSpecificMenus[vendorType] || [];
  return [...commonMenus, ...vendorMenus];
}

export function getVendorTypeDisplayName(vendorType: string | undefined): string {
  if (!vendorType) return "Service Vendor";
  
  const displayMap: Record<string, string> = {
    'real_estate': 'Real Estate',
    'gym': 'Gym & Fitness',
    'salon': 'Salon & Beauty',
    'travel_agency': 'Travel Agency',
    'finance': 'Finance',
    'tech': 'Technology Services',
    'tech_industry': 'Technology Services',
    'hotel': 'Hotel',
    'healthcare': 'Healthcare',
    'education': 'Education',
    'professional': 'Professional Services',
    'restaurant': 'Restaurant',
    
  };
  
  return displayMap[vendorType] || vendorType.replace('_', ' ').toUpperCase();
}