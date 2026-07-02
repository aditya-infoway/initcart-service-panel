import  { useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaRocket, FaChartLine, FaUsers, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const features = [
    {
      icon: FaChartLine,
      title: "Analytics Dashboard",
      description: "Track your service sales and performance"
    },
    {
      icon: FaUsers,
      title: "Customer Management",
      description: "Manage your customer base"
    },
    {
      icon: FaShoppingCart,
      title: "Order Management",
      description: "Process orders efficiently"
    },
    {
      icon: FaRocket,
      title: "Growth Tools",
      description: "Tools to grow your business"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-block bg-white p-4 rounded-full mb-4"
            >
              <FaCheckCircle className="text-green-500 text-6xl" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Subscription Activated Successfully! 🎉
            </h1>
            <p className="text-green-100 text-xl">
              Welcome to the service premium vendor community of init
            </p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Dashboard is Ready
              </h2>
              <p className="text-gray-600 text-lg">
                Redirecting to your dashboard in 5 seconds...
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center"
                >
                  <feature.icon className="text-emerald-500 text-4xl mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <FaRocket />
                Go to Dashboard Now
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg transition-colors border border-gray-300"
              >
                View Profile Settings
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-10">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-600"
                />
              </div>
              <p className="text-center text-gray-500 mt-2">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600">
            Need help?{" "}
            <a href="mailto:support@ecommerce.com" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SubscriptionSuccess; 