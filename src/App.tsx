import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
const EbtChipCard = lazy(() => import("./pages/EbtChipCard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Support = lazy(() => import("./pages/Support"));
const SnapTips = lazy(() => import("./pages/SnapTips"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BenefitsCalculator = lazy(() => import("./pages/BenefitsCalculator"));
const TwitterCardPreview = lazy(() => import("./components/TwitterCardPreview"));
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

const GA_MEASUREMENT_ID = "G-W8FZZ54CKR";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <LoadingSpinner />
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
        <div className="flex-1 pb-28 md:pb-0 pt-[env(safe-area-inset-top)] md:pt-0">
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
              <Route path="/og-preview" element={<TwitterCardPreview />} />
              
              {/* City Pages - Dynamic route handles all cities */}
              <Route path="/los-angeles" element={<CityPage />} />
              <Route path="/new-york" element={<CityPage />} />
              <Route path="/brooklyn" element={<CityPage />} />
              <Route path="/chicago" element={<CityPage />} />
              <Route path="/houston" element={<CityPage />} />
              <Route path="/miami" element={<CityPage />} />
              <Route path="/atlanta" element={<CityPage />} />
              <Route path="/denver" element={<CityPage />} />
              <Route path="/seattle" element={<CityPage />} />
              <Route path="/boston" element={<CityPage />} />
              <Route path="/detroit" element={<CityPage />} />
              <Route path="/phoenix" element={<CityPage />} />
              <Route path="/philadelphia" element={<CityPage />} />
              <Route path="/san-antonio" element={<CityPage />} />
              <Route path="/san-diego" element={<CityPage />} />
              <Route path="/dallas" element={<CityPage />} />
              <Route path="/san-jose" element={<CityPage />} />
              <Route path="/austin" element={<CityPage />} />
              <Route path="/jacksonville" element={<CityPage />} />
              <Route path="/fort-worth" element={<CityPage />} />
              <Route path="/columbus" element={<CityPage />} />
              <Route path="/charlotte" element={<CityPage />} />
              <Route path="/san-francisco" element={<CityPage />} />
              <Route path="/fresno" element={<CityPage />} />
              <Route path="/indianapolis" element={<CityPage />} />
              <Route path="/sacramento" element={<CityPage />} />
              <Route path="/orlando" element={<CityPage />} />
              <Route path="/las-vegas" element={<CityPage />} />
              <Route path="/memphis" element={<CityPage />} />
              <Route path="/baltimore" element={<CityPage />} />
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
