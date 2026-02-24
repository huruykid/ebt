import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQSchema } from '@/components/FAQSchema';

interface CityFAQSectionProps {
  cityName: string;
  stateName: string;
}

export const CityFAQSection: React.FC<CityFAQSectionProps> = ({ cityName, stateName }) => {
  const location = `${cityName}, ${stateName}`;

  const faqs = [
    {
      id: 'places-accept-ebt',
      question: `What places accept EBT in ${location}?`,
      answer: `Grocery stores, supermarkets, convenience stores, farmers markets, and select restaurants in ${cityName} accept EBT and SNAP benefits. Major chains like Walmart, Kroger, ALDI, and local independent grocers are common options. Use the search above to find all EBT-accepting locations near you in ${location} with hours, directions, and ratings.`,
    },
    {
      id: 'restaurants-accept-ebt',
      question: `What restaurants accept EBT in ${location}?`,
      answer: `Restaurants in ${cityName} that accept EBT participate in the Restaurant Meals Program (RMP), which serves elderly (60+), disabled, or homeless SNAP recipients. Fast-food chains and local diners may qualify depending on ${stateName}'s participation. Search above to see RMP-eligible restaurants near you in ${location}.`,
    },
    {
      id: 'buy-food-ebt',
      question: `Where can I buy food with EBT in ${location}?`,
      answer: `You can buy groceries, fruits, vegetables, meat, dairy, bread, and other SNAP-eligible food items at hundreds of stores in ${cityName}. This includes supermarkets, warehouse clubs like Costco and Sam's Club, dollar stores, and ethnic grocery stores. Search by ZIP code above to find the closest EBT food stores in ${location}.`,
    },
    {
      id: 'find-ebt-stores',
      question: `How do I find EBT stores near me in ${location}?`,
      answer: `Use the EBT Finder search above to locate stores near you in ${cityName}. Enter your ZIP code or allow location access to see nearby stores sorted by distance. You can filter by store type, view hours of operation, and get directions — all free and updated daily.`,
    },
    {
      id: 'grocery-stores-ebt',
      question: `Which grocery stores accept EBT in ${location}?`,
      answer: `Most major grocery chains in ${cityName} accept EBT, including Walmart, Target, Kroger, Safeway, ALDI, Trader Joe's, and Whole Foods. Many local and independent grocery stores also accept SNAP benefits. Search above to see the full list of grocery stores accepting EBT in ${location} with real-time hours and ratings.`,
    },
    {
      id: 'farmers-market-ebt',
      question: `Can I use EBT at farmers markets in ${location}?`,
      answer: `Yes, many farmers markets in ${cityName} accept EBT and SNAP benefits. Some markets also offer SNAP matching programs that double your benefits for fresh produce purchases. Look for farmers markets in the search results above, or search "farmers market" to find participating locations in ${location}.`,
    },
  ];

  const schemaFaqs = faqs.map(f => ({ question: f.question, answer: f.answer }));

  return (
    <div className="bg-muted/50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            EBT & SNAP FAQ for {location}
          </h2>
          <p className="text-muted-foreground">
            Answers to the most common questions about using EBT in {cityName}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border-b border-border/50">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {faq.question}
                </h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <FAQSchema faqs={schemaFaqs} />
    </div>
  );
};
