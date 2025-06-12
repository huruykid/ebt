
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

    // Get URL parameters to support resuming from a specific offset
    const url = new URL(req.url);
    const startOffset = parseInt(url.searchParams.get('offset') || '0');
    const shouldClear = url.searchParams.get('clear') !== 'false';

    // Clear existing data only if this is a fresh start
    if (shouldClear && startOffset === 0) {
      await clearExistingData(supabase);
      console.log('Cleared existing data');
    }

    // Optimized parameters for better performance
    const CHUNK_SIZE = 5000; // Smaller chunks to avoid CPU timeout
    const MAX_RECORDS_PER_INVOCATION = 50000; // Limit per function call
    let totalProcessed = 0;
    let offset = startOffset;
    let hasMore = true;
    let consecutiveEmptyChunks = 0;
    const maxEmptyChunks = 3; // Reduced for faster detection

    console.log(`Target: ~264,290 records from USDA`);
    console.log(`Starting from offset: ${offset}`);

    while (hasMore && consecutiveEmptyChunks < maxEmptyChunks && totalProcessed < MAX_RECORDS_PER_INVOCATION) {
      console.log(`Fetching chunk starting at offset ${offset}...`);
      console.log(`Progress: ${startOffset + totalProcessed} total records processed so far`);
      
      try {
        const chunk = await fetchAllStores(offset, CHUNK_SIZE);
        
        if (chunk.length === 0) {
          console.log(`Empty chunk at offset ${offset}`);
          consecutiveEmptyChunks++;
          offset += CHUNK_SIZE;
          continue;
        }

        console.log(`Processing ${chunk.length} stores from offset ${offset}...`);
        const insertedCount = await insertStoresInBatches(supabase, chunk);
        totalProcessed += insertedCount;
        consecutiveEmptyChunks = 0;
        
        console.log(`Batch completed. Inserted: ${insertedCount}, Total this session: ${totalProcessed}`);
        
        // Progress indicator
        const totalSoFar = startOffset + totalProcessed;
        const progressPercent = Math.round((totalSoFar / 264290) * 100);
        console.log(`Progress: ${progressPercent}% of expected 264,290 records (${totalSoFar} total)`);
        
        offset += CHUNK_SIZE;

        // Add a small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (chunkError) {
        console.error(`Error processing chunk at offset ${offset}:`, chunkError);
        
        // If it's a critical error, stop completely
        if (chunkError.message.includes('CPU time limit exceeded') || 
            chunkError.message.includes('Function invocation timed out')) {
          console.log('Stopping due to timeout/CPU limit');
          break;
        }
        
        consecutiveEmptyChunks++;
        offset += CHUNK_SIZE;
        continue;
      }
    }

    const finalOffset = offset;
    const grandTotal = startOffset + totalProcessed;
    
    console.log(`Session completed. Records processed this session: ${totalProcessed}`);
    console.log(`Grand total processed: ${grandTotal} | Next offset: ${finalOffset}`);
    
    // Determine if more data is available
    const needsContinuation = grandTotal < 264290 && consecutiveEmptyChunks < maxEmptyChunks && totalProcessed === MAX_RECORDS_PER_INVOCATION;
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${totalProcessed} SNAP stores this session`,
        sessionStores: totalProcessed,
        totalStores: grandTotal,
        expectedStores: 264290,
        coveragePercent: Math.round((grandTotal / 264290) * 100),
        nextOffset: finalOffset,
        needsContinuation,
        continuationUrl: needsContinuation ? `${url.origin}${url.pathname}?offset=${finalOffset}&clear=false` : null
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
