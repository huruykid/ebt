import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action } = await req.json();

    if (action === 'analyze') {
      // Analyze current state
      const { data: storeStats } = await supabase.rpc('count', {
        sql: `
          SELECT 
            COUNT(*) as total_stores,
            COUNT(google_place_id) as stores_with_place_id,
            COUNT(CASE WHEN google_last_updated IS NULL AND google_place_id IS NOT NULL THEN 1 END) as never_updated,
            COUNT(CASE WHEN google_last_updated < NOW() - INTERVAL '30 days' THEN 1 END) as stale_data,
            COUNT(CASE WHEN google_rating IS NOT NULL THEN 1 END) as with_rating,
            COUNT(CASE WHEN google_photos IS NOT NULL THEN 1 END) as with_photos,
            COUNT(CASE WHEN google_opening_hours IS NOT NULL THEN 1 END) as with_hours
          FROM snap_stores
        `
      });

      const { count: cacheCount } = await supabase
        .from('google_places_cache')
        .select('*', { count: 'exact', head: true });

      return new Response(
        JSON.stringify({
          success: true,
          analysis: {
            storeStats,
            cacheEntries: cacheCount
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'sync_cache_to_stores') {
      // Transfer all cached data that hasn't been saved to stores
      const { data: cacheEntries, error: cacheError } = await supabase
        .from('google_places_cache')
        .select('*')
        .not('place_id', 'is', null);

      if (cacheError) throw cacheError;

      let synced = 0;
      let errors = 0;

      for (const cache of cacheEntries || []) {
        try {
          const businessData = cache.business_data as any;
          
          // Find store by matching search query info
          const searchParams = cache.search_query ? JSON.parse(cache.search_query) : null;
          
          if (businessData && cache.place_id) {
            // Update store with this Google Place ID
            const { error: updateError } = await supabase
              .from('snap_stores')
              .update({
                google_place_id: cache.place_id,
                google_name: businessData.name,
                google_formatted_address: businessData.formatted_address,
                google_website: businessData.website,
                google_formatted_phone_number: businessData.formatted_phone_number,
                google_rating: businessData.rating,
                google_user_ratings_total: businessData.user_ratings_total,
                google_opening_hours: businessData.opening_hours,
                google_photos: businessData.photos,
                google_types: businessData.types,
                google_price_level: businessData.price_level,
                google_geometry: businessData.geometry,
                google_business_status: businessData.business_status,
                google_vicinity: businessData.vicinity,
                google_reviews: businessData.reviews,
                google_last_updated: new Date().toISOString()
              })
              .eq('google_place_id', cache.place_id);

            if (!updateError) {
              synced++;
            } else {
              errors++;
              console.error('Update error:', updateError);
            }
          }
        } catch (err) {
          errors++;
          console.error('Sync error:', err);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          synced,
          errors,
          total: cacheEntries?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'export_all_data') {
      // Export all Google Places data to a downloadable format
      const { data: stores, error } = await supabase
        .from('snap_stores')
        .select(`
          id,
          Store_Name,
          google_place_id,
          google_name,
          google_formatted_address,
          google_website,
          google_formatted_phone_number,
          google_rating,
          google_user_ratings_total,
          google_opening_hours,
          google_photos,
          google_types,
          google_price_level,
          google_business_status,
          google_reviews,
          google_last_updated
        `)
        .not('google_place_id', 'is', null);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          exportedStores: stores?.length || 0,
          data: stores
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Preserve Google Data error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
