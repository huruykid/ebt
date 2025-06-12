
import React from 'react';
import { CreditCard, Utensils, Heart, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const EbtInfoSection: React.FC = () => {
  const benefits = [
    {
      icon: CreditCard,
      title: 'EBT/SNAP Accepted',
      description: 'All listed stores accept Electronic Benefit Transfer cards'
    },
    {
      icon: Utensils,
      title: 'Hot Foods Available',
      description: 'Some locations participate in the Restaurant Meals Program (RMP)'
    },
    {
      icon: Heart,
      title: 'Save Favorites',
      description: 'Keep track of your preferred stores for easy access'
    },
    {
      icon: CheckCircle,
      title: 'Verified Information',
      description: 'Store data is regularly updated from official sources'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">About EBT/SNAP Benefits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-success/10 p-2 rounded-lg">
                  <IconComponent className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
