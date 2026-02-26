import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { IPGeolocationProvider } from "@/contexts/IPGeolocationContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { HeaderNavigation } from "@/components/HeaderNavigation";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SearchEngineOptimizer } from "@/components/SearchEngineOptimizer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SEO } from "@/components/SEO";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { GeoBlockingOverlay } from "@/components/GeoBlockingOverlay";
// Eagerly loaded - critical path
import Index from "./pages/Index";

// Lazy loaded - not needed on initial render
const Auth = lazy(() => import("./pages/Auth"));
const EnhancedSearch = lazy(() => import("./pages/EnhancedSearch").then(m => ({ default: m.EnhancedSearch })));
const StoreDetail = lazy(() => import("./pages/StoreDetail"));
const Mission = lazy(() => import("./pages/Mission"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const CityPage = lazy(() => import("./pages/CityPage"));
const StatePage = lazy(() => import("./pages/StatePage"));
const EbtChipCard = lazy(() => import("./pages/EbtChipCard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Support = lazy(() => import("./pages/Support"));
const SnapTips = lazy(() => import("./pages/SnapTips"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BenefitsCalculator = lazy(() => import("./pages/BenefitsCalculator"));

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-W8FZZ54CKR";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <LoadingSpinner message="Loading..." />
  </div>
);

const AppContent = () => {
  const navigate = useNavigate();

  const handleNavigate = (itemId: string) => {
    const routes: Record<string, string> = {
      'home': '/',
      'search': '/search',
      'mission': '/mission',
      'snap-tips': '/snap-tips',
      'blog': '/blog',
      'benefits-calculator': '/benefits-calculator',
      'profile': '/profile',
    };
    if (routes[itemId]) navigate(routes[itemId]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Geo-blocking overlay for non-US visitors */}
      <GeoBlockingOverlay />
      
      <SEO>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        <SearchEngineOptimizer />
        
        {/* Header navigation - desktop only */}
        <div className="hidden md:block">
          <HeaderNavigation onNavigate={handleNavigate} />
        </div>

        {/* Main content */}
        <div id="main-content" className="flex-1 pb-32 md:pb-0 pt-[env(safe-area-inset-top)] md:pt-0">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/search" element={<EnhancedSearch />} />
              <Route path="/store/:id" element={<StoreDetail />} />
              <Route path="/mission" element={<Mission />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ebt-chip-card" element={<EbtChipCard />} />
              <Route path="/support" element={<Support />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/snap-tips" element={<SnapTips />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/benefits-calculator" element={<BenefitsCalculator />} />
              
              
              {/* State Pages - All 50 states + DC */}
              <Route path="/state/:stateSlug" element={<StatePage />} />
              
              {/* City Pages - Single dynamic route */}
              <Route path="/city/:citySlug" element={<CityPage />} />
              
              
              {/* Explicit 404 route for SEO (returns proper 404 page) */}
              <Route path="/not-found" element={<NotFound />} />
              
              {/* Legacy city routes (e.g., /los-angeles) — CityPage handles redirect to /city/los-angeles */}
              <Route path="/:citySlug" element={<CityPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
        
        {/* Bottom navigation - mobile only */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          <BottomNavigation onNavigate={handleNavigate} />
        </div>
      </SEO>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <IPGeolocationProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </IPGeolocationProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
