
import type { TransformedStore } from './types.ts';

export async function clearExistingData(supabase: any): Promise<void> {
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

export async function insertStoresInBatches(supabase: any, stores: TransformedStore[]): Promise<number> {
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
