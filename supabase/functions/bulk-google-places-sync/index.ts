import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GooglePlacesResponse {
  candidates?: Array<{
    place_id: string;
    name: string;
    formatted_address?: string;
    geometry?: {
      location: {
        lat: number;
        lng: number;
      }
    };
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: any;
    photos?: any[];
    formatted_phone_number?: string;
    website?: string;
    types?: string[];
    price_level?: number;
    business_status?: string;
  }>;
  status: string;
  error_message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { batch_size = 25 } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!googleApiKey) {
      throw new Error('Google Places API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🚀 Starting bulk sync with batch size: ${batch_size}`);

    // Get next batch of stores from the queue
    const { data: batchStores, error: batchError } = await supabase
      .rpc('get_next_sync_batch', { batch_size });

    if (batchError) {
      console.error('❌ Error getting batch:', batchError);
      throw batchError;
    }

    if (!batchStores || batchStores.length === 0) {
      console.log('✅ No more stores to process');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No more stores to process',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📋 Processing ${batchStores.length} stores`);

    let processed = 0;
    let failed = 0;
    const results = [];

    // Process each store in the batch
    for (const store of batchStores) {
      try {
        console.log(`🔍 Processing: ${store.store_name} (${store.city}, ${store.state})`);

        // First try to find existing cached data
        const { data: cached } = await supabase
          .from('google_places_cache')
          .select('*')
          .eq('search_query', `${store.store_name} ${store.store_address} ${store.city} ${store.state}`)
          .gt('cache_expires_at', new Date().toISOString())
          .maybeSingle();

        let businessData = null;

        if (cached && cached.business_data) {
          console.log(`📋 Using cached data for ${store.store_name}`);
          businessData = cached.business_data;
        } else {
          // Search Google Places API
          const searchQuery = `${store.store_name} ${store.store_address} ${store.city} ${store.state}`;
          const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,opening_hours,photos,formatted_phone_number,website,types,price_level,business_status&key=${googleApiKey}`;

          console.log(`🌐 Calling Google Places API for: ${store.store_name}`);
          
          const response = await fetch(searchUrl);
          const data: GooglePlacesResponse = await response.json();

          if (data.status !== 'OK' || !data.candidates || data.candidates.length === 0) {
            console.log(`⚠️ No results for: ${store.store_name}`);
            
            // Mark as failed in queue
            await supabase.rpc('update_sync_queue_status', {
              queue_id: store.queue_id,
              new_status: 'failed',
              error_msg: `No Google Places results: ${data.status}`
            });
            
            failed++;
            continue;
          }

          businessData = data.candidates[0];

          // Cache the result
          const cacheData = {
            search_query: searchQuery,
            place_id: businessData.place_id,
            business_data: businessData,
            cache_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          };

          await supabase
            .from('google_places_cache')
            .upsert(cacheData, {
              onConflict: 'search_query,place_id,params_hash,fields_hash',
              ignoreDuplicates: false
            });
        }

        // Update the store with Google Places data
        const updateData = {
          google_place_id: businessData.place_id,
          google_name: businessData.name,
          google_formatted_address: businessData.formatted_address,
          google_website: businessData.website,
          google_formatted_phone_number: businessData.formatted_phone_number,
          google_opening_hours: businessData.opening_hours ? JSON.stringify(businessData.opening_hours) : null,
          google_rating: businessData.rating,
          google_user_ratings_total: businessData.user_ratings_total,
          google_photos: businessData.photos ? JSON.stringify(businessData.photos) : null,
          google_types: businessData.types ? JSON.stringify(businessData.types) : null,
          google_price_level: businessData.price_level,
          google_business_status: businessData.business_status,
          google_last_updated: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('snap_stores')
          .update(updateData)
          .eq('id', store.store_id);

        if (updateError) {
          console.error(`❌ Error updating store ${store.store_name}:`, updateError);
          
          await supabase.rpc('update_sync_queue_status', {
            queue_id: store.queue_id,
            new_status: 'failed',
            error_msg: `Update error: ${updateError.message}`
          });
          
          failed++;
          continue;
        }

        // Mark as completed in queue
        await supabase.rpc('update_sync_queue_status', {
          queue_id: store.queue_id,
          new_status: 'completed'
        });

        processed++;
        results.push({
          store_name: store.store_name,
          place_id: businessData.place_id,
          rating: businessData.rating,
          status: 'success'
        });

        console.log(`✅ Updated: ${store.store_name} (${businessData.place_id})`);

        // Rate limiting - small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error processing ${store.store_name}:`, error);
        
        await supabase.rpc('update_sync_queue_status', {
          queue_id: store.queue_id,
          new_status: 'failed',
          error_msg: error.message
        });
        
        failed++;
      }
    }

    // Get remaining queue stats
    const { data: queueStats } = await supabase
      .from('google_places_sync_queue')
      .select('status')
      .in('status', ['pending', 'processing']);

    const remaining = queueStats?.length || 0;

    console.log(`📊 Batch complete: ${processed} processed, ${failed} failed, ${remaining} remaining`);

    return new Response(JSON.stringify({
      success: true,
      processed,
      failed,
      remaining,
      batch_size: batchStores.length,
      results: results.slice(0, 5) // Show first 5 results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Bulk sync error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});