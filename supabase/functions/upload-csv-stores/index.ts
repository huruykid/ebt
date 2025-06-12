
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseCSV } from './csv-parser.ts';
import { transformCSVRow } from './data-transformer.ts';
import { clearExistingData, insertStoresInBatches } from './database-operations.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting CSV upload and processing...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse multipart form data
    const formData = await req.formData();
    const csvFile = formData.get('csv') as File;
    
    if (!csvFile) {
      return new Response(
        JSON.stringify({ success: false, error: 'No CSV file provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing CSV file: ${csvFile.name} (${csvFile.size} bytes)`);

    // Read and parse CSV content
    const csvText = await csvFile.text();
    const csvRows = parseCSV(csvText);
    
    if (csvRows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'CSV file is empty or invalid' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Parsed ${csvRows.length} rows from CSV`);

    // Transform CSV rows to match database schema
    const transformedStores = csvRows.map(transformCSVRow).filter(store => store.store_name);
    
    console.log(`Transformed ${transformedStores.length} valid store records`);

    // Clear existing data
    await clearExistingData(supabase);

    // Insert new data in batches
    const insertedCount = await insertStoresInBatches(supabase, transformedStores);

    // Store CSV file in bucket for reference
    const fileName = `stores_${Date.now()}_${csvFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('csv-uploads')
      .upload(fileName, csvFile);

    if (uploadError) {
      console.warn('Failed to store CSV file:', uploadError.message);
    } else {
      console.log(`CSV file stored as: ${fileName}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed CSV and imported ${insertedCount} stores`,
        totalStores: insertedCount,
        fileName: uploadError ? null : fileName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('CSV processing error:', error);
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
