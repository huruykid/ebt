
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

    // Fetch data from ArcGIS API
    const arcgisUrl = 'https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/snap_retailer_location_data/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson&resultRecordCount=5000';
    
    console.log('Fetching data from ArcGIS...');
    const response = await fetch(arcgisUrl);
    
    if (!response.ok) {
      throw new Error(`ArcGIS API error: ${response.status} ${response.statusText}`);
    }

    const geoJsonData = await response.json();
    console.log(`Fetched ${geoJsonData.features?.length || 0} features from ArcGIS`);

    if (!geoJsonData.features || geoJsonData.features.length === 0) {
      console.log('No features found in response');
      return new Response(
        JSON.stringify({ success: true, message: 'No data to sync' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform GeoJSON features to our database format
    const stores = geoJsonData.features.map((feature: any) => {
      const props = feature.properties;
      const coords = feature.geometry?.coordinates;
      
      return {
        object_id: props.OBJECTID?.toString(),
        record_id: props.Record_ID?.toString(),
        store_name: props.Store_Name || 'Unknown Store',
        store_type: props.Store_Type,
        store_street_address: props.Address,
        additional_address: props.Address2,
        city: props.City,
        state: props.State,
        zip_code: props.Zip5,
        zip4: props.Zip4,
        county: props.County,
        longitude: coords ? coords[0] : props.Longitude,
        latitude: coords ? coords[1] : props.Latitude,
        x: props.X,
        y: props.Y,
        grantee_name: props.Grantee_Name,
        incentive_program: props.Incentive_Program,
      };
    }).filter(store => store.store_name && store.store_name !== 'Unknown Store');

    console.log(`Transformed ${stores.length} valid store records`);

    // Clear existing data and insert new data in batches
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
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stores.length / batchSize)}...`);
      
      const { error: insertError } = await supabase
        .from('snap_stores')
        .insert(batch);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to insert batch: ${insertError.message}`);
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
