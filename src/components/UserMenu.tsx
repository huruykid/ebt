
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PointsDisplay } from '@/components/gamification/PointsDisplay';
import { useGameification } from '@/hooks/useGameification';
import { toast } from 'sonner';

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { userStats } = useGameification();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        {userStats && (
          <div className="hidden sm:block">
            <PointsDisplay userStats={userStats} compact={true} />
          </div>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b text-sm text-gray-600">
            {user.email}
          </div>
          {userStats && (
            <div className="px-4 py-3 border-b">
              <PointsDisplay userStats={userStats} compact={true} />
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
