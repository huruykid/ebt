
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

      // Use privacy-preserving RPC function
      // This function:
      // - Never stores user_id (anonymized via daily-rotating session hash)
      // - Rounds coordinates to ~1km precision
      // - Cannot be used to track individual users
      const { error } = await supabase.rpc('insert_store_click_anonymous', {
        p_store_id: storeId,
        p_latitude: userLatitude,
        p_longitude: userLongitude,
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
