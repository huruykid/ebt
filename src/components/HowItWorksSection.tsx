import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Filter, Star, Navigation } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: MapPin,
      title: 'Enter Your Location',
      description: 'Search by ZIP code or use your current location to find EBT and SNAP-accepting stores, restaurants, and farmers markets near you.'
    },
    {
      icon: Filter,
      title: 'Filter by Store Type',
      description: 'Choose from grocery stores, convenience stores, supermarkets, farmers markets, or restaurants participating in the Restaurant Meals Program (RMP).'
    },
    {
      icon: Star,
      title: 'Read Reviews & Find Hours',
      description: 'Check community reviews, store hours, phone numbers, and directions before visiting. Save your favorite locations for quick access.'
    }
  ];

  return (
    <section className="py-12 px-6 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">How to Find EBT Stores Near You</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Locate SNAP-approved retailers in three simple steps. Our free tool makes it easy to find where you can use your EBT card for groceries, hot meals, and more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">Step {index + 1}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
