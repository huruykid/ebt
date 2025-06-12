
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../sync-snap-stores/constants.ts';

interface CSVRow {
  [key: string]: string;
}

interface TransformedStore {
  object_id: string;
  record_id: string;
  store_name: string;
  store_type: string;
  store_street_address: string;
  additional_address: string;
  city: string;
  state: string;
  zip_code: string;
  zip4: string;
  county: string;
  longitude: number;
  latitude: number;
  x: number;
  y: number;
  grantee_name: string;
  incentive_program: string;
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
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

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function transformCSVRow(row: CSVRow): TransformedStore | null {
  // Map common CSV column names to our expected format
  const storeName = row['Store_Name'] || row['Store Name'] || row['STORE_NAME'] || '';
  const storeType = row['Store_Type'] || row['Store Type'] || row['STORE_TYPE'] || '';
  const address = row['Store_Street_Address'] || row['Address'] || row['STORE_ADDRESS'] || '';
  const city = row['City'] || row['CITY'] || '';
  const state = row['State'] || row['STATE'] || '';
  const zipCode = row['Zip_Code'] || row['Zip Code'] || row['ZIP_CODE'] || '';

  // Skip rows without essential data
  if (!storeName || !city || !state) {
    return null;
  }

  return {
    object_id: row['OBJECTID'] || row['Object_ID'] || '',
    record_id: row['Record_ID'] || row['RECORD_ID'] || '',
    store_name: storeName,
    store_type: storeType,
    store_street_address: address,
    additional_address: row['Additonal_Address'] || row['Additional_Address'] || '',
    city: city,
    state: state,
    zip_code: zipCode,
    zip4: row['Zip4'] || row['ZIP4'] || '',
    county: row['County'] || row['COUNTY'] || '',
    longitude: parseFloat(row['Longitude'] || row['LONGITUDE'] || '0') || 0,
    latitude: parseFloat(row['Latitude'] || row['LATITUDE'] || '0') || 0,
    x: parseFloat(row['X'] || '0') || 0,
    y: parseFloat(row['Y'] || '0') || 0,
    grantee_name: row['Grantee_Name'] || row['GRANTEE_NAME'] || '',
    incentive_program: row['Incentive_Program'] || row['INCENTIVE_PROGRAM'] || '',
  };
}

async function clearExistingData(supabase: any): Promise<void> {
  console.log('Clearing existing data...');
  
  // Clear dependent tables first
  const { error: clicksError } = await supabase
    .from('store_clicks')
    .delete()
    .gte('clicked_at', '1900-01-01');

  if (clicksError) {
    console.warn('Warning: Could not clear store_clicks:', clicksError.message);
  }
  
  const { error: favoritesError } = await supabase
    .from('favorites')
    .delete()
    .gte('created_at', '1900-01-01');

  if (favoritesError) {
    console.warn('Warning: Could not clear favorites:', favoritesError.message);
  }
  
  // Clear main table
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
  const batchSize = 1000;
  let insertedCount = 0;
  
  console.log(`Starting batch insert of ${stores.length} stores...`);
  
  for (let i = 0; i < stores.length; i += batchSize) {
    const batch = stores.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(stores.length / batchSize);
    
    console.log(`Inserting batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);
    
    const { error: insertError } = await supabase
      .from('snap_stores')
      .insert(batch);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Failed to insert batch ${batchNumber}: ${insertError.message}`);
    }
    
    insertedCount += batch.length;
    console.log(`Successfully inserted batch ${batchNumber}. Total inserted: ${insertedCount}`);
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
    console.log('Starting CSV processing...');

    const { csvContent } = await req.json();

    if (!csvContent) {
      throw new Error('No CSV content provided');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Parsing CSV content...');
    const csvRows = parseCSV(csvContent);
    console.log(`Parsed ${csvRows.length} rows from CSV`);

    console.log('Transforming CSV data...');
    const transformedStores = csvRows
      .map(transformCSVRow)
      .filter((store): store is TransformedStore => store !== null);

    console.log(`Transformed ${transformedStores.length} valid store records`);

    if (transformedStores.length === 0) {
      throw new Error('No valid store data found in CSV');
    }

    // Clear existing data
    await clearExistingData(supabase);

    // Insert new data
    const insertedCount = await insertStoresInBatches(supabase, transformedStores);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${insertedCount} SNAP stores from CSV`,
        totalStores: insertedCount,
        expectedStores: 264290,
        coveragePercent: Math.round((insertedCount / 264290) * 100)
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
