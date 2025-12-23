import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Utensils } from 'lucide-react';

export const SnapTipsSection: React.FC = () => {
  return (
    <section className="bg-white py-16 border-t" itemScope itemType="https://schema.org/Article">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="bg-white border-primary/20 shadow-lg">
          <CardContent className="p-8">
            <header className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Utensils className="h-8 w-8 text-primary" aria-hidden="true" />
                <h2 className="text-3xl font-bold text-foreground" itemProp="headline">
                  Maximize Your SNAP Benefits in 2025
                </h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6" itemProp="description">
                Discover money-saving programs, eligible items, and insider tips to get the most out of your EBT benefits. Learn about Double Up Food Bucks, Restaurant Meals Program, and 2025 policy updates.
              </p>
            </header>
            
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20" itemScope itemType="https://schema.org/HowTo">
              <div className="flex items-start gap-6">
                <div className="bg-primary/10 p-4 rounded-xl hidden sm:block" aria-hidden="true">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-3 text-xl" itemProp="name">
                    Complete 2025 SNAP Tips & Tricks Guide
                  </h3>
                  <div className="text-muted-foreground mb-4 space-y-2" itemProp="description">
                    <p itemProp="step" itemScope itemType="https://schema.org/HowToStep">
                      • <strong>Double Up Food Bucks:</strong> <span itemProp="text">Match your SNAP dollars on fresh produce up to $30 per day at participating farmers markets</span>
                    </p>
                    <p itemProp="step" itemScope itemType="https://schema.org/HowToStep">
                      • <strong>Surprising eligible items:</strong> <span itemProp="text">Purchase birthday cakes, coffee, seeds, plants, and frozen prepared meals with EBT</span>
                    </p>
                    <p itemProp="step" itemScope itemType="https://schema.org/HowToStep">
                      • <strong>Restaurant Meals Program:</strong> <span itemProp="text">Use EBT at participating restaurants in select states for prepared meals</span>
                    </p>
                    <p itemProp="step" itemScope itemType="https://schema.org/HowToStep">
                      • <strong>2025 policy updates:</strong> <span itemProp="text">New work requirements and benefit changes affecting eligibility</span>
                    </p>
                  </div>
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 shadow-md"
                  >
                    <a 
                      href="/snap-tips" 
                      className="flex items-center gap-2"
                      aria-label="View complete SNAP benefits guide and money-saving tips"
                      title="Complete 2025 SNAP Tips Guide - Double Up Food Bucks & More"
                    >
                      View Complete Guide
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Schema.org structured data for SNAP tips */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "How to Maximize Your SNAP Benefits in 2025",
              "description": "Complete guide to getting the most out of your EBT benefits including Double Up Food Bucks, eligible items, and policy updates",
              "image": "https://ebtfinder.org/ebt-logo.png",
              "totalTime": "PT10M",
              "supply": [{ "@type": "HowToSupply", "name": "EBT Card" }],
              "step": [
                { "@type": "HowToStep", "name": "Use Double Up Food Bucks Programs", "text": "Match your SNAP dollars on fresh produce up to $30 per day at participating farmers markets." },
                { "@type": "HowToStep", "name": "Know What You Can Buy", "text": "Purchase surprising eligible items like birthday cakes, coffee, seeds, plants with your EBT card." },
                { "@type": "HowToStep", "name": "Access Restaurant Meals Program", "text": "Use EBT at participating restaurants in select states if you qualify." },
                { "@type": "HowToStep", "name": "Stay Updated on Policy Changes", "text": "Be aware of 2025 policy updates including new work requirements." }
              ],
              "url": "https://ebtfinder.org/snap-tips"
            })
          }}
        />
      </div>
    </section>
  );
};
