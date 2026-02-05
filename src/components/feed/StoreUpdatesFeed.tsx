import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Camera, DollarSign, Lightbulb, Clock, MapPin, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStoreUpdates, StoreUpdate } from '@/hooks/useStoreUpdates';
import { useIPGeolocation } from '@/hooks/useIPGeolocation';

const UPDATE_ICONS: Record<StoreUpdate['update_type'], React.ReactNode> = {
  review: <MessageSquare className="h-4 w-4" />,
  photo: <Camera className="h-4 w-4" />,
  price: <DollarSign className="h-4 w-4" />,
  tip: <Lightbulb className="h-4 w-4" />,
  hours: <Clock className="h-4 w-4" />,
};

const UPDATE_COLORS: Record<StoreUpdate['update_type'], string> = {
  review: 'bg-blue-100 text-blue-700',
  photo: 'bg-purple-100 text-purple-700',
  price: 'bg-green-100 text-green-700',
  tip: 'bg-yellow-100 text-yellow-700',
  hours: 'bg-orange-100 text-orange-700',
};

interface StoreUpdatesFeedProps {
  storeId?: string;
  title?: string;
  limit?: number;
  showNearby?: boolean;
}

export const StoreUpdatesFeed: React.FC<StoreUpdatesFeedProps> = ({
  storeId,
  title = 'Recent Activity',
  limit = 20,
  showNearby = true,
}) => {
  const { data: ipData } = useIPGeolocation();
  
  const { updates, isLoading } = useStoreUpdates({
    storeId,
    limit,
    userLat: showNearby && ipData ? ipData.latitude : undefined,
    userLng: showNearby && ipData ? ipData.longitude : undefined,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No recent updates{showNearby ? ' in your area' : ''}. Be the first to contribute!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
          {showNearby && ipData && (
            <Badge variant="secondary" className="ml-auto text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Nearby
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="flex gap-3">
            <div className={`p-2 rounded-full ${UPDATE_COLORS[update.update_type]}`}>
              {UPDATE_ICONS[update.update_type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{update.title}</p>
                  {update.store && (
                    <Link
                      to={`/store/${update.store_id}`}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      {update.store.Store_Name} · {update.store.City}, {update.store.State}
                    </Link>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                </span>
              </div>
              {update.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {update.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
