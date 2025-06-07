
import { ArcGISResponse, ArcGISFeature, TransformedStore } from './types.ts';

export async function fetchAllStores(): Promise<TransformedStore[]> {
  const allStores: TransformedStore[] = [];
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

    // Transform and add to collection - optimized for performance
    const transformedStores = transformFeatures(features);
    allStores.push(...transformedStores);
    
    // FIXED: Correct pagination logic
    if (jsonData.exceededTransferLimit === true) {
      // More records are definitely available, continue pagination
      console.log('More records available, continuing pagination...');
      offset += limit;
    } else if (jsonData.exceededTransferLimit === false) {
      // API explicitly says no more records
      console.log('API indicates no more records available.');
      hasMore = false;
    } else if (features.length < limit) {
      // Got fewer records than requested, likely at the end
      console.log(`Got ${features.length} records, less than limit ${limit}. Ending pagination.`);
      hasMore = false;
    } else {
      // Continue to next batch (fallback case)
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

function transformFeatures(features: ArcGISFeature[]): TransformedStore[] {
  return features.map((feature: ArcGISFeature) => {
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
}
