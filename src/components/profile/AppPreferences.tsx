
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, MapPin } from 'lucide-react';

export const AppPreferences: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4" />
              <Label className="text-sm font-medium text-gray-900">Notifications</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-gray-500">
                    Receive updates about new stores and app features
                  </p>
                </div>
                <Switch id="email-notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="favorite-updates" className="text-sm font-medium">
                    Favorite Store Updates
                  </Label>
                  <p className="text-xs text-gray-500">
                    Get notified when your favorite stores have updates
                  </p>
                </div>
                <Switch id="favorite-updates" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4" />
              <Label className="text-sm font-medium text-gray-900">Location Settings</Label>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-radius" className="text-sm font-medium">
                  Default Search Radius
                </Label>
                <Select defaultValue="10">
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select search radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 miles</SelectItem>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="25">25 miles</SelectItem>
                    <SelectItem value="50">50 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-location" className="text-sm font-medium">
                    Auto-detect Location
                  </Label>
                  <p className="text-xs text-gray-500">
                    Automatically use your current location for searches
                  </p>
                </div>
                <Switch id="auto-location" defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          {/* Display Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4" />
              <Label className="text-sm font-medium text-gray-900">Display</Label>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="results-per-page" className="text-sm font-medium">
                  Results Per Page
                </Label>
                <Select defaultValue="20">
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select number of results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 results</SelectItem>
                    <SelectItem value="20">20 results</SelectItem>
                    <SelectItem value="50">50 results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-distance" className="text-sm font-medium">
                    Show Distance in Results
                  </Label>
                  <p className="text-xs text-gray-500">
                    Display distance from your location in search results
                  </p>
                </div>
                <Switch id="show-distance" defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
