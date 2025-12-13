import { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const Signup = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
 
// Inside your Signup component
const [passwordVisible, setPasswordVisible] = useState({
  password: false,
  confirmPassword: false
});
const togglePasswordVisibility = (field) => {
  setPasswordVisible(prev => ({
    ...prev,
    [field]: !prev[field]
  }));
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword, role } = formData;
    const errors = {};

    // Name validation
    if (name.length < 3) {
      errors.name = t("signup.errors.nameTooShort");
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = t("signup.errors.invalidEmail");
    }

    // Phone validation
    if (!/^\d{9,15}$/.test(phone)) {
      errors.phone = t("signup.errors.invalidPhone");
    }

    // Password validation
    if (password.length < 6) {
      errors.password = t("signup.errors.passwordTooShort");
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t("signup.errors.passwordMismatch");
    }

    // Role validation
    if (!["customer", "landowner"].includes(role)) {
      errors.role = t("signup.errors.invalidRole");
    }

    return Object.keys(errors).length ? errors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess("");

    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors) {
      setError(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      
      // Ensure phone is sent as string
      dataToSend.phone = dataToSend.phone.toString();

      console.log("Submitting data:", JSON.stringify(dataToSend, null, 2));

      const response = await axios.post("/api/auth/signup", dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Signup successful:", response.data);
      setSuccess(t("signup.success"));
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      
      if (err.response?.data?.errors) {
        // Handle backend validation errors
        setError(err.response.data.errors);
      } else {
        setError({
          general: err.response?.data?.message || t("signup.errors.general"),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName) => {
    return error?.[fieldName] || error?.errors?.[fieldName];
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-4"
        noValidate
      >
        <h2 className="text-2xl font-bold text-center">{t("signup.title")}</h2>

        {error?.general && (
          <p className="text-red-500 text-sm">{error.general}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm">{success}</p>
        )}

        {/* Name Field */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            {t("signup.name")}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${
              getFieldError("name") ? "border-red-500" : ""
            }`}
            required
            minLength="3"
          />
          {getFieldError("name") && (
            <p className="text-red-500 text-xs mt-1">{getFieldError("name")}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            {t("signup.email")}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${
              getFieldError("email") ? "border-red-500" : ""
            }`}
            required
          />
          {getFieldError("email") && (
            <p className="text-red-500 text-xs mt-1">{getFieldError("email")}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            {t("signup.phone")}
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${
              getFieldError("phone") ? "border-red-500" : ""
            }`}
            required
            pattern="[0-9]{9,15}"
          />
          {getFieldError("phone") && (
            <p className="text-red-500 text-xs mt-1">{getFieldError("phone")}</p>
          )}
        </div>

    <div>
  {/* Password Field */}
  <div className="mb-4">
    <label htmlFor="password" className="block text-sm font-medium mb-1">
      {t("signup.password")}
    </label>
    <div className="relative">
      <input
        id="password"
        name="password"
        type={passwordVisible.password ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md ${
          getFieldError("password") ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        required
        minLength={6}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 px-3 flex items-center"
        onClick={() => togglePasswordVisibility("password")}
        aria-label={
          passwordVisible.password ? "Hide password" : "Show password"
        }
      >
        {passwordVisible.password ? (
          <FaEyeSlash className="text-gray-500 hover:text-gray-700" />
        ) : (
          <FaEye className="text-gray-500 hover:text-gray-700" />
        )}
      </button>
    </div>
    {getFieldError("password") && (
      <p className="mt-1 text-sm text-red-600">
        {getFieldError("password")}
      </p>
    )}
  </div>

  {/* Confirm Password Field */}
  <div className="mb-4">
    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
      {t("signup.confirmPassword")}
    </label>
    <div className="relative">
      <input
        id="confirmPassword"
        name="confirmPassword"
        type={passwordVisible.confirmPassword ? "text" : "password"}
        value={formData.confirmPassword}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md ${
          getFieldError("confirmPassword") ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        required
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 px-3 flex items-center"
        onClick={() => togglePasswordVisibility("confirmPassword")}
        aria-label={
          passwordVisible.confirmPassword ? "Hide password" : "Show password"
        }
      >
        {passwordVisible.confirmPassword ? (
          <FaEyeSlash className="text-gray-500 hover:text-gray-700" />
        ) : (
          <FaEye className="text-gray-500 hover:text-gray-700" />
        )}
      </button>
    </div>
    {getFieldError("confirmPassword") && (
      <p className="mt-1 text-sm text-red-600">
        {getFieldError("confirmPassword")}
      </p>
    )}
  </div>
</div>

        {/* Role Selector */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            {t("signup.role")}
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 ${
              getFieldError("role") ? "border-red-500" : ""
            }`}
            required
          >
            <option value="customer">{t("signup.customer")}</option>
            <option value="landowner">{t("signup.landowner")}</option>
          </select>
          {getFieldError("role") && (
            <p className="text-red-500 text-xs mt-1">{getFieldError("role")}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("signup.submitting") : t("signup.button")}
        </button>
      </form>
    </div>
  );
};

export default Signup;