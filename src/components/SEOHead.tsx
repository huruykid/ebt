
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  structuredData?: object;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  structuredData,
  ogImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=630&fit=crop&auto=format",
  ogType = "website",
  twitterCard = "summary_large_image"
}) => {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updatePropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    if (description) {
      updateMetaTag('description', description);
      updatePropertyTag('og:description', description);
      updateMetaTag('twitter:description', description);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    if (title) {
      updatePropertyTag('og:title', title);
      updateMetaTag('twitter:title', title);
    }

    // Update Open Graph and Twitter meta tags
    updatePropertyTag('og:type', ogType);
    updatePropertyTag('og:image', ogImage);
    updatePropertyTag('og:image:width', '1200');
    updatePropertyTag('og:image:height', '630');
    updatePropertyTag('og:site_name', 'EBT Finder');
    updateMetaTag('twitter:card', twitterCard);
    updateMetaTag('twitter:image', ogImage);
    updatePropertyTag('og:url', canonicalUrl || window.location.href);

    // Update canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }

    // Add structured data
    if (structuredData) {
      const existingScript = document.querySelector('#structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, canonicalUrl, structuredData, ogImage, ogType, twitterCard]);

  return null;
};
