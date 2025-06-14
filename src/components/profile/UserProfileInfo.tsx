
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { UserStoreContributions } from './UserStoreContributions';
import { useUserStores } from '@/hooks/useUserStores';

export const UserProfileInfo: React.FC = () => {
  const { user } = useAuth();
  const { data: userStores, isLoading: storesLoading } = useUserStores();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Email Address</label>
            <p className="text-gray-900 mt-1">{user.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Account Status</label>
            <div className="mt-1">
              <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                {user.email_confirmed_at ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Member Since</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900">
                {format(new Date(user.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Account Type</label>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900">Standard User</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Contributions Section */}
      {storesLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <UserStoreContributions stores={userStores || []} />
      )}
    </div>
  );
};
