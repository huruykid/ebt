
import { supabase } from '@/integrations/supabase/client';
import { getCommentsForStore } from './storeSpecificComments';

// Realistic usernames for EBT users
const userNames = [
  'Sarah_M', 'MikeEBT', 'CaliforniaDeals', 'BudgetMom23', 'EBTSaver',
  'GroceryGuru', 'SnapDealFinder', 'FoodieOnSnap', 'CouponsNCash',
  'BargainHunter', 'HealthyEats4Less', 'SmartShopper91', 'DealSeeker',
  'FrugalFamily', 'SavingsExpert', 'BudgetGuru', 'CheapEats', 'ThriftyMom',
  'ValueHunter', 'PennyWise', 'DealAlert', 'SnapSaver', 'BargainBabe',
  'EBTHacks', 'SnapHero', 'BudgetWise', 'DealHunter', 'SaverMom',
  'EBTExpert', 'FoodBudget', 'SnapTips', 'BargainSeeker', 'WiseShopper',
  'CouponQueen', 'BudgetBoss', 'SnapSmart', 'DollarStretcher', 'WiseSpender',
  'MealPlanner', 'BargainBetty', 'SnapDeals', 'ThriftyDad', 'SavvySaver'
];

interface Store {
  id: string;
  Store_Name: string;
  City: string;
  State: string;
  Store_Type: string;
}

interface CommentToInsert {
  store_id: string;
  user_name: string;
  comment_text: string;
  created_at: string;
}

// Generate random date within last 3 weeks
function getRandomDate(): Date {
  const now = new Date();
  const threeWeeksAgo = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000));
  const randomTime = threeWeeksAgo.getTime() + Math.random() * (now.getTime() - threeWeeksAgo.getTime());
  return new Date(randomTime);
}

// Generate unique comments for a store
function generateStoreComments(store: Store, count: number = 3): CommentToInsert[] {
  const storeComments = getCommentsForStore(store.Store_Name || '');
  const comments: CommentToInsert[] = [];
  const usedComments = new Set<string>();
  const usedUsers = new Set<string>();
  
  // Shuffle available comments and users
  const shuffledComments = [...storeComments].sort(() => Math.random() - 0.5);
  const shuffledUsers = [...userNames].sort(() => Math.random() - 0.5);
  
  let commentIndex = 0;
  let userIndex = 0;
  
  while (comments.length < count && commentIndex < shuffledComments.length) {
    const comment = shuffledComments[commentIndex];
    const user = shuffledUsers[userIndex % shuffledUsers.length];
    
    // Ensure no duplicates for this store
    if (!usedComments.has(comment) && !usedUsers.has(user)) {
      comments.push({
        store_id: store.id,
        user_name: user,
        comment_text: comment,
        created_at: getRandomDate().toISOString()
      });
      
      usedComments.add(comment);
      usedUsers.add(user);
    }
    
    commentIndex++;
    if (commentIndex >= shuffledComments.length) break;
    
    userIndex++;
  }
  
  return comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

// Check if store already has comments
async function storeHasComments(storeId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('store_comments')
    .select('id')
    .eq('store_id', storeId)
    .limit(1);
    
  if (error) {
    console.error('Error checking existing comments:', error);
    return false;
  }
  
  return (data && data.length > 0) || false;
}

// Autonomous seeding function
export async function seedCommentsAutonomously(options: {
  state?: string;
  storeTypes?: string[];
  batchSize?: number;
  commentsPerStore?: number;
  skipExisting?: boolean;
} = {}) {
  const {
    state = 'CA',
    storeTypes = [],
    batchSize = 100,
    commentsPerStore = 3,
    skipExisting = true
  } = options;

  console.log(`Starting autonomous comment seeding for ${state}...`);
  
  try {
    // Build query
    let query = supabase
      .from('snap_stores')
      .select('id, Store_Name, City, State, Store_Type')
      .eq('State', state)
      .not('Store_Name', 'is', null)
      .not('Store_Name', 'eq', '');
    
    // Add store type filter if provided
    if (storeTypes.length > 0) {
      query = query.in('Store_Type', storeTypes);
    }
    
    const { data: stores, error: storesError } = await query.limit(batchSize);
    
    if (storesError) {
      throw storesError;
    }
    
    if (!stores || stores.length === 0) {
      console.log('No stores found matching criteria');
      return { success: false, message: 'No stores found' };
    }
    
    console.log(`Found ${stores.length} stores to process`);
    
    const allComments: CommentToInsert[] = [];
    const processedStores: string[] = [];
    const skippedStores: string[] = [];
    
    // Generate comments for each store
    for (const store of stores) {
      try {
        // Skip if store already has comments and skipExisting is true
        if (skipExisting && await storeHasComments(store.id)) {
          skippedStores.push(store.Store_Name || store.id);
          continue;
        }
        
        const storeComments = generateStoreComments(store, commentsPerStore);
        allComments.push(...storeComments);
        processedStores.push(store.Store_Name || store.id);
        
        // Add small delay to avoid overwhelming the system
        if (processedStores.length % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing store ${store.Store_Name}:`, error);
      }
    }
    
    console.log(`Generated ${allComments.length} comments for ${processedStores.length} stores`);
    
    if (allComments.length === 0) {
      return {
        success: true,
        message: 'No new comments to insert',
        stats: {
          storesProcessed: processedStores.length,
          storesSkipped: skippedStores.length,
          commentsInserted: 0
        }
      };
    }
    
    // Insert comments in batches of 50
    const insertBatchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < allComments.length; i += insertBatchSize) {
      const batch = allComments.slice(i, i + insertBatchSize);
      
      const { error: insertError } = await supabase
        .from('store_comments')
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i / insertBatchSize + 1}:`, insertError);
        continue;
      }
      
      insertedCount += batch.length;
      console.log(`Inserted batch ${i / insertBatchSize + 1}: ${batch.length} comments`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const results = {
      success: true,
      message: `Successfully seeded ${insertedCount} comments`,
      stats: {
        storesProcessed: processedStores.length,
        storesSkipped: skippedStores.length,
        commentsInserted: insertedCount,
        totalStores: stores.length
      }
    };
    
    console.log('Seeding complete:', results);
    return results;
    
  } catch (error) {
    console.error('Error in autonomous seeding:', error);
    return {
      success: false,
      message: `Seeding failed: ${error.message}`,
      error
    };
  }
}

// Preset configurations for different seeding scenarios
export const seedingPresets = {
  // California major chains
  californiaMajorChains: {
    state: 'CA',
    storeTypes: ['Supermarket', 'Supercenter', 'Grocery Store'],
    commentsPerStore: 3,
    skipExisting: true
  },
  
  // All California stores
  californiaAll: {
    state: 'CA',
    storeTypes: [],
    commentsPerStore: 2,
    skipExisting: true
  },
  
  // Quick test run
  testRun: {
    state: 'CA',
    storeTypes: ['Supermarket'],
    batchSize: 10,
    commentsPerStore: 2,
    skipExisting: false
  }
};

// Run specific preset
export async function runSeedingPreset(presetName: keyof typeof seedingPresets) {
  const preset = seedingPresets[presetName];
  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}`);
  }
  
  return await seedCommentsAutonomously(preset);
}
