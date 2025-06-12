
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../sync-snap-stores/constants.ts';

interface CSVRow {
  [key: string]: string;
}

interface TransformedStore {
  record_id?: string;
  object_id?: string;
  store_name: string;
  store_street_address?: string;
  additional_address?: string;
  city?: string;
  county?: string;
  state?: string;
  zip_code?: string;
  zip4?: string;
  latitude?: number;
  longitude?: number;
  x?: number;
  y?: number;
  grantee_name?: string;
  store_type?: string;
  incentive_program?: string;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }
  
  return rows;
}

function transformCSVRow(row: CSVRow): TransformedStore {
  // Transform CSV row to match snap_stores table structure
  // Adjust field mappings based on your CSV structure
  return {
    record_id: row.RECORDID || row.record_id || undefined,
    object_id: row.OBJECTID || row.object_id || undefined,
    store_name: row.STORENAME || row.store_name || row.name || '',
    store_street_address: row.ADDRESS || row.store_street_address || row.address || undefined,
    additional_address: row.ADDRESS2 || row.additional_address || undefined,
    city: row.CITY || row.city || undefined,
    county: row.COUNTY || row.county || undefined,
    state: row.STATE || row.state || undefined,
    zip_code: row.ZIP || row.zip_code || row.zipcode || undefined,
    zip4: row.ZIP4 || row.zip4 || undefined,
    latitude: row.LATITUDE || row.latitude || row.lat ? parseFloat(row.LATITUDE || row.latitude || row.lat) : undefined,
    longitude: row.LONGITUDE || row.longitude || row.lng || row.lon ? parseFloat(row.LONGITUDE || row.longitude || row.lng || row.lon) : undefined,
    x: row.X || row.x ? parseFloat(row.X || row.x) : undefined,
    y: row.Y || row.y ? parseFloat(row.Y || row.y) : undefined,
    grantee_name: row.GRANTEENAME || row.grantee_name || undefined,
    store_type: row.STORETYPE || row.store_type || undefined,
    incentive_program: row.INCENTIVEPROGRAM || row.incentive_program || undefined,
  };
}

async function clearExistingData(supabase: any): Promise<void> {
  console.log('Clearing existing data...');
  
  // Clear dependent tables first
  console.log('Clearing store_clicks...');
  const { error: clicksError } = await supabase
    .from('store_clicks')
    .delete()
    .gte('clicked_at', '1900-01-01');

  if (clicksError) {
    console.warn('Warning: Could not clear store_clicks:', clicksError.message);
  }
  
  console.log('Clearing favorites...');
  const { error: favoritesError } = await supabase
    .from('favorites')
    .delete()
    .gte('created_at', '1900-01-01');

  if (favoritesError) {
    console.warn('Warning: Could not clear favorites:', favoritesError.message);
  }
  
  // Clear main stores table
  console.log('Clearing snap_stores...');
  const { error: deleteError } = await supabase
    .from('snap_stores')
    .delete()
    .gte('id', 0);

  if (deleteError) {
    throw new Error(`Failed to clear existing data: ${deleteError.message}`);
  }
  
  console.log('Successfully cleared existing data');
}

async function insertStoresInBatches(supabase: any, stores: TransformedStore[]): Promise<number> {
  const batchSize = 500;
  let insertedCount = 0;
  
  console.log(`Starting batch insert of ${stores.length} stores...`);
  
  for (let i = 0; i < stores.length; i += batchSize) {
    const batch = stores.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(stores.length / batchSize);
    
    console.log(`Inserting batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);
    
    try {
      const { error: insertError } = await supabase
        .from('snap_stores')
        .insert(batch);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to insert batch ${batchNumber}: ${insertError.message}`);
      }
      
      insertedCount += batch.length;
      console.log(`Successfully inserted batch ${batchNumber}. Total inserted: ${insertedCount}`);
      
      // Small delay between batches
      if (i + batchSize < stores.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
    } catch (error) {
      console.error(`Error inserting batch ${batchNumber}:`, error);
      throw error;
    }
  }

  console.log(`Completed batch insert. Total records inserted: ${insertedCount}`);
  return insertedCount;
}

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
