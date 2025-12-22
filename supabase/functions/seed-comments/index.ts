import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Store-specific EBT comment templates
const storeSpecificComments: Record<string, string[]> = {
  "Walmart": [
    "Walmart curbside pickup works with EBT - just pay at the window when you arrive.",
    "Pro tip: Buy the rotisserie chicken from the cold case, not the hot bar. EBT covers it.",
    "You can filter by 'EBT Eligible' on Walmart's website before placing pickup orders.",
    "Walmart garden center accepts EBT for vegetable seeds and food-producing plants!",
    "Their Great Value brand is EBT eligible and way cheaper than name brands.",
    "Use Walmart Pay app with your EBT card for faster self-checkout.",
  ],
  "Target": [
    "Target Drive Up is free and works with EBT - super convenient for groceries.",
    "Stack Target Circle coupons with EBT purchases. The discounts still apply!",
    "Target's Good & Gather brand is EBT eligible and actually pretty good quality.",
    "You can pay with EBT through the Target app for Drive Up orders.",
    "Target pickup orders let you avoid the crowds and long checkout lines.",
  ],
  "Safeway": [
    "Safeway Drive Up & Go accepts EBT payment at pickup.",
    "Their BOGO deals are amazing with EBT - essentially doubles your food.",
    "Just for U digital coupons work with SNAP purchases.",
    "Safeway SELECT brand is EBT eligible and good quality for the price.",
  ],
  "Kroger": [
    "Kroger ClickList pickup is free over $35 and accepts EBT payment.",
    "Load digital coupons in the Kroger app - they stack with EBT purchases.",
    "Their Simple Truth Organic line is EBT eligible and goes on sale often.",
    "BOGO deals work great with EBT - pay for one, get both items.",
  ],
  "Sprouts": [
    "Sprouts has $5 sandwiches that are EBT eligible — super clutch for lunch.",
    "The $5 sandwiches here work with EBT and they're actually pretty good!",
    "$5 sushi Wednesday is legit and EBT eligible. Don't sleep on this deal.",
    "Wednesday sushi deal for $5 - works with EBT. My weekly treat!",
    "Their produce section has great organic options that accept EBT.",
  ],
  "Costco": [
    "Costco accepts EBT for all food items - great for bulk buying with SNAP.",
    "Kirkland Signature brand works with EBT and offers great value per unit.",
    "Can't use EBT on Costco.com but you can order through Instacart with SNAP.",
    "Their $4.99 rotisserie chicken is huge and EBT eligible.",
  ],
  "Aldi": [
    "Aldi has the lowest grocery prices and accepts EBT for everything food-related.",
    "Their Simply Nature organic line is EBT eligible and super affordable.",
    "Aldi curbside pickup works with EBT and is usually free.",
    "Never Alone brand items are EBT eligible and surprisingly good quality.",
  ],
  "Generic": [
    "This location accepts EBT and has a good selection of fresh produce.",
    "Staff here is helpful about what's EBT eligible. No judgment at all.",
    "Clean store with reasonable prices on SNAP-eligible items.",
    "Their store brand products work with EBT and are decent quality.",
  ]
};

// Map store name variations to main keys
const storeNameMapping: Record<string, string> = {
  "Walmart Supercenter": "Walmart",
  "Walmart Neighborhood Market": "Walmart",
  "Target SuperTarget": "Target",
  "Safeway": "Safeway",
  "Kroger": "Kroger",
  "Ralphs": "Kroger",
  "King Soopers": "Kroger",
  "Costco Wholesale": "Costco",
  "Sprouts Farmers Market": "Sprouts",
};

// Realistic usernames for EBT users
const userNames = [
  'Sarah_M', 'MikeEBT', 'CaliforniaDeals', 'BudgetMom23', 'EBTSaver',
  'GroceryGuru', 'SnapDealFinder', 'FoodieOnSnap', 'CouponsNCash',
  'BargainHunter', 'HealthyEats4Less', 'SmartShopper91', 'DealSeeker',
  'FrugalFamily', 'SavingsExpert', 'BudgetGuru', 'CheapEats', 'ThriftyMom',
  'ValueHunter', 'PennyWise', 'DealAlert', 'SnapSaver', 'BargainBabe',
];

// Preset configurations for rotating seeding
const seedingPresets = [
  { state: 'California', storeTypes: ['Supermarket', 'Supercenter'], name: 'CA_Major' },
  { state: 'California', storeTypes: ['Grocery Store'], name: 'CA_Grocery' },
  { state: 'Texas', storeTypes: ['Supermarket', 'Supercenter'], name: 'TX_Major' },
  { state: 'Florida', storeTypes: ['Supermarket'], name: 'FL_Super' },
  { state: 'New York', storeTypes: ['Grocery Store'], name: 'NY_Grocery' },
  { state: 'Illinois', storeTypes: ['Supermarket'], name: 'IL_Super' },
];

