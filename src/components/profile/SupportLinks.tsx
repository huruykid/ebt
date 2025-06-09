
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HelpCircle, MessageCircle, FileText, Shield, Mail, ExternalLink } from 'lucide-react';

export const SupportLinks: React.FC = () => {
  const supportItems = [
    {
      icon: HelpCircle,
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions about using EBT Finder',
      action: 'View FAQ',
      href: '#'
    },
    {
      icon: MessageCircle,
      title: 'Contact Support',
      description: 'Get help from our support team',
      action: 'Contact Us',
      href: 'mailto:support@ebtfinder.com'
    },
    {
      icon: FileText,
      title: 'User Guide',
      description: 'Learn how to get the most out of EBT Finder',
      action: 'View Guide',
      href: '#'
    }
  ];

  const legalItems = [
    {
      icon: Shield,
      title: 'Privacy Policy',
      description: 'Learn how we protect and use your data',
      action: 'View Policy',
      href: '#'
    },
    {
      icon: FileText,
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      action: 'View Terms',
      href: '#'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supportItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    {item.action}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legal & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {legalItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    {item.action}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Need more help?</span>
            </div>
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <Mail className="h-4 w-4" />
              Email Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
