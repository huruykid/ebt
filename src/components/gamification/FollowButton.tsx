import React from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStoreFollow } from '@/hooks/useStoreFollow';
import { useAuth } from '@/contexts/AuthContext';

interface FollowButtonProps {
  storeId: string;
  variant?: 'default' | 'icon';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  storeId,
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const { user } = useAuth();
  const { isFollowing, isLoading, toggleFollow, followStore, unfollowStore } = useStoreFollow(storeId);

  if (!user) return null;

  const isPending = followStore.isPending || unfollowStore.isPending;

  const handleClick = async () => {
    await toggleFollow(storeId);
  };

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClick}
              disabled={isLoading || isPending}
              className={`${isFollowing ? 'text-primary' : 'text-muted-foreground'} ${className}`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isFollowing ? (
                <Bell className="h-4 w-4 fill-current" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFollowing ? 'Following - Click to unfollow' : 'Follow for updates'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'outline'}
      size={size}
      onClick={handleClick}
      disabled={isLoading || isPending}
      className={className}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <Bell className="h-4 w-4 mr-2 fill-current" />
      ) : (
        <BellOff className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