function getCommentsForStore(storeName: string): string[] {
  // Try exact match first
  if (storeSpecificComments[storeName]) {
    return storeSpecificComments[storeName];
  }
  
  // Try mapped name
  const mappedName = storeNameMapping[storeName];
  if (mappedName && storeSpecificComments[mappedName]) {
    return storeSpecificComments[mappedName];
  }
  
  // Check if store name contains a known brand
  for (const [key, comments] of Object.entries(storeSpecificComments)) {
    if (storeName.toLowerCase().includes(key.toLowerCase())) {
      return comments;
    }
  }
  
  // Fall back to generic comments
  return storeSpecificComments.Generic;
}

function getRandomDate(): Date {
  const now = new Date();
  const threeWeeksAgo = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000));
  const randomTime = threeWeeksAgo.getTime() + Math.random() * (now.getTime() - threeWeeksAgo.getTime());
  return new Date(randomTime);
}

function generateStoreComments(store: Store, count: number = 3): CommentToInsert[] {
  const storeComments = getCommentsForStore(store.Store_Name || '');
  const comments: CommentToInsert[] = [];
  const usedComments = new Set<string>();
  const usedUsers = new Set<string>();
  
  const shuffledComments = [...storeComments].sort(() => Math.random() - 0.5);
  const shuffledUsers = [...userNames].sort(() => Math.random() - 0.5);
  
  let commentIndex = 0;
  let userIndex = 0;
  
  while (comments.length < count && commentIndex < shuffledComments.length) {
    const comment = shuffledComments[commentIndex];
    const user = shuffledUsers[userIndex % shuffledUsers.length];
    
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

async function storeHasComments(supabase: any, storeId: string): Promise<boolean> {
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

async function cleanupOldComments(supabase: any): Promise<void> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const { error } = await supabase
    .from('store_comments')
    .delete()
    .lt('created_at', ninetyDaysAgo.toISOString());
    
  if (error) {
    console.error('Error cleaning up old comments:', error);
  } else {
    console.log('Successfully cleaned up comments older than 90 days');
  }
}

async function logSeedingRun(supabase: any, success: boolean, stats: any, preset: string): Promise<void> {
  try {
    await supabase
      .from('comment_seed_runs')
      .insert({
        success,
        preset_used: preset,
        stores_processed: stats.storesProcessed || 0,
        comments_inserted: stats.commentsInserted || 0,
        error_message: success ? null : stats.error
      });
  } catch (error) {
    console.error('Error logging seeding run:', error);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin access - only admins can seed comments
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create client with user auth to verify permissions
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - admin access required for seeding' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Starting autonomous comment seeding...');
    
    // Clean up old comments first
    await cleanupOldComments(supabase);
    
    // Select a random preset for this run
    const randomPreset = seedingPresets[Math.floor(Math.random() * seedingPresets.length)];
    const { state, storeTypes, name: presetName } = randomPreset;
    
    console.log(`Using preset: ${presetName} (${state}, ${storeTypes.join(', ')})`);
    
    // Build query for stores that don't have comments yet
    let query = supabase
      .from('snap_stores')
      .select('id, Store_Name, City, State, Store_Type')
      .eq('State', state)
      .not('Store_Name', 'is', null)
      .not('Store_Name', 'eq', '')
      .in('Store_Type', storeTypes)
      .limit(50); // Process 50 stores per run
    
    const { data: stores, error: storesError } = await query;
    
    if (storesError) {
      throw storesError;
    }
    
    if (!stores || stores.length === 0) {
      console.log('No stores found matching criteria');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No stores found',
        preset: presetName 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Found ${stores.length} stores to process`);
    
    const allComments: CommentToInsert[] = [];
    const processedStores: string[] = [];
    const skippedStores: string[] = [];
    
    // Generate comments for stores without existing comments
    for (const store of stores) {
      try {
        // Skip if store already has comments
        if (await storeHasComments(supabase, store.id)) {
          skippedStores.push(store.Store_Name || store.id);
          continue;
        }
        
        const storeComments = generateStoreComments(store, 3);
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
      const stats = {
        storesProcessed: processedStores.length,
        storesSkipped: skippedStores.length,
        commentsInserted: 0
      };
      
      await logSeedingRun(supabase, true, stats, presetName);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'No new comments to insert',
        preset: presetName,
        stats
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
    
    const stats = {
      storesProcessed: processedStores.length,
      storesSkipped: skippedStores.length,
      commentsInserted: insertedCount,
      totalStores: stores.length
    };
    
    await logSeedingRun(supabase, true, stats, presetName);
    
    console.log('Seeding complete:', stats);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully seeded ${insertedCount} comments using ${presetName} preset`,
      preset: presetName,
      stats
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in autonomous seeding:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'An error occurred during comment seeding. Please try again later.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});