
import { ArcGISResponse, ArcGISFeature, TransformedStore } from './types.ts';

export async function fetchAllStores(startOffset = 0, maxRecords = 20000): Promise<TransformedStore[]> {
  const allStores: TransformedStore[] = [];
  let offset = startOffset;
  const limit = 2000; // Use standard batch size for ArcGIS
  let recordsProcessed = 0;
  let hasMore = true;
  let consecutiveEmptyBatches = 0;

  console.log(`Starting fetch with offset ${startOffset}, max records ${maxRecords}`);

  while (hasMore && recordsProcessed < maxRecords && consecutiveEmptyBatches < 3) {
    console.log(`Fetching batch starting at offset ${offset}...`);
    
    const arcgisUrl = `https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/snap_retailer_location_data/FeatureServer/0/query?outFields=*&where=1%3D1&f=json&resultOffset=${offset}&resultRecordCount=${limit}`;
    
    try {
      const response = await fetch(arcgisUrl);
      
      if (!response.ok) {
        console.error(`ArcGIS API error: ${response.status} ${response.statusText}`);
        
        // If we get a 400 error, it might mean we've reached the end
        if (response.status === 400) {
          console.log('Got 400 error, likely reached end of data');
          break;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonData: ArcGISResponse = await response.json();
      
      // Check for ArcGIS-specific errors
      if (jsonData.error) {
        console.error('ArcGIS API returned error:', jsonData.error);
        break;
      }
      
      const features = jsonData.features || [];
      
      console.log(`Fetched ${features.length} features in this batch (offset: ${offset})`);
      
      if (features.length === 0) {
        console.log('No more features available at this offset');
        consecutiveEmptyBatches++;
        offset += limit;
        continue;
      }

      // Transform and add to collection
      const transformedStores = transformFeatures(features);
      allStores.push(...transformedStores);
      recordsProcessed += features.length;
      consecutiveEmptyBatches = 0;
      
      console.log(`Batch processed. Records in this chunk: ${transformedStores.length}, Total in chunk: ${allStores.length}`);
      
      // Move to next batch
      offset += limit;
      
      // If we got fewer records than the limit, we might be at the end
      if (features.length < limit) {
        console.log(`Batch returned ${features.length} < ${limit}, continuing to check for more...`);
      }
      
    } catch (fetchError) {
      console.error(`Error fetching data at offset ${offset}:`, fetchError);
      consecutiveEmptyBatches++;
      offset += limit;
      
      // If we've had too many errors, stop
      if (consecutiveEmptyBatches >= 3) {
        console.log('Too many consecutive errors, stopping fetch');
        break;
      }
    }
  }

  console.log(`Finished fetching chunk. Total stores: ${allStores.length}, Final offset reached: ${offset}`);
  return allStores;
}

function transformFeatures(features: ArcGISFeature[]): TransformedStore[] {
  return features.map((feature: ArcGISFeature) => {
    const attrs = feature.attributes;
    
    return {
      object_id: attrs.OBJECTID?.toString() || '',
      record_id: attrs.Record_ID?.toString() || '',
      store_name: attrs.Store_Name || 'Unknown Store',
      store_type: attrs.Store_Type || '',
      store_street_address: attrs.Address || '',
      additional_address: attrs.Address2 || '',
      city: attrs.City || '',
      state: attrs.State || '',
      zip_code: attrs.Zip5 || '',
      zip4: attrs.Zip4 || '',
      county: attrs.County || '',
      longitude: attrs.Longitude || 0,
      latitude: attrs.Latitude || 0,
      x: attrs.X || 0,
      y: attrs.Y || 0,
      grantee_name: attrs.Grantee_Name || '',
      incentive_program: attrs.Incentive_Program || '',
    };
  }).filter(store => store.store_name && store.store_name !== 'Unknown Store');
}
