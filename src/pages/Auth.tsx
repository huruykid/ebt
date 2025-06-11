
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Heart, MapPin } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Autofocus email field on page load
  useEffect(() => {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        if (result.error.message === 'User already registered') {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else if (result.error.message === 'Invalid login credentials') {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(result.error.message);
        }
      } else {
        if (!isLogin) {
          toast.success('🎉 Account created successfully! Please check your email to verify your account.');
        } else {
          toast.success('✅ Welcome back! Great to see you again.');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-green-50/30 to-neutral-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Hero Section with Visual Warmth */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-12 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div className="absolute top-8 right-8">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="absolute bottom-6 left-8">
              <MapPin className="h-7 w-7 text-white" />
            </div>
          </div>
          
          {/* Logo/Brand */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="bg-white rounded-full p-2">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-white text-xl font-bold">EBT Finder</span>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join EBT Finder'}
            </h1>
            <p className="text-green-100 text-sm">
              Helping you find EBT-accepting stores with ease and dignity.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-3">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  style={{ color: '#333', '::placeholder': { color: '#888' } }}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                style={{ color: '#333' }}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                minLength={6}
                style={{ color: '#333' }}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-medium"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <Button
              onClick={() => setIsLogin(!isLogin)}
              variant="outline"
              className="mt-4 w-full border-green-200 text-green-700 hover:bg-green-50 py-3 rounded-lg transition-all duration-200"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
