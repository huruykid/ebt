
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
    
    // Get auth token and verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - missing auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Create client with user auth to verify permissions
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - admin access required for CSV uploads' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    
    // Validate file type
    if (!csvFile.name.toLowerCase().endsWith('.csv')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid file type - must be a CSV file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate file size (max 50MB to prevent abuse)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (csvFile.size > maxSize) {
      return new Response(
        JSON.stringify({ success: false, error: 'File too large - maximum 50MB allowed' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate file is not empty
    if (csvFile.size === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'File is empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        error: 'An error occurred while processing the CSV file. Please try again later.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
