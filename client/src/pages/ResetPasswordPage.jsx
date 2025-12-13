import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPasswordPage = ({ onClose }) => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenStatus, setTokenStatus] = useState('checking'); // 'checking', 'valid', 'invalid'

  // Check token validity on component mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await axios.get(`/api/auth/validate-reset-token/${token}`);
        if (response.data.valid) {
          setTokenStatus('valid');
        } else {
          setTokenStatus('invalid');
          setErrors({
            general: response.data.error || t('reset.errors.invalidToken')
          });
        }
      } catch (err) {
        setTokenStatus('invalid');
        setErrors({
          general: err.response?.data?.error || t('reset.errors.tokenCheckFailed')
        });
      }
    };

    checkToken();
  }, [token, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    const newErrors = {};
    if (!formData.password) newErrors.password = t('reset.errors.passwordRequired');
    if (formData.password.length < 8) newErrors.password = t('reset.errors.passwordLength');
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('reset.errors.passwordMismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`/api/auth/reset-password/${token}`, {
        password: formData.password
      });
      
      setSuccess(t('reset.success'));
      setTimeout(() => {
        if (onClose) onClose(); // Close modal if it's a modal
        navigate('/'); // Redirect to home page
      }, 2000);
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || t('reset.errors.failed'),
        details: err.response?.data?.error
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenStatus === 'checking') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('reset.checkingToken')}</h2>
          <p>{t('reset.verifyingLink')}</p>
        </div>
      </div>
    );
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            aria-label={t("common.close")}
          >
            <FaTimes />
          </button>
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            {t('reset.invalidTokenTitle')}
          </h2>
          <p className="mb-4">{errors.general}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            {t('reset.requestNewLink')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold z-20"
          aria-label={t("common.close")}
        >
          <FaTimes />
        </button>

        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">{t("reset.title")}</h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              <p>{errors.general}</p>
              {errors.details && <p className="mt-1 text-xs">{errors.details}</p>}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium">
              {t("reset.newPassword")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("reset.passwordPlaceholder")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
              {t("reset.confirmPassword")}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("reset.confirmPlaceholder")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? t("reset.loading") : t("reset.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;