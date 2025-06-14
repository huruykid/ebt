
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFarmersMarketAnalysis = () => {
  return useQuery({
    queryKey: ['farmers-market-analysis'],
    queryFn: async () => {
      // Get all unique store types to analyze
      const { data: storeTypes, error: storeTypesError } = await supabase
        .from('snap_stores')
        .select('Store_Type')
        .not('Store_Type', 'is', null)
        .neq('Store_Type', '');

      if (storeTypesError) throw storeTypesError;

      // Get stores with "market" in the name
      const { data: marketStores, error: marketError } = await supabase
        .from('snap_stores')
        .select('Store_Name, Store_Type, City, State')
        .or('Store_Name.ilike.%market%,Store_Name.ilike.%farm%,Store_Name.ilike.%produce%')
        .limit(100);

      if (marketError) throw marketError;

      // Get unique store types containing market/farm/produce
      const uniqueStoreTypes = [...new Set(storeTypes.map(s => s.Store_Type))]
        .filter(type => type && (
          type.toLowerCase().includes('market') ||
          type.toLowerCase().includes('farm') ||
          type.toLowerCase().includes('produce')
        ))
        .sort();

      console.log('Potential farmers market store types:', uniqueStoreTypes);
      console.log('Sample market stores:', marketStores?.slice(0, 10));

      return {
        potentialStoreTypes: uniqueStoreTypes,
        sampleStores: marketStores || [],
        totalMarketStores: marketStores?.length || 0
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
