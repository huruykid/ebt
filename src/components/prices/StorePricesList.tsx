import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, Tag, ThumbsUp, ThumbsDown, CheckCircle2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStorePrices } from '@/hooks/useStorePrices';
import { useAuth } from '@/contexts/AuthContext';
import { PriceReportForm } from './PriceReportForm';

interface StorePricesListProps {
  storeId: string;
  storeName: string;
}

export const StorePricesList: React.FC<StorePricesListProps> = ({
  storeId,
  storeName,
}) => {
  const { user } = useAuth();
  const { prices, isLoading, verifyPrice } = useStorePrices(storeId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Community Prices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Community Prices
        </CardTitle>
        <PriceReportForm storeId={storeId} storeName={storeName} />
      </CardHeader>
      <CardContent>
        {prices.length === 0 ? (
          <div className="text-center py-6">
            <DollarSign className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-2">No prices reported yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to help others by sharing prices!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {prices.map((price) => (
              <div
                key={price.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{price.product_name}</span>
                    {price.is_sale && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Tag className="h-3 w-3 mr-1" />
                        Sale
                      </Badge>
                    )}
                    {price.verified_count >= 3 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-primary">
                      ${price.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {price.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(price.reported_at), { addSuffix: true })}
                    </span>
                    {price.verified_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {price.verified_count} verified
                      </span>
                    )}
                  </div>
                </div>
                
                {user && (
                  <div className="flex gap-1 ml-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => verifyPrice.mutate({ priceId: price.id, isAccurate: true })}
                      disabled={verifyPrice.isPending}
                      title="Confirm this price"
                    >
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => verifyPrice.mutate({ priceId: price.id, isAccurate: false })}
                      disabled={verifyPrice.isPending}
                      title="Price is incorrect"
                    >
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
