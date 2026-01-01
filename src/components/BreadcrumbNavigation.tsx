
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ items }) => {
  const location = useLocation();
  
  // Generate breadcrumbs based on current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home
    breadcrumbs.push({ label: 'Home', href: '/' });

    // Process path segments
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      
      // Format segment label
      let label = segment;
      if (segment === 'search') {
        label = 'Store Search';
      } else if (segment === 'mission') {
        label = 'Our Mission';
      } else if (segment === 'favorites') {
        label = 'Favorites';
      } else if (segment === 'profile') {
        label = 'Profile';
      } else {
        // Format city names (e.g., 'chicago-ebt' -> 'Chicago')
        label = segment
          .replace('-ebt', '')
          .replace('-', ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      breadcrumbs.push({ label, href });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="bg-muted/30 border-b">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap overflow-x-auto">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              return (
                <React.Fragment key={`breadcrumb-${index}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="inline-flex items-center gap-1">
                        {index === 0 && <Home className="h-4 w-4" />}
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.href || '#'} className="inline-flex items-center gap-1 hover:text-foreground">
                          {index === 0 && <Home className="h-4 w-4" />}
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};
