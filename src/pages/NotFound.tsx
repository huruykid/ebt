import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from '@/components/SEOHead';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Set 404 status for SEO
    if (typeof window !== 'undefined' && window.history) {
      const statusMeta = document.createElement('meta');
      statusMeta.name = 'http-status';
      statusMeta.content = '404';
      document.head.appendChild(statusMeta);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SEOHead
        title="Page Not Found | EBT Finder"
        description="The page you're looking for doesn't exist. Find EBT and SNAP-accepting stores with EBT Finder."
        keywords="404, page not found, EBT stores, SNAP benefits"
        canonicalUrl="https://ebtfinder.org/404"
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
