
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './constants.ts';
import { fetchAllStores } from './arcgis-fetcher.ts';
import { clearExistingData, insertStoresInBatches } from './database-operations.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting SNAP stores sync...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all data from ArcGIS API with pagination
    console.log('Fetching all data from ArcGIS with pagination...');
    const stores = await fetchAllStores();
    
    console.log(`Total stores fetched: ${stores.length}`);

    if (stores.length === 0) {
      console.log('No stores found in response');
      return new Response(
        JSON.stringify({ success: true, message: 'No data to sync' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear existing data
    await clearExistingData(supabase);

    // Insert new data in batches
    const insertedCount = await insertStoresInBatches(supabase, stores);

    console.log(`Successfully synced ${insertedCount} SNAP stores`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${insertedCount} SNAP stores`,
        totalStores: insertedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
