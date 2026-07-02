import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import apiClient from "../../api/apiClient";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { loadRazorpayScript } from "../../utils/razorpay";
import {
  FaCheck,
  FaTimes,
  FaStar,
  FaBolt,
  FaShieldAlt,
  FaLock,
  FaArrowRight,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";

interface SubscriptionPlan {
  id: number;
  service_type: string;
  service_type_display?: string;
  subscription_type: string;
  subscription_type_display?: string;
  amount: number;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  vendor_service_type: string;
  plans: SubscriptionPlan[];
  total_plans: number;
}

const VendorSubscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { vendor, setSubscriptionStatus } = useAuthStore();
  const navigate = useNavigate();

  // Check if user already has subscription
useEffect(() => {
  const hasSub = localStorage.getItem("hasActiveSubscription") === 'true';
  const endDateStr = localStorage.getItem("subscriptionEndDate");
  
  // Only redirect if subscription is active AND we're not already on dashboard
  if (hasSub && endDateStr) {
    const endDate = new Date(endDateStr);
    const today = new Date();
    if (endDate > today) {
      console.log("Already has active subscription, redirecting to dashboard");
      navigate("/", { replace: true });
    }
  }
}, [navigate]);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching subscription plans...");
        const res = await apiClient.get<ApiResponse>("/ecommerce/service-plans/");
        console.log("API Response:", res.data);

        if (res.data.success && Array.isArray(res.data.plans) && res.data.plans.length > 0) {
          setPlans(res.data.plans);
          console.log(`Loaded ${res.data.plans.length} plans for service type: ${res.data.vendor_service_type}`);
        } else {
          setError("No subscription plans available for your service type");
          setPlans([]);
        }
      } catch (error: any) {
        console.error("Error fetching plans:", error);

        let errorMessage = "Failed to load subscription plans";
        if (error.response?.status === 401) {
          errorMessage = "Please login again";
          navigate("/login");
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);

        // Fallback: Try to use active-plans endpoint
        try {
          console.log("Trying fallback endpoint...");
          const fallbackRes = await apiClient.get("/ecommerce/active-plans/");
          if (Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
            setPlans(fallbackRes.data);
            setError(null);
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [navigate]);

  // Start free trial
  const startFreeTrial = async () => {
    try {
      const res = await apiClient.post("/ecommerce/free-trial/");

      if (res.data.success) {
        // Set subscription status
        setSubscriptionStatus(true);
        localStorage.setItem("hasActiveSubscription", "true");
        localStorage.setItem("subscriptionType", "free_trial");
        localStorage.setItem("subscriptionEndDate", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

        Swal.fire({
          icon: "success",
          title: "Free Trial Started!",
          text: "You now have 7 days of free access.",
          showConfirmButton: false,
          timer: 2000
        });

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        throw new Error(res.data.error || "Failed to start free trial");
      }
    } catch (error: any) {
      console.error("Free trial error:", error);

      let errorMsg = "Failed to start free trial";
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg
      });
    }
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    try {
      const confirm = await Swal.fire({
        title: "Confirm Subscription",
        text: `Subscribe to ${selectedPlan.subscription_type} plan for ₹${selectedPlan.amount}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Subscribe",
      });

      if (!confirm.isConfirmed) {
        setIsProcessing(false);
        return;
      }

      // ✅ load razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      // ✅ create order from your API
      const orderRes = await apiClient.post(
        "/ecommerce/create-razorpay-order/",
        {
          subscription_plan_id: selectedPlan.id
        }
      );

      const { order_id, amount, currency, key } = orderRes.data;

      // ✅ open checkout
      const options = {
        // key: import.meta.env.VITE_RAZORPAY_KEY, // your key
        key:key,
        amount,
        currency,
        name: "Vendor Subscription",
        description: selectedPlan.subscription_type,
        order_id,

        handler: async function (response: any) {
          try {
            // ✅ verify with backend
            const verifyRes = await apiClient.post(
              "/ecommerce/verify-payment/",
              {
                subscription_plan_id: selectedPlan.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verifyRes.data.success) {
              setSubscriptionStatus(true);

              Swal.fire({
                icon: "success",
                title: "Subscription Activated!",
                timer: 2000,
                showConfirmButton: false,
              });

              setTimeout(() => navigate("/"), 2000);
            }
          } catch (err: any) {
            Swal.fire("Verification failed", err.message, "error");
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      Swal.fire("Payment error", err.message, "error");
      setIsProcessing(false);
    }
  };


  // Get features for a plan
  const getFeatures = (subscriptionType: string, amount: number) => {
    const baseFeatures = {
      "1 Month": ["Basic Dashboard", "Up to 50 Listings", "Email Support", "30 Days Access"],
      "3 Months": ["All Basic Features", "Advanced Analytics", "Priority Support", "90 Days Access", "10% Discount"],
      "6 Months": ["All Quarterly Features", "Marketing Tools", "Dedicated Support", "180 Days Access", "20% Discount"],
      "1 year": ["All Half-yearly Features", "API Access", "Custom Branding", "365 Days Access", "25% Discount"],
      "Free Trial": ["Basic Dashboard", "Up to 10 Listings", "Email Support", "7 Days Trial"]
    };

    return baseFeatures[subscriptionType as keyof typeof baseFeatures] || ["Basic Features", "Email Support"];
  };

  // Get service type display name
  const getServiceTypeDisplay = (plan: SubscriptionPlan) => {
    return plan.service_type_display || plan.service_type.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="container mx-auto py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <FaShieldAlt size={18} />
            <span className="font-semibold">Secure & Reliable</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">Vendor Dashboard</span>
          </h1>

          {vendor?.vendor_subtype && (
            <div className="mb-4">
              <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
                {vendor.vendor_subtype.replace('_', ' ').toUpperCase()} SERVICES
              </span>
            </div>
          )}

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose a subscription plan tailored for your business. Start with a free trial or subscribe to unlock advanced features.
          </p>

          {error && (
            <div className="mt-4 inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Error State */}
        {/* {error && !loading && plans.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Plans Available</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : ( */}
          <>
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Free Trial Card - Always show */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        Free
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 mt-2">
                        Starter
                      </h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <FaBolt className="text-green-600" size={24} />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      ₹0<span className="text-lg text-gray-500">/7 days</span>
                    </div>
                    <p className="text-gray-600">7-day free trial with basic features</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {getFeatures("Free Trial", 0).map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <FaCheck className="text-green-500" size={16} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={startFreeTrial}
                    className="w-full py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center justify-center gap-2"
                  >
                    Start Free Trial
                    <FaArrowRight />
                  </button>
                </div>
              </motion.div>

              {/* Paid Plans */}
              {plans
                .filter(plan => plan.subscription_type !== "Free Trial") // Exclude free trial from paid plans
                .map((plan, index) => {
                  const isPopular = plan.subscription_type === "6 Months";
                  const features = getFeatures(plan.subscription_type, plan.amount);

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                      className={`bg-white rounded-xl shadow-lg border hover:shadow-xl transition-shadow duration-300 relative ${isPopular ? "border-blue-500 border-2" : "border-gray-200"
                        }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-bl-lg">
                          <span className="font-bold text-sm">MOST POPULAR</span>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                              {plan.subscription_type}
                            </span>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                              {plan.subscription_type} Plan
                            </h3>
                            <div className="mt-1">
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {getServiceTypeDisplay(plan)}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <FaShieldAlt className="text-blue-600" size={24} />
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-baseline mb-2">
                            <span className="text-4xl font-bold text-gray-900">₹{plan.amount}</span>
                            <span className="text-lg text-gray-500 ml-2">
                              /{plan.subscription_type.toLowerCase().includes('month') ? 'month' :
                                plan.subscription_type.toLowerCase().includes('year') ? 'year' :
                                  plan.subscription_type.toLowerCase()}
                            </span>
                          </div>
                          <p className="text-gray-600">{plan.description}</p>
                        </div>

                        <ul className="space-y-3 mb-8">
                          {features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3">
                              <FaCheck className="text-green-500" size={16} />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => setSelectedPlan(plan)}
                          className={`w-full py-3 rounded-lg font-semibold transition-all ${isPopular
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              : "bg-gray-900 hover:bg-black text-white"
                            }`}
                        >
                          Select Plan
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            {/* No Plans Message */}
            {plans.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
                {/* <h3 className="text-2xl font-bold text-gray-900 mb-2">No Subscription Plans Found</h3> */}
                {/* <p className="text-gray-600 mb-4">There are no subscription plans available for your service type at the moment.</p> */}
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold"
                >
                  Contact Support
                </button>
              </div>
            )}

            {/* Payment Modal */}
            {selectedPlan && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-2xl max-w-md w-full"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Confirm Subscription</h3>
                        <p className="text-gray-600">Complete payment to activate your plan</p>
                      </div>
                      <button
                        onClick={() => setSelectedPlan(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <FaTimes size={24} />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">Service Type:</span>
                        <span className="font-bold">{getServiceTypeDisplay(selectedPlan)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">Selected Plan:</span>
                        <span className="font-bold text-lg">{selectedPlan.subscription_type}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">₹{selectedPlan.amount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Duration:</span>
                        <span>{selectedPlan.subscription_type}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={processPayment}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Subscribe Now - ₹{selectedPlan.amount}
                            <FaArrowRight />
                          </>
                        )}
                      </button>

                      <div className="text-center text-gray-500 text-sm">
                        <p className="flex items-center justify-center gap-2">
                          <FaLock /> Secure payment powered by Razorpay
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Footer Note */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <FaStar className="text-yellow-500" />
                <span className="font-semibold text-gray-700">All plans include:</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {["Secure Dashboard", "24/7 Support", "Monthly Reports", "Data Backup"].map((feature, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
              <p className="text-gray-600">
                Need help choosing a plan? Contact our support team at support@example.com
              </p>
            </div>
          </>
      </div>
    </div>
  );
};

export default VendorSubscription;
//for real razorpay integration 
/* // src/utils/razorpay.ts
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
} */