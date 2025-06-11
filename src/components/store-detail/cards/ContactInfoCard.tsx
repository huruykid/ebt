
import React from 'react';
import { Phone, Globe, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContactInfoCardProps {
  // Remove Google Places dependency
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = () => {
  const handleAddContact = () => {
    // TODO: Implement community contact info submission
    console.log('Community contact info submission coming soon');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <div className="flex justify-center gap-2 mb-3">
            <Phone className="h-6 w-6 text-muted-foreground" />
            <Globe className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Contact information not yet available</p>
          <p className="text-sm text-muted-foreground mb-4">
            Help the community by sharing contact details
          </p>
          <Button 
            onClick={handleAddContact}
            size="sm" 
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
