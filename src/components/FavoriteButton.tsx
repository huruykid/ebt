
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

interface FavoriteButtonProps {
  storeId: string;
  variant?: 'default' | 'icon';
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  storeId,
  variant = 'default',
  className = ''
}) => {
  const { user, isGuest } = useAuth();
  const { isFavorited, toggleFavorite, isToggling } = useFavorites();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const favorited = user ? isFavorited(storeId) : false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user && !isGuest) {
      // Show login modal for non-authenticated users
      setShowLoginModal(true);
    } else if (!user && isGuest) {
      // Show login modal for guest users
      setShowLoginModal(true);
    } else {
      // User is authenticated, proceed with favorite toggle
      toggleFavorite(storeId);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/auth');
  };

  if (variant === 'icon') {
    return (
      <>
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

        <AlertDialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign in to save favorites</AlertDialogTitle>
              <AlertDialogDescription>
                Create an account or sign in to save this store to your favorites and access them anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Maybe later</AlertDialogCancel>
              <AlertDialogAction onClick={handleLoginRedirect}>
                Sign in
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
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

      <AlertDialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in to save favorites</AlertDialogTitle>
            <AlertDialogDescription>
              Create an account or sign in to save this store to your favorites and access them anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe later</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>
              Sign in
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
