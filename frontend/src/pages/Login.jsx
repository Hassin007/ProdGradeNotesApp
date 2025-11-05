import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { scaleIn } from '../utils/constants';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine if we're on login or register based on URL
  const isLoginPage = location.pathname === '/login';
  const [isLogin, setIsLogin] = useState(isLoginPage);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const from = location.state?.from?.pathname || '/';

  // Sync tab state with URL
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        // Login logic
        result = await login({
          email: formData.email,
          password: formData.password
        });

        if (result.success) {
          navigate(from, { replace: true });
        }
      } else {
        // Register logic
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        result = await register({
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        });

        if (result.success) {

          setFormData({
          fullName: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
          });

          // After successful registration, redirect to login page
          navigate('/login', { 
            replace: true,
            state: { 
              message: 'Registration successful! Please login to continue.',
              registeredEmail: formData.email 
            }
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const switchToLogin = () => {
    navigate('/login', { replace: true });
    setFormData({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const switchToRegister = () => {
    navigate('/register', { replace: true });
    setFormData({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Pre-fill email if coming from registration
  useEffect(() => {
    if (location.state?.registeredEmail) {
      setFormData(prev => ({
        ...prev,
        email: location.state.registeredEmail
      }));
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-1">
            <div className="flex relative">
              {/* Animated Background Slider */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                initial={false}
                animate={{
                  left: isLogin ? '0.25rem' : '50%',
                  width: 'calc(50% - 0.5rem)'
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
              
              {/* Login Tab */}
              <button
                data-testid="tab-signin"
                onClick={switchToLogin}
                className={`flex-1 py-4 px-6 text-center relative z-10 transition-colors ${
                  isLogin 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                <span className="font-semibold">Sign In</span>
              </button>
              
              {/* Register Tab */}
              <button
                data-testid="switch-to-register"
                onClick={switchToRegister}
                className={`flex-1 py-4 px-6 text-center relative z-10 transition-colors ${
                  !isLogin 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                <span className="font-semibold">Sign Up</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Success message after registration */}
            {location.state?.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <p className="text-green-700 dark:text-green-300 text-sm text-center">
                  {location.state.message}
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.form
                data-testid="register-form" 
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-6"
                autocomplete="off"
              >
                {/* Logo & Title */}
                <div className="text-center mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Logo size={64} variant="creative" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
                  </p>
                </div>

                {/* Full Name Field - Only for Register */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </motion.div>
                )}

                {/* Username Field - Only for Register */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </motion.div>
                )}

                {/* Email Field */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Confirm Password Field - Only for Register */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>
                )}
                  {isLogin && 
                  (<div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
                {/* Submit Button */}
                <motion.button
                  data-testid={isLogin ? 'submit-signin' : 'submit-signup'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </motion.button>

                {/* Switch Mode */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={isLogin ? switchToRegister : switchToLogin}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;