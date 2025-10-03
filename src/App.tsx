
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { HeaderNavigation } from "@/components/HeaderNavigation";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SEOOptimizer } from "@/components/SEOOptimizer";
import { AdvancedSEO } from "@/components/AdvancedSEO";
import { RankingBooster } from "@/components/RankingBooster";
import { ComprehensiveSEO } from "@/components/ComprehensiveSEO";
import BlogHome from "./pages/BlogHome";
import Auth from "./pages/Auth";
import { EnhancedSearch } from "./pages/EnhancedSearch";
import StoreDetail from "./pages/StoreDetail";
import Mission from "./pages/Mission";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import CityPage from "./pages/CityPage";
import EbtChipCard from "./pages/EbtChipCard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Support from "./pages/Support";
import SnapTips from "./pages/SnapTips";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Recipes from "./pages/Recipes";
import BusinessResources from "./pages/BusinessResources";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});

// Replace this with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-W8FZZ54CKR";

const AppContent = () => {
  const navigate = useNavigate();

  const handleNavigate = (itemId: string) => {
    console.log('Navigate to:', itemId);
    switch (itemId) {
      case 'home':
        navigate('/');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'blog':
        navigate('/blog');
        break;
      case 'recipes':
        navigate('/recipes');
        break;
      case 'mission':
        navigate('/mission');
        break;
      case 'snap-tips':
        navigate('/snap-tips');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Advanced SEO and Ranking Optimizations */}
      <ComprehensiveSEO>
        <AdvancedSEO>
          <RankingBooster>
            <SEOOptimizer>
        {/* Google Analytics */}
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        
        {/* Header navigation - desktop and mobile */}
        <div className="hidden md:block">
          <HeaderNavigation onNavigate={handleNavigate} />
        </div>

        {/* Main content area with responsive bottom padding and top safe area */}
        <div className="flex-1 pb-28 md:pb-0 pt-[env(safe-area-inset-top)] md:pt-0">
          <Routes>
            <Route path="/" element={<BlogHome />} />
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
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/business-resources" element={<BusinessResources />} />
            
            {/* City Pages - Specific routes first, then catch-all */}
            <Route path="/los-angeles" element={<CityPage />} />
            <Route path="/chicago-ebt" element={<CityPage />} />
            <Route path="/houston" element={<CityPage />} />
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
            {/* Catch-all for any other city slugs */}
            <Route path="/:citySlug" element={<CityPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        
        {/* Fixed bottom navigation - mobile only */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          <BottomNavigation onNavigate={handleNavigate} />
        </div>
            </SEOOptimizer>
          </RankingBooster>
        </AdvancedSEO>
      </ComprehensiveSEO>
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
