
import { ArcGISResponse, ArcGISFeature, TransformedStore } from './types.ts';

export async function fetchAllStores(startOffset = 0, maxRecords = 10000): Promise<TransformedStore[]> {
  const allStores: TransformedStore[] = [];
  let offset = startOffset;
  const limit = 2000; // Optimized batch size
  let recordsProcessed = 0;
  let hasMore = true;
  let consecutiveEmptyBatches = 0;
  const maxConsecutiveEmpty = 3;

  console.log(`Starting fetch with offset ${startOffset}, max records ${maxRecords}`);

  while (hasMore && recordsProcessed < maxRecords && consecutiveEmptyBatches < maxConsecutiveEmpty) {
    console.log(`Fetching batch starting at offset ${offset}...`);
    
    // Use the official USDA SNAP retailer API endpoint
    const arcgisUrl = `https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/snap_retailer_location_data/FeatureServer/0/query?outFields=*&where=1%3D1&f=json&resultOffset=${offset}&resultRecordCount=${limit}&orderByFields=OBJECTID`;
    
    try {
      const response = await fetch(arcgisUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Supabase-Edge-Function/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`ArcGIS API error: ${response.status} ${response.statusText}`);
        
        if (response.status === 400) {
          console.log('Got 400 error, might have reached end of data or hit API limit');
          // Try smaller batch size on 400 error
          if (limit > 500) {
            console.log('Retrying with smaller batch size...');
            continue;
          }
          break;
        }
        
        if (response.status === 429) {
          console.log('Rate limited, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonData: ArcGISResponse = await response.json();
      
      if (jsonData.error) {
        console.error('ArcGIS API returned error:', jsonData.error);
        if (jsonData.error.code === 400) {
          console.log('API returned 400 error, likely reached end of available data');
          break;
        }
        throw new Error(`ArcGIS Error: ${jsonData.error.message}`);
      }
      
      const features = jsonData.features || [];
      
      console.log(`Fetched ${features.length} features in this batch (offset: ${offset})`);
      
      if (features.length === 0) {
        console.log('No more features available at this offset');
        consecutiveEmptyBatches++;
        offset += limit;
        continue;
      }

      // Log sample data for debugging (only on first batch)
      if (offset === startOffset && features.length > 0) {
        const sampleFeature = features[0];
        console.log('Sample feature attributes:', JSON.stringify(sampleFeature.attributes, null, 2));
      }

      const transformedStores = transformFeatures(features);
      allStores.push(...transformedStores);
      recordsProcessed += features.length;
      consecutiveEmptyBatches = 0;
      
      console.log(`Batch processed. Records in this chunk: ${transformedStores.length}, Total accumulated: ${allStores.length}`);
      
      offset += limit;
      
      // If we got fewer features than requested, we might be near the end
      if (features.length < limit) {
        console.log(`Batch returned ${features.length} < ${limit}, might be approaching end of data`);
      }
      
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 150));
      
    } catch (fetchError) {
      console.error(`Error fetching data at offset ${offset}:`, fetchError);
      consecutiveEmptyBatches++;
      offset += limit;
      
      if (consecutiveEmptyBatches >= maxConsecutiveEmpty) {
        console.log('Too many consecutive errors, stopping fetch');
        break;
      }
      
      // Wait before retrying on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`Finished fetching chunk. Total stores: ${allStores.length}, Final offset reached: ${offset}`);
  return allStores;
}

function transformFeatures(features: ArcGISFeature[]): TransformedStore[] {
  return features.map((feature: ArcGISFeature) => {
    const attrs = feature.attributes;
    
    // Log address fields for debugging with correct field names
    const addressInfo = {
      Store_Street_Address: attrs.Store_Street_Address,
      Additonal_Address: attrs.Additonal_Address, // Note: ArcGIS has a typo in their field name
      City: attrs.City,
      State: attrs.State,
      Zip_Code: attrs.Zip_Code,
      Zip4: attrs.Zip4
    };
    
    if (!attrs.Store_Street_Address && !attrs.City) {
      console.log(`Store with missing address data:`, {
        storeName: attrs.Store_Name,
        objectId: attrs.OBJECTID,
        addressFields: addressInfo
      });
    }
    
    return {
      object_id: attrs.OBJECTID?.toString() || '',
      record_id: attrs.Record_ID?.toString() || '',
      store_name: attrs.Store_Name || 'Unknown Store',
      store_type: attrs.Store_Type || '',
      store_street_address: attrs.Store_Street_Address || '',
      additional_address: attrs.Additonal_Address || '', // Note the typo in ArcGIS field name
      city: attrs.City || '',
      state: attrs.State || '',
      zip_code: attrs.Zip_Code || '',
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
