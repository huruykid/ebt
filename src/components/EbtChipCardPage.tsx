
import React, { useState } from 'react';
import { ZipCodeSearch } from '@/components/ZipCodeSearch';
import { FAQSection } from '@/components/FAQSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Shield, CheckCircle, MapPin, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeString, isValidEmail } from '@/utils/security';

export const EbtChipCardPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleZipSearch = (zipCode: string) => {
    console.log('ZIP search:', zipCode);
    setZipCode(zipCode);
    setIsSearchActive(true);
    // This will integrate with your existing search functionality
    toast.success(`Searching for EBT chip card accepting stores in ${zipCode}`);
  };

  const handleClearSearch = () => {
    setZipCode('');
    setIsSearchActive(false);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedEmail = sanitizeString(email);
    
    if (!isValidEmail(sanitizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // For now, just show success message - backend integration will come later
    setEmailSubmitted(true);
    toast.success('Thanks! We\'ll notify you when chip cards roll out in your area.');
    setEmail('');
  };

  const chipCardFaqs = [
    {
      id: 'what-is-ebt-chip-card',
      question: 'What is an EBT chip card?',
      answer: 'An EBT chip card is the new, more secure version of your SNAP benefits card. Instead of a magnetic stripe, it has a small computer chip that provides better protection against fraud and unauthorized use. The chip card works the same way as your old EBT card - you insert it instead of swiping, enter your PIN, and use your benefits normally.'
    },
    {
      id: 'why-switch-to-chip',
      question: 'Why did EBT switch to chip cards?',
      answer: 'EBT programs switched to chip cards to improve security and reduce fraud. Chip cards are much harder to counterfeit than magnetic stripe cards. The chip creates a unique transaction code each time you use it, making it nearly impossible for criminals to steal and reuse your card information. This protects both your benefits and the integrity of government assistance programs.'
    },
    {
      id: 'do-all-stores-accept-chip',
      question: 'Do all stores accept EBT chip cards yet?',
      answer: 'Most major retailers and grocery stores now accept EBT chip cards, but some older card readers may only work with magnetic stripe cards. If you encounter a store that can\'t process your chip card, ask them to try swiping it instead - most chip cards still have the magnetic stripe as a backup. The rollout is ongoing, and more stores are upgrading their systems regularly.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg">
                <CreditCard className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Find Stores That Accept the New EBT Chip Cards
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Search stores by ZIP code to see which locations near you accept the new EBT chip cards. 
              Our database is updated daily with the latest store information.
            </p>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900 dark:text-white">More Secure</span>
              </div>
              <div className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900 dark:text-white">Fraud Protection</span>
              </div>
              <div className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <MapPin className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-900 dark:text-white">Updated Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About EBT Chip Cards Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              What You Need to Know About EBT Chip Cards
            </h2>
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                The new EBT chip card represents a significant upgrade in payment security for SNAP benefits recipients. 
                Unlike traditional magnetic stripe cards, chip cards contain a small computer chip that generates unique 
                transaction codes, making them virtually impossible to counterfeit or clone.
              </p>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                This transition to chip technology is part of a nationwide effort to protect SNAP benefits from fraud 
                and ensure that assistance reaches those who need it most. The rollout is happening state by state, 
                with many locations already accepting the new format. While most major retailers have upgraded their 
                systems, some smaller stores may still be in the process of updating their card readers.
              </p>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Using your new chip card is simple: insert it into the card reader (chip end first), wait for the 
                prompt, enter your PIN, and complete your transaction. The chip card works at all the same locations 
                as your previous EBT card, with the added benefit of enhanced security and fraud protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ZIP Code Search Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
              Find EBT Chip Card Stores Near You
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Enter your ZIP code to discover which stores in your area accept the new EBT chip cards
            </p>
            
            <ZipCodeSearch
              onZipSearch={handleZipSearch}
              onClearSearch={handleClearSearch}
              isSearchActive={isSearchActive}
              activeZip={zipCode}
            />
          </div>
        </div>
      </div>

      {/* Email Capture Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Mail className="h-12 w-12 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Want to Know When Your State Rolls Out Chip Cards?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Get alerts when new stores near you start accepting the chip card format. 
              We'll keep you updated on the latest rollout information.
            </p>
            
            {!emailSubmitted ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white"
                  required
                />
                <Button type="submit" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Alerts
                </Button>
              </form>
            ) : (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold">Thanks for signing up!</p>
                  <p className="text-gray-600 text-sm mt-2">
                    We'll notify you when chip cards roll out in your area.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* State-Specific Info Section (Placeholder) */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              State-Specific EBT Chip Card Information
            </h2>
            
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  Coming Soon: State-by-State Rollout Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  We're working on comprehensive state-specific information about EBT chip card rollouts, 
                  participating stores, and implementation timelines. Check back soon for detailed updates 
                  about your state's progress.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              EBT Chip Card Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Get answers to common questions about the new EBT chip cards
            </p>
          </div>
          
          <div className="space-y-4">
            {chipCardFaqs.map((faq) => (
              <Card key={faq.id} className="border border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
