
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

    // Process stores in larger chunks but with more conservative approach
    const CHUNK_SIZE = 20000; // Larger chunks to reduce API calls
    let totalProcessed = 0;
    let offset = 0;
    let hasMore = true;
    let consecutiveEmptyChunks = 0;

    while (hasMore && consecutiveEmptyChunks < 3) {
      console.log(`Fetching chunk starting at offset ${offset}...`);
      
      try {
        const chunk = await fetchAllStores(offset, CHUNK_SIZE);
        
        if (chunk.length === 0) {
          console.log(`Empty chunk at offset ${offset}`);
          consecutiveEmptyChunks++;
          offset += CHUNK_SIZE;
          continue;
        }

        console.log(`Processing ${chunk.length} stores...`);
        const insertedCount = await insertStoresInBatches(supabase, chunk);
        totalProcessed += insertedCount;
        consecutiveEmptyChunks = 0; // Reset counter on successful chunk
        
        console.log(`Processed chunk. Total so far: ${totalProcessed}`);
        
        // If we got fewer stores than requested, we might be near the end
        // but continue to make sure we get everything
        if (chunk.length < CHUNK_SIZE) {
          console.log(`Chunk size ${chunk.length} < ${CHUNK_SIZE}, might be near end`);
        }
        
        offset += CHUNK_SIZE;

        // Add a small delay between chunks to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (chunkError) {
        console.error(`Error processing chunk at offset ${offset}:`, chunkError);
        
        // If it's a critical error, stop completely
        if (chunkError.message.includes('CPU time limit exceeded') || 
            chunkError.message.includes('Function invocation timed out')) {
          console.log('Stopping due to timeout/CPU limit');
          break;
        }
        
        // For other errors, try to continue with next chunk
        consecutiveEmptyChunks++;
        offset += CHUNK_SIZE;
        continue;
      }
    }

    console.log(`Successfully synced ${totalProcessed} SNAP stores`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${totalProcessed} SNAP stores`,
        totalStores: totalProcessed,
        finalOffset: offset
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
