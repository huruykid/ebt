import { Skeleton } from '@/components/ui/skeleton';

export const StoreCardSkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-start gap-3">
      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-8 rounded-full" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </div>
      <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
    </div>
  </div>
);

export const StoreCardSkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <StoreCardSkeleton key={i} />
    ))}
  </div>
);
