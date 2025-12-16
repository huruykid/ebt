import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List } from 'lucide-react';
import DOMPurify from 'dompurify';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from sanitized HTML content (defense-in-depth)
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['id']
    });
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    
    const headingElements = tempDiv.querySelectorAll('h2, h3');
    const extractedHeadings: Heading[] = [];
    
    headingElements.forEach((heading, index) => {
      const id = `heading-${index}`;
      const level = parseInt(heading.tagName.charAt(1));
      extractedHeadings.push({
        id,
        text: heading.textContent || '',
        level
      });
    });

    setHeadings(extractedHeadings);

    // Add IDs to actual headings in the article
    setTimeout(() => {
      const articleHeadings = document.querySelectorAll('article h2, article h3');
      articleHeadings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }, 100);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    const headingElements = document.querySelectorAll('article h2, article h3');
    headingElements.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card className="sticky top-24 hidden lg:block">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <List className="h-4 w-4" />
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <nav>
          <ul className="space-y-2">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ marginLeft: `${(heading.level - 2) * 1}rem` }}
              >
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`text-sm text-left w-full hover:text-primary transition-colors ${
                    activeId === heading.id
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
}
