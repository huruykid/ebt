
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserProfileInfo } from '@/components/profile/UserProfileInfo';
import { UserReviews } from '@/components/profile/UserReviews';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { AppPreferences } from '@/components/profile/AppPreferences';
import { SupportLinks } from '@/components/profile/SupportLinks';
import { SavedListsView } from '@/components/lists/SavedListsView';
import { useFavorites } from '@/hooks/useFavorites';
import { User, Settings, MessageSquare, Heart, HelpCircle, LogOut, Mail, Lock, UserPlus, FolderHeart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type ProfileSection = 'info' | 'reviews' | 'lists' | 'settings' | 'preferences' | 'support';

const AuthInterface = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link."
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've been signed in successfully."
          });
          // Clear the form on successful sign in
          setEmail('');
          setPassword('');
        }
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Join our community and start saving your favorite stores' 
                : 'Welcome back! Sign in to access your profile'
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    {isSignUp ? (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Create one"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, signOut, loading, isGuest } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<ProfileSection>('info');

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth interface for non-authenticated users (including guests)
  if (!user) {
    return <AuthInterface />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "✅ You've been signed out",
        description: "Come back anytime! Your favorites will be waiting."
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const sectionItems = [
    { id: 'info' as ProfileSection, label: 'Profile Info', icon: User },
    { id: 'reviews' as ProfileSection, label: 'My Reviews', icon: MessageSquare },
    { id: 'lists' as ProfileSection, label: 'My Lists', icon: FolderHeart },
    { id: 'settings' as ProfileSection, label: 'Account Settings', icon: Settings },
    { id: 'preferences' as ProfileSection, label: 'App Preferences', icon: Settings },
    { id: 'support' as ProfileSection, label: 'Help & Support', icon: HelpCircle },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'info':
        return <UserProfileInfo />;
      case 'reviews':
        return <UserReviews />;
      case 'lists':
        return <SavedListsView />;
      case 'settings':
        return <AccountSettings />;
      case 'preferences':
        return <AppPreferences />;
      case 'support':
        return <SupportLinks />;
      default:
        return <UserProfileInfo />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-semibold bg-green-600 text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.email}
                  </h1>
                  <p className="text-gray-600">
                    {favorites.length} favorites saved
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => navigate('/favorites')}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Heart className="h-4 w-4" />
                  View Favorites
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          activeSection === item.id 
                            ? 'bg-green-50 text-green-700 border-r-2 border-green-600' 
                            : 'text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
