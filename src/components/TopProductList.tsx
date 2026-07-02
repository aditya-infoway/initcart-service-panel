import { type FC } from "react";
import { toAbsoluteUrl } from "../utils/reuseable";

type Props = {
  className?: string;
};

const services = [
  {
    img: "media/images/gym.jpg",
    name: "Premium Gym Membership",
    type: "Gym",
    bookings: "120",
    trend: "+8%",
  },
  {
    img: "media/images/salon.jpg",
    name: "Hair & Spa Package",
    type: "Salon",
    bookings: "85",
    trend: "+5%",
  },
  {
    img: "media/images/travel.jpg",
    name: "Weekend Travel Package",
    type: "Travel Agency",
    bookings: "60",
    trend: "+12%",
  },
  {
    img: "media/images/finance.jpg",
    name: "Financial Consulting",
    type: "Finance",
    bookings: "40",
    trend: "-2%",
  },
  {
    img: "media/images/education.jpg",
    name: "Online Coding Course",
    type: "Education",
    bookings: "150",
    trend: "+15%",
  },
];

const TopServiceList: FC<Props> = ({ className = "" }) => {
  return (
    <div
      className={`backdrop-blur-md bg-gradient-to-br from-white/90 to-gray-50/90 
        dark:from-gray-900/80 dark:to-gray-800/80 
        rounded-2xl shadow-lg border border-gray-100/60 dark:border-gray-700/60 
        p-6 transition-all duration-300 hover:shadow-xl ${className}`}
    >
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Top Booked Services
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Based on recent bookings
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
              <th className="py-3"></th>
              <th className="py-3 font-medium">Service</th>
              <th className="py-3 font-medium">Type</th>
              <th className="py-3 font-medium">Bookings</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
              >
                <td className="py-4 pr-3">
                  <img
                    src={toAbsoluteUrl(item.img)}
                    alt={item.name}
                    className="h-14 w-14 rounded-md bg-gray-50 dark:bg-gray-700 p-1"
                  />
                </td>
                <td className="py-4 font-semibold text-gray-900 dark:text-gray-100">
                  {item.name}
                </td>
                <td className="py-4 text-gray-700 dark:text-gray-300">
                  {item.type}
                </td>
                <td className="py-4 text-gray-700 dark:text-gray-300">
                  {item.bookings}
                </td>
                <td
                  className={`py-4 text-right font-semibold ${
                    item.trend.startsWith("+")
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {item.trend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { TopServiceList };
