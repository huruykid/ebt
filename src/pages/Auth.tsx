
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Heart, MapPin, Users } from 'lucide-react';
import { signUpSchema, signInSchema } from '@/lib/validationSchemas';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user, isGuest, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user || isGuest) {
      navigate('/');
    }
  }, [user, isGuest, navigate]);

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
      // Validate form inputs
      if (isLogin) {
        const validationResult = signInSchema.safeParse({ email, password });
        if (!validationResult.success) {
          const errors = validationResult.error.errors.map(e => e.message).join(', ');
          toast.error(errors);
          setLoading(false);
          return;
        }
      } else {
        const validationResult = signUpSchema.safeParse({ email, password, fullName });
        if (!validationResult.success) {
          const errors = validationResult.error.errors.map(e => e.message).join(', ');
          toast.error(errors);
          setLoading(false);
          return;
        }
      }

      let result;
      if (isLogin) {
        result = await signIn(email.trim(), password);
      } else {
        result = await signUp(email.trim(), password, fullName.trim());
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

  const handleGuestAccess = () => {
    continueAsGuest();
    toast.success('👋 Welcome! You can browse stores as a guest.');
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('Failed to sign in with Google. Please try again.');
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Enter your full name"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                placeholder="Enter your email"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                placeholder="Enter your password"
                minLength={6}
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

          {/* Google Sign-In */}
          <div className="mt-4">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with</span>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full py-3 rounded-lg border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>
          </div>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <Button
                onClick={() => setIsLogin(!isLogin)}
                variant="outline"
                className="w-full border-green-200 text-green-700 hover:bg-green-50 py-3 rounded-lg transition-all duration-200"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </Button>

              <Button
                onClick={handleGuestAccess}
                variant="outline"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" />
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
