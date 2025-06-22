
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      id: 'rmp-hot-meals',
      question: 'How do I know if a store accepts EBT hot meals (RMP)?',
      answer: 'The Restaurant Meals Program (RMP) allows elderly (60+), disabled, or homeless individuals to use EBT benefits for hot prepared meals. Look for stores marked with "RMP Eligible" or "Hot Food Program" tags in our search results. Participating states include California, Arizona, Michigan, Maryland, Virginia, and Rhode Island. You must qualify for RMP through your state\'s SNAP office to use this benefit.'
    },
    {
      id: 'corner-stores-gas-stations',
      question: 'Can I use EBT at corner stores or gas stations?',
      answer: 'Yes, many corner stores, convenience stores, and some gas stations accept EBT for eligible food items. However, you can only purchase SNAP-approved foods like bread, milk, fruits, vegetables, meat, and other groceries. You cannot use EBT for hot prepared foods (unless RMP eligible), alcohol, tobacco, or non-food items like gas or household supplies.'
    },
    {
      id: 'ebt-vs-chip-cards',
      question: 'What\'s the difference between regular EBT and EBT chip cards?',
      answer: 'EBT chip cards are newer, more secure versions of traditional magnetic stripe EBT cards. Chip cards provide better fraud protection and work the same way as your old EBT card - just insert instead of swipe. All benefits, PIN numbers, and eligible purchases remain exactly the same. If your state has upgraded to chip cards, your old magnetic stripe card will eventually stop working, so request a replacement from your SNAP office.'
    },
    {
      id: 'find-farmers-markets',
      question: 'Can I use EBT at farmers markets?',
      answer: 'Yes, many farmers markets across the U.S. accept EBT and SNAP benefits. Some markets even offer matching programs that double your SNAP dollars for fresh produce purchases. Look for farmers markets in our search results or search specifically for "farmers market" in your area. You\'ll typically swipe your EBT card at a central booth and receive tokens or vouchers to use with individual vendors.'
    },
    {
      id: 'online-ebt-shopping',
      question: 'Can I shop online with EBT benefits?',
      answer: 'Yes, several major retailers now accept EBT for online grocery orders, including Amazon, Walmart, Target, and many regional chains. You can use EBT to pay for eligible food items, but delivery fees must be paid with another payment method. Look for "Online EBT" or "EBT Online" indicators in our store listings, or check directly with retailers about their online EBT policies.'
    }
  ];

  return (
    <div className="bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Get answers to common questions about using EBT and SNAP benefits
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
    </div>
  );
};
