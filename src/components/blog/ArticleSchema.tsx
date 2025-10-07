import { useEffect } from 'react';
import type { BlogPostWithCategory } from '@/types/blogTypes';

interface ArticleSchemaProps {
  post: BlogPostWithCategory;
}

export function ArticleSchema({ post }: ArticleSchemaProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.meta_description || post.excerpt || '',
      "image": post.featured_image || '',
      "datePublished": post.published_at || post.created_at,
      "dateModified": post.updated_at,
      "author": {
        "@type": "Organization",
        "name": post.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "EBT Finder",
        "logo": {
          "@type": "ImageObject",
          "url": "https://ebtfinder.com/primary-logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://ebtfinder.com/blog/${post.slug}`
      },
      "articleSection": post.blog_categories?.name || "SNAP Benefits",
      "keywords": post.blog_categories?.name || "SNAP, EBT, food assistance"
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    script.id = 'article-schema';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('article-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [post]);

  return null;
}
