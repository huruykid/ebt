
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

      // Get stores that look like farmers markets (more precise filtering)
      const { data: farmersMarkets, error: farmersError } = await supabase
        .from('snap_stores')
        .select('Store_Name, Store_Type, City, State')
        .or('Store_Name.ilike.%farmers market%,Store_Name.ilike.%farmer\'s market%,Store_Name.ilike.%farm market%,Store_Type.ilike.%farmers market%')
        .limit(100);

      if (farmersError) throw farmersError;

      // Get grocery stores that might be confused for farmers markets
      const { data: groceryStores, error: groceryError } = await supabase
        .from('snap_stores')
        .select('Store_Name, Store_Type, City, State')
        .or('Store_Name.ilike.%whole foods%,Store_Name.ilike.%fresh market%,Store_Name.ilike.%food market%')
        .limit(50);

      if (groceryError) throw groceryError;

      // Get unique store types containing market/farm/produce
      const farmersMarketTypes = [...new Set(storeTypes.map(s => s.Store_Type))]
        .filter(type => type && (
          type.toLowerCase().includes('farmers market') ||
          type.toLowerCase().includes('farm market')
        ))
        .sort();

      const groceryMarketTypes = [...new Set(storeTypes.map(s => s.Store_Type))]
        .filter(type => type && (
          type.toLowerCase().includes('market') &&
          !type.toLowerCase().includes('farmers') &&
          !type.toLowerCase().includes('farm market')
        ))
        .sort();

      console.log('True farmers market store types:', farmersMarketTypes);
      console.log('Grocery market store types (not farmers markets):', groceryMarketTypes);
      console.log('Sample farmers markets:', farmersMarkets?.slice(0, 10));
      console.log('Sample grocery stores with "market":', groceryStores?.slice(0, 10));

      return {
        farmersMarketTypes,
        groceryMarketTypes,
        sampleFarmersMarkets: farmersMarkets || [],
        sampleGroceryStores: groceryStores || [],
        totalFarmersMarkets: farmersMarkets?.length || 0,
        totalGroceryStores: groceryStores?.length || 0
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
