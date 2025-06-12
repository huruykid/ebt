
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useStoreClickTracking = () => {
  const { user } = useAuth();

  const trackStoreClick = async (storeId: number, userLatitude: number, userLongitude: number) => {
    try {
      const { error } = await supabase
        .from('store_clicks')
        .insert({
          store_id: storeId.toString(),
          user_latitude: userLatitude,
          user_longitude: userLongitude,
          user_id: user?.id || null,
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
