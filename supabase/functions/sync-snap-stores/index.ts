
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

    // Process stores with more aggressive fetching to ensure we get all 264k+ records
    const CHUNK_SIZE = 10000; // Smaller chunks for better reliability
    let totalProcessed = 0;
    let offset = 0;
    let hasMore = true;
    let consecutiveEmptyChunks = 0;
    const maxEmptyChunks = 5; // Increased tolerance for empty chunks

    console.log('Target: ~264,290 records from USDA');

    while (hasMore && consecutiveEmptyChunks < maxEmptyChunks) {
      console.log(`Fetching chunk starting at offset ${offset}...`);
      console.log(`Progress: ${totalProcessed} records processed so far`);
      
      try {
        const chunk = await fetchAllStores(offset, CHUNK_SIZE);
        
        if (chunk.length === 0) {
          console.log(`Empty chunk at offset ${offset}`);
          consecutiveEmptyChunks++;
          
          // Try a few more offsets before giving up
          if (consecutiveEmptyChunks < maxEmptyChunks) {
            offset += CHUNK_SIZE;
            continue;
          } else {
            console.log(`Reached ${maxEmptyChunks} consecutive empty chunks, stopping`);
            break;
          }
        }

        console.log(`Processing ${chunk.length} stores from offset ${offset}...`);
        const insertedCount = await insertStoresInBatches(supabase, chunk);
        totalProcessed += insertedCount;
        consecutiveEmptyChunks = 0; // Reset counter on successful chunk
        
        console.log(`Batch completed. Inserted: ${insertedCount}, Total so far: ${totalProcessed}`);
        
        // Progress indicator
        const progressPercent = Math.round((totalProcessed / 264290) * 100);
        console.log(`Progress: ${progressPercent}% of expected 264,290 records`);
        
        offset += CHUNK_SIZE;

        // Add a small delay between chunks to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
        
        if (consecutiveEmptyChunks >= maxEmptyChunks) {
          console.log('Too many consecutive errors, stopping');
          break;
        }
        
        continue;
      }
    }

    console.log(`Sync completed. Total stores processed: ${totalProcessed}`);
    console.log(`Expected: 264,290 | Actual: ${totalProcessed} | Coverage: ${Math.round((totalProcessed / 264290) * 100)}%`);

    // If we got significantly fewer records than expected, log a warning
    if (totalProcessed < 200000) {
      console.warn(`WARNING: Only synced ${totalProcessed} out of expected 264,290 records`);
      console.warn('This may indicate API limits, network issues, or data access restrictions');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${totalProcessed} SNAP stores`,
        totalStores: totalProcessed,
        expectedStores: 264290,
        coveragePercent: Math.round((totalProcessed / 264290) * 100),
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
