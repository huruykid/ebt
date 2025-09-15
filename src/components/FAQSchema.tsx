import { useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export const FAQSchema: React.FC<FAQSchemaProps> = ({ faqs }) => {
  useEffect(() => {
    if (!faqs || faqs.length === 0) return;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    // Remove existing FAQ schema
    const existingSchema = document.querySelector('#faq-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.id = 'faq-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const schemaElement = document.querySelector('#faq-schema');
      if (schemaElement) {
        schemaElement.remove();
      }
    };
  }, [faqs]);

  return null;
};