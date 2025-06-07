
import { ArcGISResponse, ArcGISFeature, TransformedStore } from './types.ts';

export async function fetchAllStores(startOffset = 0, maxRecords = 10000): Promise<TransformedStore[]> {
  const allStores: TransformedStore[] = [];
  let offset = startOffset;
  const limit = 1000; // ArcGIS max per request
  let recordsProcessed = 0;
  let hasMore = true;

  while (hasMore && recordsProcessed < maxRecords) {
    console.log(`Fetching batch starting at offset ${offset}...`);
    
    const arcgisUrl = `https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/snap_retailer_location_data/FeatureServer/0/query?outFields=*&where=1%3D1&f=json&resultOffset=${offset}&resultRecordCount=${limit}`;
    
    try {
      const response = await fetch(arcgisUrl);
      
      if (!response.ok) {
        console.error(`ArcGIS API error: ${response.status} ${response.statusText}`);
        break;
      }

      const jsonData: ArcGISResponse = await response.json();
      const features = jsonData.features || [];
      
      console.log(`Fetched ${features.length} features in this batch`);
      
      if (features.length === 0) {
        console.log('No more features available');
        hasMore = false;
        break;
      }

      // Transform and add to collection
      const transformedStores = transformFeatures(features);
      allStores.push(...transformedStores);
      recordsProcessed += features.length;
      
      console.log(`Total records processed in this chunk: ${recordsProcessed}`);
      
      // Check if we should continue
      if (jsonData.exceededTransferLimit === false || features.length < limit) {
        console.log('Reached end of available data for this chunk');
        hasMore = false;
      } else {
        offset += limit;
      }
      
      // Safety check to prevent infinite loops
      if (recordsProcessed >= maxRecords) {
        console.log(`Reached max records limit for this chunk: ${maxRecords}`);
        hasMore = false;
      }
      
    } catch (fetchError) {
      console.error(`Error fetching data at offset ${offset}:`, fetchError);
      break;
    }
  }

  console.log(`Finished fetching chunk. Total stores: ${allStores.length}`);
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
