
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ArcGISFeature {
  attributes: {
    OBJECTID: number;
    Store_Name: string;
    Store_Type: string;
    Address: string;
    Address2?: string;
    City: string;
    State: string;
    Zip5: string;
    Zip4?: string;
    County: string;
    Longitude: number;
    Latitude: number;
    X?: number;
    Y?: number;
    Grantee_Name?: string;
    Incentive_Program?: string;
    Record_ID?: string;
  };
}

interface ArcGISResponse {
  features: ArcGISFeature[];
  exceededTransferLimit?: boolean;
}

async function fetchAllStores(): Promise<any[]> {
  const allStores: any[] = [];
  let offset = 0;
  const limit = 2000; // ArcGIS max per request
  let hasMore = true;
  let consecutiveEmptyBatches = 0;

  while (hasMore) {
    console.log(`Fetching batch starting at offset ${offset}...`);
    
    // Use the REST API endpoint instead of GeoJSON to get proper pagination info
    const arcgisUrl = `https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/snap_retailer_location_data/FeatureServer/0/query?outFields=*&where=1%3D1&f=json&resultOffset=${offset}&resultRecordCount=${limit}`;
    
    const response = await fetch(arcgisUrl);
    
    if (!response.ok) {
      throw new Error(`ArcGIS API error: ${response.status} ${response.statusText}`);
    }

    const jsonData: ArcGISResponse = await response.json();
    const features = jsonData.features || [];
    
    console.log(`Fetched ${features.length} features in this batch`);
    console.log(`Exceeded transfer limit: ${jsonData.exceededTransferLimit}`);
    
    if (features.length === 0) {
      consecutiveEmptyBatches++;
      console.log(`Empty batch detected (${consecutiveEmptyBatches})`);
      
      // If we get 2 consecutive empty batches, we're likely at the end
      if (consecutiveEmptyBatches >= 2) {
        hasMore = false;
        break;
      }
      
      // Try next offset in case there's a gap
      offset += limit;
      continue;
    }

    // Reset empty batch counter when we get data
    consecutiveEmptyBatches = 0;

    // Transform and add to collection
    const transformedStores = features.map((feature: any) => {
      const attrs = feature.attributes;
      
      return {
        object_id: attrs.OBJECTID?.toString(),
        record_id: attrs.Record_ID?.toString(),
        store_name: attrs.Store_Name || 'Unknown Store',
        store_type: attrs.Store_Type,
        store_street_address: attrs.Address,
        additional_address: attrs.Address2,
        city: attrs.City,
        state: attrs.State,
        zip_code: attrs.Zip5,
        zip4: attrs.Zip4,
        county: attrs.County,
        longitude: attrs.Longitude,
        latitude: attrs.Latitude,
        x: attrs.X,
        y: attrs.Y,
        grantee_name: attrs.Grantee_Name,
        incentive_program: attrs.Incentive_Program,
      };
    }).filter(store => store.store_name && store.store_name !== 'Unknown Store');

    allStores.push(...transformedStores);
    
    // More robust pagination logic
    if (features.length < limit) {
      // If we got fewer records than requested, we've likely reached the end
      console.log(`Got ${features.length} records, less than limit ${limit}. Ending pagination.`);
      hasMore = false;
    } else if (jsonData.exceededTransferLimit === false) {
      // If the API explicitly says no more records
      console.log('API indicates no more records available.');
      hasMore = false;
    } else {
      // Continue to next batch
      offset += limit;
    }
    
    // Safety check to prevent infinite loops
    if (offset > 1000000) { // Increased safety limit
      console.log('Safety limit reached, stopping pagination');
      hasMore = false;
    }
    
    console.log(`Total stores collected so far: ${allStores.length}`);
  }

  console.log(`Finished fetching. Total stores: ${allStores.length}`);
  return allStores;
}

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

    // Fetch all data from ArcGIS API with pagination
    console.log('Fetching all data from ArcGIS with pagination...');
    const stores = await fetchAllStores();
    
    console.log(`Total stores fetched: ${stores.length}`);

    if (stores.length === 0) {
      console.log('No stores found in response');
      return new Response(
        JSON.stringify({ success: true, message: 'No data to sync' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear existing data
    console.log('Clearing existing store data...');
    const { error: deleteError } = await supabase
      .from('snap_stores')
      .delete()
      .neq('id', 0); // Delete all records

    if (deleteError) {
      throw new Error(`Failed to clear existing data: ${deleteError.message}`);
    }

    // Insert new data in batches of 1000
    const batchSize = 1000;
    let insertedCount = 0;
    
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
    }

    console.log(`Successfully synced ${insertedCount} SNAP stores`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${insertedCount} SNAP stores`,
        totalStores: insertedCount
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
