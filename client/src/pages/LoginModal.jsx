import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "../api/axios";

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Configure CSRF protection
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';

  const validateLoginForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = t("login.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("login.errors.emailInvalid");
    }
    if (!formData.password) newErrors.password = t("login.errors.passwordRequired");
    return newErrors;
  };

  const validateResetForm = () => {
    const newErrors = {};
    if (!resetEmail) newErrors.email = t("login.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      newErrors.email = t("login.errors.emailInvalid");
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const res = await axios.post("/auth/login", formData, {
      withCredentials: true
    });

    // Store token in localStorage
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
       localStorage.setItem('user', JSON.stringify(res.data.user)); 
    }

    setErrors({});
    setSuccess(t("login.success"));

    // Include ALL user fields from the response
    const userData = {
      ...res.data.user, // Spread all user properties
      id: res.data.user?.id // Explicitly include id for consistency
    };

    console.log("Storing user data:", userData); // Debug log

    // Close modal after 2 seconds
    setTimeout(() => {
      onLoginSuccess(userData);
      onClose();
    }, 2000);

  } catch (err) {
    console.error("Login error:", err);
    setErrors({
      general: err.response?.data?.message || t("login.errors.general"),
      details: err.response?.data?.error || ""
    });
  } finally {
    setIsLoading(false);
  }
};
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateResetForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email: resetEmail });
      
      setSuccess(t("login.resetSent"));
      setErrors({});
      
      // Auto-return to login after success
      setTimeout(() => {
        setShowReset(false);
        setResetEmail("");
      }, 2000);
      
    } catch (err) {
      console.error("Reset error:", err);
      setErrors({
        general: t("login.errors.resetFailed"),
        details: err.response?.data?.error || err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold z-20"
          aria-label={t("common.close")}
        >
          &times;
        </button>

        {!showReset ? (
          <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">{t("login.title")}</h2>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errors.general}
                {errors.details && (
                  <p className="mt-1 text-xs opacity-75">{errors.details}</p>
                )}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {success}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("login.emailPlaceholder")}
                autoComplete="username"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("login.passwordPlaceholder")}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex justify-center items-center ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? t("login.loading") : t("login.submit")}
            </button>

            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setShowReset(true);
                  setErrors({});
                  setSuccess("");
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t("login.forgotPassword")}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">{t("login.resetTitle")}</h2>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errors.general}
                {errors.details && (
                  <p className="mt-1 text-xs opacity-75">{errors.details}</p>
                )}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {success}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="resetEmail" className="block mb-2 text-sm font-medium">
                {t("login.email")}
              </label>
              <input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                }}
                className={`w-full p-3 border rounded-lg ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("login.emailPlaceholder")}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex justify-center items-center ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? t("login.loading") : t("login.resetSubmit")}
            </button>

            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setErrors({});
                  setSuccess("");
                }}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                {t("login.backToLogin")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;