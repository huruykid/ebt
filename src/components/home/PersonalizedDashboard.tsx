import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Sparkles, ChevronRight, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentlyViewedStores } from '@/hooks/useRecentlyViewedStores';
import { usePersonalizedRecommendations } from '@/hooks/usePersonalizedRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPoints } from '@/hooks/useUserPoints';
import { PointsDisplay, BadgesDisplay, StreakIndicator } from '@/components/gamification';
import type { Store } from '@/types/storeTypes';

interface MiniStoreCardProps {
  store: Store & { distance?: number };
  showDistance?: boolean;
}

const MiniStoreCard: React.FC<MiniStoreCardProps> = ({ store, showDistance }) => {
  return (
    <Link
      to={`/store/${store.id}`}
      className="block p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm text-foreground truncate">
            {store.Store_Name}
          </h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {store.City}, {store.State}
          </p>
          {showDistance && store.distance !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {store.distance.toFixed(1)} mi
              </span>
            </div>
          )}
        </div>
        {store.google_rating && (
          <Badge variant="secondary" className="text-xs shrink-0">
            ★ {store.google_rating.toFixed(1)}
          </Badge>
        )}
      </div>
      {store.Incentive_Program && (
        <Badge variant="default" className="mt-2 text-xs bg-primary/10 text-primary border-primary/20">
          {store.Incentive_Program}
        </Badge>
      )}
    </Link>
  );
};

const LoadingCard: React.FC = () => (
  <div className="p-3 rounded-lg border bg-card">
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  stores: (Store & { distance?: number })[];
  isLoading: boolean;
  emptyMessage: string;
  showDistance?: boolean;
  actionHref?: string;
  actionLabel?: string;
}

const DashboardSection: React.FC<SectionProps> = ({
  title,
  icon,
  stores,
  isLoading,
  emptyMessage,
  showDistance,
  actionHref,
  actionLabel,
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {actionHref && stores.length > 0 && (
            <Link to={actionHref}>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                {actionLabel}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <div className="space-y-2">
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : stores.length > 0 ? (
          <div className="space-y-2">
            {stores.slice(0, 3).map(store => (
              <MiniStoreCard key={store.id} store={store} showDistance={showDistance} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {emptyMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface PersonalizedDashboardProps {
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  latitude,
  longitude,
  className = '',
}) => {
  const { user } = useAuth();
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const { recentStores, isLoading: recentLoading } = useRecentlyViewedStores();
  const { recommendations, isLoading: recommendationsLoading, hasPreferences } = usePersonalizedRecommendations(latitude, longitude);
  const { trackDailyVisit, points } = useUserPoints();

  // Track daily visit when dashboard loads (awards 1 point per day)
  useEffect(() => {
    if (user) {
      trackDailyVisit.mutate();
    }
  }, [user]);

  // Don't show if user is not logged in
  if (!user) return null;

  // Extract stores from favorites
  const favoriteStores = favorites
    .map(f => f.snap_stores)
    .filter((s): s is Store => s !== null && s !== undefined);

  // Check if there's any personalized content
  const hasContent = favoriteStores.length > 0 || recentStores.length > 0 || recommendations.length > 0;
  const isLoading = favoritesLoading || recentLoading || recommendationsLoading;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Gamification Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Your Dashboard</h2>
          <Badge variant="outline" className="text-xs">Personalized</Badge>
        </div>
        <StreakIndicator />
      </div>

      {/* Points and Badges Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <PointsDisplay />
        <BadgesDisplay limit={5} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Favorites */}
        <DashboardSection
          title="Saved Stores"
          icon={<Heart className="h-4 w-4 text-red-500" />}
          stores={favoriteStores}
          isLoading={favoritesLoading}
          emptyMessage="No saved stores yet. Tap the heart on any store to save it!"
          actionHref="/favorites"
          actionLabel="View All"
        />

        {/* Recently Viewed */}
        <DashboardSection
          title="Recently Viewed"
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          stores={recentStores}
          isLoading={recentLoading}
          emptyMessage="No stores viewed recently. Start exploring!"
        />

        {/* Recommendations */}
        <DashboardSection
          title={hasPreferences ? 'For You' : 'Nearby & Popular'}
          icon={<Sparkles className="h-4 w-4 text-amber-500" />}
          stores={recommendations}
          isLoading={recommendationsLoading}
          emptyMessage="Enable location to get personalized recommendations"
          showDistance
        />
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
