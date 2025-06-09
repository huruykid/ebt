
import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface FavoriteButtonProps {
  storeId: number;
  variant?: 'default' | 'icon';
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  storeId,
  variant = 'default',
  className = ''
}) => {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite, isToggling } = useFavorites();

  if (!user) {
    return null;
  }

  const favorited = isFavorited(storeId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(storeId);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isToggling}
        className={`p-2 rounded-full transition-colors hover:bg-gray-100 ${className}`}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          size={20}
          className={`transition-colors ${
            favorited 
              ? 'fill-red-500 stroke-red-500' 
              : 'stroke-gray-400 hover:stroke-red-500'
          }`}
        />
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isToggling}
      variant={favorited ? 'default' : 'outline'}
      size="sm"
      className={`${favorited ? 'bg-red-500 hover:bg-red-600' : 'border-red-500 text-red-500 hover:bg-red-50'} ${className}`}
    >
      <Heart
        size={16}
        className={`mr-2 ${favorited ? 'fill-white' : 'fill-none'}`}
      />
      {favorited ? 'Favorited' : 'Add to Favorites'}
    </Button>
  );
};
