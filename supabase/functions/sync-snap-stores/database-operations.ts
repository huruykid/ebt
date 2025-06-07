
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TransformedStore } from './types.ts';

export async function clearExistingData(supabase: any): Promise<void> {
  console.log('Clearing existing store data...');
  const { error: deleteError } = await supabase
    .from('snap_stores')
    .delete()
    .neq('id', 0); // Delete all records

  if (deleteError) {
    throw new Error(`Failed to clear existing data: ${deleteError.message}`);
  }
}

export async function insertStoresInBatches(supabase: any, stores: TransformedStore[]): Promise<number> {
  const batchSize = 1000; // Smaller batch size for better reliability
  let insertedCount = 0;
  
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
      
      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < stores.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
    } catch (error) {
      console.error(`Error inserting batch ${batchNumber}:`, error);
      throw error;
    }
  }

  return insertedCount;
}
