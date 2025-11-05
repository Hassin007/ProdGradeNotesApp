import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import { authAPI } from '../services/api';
import { scaleIn } from '../utils/constants';
import Logo from '../components/Logo';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsValidating(false);
        return;
      }

      try {
        setIsValidating(true);
        const response = await authAPI.validateResetToken(token);
        
        if (response.success) {
          setIsValidToken(true);
          setUserEmail(response.data.email || ''); // Set email if returned
          console.log('✅ Token is valid');
        }
      } catch (error) {
        console.error('❌ Token validation failed:', error);
        setIsValidToken(false);
        setMessage(error.response?.data?.message || 'Invalid or expired reset link');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    let hasSpecialChar = /[^A-Za-z0-9]/.test(formData.newPassword);
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters');
      return;
    }
    if (!hasSpecialChar) {
      setMessage('Password should have at least one special character');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await authAPI.resetPassword(token, formData.newPassword);
      
      if (response.success) {
        setIsSuccess(true);
        setMessage('Password reset successfully! Redirecting to login...');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please login with your new password.' 
            } 
          });
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setMessage(errorMessage);
      
      // Re-validate token if reset fails
      if (errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
        setIsValidToken(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear message when user starts typing
    if (message) setMessage('');
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md z-10"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 text-center">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Logo size={64} variant="creative" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Verifying Link</h2>
              <p className="text-blue-100 mt-2">
                Checking reset link validity...
              </p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Please wait
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We're verifying your password reset link
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md z-10"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 text-center">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-2xl text-white">⚠️</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Invalid Link</h2>
              <p className="text-red-100 mt-2">
                This reset link is invalid or has expired
              </p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="w-20 h-20 bg-red-100/80 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                <span className="text-3xl">❌</span>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Reset Link Expired
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {message || 'This password reset link is no longer valid. Please request a new one.'}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                >
                  Get New Reset Link
                </button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md z-10"
      >
        {/* Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
            {/* Back Button */}
            <button
              onClick={() => navigate('/login')}
              className="absolute left-4 top-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Logo size={64} variant="creative" />
            </motion.div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-white">New Password</h2>
            <p className="text-blue-100 mt-2">
              Create your new password
            </p>

            {/* User Email (if available) */}
            {userEmail && (
              <div className="mt-3 flex items-center justify-center gap-2 text-blue-100 text-sm">
                <Mail className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-8">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6" autocomplete="off">
                {/* Message Display */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-center backdrop-blur-sm"
                  >
                    {message}
                  </motion.div>
                )}

                {/* Success Banner - Token is valid */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg text-center backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Reset link verified! Set your new password below.
                  </div>
                </motion.div>

                {/* New Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    minLength="8"
                    className="w-full pl-10 pr-12 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="8"
                    className="w-full pl-10 pr-12 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                    Password Requirements:
                  </p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Make it strong and unique</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Resetting Password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </form>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-100/80 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Password Reset!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your password has been reset successfully. Redirecting to login...
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;