
import React from 'react';
import { Phone, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GooglePlacesDetails {
  formatted_phone_number?: string;
  website?: string;
}

interface ContactInfoCardProps {
  googlePlacesData?: GooglePlacesDetails | null;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ googlePlacesData }) => {
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  if (!googlePlacesData?.formatted_phone_number && !googlePlacesData?.website) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {googlePlacesData.formatted_phone_number && (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-gray-900 font-medium">Phone</p>
              <a 
                href={`tel:${googlePlacesData.formatted_phone_number}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {formatPhoneNumber(googlePlacesData.formatted_phone_number)}
              </a>
            </div>
          </div>
        )}

        {googlePlacesData.website && (
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-gray-900 font-medium">Website</p>
              <a 
                href={googlePlacesData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Visit Website
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
