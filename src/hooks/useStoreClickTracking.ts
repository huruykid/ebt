
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useStoreClickTracking = () => {
  const { user } = useAuth();

  const trackStoreClick = async (storeId: string, userLatitude: number, userLongitude: number) => {
    try {
      // Validate inputs
      if (!user?.id) {
        console.warn('User not authenticated for click tracking');
        return;
      }
      
      if (!storeId || typeof userLatitude !== 'number' || typeof userLongitude !== 'number') {
        console.warn('Invalid parameters for click tracking');
        return;
      }

      // Round coordinates to 3 decimals (~100m) to comply with DB constraint and protect privacy
      const roundedLat = Math.round(userLatitude * 1000) / 1000;
      const roundedLng = Math.round(userLongitude * 1000) / 1000;

      const { error } = await supabase
        .from('store_clicks')
        .insert({
          store_id: storeId,
          user_latitude: roundedLat,
          user_longitude: roundedLng,
          user_id: user.id,
        });

      if (error) {
        console.error('Error tracking store click:', error);
      }
    } catch (error) {
      console.error('Error tracking store click:', error);
    }
  };

  return { trackStoreClick };
};
