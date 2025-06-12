
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TransformedStore } from './types.ts';

export async function clearExistingData(supabase: any): Promise<void> {
  console.log('Clearing existing data...');
  
  // First, clear favorites table to avoid foreign key constraint issues
  console.log('Clearing favorites that reference stores...');
  const { error: favoritesError } = await supabase
    .from('favorites')
    .delete()
    .gte('created_at', '1900-01-01'); // Delete all favorites records using a date condition

  if (favoritesError) {
    console.warn('Warning: Could not clear favorites:', favoritesError.message);
    // Continue anyway - this might not be critical
  } else {
    console.log('Successfully cleared favorites');
  }
  
  // Now clear the stores table
  console.log('Clearing stores data...');
  const { error: deleteError } = await supabase
    .from('snap_stores')
    .delete()
    .gte('id', 0); // Delete all records using a condition that matches all

  if (deleteError) {
    throw new Error(`Failed to clear existing data: ${deleteError.message}`);
  }
  
  console.log('Successfully cleared existing data');
}

export async function insertStoresInBatches(supabase: any, stores: TransformedStore[]): Promise<number> {
  const batchSize = 1000; // Optimized batch size for Supabase
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
      
      // Small delay between batches to prevent overwhelming the database
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
