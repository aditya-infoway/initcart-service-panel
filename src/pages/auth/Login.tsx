// pages/auth/Login.tsx
import { useState } from "react";
import { FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import MainButton from "../../components/common/MainButton";
import { IoMdCart } from "react-icons/io";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../api/apiClient";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const loginStore = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is Required"),
      password: Yup.string().required("Password is Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          identifier: values.email.trim(),
          password: values.password,
        };

        const res = await apiClient.post("ecommerce/auth/service-login/", payload);
        const data = res.data;

        if (data && data.access) {
          // ✅ Save tokens
          localStorage.setItem("access", data.access);
          localStorage.setItem("access_token", data.access);
          localStorage.setItem("refresh", data.refresh);
          localStorage.setItem("refresh_token", data.refresh);
          localStorage.setItem("vendor", JSON.stringify(data.vendor));

          // ✅ Login to store
          loginStore({
            access: data.access,
            refresh: data.refresh,
            vendor: data.vendor,
          });

          // ✅ Check subscription status after login
          let hasSubscription = false;
          let subscriptionData: any = null;

          try {
            const subRes = await apiClient.get("/ecommerce/vendor-subscriptions/check/");
            console.log("Subscription response:", subRes.data);

            if (subRes.data?.has_active_subscription === true) {
              hasSubscription = true;
              subscriptionData = subRes.data;
            }
          } catch (subError) {
            console.error("Subscription check failed:", subError);
          }

          // ✅ FIXED: end_date multiple locations se extract karo
          if (hasSubscription && subscriptionData) {
            localStorage.setItem("hasActiveSubscription", "true");

            const endDate =
              subscriptionData.end_date ||
              subscriptionData.current_subscription?.end_date ||
              subscriptionData.subscription?.end_date ||
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

            localStorage.setItem("subscriptionEndDate", endDate);

            const subType =
              subscriptionData.subscription_type ||
              subscriptionData.current_subscription?.subscription_plan?.subscription_type;

            if (subType) {
              localStorage.setItem("subscriptionType", subType);
            }

            Swal.fire({
              icon: "success",
              title: "Login Successful!",
              text: "Welcome back!",
              timer: 1500,
              showConfirmButton: false,
            });

            setTimeout(() => navigate("/", { replace: true }), 500);

          } else {
            // ❌ No active subscription
            localStorage.removeItem("hasActiveSubscription");
            localStorage.removeItem("subscriptionType");
            localStorage.removeItem("subscriptionEndDate");

            Swal.fire({
              icon: "info",
              title: "Subscription Required",
              text: "Please purchase a subscription to access the vendor panel.",
              timer: 2000,
              showConfirmButton: false,
            });

            setTimeout(() => navigate("/subscription", { replace: true }), 500);
          }

        } else {
          throw new Error(data?.message || "Invalid login response");
        }

      } catch (err: any) {
        console.error("Login error:", err);

        let errorMsg = "Login failed";
        if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMsg = err.response.data.error;
        } else if (err.message?.includes("Network Error")) {
          errorMsg = "Server is not responding. Please check if Django server is running.";
        } else if (err.message?.includes("timeout")) {
          errorMsg = "Request timeout. Server might be busy.";
        }

        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: errorMsg,
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex w-full" style={{ height: "100svh" }}>
      <div className="hidden lg:flex w-[55%] relative p-5 lg:p-10 bg-gradient-to-br from-[#0165ff] to-[#0053cf] overflow-hidden">
        <div className="relative z-10 text-white flex flex-col justify-center h-full gap-6">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold"
          >
            Welcome to Service Vendor Panel
          </motion.h1>
          <motion.p
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-gray-200"
          >
            Manage services and inquiries effortlessly.
          </motion.p>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute -bottom-10 -right-20 w-60 h-60 bg-white opacity-10 rounded-full"
        />
      </div>

      <div className="w-full lg:w-[45%] p-5 lg:p-10 flex flex-col justify-center gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-20"
        >
          <div className="text-center flex flex-col gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-2"
            >
              <div className="bg-gradient-to-br from-[#0165ff] to-[#004bb5] rounded-full p-2 shadow-[4px_4px_10px_rgba(0,0,0,0.3), -4px_-4px_10px_rgba(255,255,255,0.2)] transform transition-transform duration-300">
                <IoMdCart color="white" size={22} />
              </div>
              <div className="font-bold text-xl">Ecommerce</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2"
            >
              <div className="font-heading font-bold text-[38px]">
                Welcome Back
              </div>
              <div className="text-gray-500 text-lg">
                Please login to your account
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
              <div>
                <input
                  type="email"
                  className={`${
                    formik.touched.email && formik.errors.email
                      ? "customInputError"
                      : "customInput"
                  }`}
                  placeholder="Email address"
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  disabled={loading}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.email}
                  </div>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={!showPassword ? "password" : "text"}
                    className={`${
                      formik.touched.password && formik.errors.password
                        ? "customInputError"
                        : "customInput"
                    }`}
                    style={{ paddingRight: "50px" }}
                    placeholder="Password"
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    disabled={loading}
                  />
                  <div
                    onClick={() => !loading && setShowPassword((prev) => !prev)}
                    className={`absolute right-4 top-[50%] transform -translate-y-1/2 cursor-pointer transition-colors duration-300 ${
                      loading
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {showPassword ? <FaEye size={19} /> : <FaEyeSlash size={19} />}
                  </div>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-sm mt-1 ms-2">
                    {formik.errors.password}
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="select-none cursor-pointer"
        >
          <MainButton
            text={loading ? "Logging in..." : "Login"}
            loading={loading}
            disabled={!formik.isValid || loading}
            submit={() => formik.handleSubmit()}
            className="hover:scale-103 transition-transform duration-300 w-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="w-full flex justify-center items-center mt-6"
        >
          <div className="w-full max-w-sm relative text-center">
            <div className="absolute inset-x-0 -top-4 flex justify-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            <div className="mb-3">
              <span className="text-sm text-gray-500">New to our platform?</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                window.location.href = "https://initcart.in/vendor-registration";
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 
                         hover:from-green-600 hover:to-emerald-700 
                         text-white font-semibold py-3 px-4 rounded-xl 
                         shadow-lg hover:shadow-xl transition-all duration-300 
                         flex items-center justify-center gap-3 group"
            >
              <FaUserPlus className="text-white text-lg group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-base">Register as a Vendor</span>
              <div className="w-0 group-hover:w-5 overflow-hidden transition-all duration-300">
                <span className="text-white text-lg">→</span>
              </div>
            </motion.button>

            <p className="text-xs text-gray-400 mt-3">
              Start your journey with us today
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;