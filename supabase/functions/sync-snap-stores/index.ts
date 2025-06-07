
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

    // Clear existing data first
    await clearExistingData(supabase);
    console.log('Cleared existing data');

    // Process stores in chunks to avoid memory issues
    const CHUNK_SIZE = 10000; // Process 10k stores at a time
    let totalProcessed = 0;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      console.log(`Fetching chunk starting at offset ${offset}...`);
      
      try {
        const chunk = await fetchAllStores(offset, CHUNK_SIZE);
        
        if (chunk.length === 0) {
          console.log('No more stores found, ending sync');
          hasMore = false;
          break;
        }

        console.log(`Processing ${chunk.length} stores...`);
        const insertedCount = await insertStoresInBatches(supabase, chunk);
        totalProcessed += insertedCount;
        
        console.log(`Processed chunk. Total so far: ${totalProcessed}`);
        
        // If we got fewer stores than requested, we're at the end
        if (chunk.length < CHUNK_SIZE) {
          hasMore = false;
        } else {
          offset += CHUNK_SIZE;
        }

        // Add a small delay between chunks to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (chunkError) {
        console.error(`Error processing chunk at offset ${offset}:`, chunkError);
        // Continue with next chunk instead of failing completely
        offset += CHUNK_SIZE;
        continue;
      }
    }

    console.log(`Successfully synced ${totalProcessed} SNAP stores`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${totalProcessed} SNAP stores`,
        totalStores: totalProcessed
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
