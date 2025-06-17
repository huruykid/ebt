
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { HeaderNavigation } from "@/components/HeaderNavigation";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StoreSearch from "./pages/StoreSearch";
import StoreDetail from "./pages/StoreDetail";
import Mission from "./pages/Mission";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Replace this with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

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
      case 'mission':
        navigate('/mission');
        break;
      case 'favorites':
        navigate('/favorites');
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
      {/* Google Analytics */}
      <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
      
      {/* Header navigation - desktop and mobile */}
      <div className="hidden md:block">
        <HeaderNavigation onNavigate={handleNavigate} />
      </div>

      {/* Main content area with responsive bottom padding */}
      <div className="flex-1 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/search" element={<StoreSearch />} />
          <Route path="/store/:id" element={<StoreDetail />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      {/* Fixed bottom navigation - mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <BottomNavigation onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

const App = () => (
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
);

export default App;
