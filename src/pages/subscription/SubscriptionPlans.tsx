import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  FaCheck, FaCrown, FaRocket, FaGem, FaStar, 
  FaShieldAlt, FaSyncAlt, FaHeadset, FaCreditCard,
  FaExclamationTriangle, FaSpinner
} from 'react-icons/fa';

interface SubscriptionPlan {
  id: number;
  service_type: string;
  subscription_type: string;
  amount: number;
  description: string;
  is_active: boolean;
  service_type_display?: string;
  subscription_type_display?: string;
}

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionPlans();
    const vendor = JSON.parse(localStorage.getItem('vendor') || '{}');
    setVendorInfo(vendor);
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching subscription plans from admin API...');
      
      const token = localStorage.getItem('access');
      if (!token) {
        throw new Error('Please login again');
      }
      
      // Use the admin endpoint (same as admin panel)
      const response = await fetch('api/ecommerce/subscriptions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response Status:', response.status);
      
      if (response.status === 403) {
        throw new Error('Access denied. Please contact administrator.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      // Get response as text first
      const responseText = await response.text();
      console.log('Response length:', responseText.length);
      
      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw response (first 500 chars):', responseText.substring(0, 500));
        throw new Error('Invalid response from server');
      }
      
      console.log('API Data:', data);
      
      // Handle different response formats
      let plansArray: any[] = [];
      
      if (Array.isArray(data)) {
        plansArray = data;
      } else if (data && Array.isArray(data.data)) {
        plansArray = data.data;
      } else if (data && Array.isArray(data.results)) {
        plansArray = data.results;
      } else if (data && typeof data === 'object') {
        // Check common keys
        const keys = Object.keys(data);
        for (const key of keys) {
          if (Array.isArray(data[key])) {
            plansArray = data[key];
            break;
          }
        }
      }
      
      console.log('Extracted plans:', plansArray);
      
      if (plansArray.length === 0) {
        // Fallback to hardcoded plans
        console.log('No plans from API, using fallback');
        plansArray = getHardcodedPlans();
      }
      
      // Filter active plans and format
      const activePlans = plansArray
        .filter((plan: any) => {
          // Include all plans, but mark inactive ones
          return plan.is_active !== false;
        })
        .map((plan: any) => {
          // Format service type for display
          let serviceTypeDisplay = plan.service_type_display || plan.service_type || 'Service';
          if (serviceTypeDisplay.includes('_')) {
            serviceTypeDisplay = serviceTypeDisplay
              .split('_')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          } else {
            serviceTypeDisplay = serviceTypeDisplay.charAt(0).toUpperCase() + serviceTypeDisplay.slice(1);
          }
          
          // Format subscription type
          let subscriptionTypeDisplay = plan.subscription_type_display || plan.subscription_type || 'Monthly';
          
          // Convert amount to number
          let amount = 0;
          if (typeof plan.amount === 'number') {
            amount = plan.amount;
          } else if (typeof plan.amount === 'string') {
            amount = parseFloat(plan.amount) || 0;
          }
          
          return {
            id: plan.id || Math.random(),
            service_type: plan.service_type || 'general',
            subscription_type: plan.subscription_type || '1 Month',
            amount: amount,
            description: plan.description || 'Subscription plan',
            is_active: plan.is_active !== false,
            service_type_display: serviceTypeDisplay,
            subscription_type_display: subscriptionTypeDisplay
          };
        })
        .sort((a, b) => a.amount - b.amount); // Sort by price
      
      console.log('Processed active plans:', activePlans);
      setPlans(activePlans);
      
      if (activePlans.length === 0) {
        setError('No subscription plans available. Please contact administrator.');
      }
      
    } catch (err: any) {
      console.error('Error loading plans:', err);
      setError(err.message || 'Failed to load subscription plans');
      
      // Fallback to hardcoded plans
      console.log('Using hardcoded fallback plans');
      const fallbackPlans = getHardcodedPlans();
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

  const getHardcodedPlans = (): SubscriptionPlan[] => {
    return [
      {
        id: 1,
        service_type: 'salon',
        service_type_display: 'Salon & Beauty',
        subscription_type: '1 Month',
        subscription_type_display: '1 Month',
        amount: 499,
        description: 'Basic plan for all vendors - includes dashboard access and basic features',
        is_active: true
      },
      {
        id: 2,
        service_type: 'general',
        service_type_display: 'General',
        subscription_type: '3 Months',
        subscription_type_display: '3 Months',
        amount: 1299,
        description: 'Popular plan - includes advanced features and priority support',
        is_active: true
      },
      {
        id: 3,
        service_type: 'general',
        service_type_display: 'General',
        subscription_type: '1 year',
        subscription_type_display: '1 Year',
        amount: 3999,
        description: 'Premium annual plan - includes all features, API access and dedicated support',
        is_active: true
      }
    ];
  };

  const handleActivatePlan = async (plan: SubscriptionPlan) => {
    try {
      setSelectedPlan(plan.id);
      
      Swal.fire({
        title: 'Activate Subscription?',
        html: `
          <div class="text-left">
            <p><strong>Plan:</strong> ${plan.service_type_display} - ${plan.subscription_type_display}</p>
            <p><strong>Amount:</strong> ₹${plan.amount}</p>
            <p class="text-green-600 font-semibold">Test Mode Active</p>
            <p class="text-gray-600 text-sm mt-2">No real payment required. This is for testing only.</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Activate',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10b981',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const token = localStorage.getItem('access');
            
            // Try the test payment endpoint
            const response = await fetch('/api/ecommerce/simulate-test-payment/', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                subscription_plan_id: plan.id
              })
            });
            
            let data;
            try {
              const text = await response.text();
              data = JSON.parse(text);
            } catch {
              throw new Error('Invalid response from server');
            }
            
            if (data.success) {
              // Update vendor status in localStorage
              const vendor = JSON.parse(localStorage.getItem('vendor') || '{}');
              vendor.subscription_status = 'active';
              vendor.subscription_expiry = data.subscription?.expiry_date || new Date(Date.now() + 30*24*60*60*1000).toISOString();
              localStorage.setItem('vendor', JSON.stringify(vendor));
              
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Subscription activated successfully. Redirecting to dashboard...',
                timer: 2000,
                showConfirmButton: false
              }).then(() => {
                window.location.href = '/';
              });
            } else {
              throw new Error(data.error || 'Activation failed');
            }
          } catch (paymentError: any) {
            // If payment API fails, still activate locally for testing
            console.log('Payment API failed, activating locally:', paymentError);
            
            // Update vendor status in localStorage (simulate activation)
            const vendor = JSON.parse(localStorage.getItem('vendor') || '{}');
            vendor.subscription_status = 'active';
            vendor.subscription_expiry = new Date(Date.now() + 30*24*60*60*1000).toISOString(); // 30 days from now
            localStorage.setItem('vendor', JSON.stringify(vendor));
            
            Swal.fire({
              icon: 'success',
              title: 'Test Activation Complete!',
              html: `
                <div class="text-left">
                  <p>Subscription activated in test mode.</p>
                  <p class="text-sm text-gray-600 mt-2">(Payment API failed but subscription was activated locally for testing)</p>
                </div>
              `,
              confirmButtonText: 'Go to Dashboard'
            }).then(() => {
              window.location.href = '/';
            });
          }
        }
      });
    } catch (error: any) {
      console.error('Activation error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to activate subscription'
      });
    } finally {
      setSelectedPlan(null);
    }
  };

  const getPlanColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600", 
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600"
    ];
    return colors[index % colors.length];
  };

  const getPlanIcon = (index: number) => {
    const icons = [FaRocket, FaGem, FaCrown, FaStar, FaCheck];
    return icons[index % icons.length];
  };

  const getPlanFeatures = (amount: number) => {
    if (amount <= 500) {
      return [
        "Basic Dashboard Access",
        "Up to 50 Products/Services",
        "Email Support",
        "Order Management",
        "Basic Reports",
        "Mobile Responsive"
      ];
    } else if (amount <= 1500) {
      return [
        "Advanced Dashboard",
        "Up to 500 Products/Services",
        "Priority Support",
        "Bulk Operations",
        "Advanced Analytics",
        "Marketing Tools",
        "API Access"
      ];
    } else {
      return [
        "Enterprise Dashboard",
        "Unlimited Products/Services",
        "24/7 Phone Support",
        "Full API Access",
        "Custom Reports",
        "Dedicated Account Manager",
        "Training Sessions",
        "Early Access Features"
      ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <FaSpinner className="animate-spin text-blue-600 text-5xl mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Plans</h2>
        <p className="text-gray-600">Please wait while we load subscription plans...</p>
        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-blue-600 rounded-lg p-2 mr-3">
                <FaCrown className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
                <p className="text-gray-600">Choose a plan to continue to dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {vendorInfo && (
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{vendorInfo.business_name}</p>
                  <p className="text-sm text-gray-600">Service: {vendorInfo.service_type || 'General'}</p>
                </div>
              )}
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Test Mode Banner */}
        <div className="mb-8 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCreditCard className="text-2xl mr-3" />
              <div>
                <h3 className="text-xl font-bold">Test Mode Active</h3>
                <p className="text-green-100">No real payment required. Click any plan to activate instantly.</p>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="font-bold">DEMO</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-yellow-800">Note</h4>
                <p className="text-yellow-700">{error}</p>
                <button
                  onClick={fetchSubscriptionPlans}
                  className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 font-semibold"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = getPlanIcon(index);
            const colorClass = getPlanColor(index);
            const isPopular = index === 1;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl overflow-hidden shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isPopular ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-1.5 text-sm font-bold transform translate-x-8 translate-y-4 rotate-45">
                    RECOMMENDED
                  </div>
                )}

                <div className="bg-white p-8">
                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`bg-gradient-to-br ${colorClass} rounded-xl p-3 mr-4`}>
                        <Icon className="text-white text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {plan.service_type_display}
                        </h3>
                        <p className="text-gray-500">{plan.subscription_type_display}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">₹{plan.amount}</span>
                      <span className="text-gray-500 ml-2">/{plan.subscription_type.toLowerCase()}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {plan.subscription_type.includes('Month') 
                        ? `₹${(plan.amount / parseInt(plan.subscription_type)).toFixed(2)}/month` 
                        : 'Best value'}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-8 border-t pt-6">{plan.description}</p>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <FaCheck className="text-green-500 mr-2" />
                      What's included:
                    </h4>
                    <ul className="space-y-3">
                      {getPlanFeatures(plan.amount).map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleActivatePlan(plan)}
                    disabled={selectedPlan === plan.id}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isPopular
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                        : `bg-gradient-to-r ${colorClass} hover:opacity-90`
                    } text-white shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center`}
                  >
                    {selectedPlan === plan.id ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="mr-2" />
                        Activate This Plan
                      </>
                    )}
                  </button>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      <FaShieldAlt className="mr-2" /> Secure
                    </span>
                    <span className="flex items-center">
                      <FaSyncAlt className="mr-2" /> Instant
                    </span>
                    <span className="flex items-center">
                      <FaHeadset className="mr-2" /> Support
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <FaCheck className="text-green-500 mr-2" /> No Risk
            </h3>
            <p className="text-gray-600">Test activation with no real payment. Upgrade to real payments anytime.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <FaShieldAlt className="text-blue-500 mr-2" /> Secure
            </h3>
            <p className="text-gray-600">Your data is protected with enterprise-grade security.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <FaHeadset className="text-purple-500 mr-2" /> Support
            </h3>
            <p className="text-gray-600">Get help from our support team whenever you need it.</p>
          </div>
        </div>

        {/* Need Help */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need help choosing a plan?</p>
          <button
            onClick={() => window.location.href = 'mailto:support@example.com'}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;