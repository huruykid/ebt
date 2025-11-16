import React from 'react';
import { MapPin, Store, Users, Shield } from 'lucide-react';

export const TrustSignalsSection: React.FC = () => {
  const stats = [
    {
      icon: Store,
      value: '300,000+',
      label: 'EBT-Accepting Stores',
      description: 'Nationwide coverage'
    },
    {
      icon: MapPin,
      value: '50 States',
      label: 'Complete US Coverage',
      description: 'All cities & ZIP codes'
    },
    {
      icon: Users,
      value: '15,000+',
      label: 'Community Reviews',
      description: 'Real user experiences'
    },
    {
      icon: Shield,
      value: 'Daily Updates',
      label: 'Verified Information',
      description: 'Official USDA data'
    }
  ];

  return (
    <section className="py-12 px-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            America's Largest EBT Store Directory
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trusted by thousands of SNAP recipients nationwide. Free, accurate, and always up to date.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
