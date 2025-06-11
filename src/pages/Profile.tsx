import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserProfileInfo } from '@/components/profile/UserProfileInfo';
import { UserReviews } from '@/components/profile/UserReviews';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { AppPreferences } from '@/components/profile/AppPreferences';
import { SupportLinks } from '@/components/profile/SupportLinks';
import { useFavorites } from '@/hooks/useFavorites';
import { User, Settings, MessageSquare, Heart, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type ProfileSection = 'info' | 'reviews' | 'settings' | 'preferences' | 'support';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<ProfileSection>('info');

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

  if (!user) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-neutral-100 p-4">
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
    </ProtectedRoute>
  );
}
