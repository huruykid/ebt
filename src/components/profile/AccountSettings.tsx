
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Lock, Trash2, AlertTriangle } from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please make sure both passwords match.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed."
      });
      
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Section */}
          <div>
            <Label className="text-sm font-medium text-gray-600">Email Address</Label>
            <p className="text-gray-900 mt-1 mb-2">{user?.email}</p>
            <p className="text-xs text-gray-500">
              To change your email address, please contact support.
            </p>
          </div>

          <Separator />

          {/* Password Change Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-4 w-4" />
              <Label className="text-sm font-medium text-gray-900">Change Password</Label>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isChangingPassword || !newPassword || !confirmPassword}
                className="w-full sm:w-auto"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h3 className="font-medium text-red-900">Danger Zone</h3>
            </div>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. This will permanently delete your account, reviews, and favorites.
            </p>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
