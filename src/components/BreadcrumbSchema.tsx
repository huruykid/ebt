import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
  useEffect(() => {
    if (!items || items.length === 0) return;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://ebtfinder.org${item.url}`
      }))
    };

    // Remove existing breadcrumb schema
    const existingSchema = document.querySelector('#breadcrumb-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.id = 'breadcrumb-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const schemaElement = document.querySelector('#breadcrumb-schema');
      if (schemaElement) {
        schemaElement.remove();
      }
    };
  }, [items]);

  return null;
};