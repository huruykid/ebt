import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting: 5 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('x-real-ip') 
    || 'unknown';
}

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (record.count >= RATE_LIMIT_REQUESTS) {
    return true;
  }
  
  record.count++;
  return false;
}

interface GooglePlacesResponse {
  candidates?: Array<{
    place_id: string;
    name: string;
    formatted_address?: string;
    geometry?: {
      location: {
        lat: number;
        lng: number;
      }
    };
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: any;
    photos?: any[];
    formatted_phone_number?: string;
    website?: string;
    types?: string[];
    price_level?: number;
    business_status?: string;
  }>;
  status: string;
  error_message?: string;
}

// ============= NAME SIMILARITY VALIDATION =============

// Common words to ignore in name comparison
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'at', 'to', 'for', 'on', 'by',
  'inc', 'llc', 'ltd', 'corp', 'corporation', 'company', 'co', 'store', 'stores',
  'shop', 'market', 'mart', 'supermarket', 'grocery', 'food', 'foods',
  'restaurant', 'cafe', 'deli', 'bakery', 'pharmacy', 'gas', 'station',
  '#', 'no', 'number'
]);

// Known chain names that require exact matching
const KNOWN_CHAINS = [
  'walmart', 'target', 'costco', 'kroger', 'safeway', 'albertsons', 'publix',
  'whole foods', 'trader joe', 'aldi', 'lidl', 'food lion', 'giant', 'wegmans',
  'cvs', 'walgreens', 'rite aid', '7-eleven', '7 eleven', 'circle k', 'wawa',
  'sheetz', 'quicktrip', 'racetrac', 'speedway', 'shell', 'chevron', 'exxon',
  'bp', 'arco', 'mobil', 'sunoco', 'marathon', 'phillips 66',
  'mcdonalds', 'burger king', 'wendys', 'taco bell', 'subway', 'chick-fil-a',
  'pizza hut', 'dominos', 'papa johns', 'little caesars', 'chipotle',
  'starbucks', 'dunkin', 'panera', 'five guys', 'sonic', 'dairy queen',
  'jack in the box', 'carls jr', 'hardees', 'arbys', 'popeyes', 'kfc',
  'dollar general', 'dollar tree', 'family dollar', 'big lots'
];

/**
 * Normalize a name for comparison
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
}

/**
 * Extract significant words from a name (removing stop words and numbers)
 */
function extractSignificantWords(name: string): string[] {
  return normalizeName(name)
    .split(' ')
    .filter(word => word.length > 1 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));
}

/**
 * Check if a name matches a known chain
 */
function isKnownChain(name: string): string | null {
  const normalized = normalizeName(name);
  for (const chain of KNOWN_CHAINS) {
    if (normalized.includes(chain) || normalized.startsWith(chain.split(' ')[0])) {
      return chain;
    }
  }
  return null;
}

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(set1: string[], set2: string[]): number {
  const s1 = new Set(set1);
  const s2 = new Set(set2);
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Calculate normalized Levenshtein similarity (0-1)
 */
function levenshteinSimilarity(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(s1, s2) / maxLen;
}

interface NameValidationResult {
  isValid: boolean;
  confidence: number;
  reason: string;
  storeName: string;
  googleName: string;
}

/**
 * Validate if Google Places name is a reasonable match for store name
 * Returns validation result with confidence score and reason
 */
function validateNameSimilarity(storeName: string, googleName: string): NameValidationResult {
  const normalizedStore = normalizeName(storeName);
  const normalizedGoogle = normalizeName(googleName);
  
  // 1. Exact match (after normalization)
  if (normalizedStore === normalizedGoogle) {
    return { isValid: true, confidence: 1.0, reason: 'exact_match', storeName, googleName };
  }
  
  // 2. Check if either is a known chain
  const storeChain = isKnownChain(storeName);
  const googleChain = isKnownChain(googleName);
  
  // If both are different known chains, reject immediately
  if (storeChain && googleChain && storeChain !== googleChain) {
    return { 
      isValid: false, 
      confidence: 0, 
      reason: `chain_mismatch: store="${storeChain}" vs google="${googleChain}"`,
      storeName, 
      googleName 
    };
  }
  
  // If Google name is a known chain but store name isn't that chain
  if (googleChain && !normalizedStore.includes(googleChain)) {
    return { 
      isValid: false, 
      confidence: 0, 
      reason: `google_is_chain_not_in_store: "${googleChain}"`,
      storeName, 
      googleName 
    };
  }
  
  // 3. Check if one name contains the other
  if (normalizedStore.includes(normalizedGoogle) || normalizedGoogle.includes(normalizedStore)) {
    return { isValid: true, confidence: 0.9, reason: 'name_contains', storeName, googleName };
  }
  
  // 4. Word-based similarity
  const storeWords = extractSignificantWords(storeName);
  const googleWords = extractSignificantWords(googleName);
  const jaccardScore = jaccardSimilarity(storeWords, googleWords);
  
  // 5. Character-based similarity
  const levScore = levenshteinSimilarity(normalizedStore, normalizedGoogle);
  
  // 6. Combined confidence score (weighted average)
  const combinedScore = (jaccardScore * 0.6) + (levScore * 0.4);
  
  // Threshold: require at least 40% similarity OR at least one significant word match
  const hasWordOverlap = storeWords.some(w => googleWords.includes(w));
  const isValid = combinedScore >= 0.4 || (hasWordOverlap && combinedScore >= 0.2);
  
  return {
    isValid,
    confidence: combinedScore,
    reason: isValid 
      ? `similarity_match: jaccard=${jaccardScore.toFixed(2)}, levenshtein=${levScore.toFixed(2)}`
      : `low_similarity: jaccard=${jaccardScore.toFixed(2)}, levenshtein=${levScore.toFixed(2)}`,
    storeName,
    googleName
  };
}

// ============= END NAME SIMILARITY VALIDATION =============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  if (isRateLimited(clientIP)) {
    console.log(`Rate limited: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Authentication: require valid JWT and admin role
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check admin role
  const { data: isAdmin } = await authClient.rpc('has_role', {
    _user_id: claimsData.claims.sub,
    _role: 'admin'
  });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { batch_size = 25 } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!googleApiKey) {
      throw new Error('Google Places API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🚀 Starting bulk sync with batch size: ${batch_size}`);

    // Get next batch of stores from the queue
    const { data: batchStores, error: batchError } = await supabase
      .rpc('get_next_sync_batch', { batch_size });

    if (batchError) {
      console.error('❌ Error getting batch:', batchError);
      throw batchError;
    }

    if (!batchStores || batchStores.length === 0) {
      console.log('✅ No more stores to process');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No more stores to process',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📋 Processing ${batchStores.length} stores`);

    let processed = 0;
    let failed = 0;
    let skippedMismatch = 0;
    const results = [];

    // Process each store in the batch
    for (const store of batchStores) {
      try {
        console.log(`🔍 Processing: ${store.store_name} (${store.city}, ${store.state})`);

        // First try to find existing cached data
        const { data: cached } = await supabase
          .from('google_places_cache')
          .select('*')
          .eq('search_query', `${store.store_name} ${store.store_address} ${store.city} ${store.state}`)
          .gt('cache_expires_at', new Date().toISOString())
          .maybeSingle();

        let businessData = null;

        if (cached && cached.business_data) {
          console.log(`📋 Using cached data for ${store.store_name}`);
          businessData = cached.business_data;
        } else {
          // Search Google Places API - try with address first for better accuracy
          // Remove store numbers from chain names for better matching
          const cleanStoreName = store.store_name.replace(/\s+\d+$/, '').trim();
          const searchQuery = `${cleanStoreName} ${store.store_address} ${store.city} ${store.state}`;
          console.log(`🔎 Search query: "${searchQuery}"`);
          const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,opening_hours,photos,formatted_phone_number,website,types,price_level,business_status&locationbias=circle:1000@${store.latitude},${store.longitude}&key=${googleApiKey}`;

          console.log(`🌐 Calling Google Places API for: ${store.store_name}`);
          
          const response = await fetch(searchUrl);
          const data: GooglePlacesResponse = await response.json();

          if (data.status !== 'OK' || !data.candidates || data.candidates.length === 0) {
            console.log(`⚠️ No results for: ${store.store_name}`);
            
            // Mark as failed in queue
            await supabase.rpc('update_sync_queue_status', {
              queue_id: store.queue_id,
              new_status: 'failed',
              error_msg: `No Google Places results: ${data.status}`
            });
            
            failed++;
            continue;
          }

          businessData = data.candidates[0];

          // Cache the result
          const cacheData = {
            search_query: searchQuery,
            place_id: businessData.place_id,
            business_data: businessData,
            cache_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          };

          await supabase
            .from('google_places_cache')
            .upsert(cacheData, {
              onConflict: 'search_query,place_id,params_hash,fields_hash',
              ignoreDuplicates: false
            });
        }

        // ============= NAME VALIDATION BEFORE SAVING =============
        const validation = validateNameSimilarity(store.store_name, businessData.name);
        
        if (!validation.isValid) {
          console.log(`⚠️ Name mismatch rejected: "${store.store_name}" vs Google "${businessData.name}" - ${validation.reason}`);
          
          // Mark as failed with mismatch reason
          await supabase.rpc('update_sync_queue_status', {
            queue_id: store.queue_id,
            new_status: 'failed',
            error_msg: `Name mismatch: store="${store.store_name}" vs google="${businessData.name}" (${validation.reason})`
          });
          
          skippedMismatch++;
          results.push({
            store_name: store.store_name,
            google_name: businessData.name,
            status: 'skipped_mismatch',
            reason: validation.reason,
            confidence: validation.confidence
          });
          continue;
        }
        
        console.log(`✅ Name validation passed: "${store.store_name}" ≈ "${businessData.name}" (confidence: ${validation.confidence.toFixed(2)})`);
        // ============= END NAME VALIDATION =============

        // Update the store with Google Places data
        const updateData = {
          google_place_id: businessData.place_id,
          google_name: businessData.name,
          google_formatted_address: businessData.formatted_address,
          google_website: businessData.website,
          google_formatted_phone_number: businessData.formatted_phone_number,
          google_opening_hours: businessData.opening_hours ? JSON.stringify(businessData.opening_hours) : null,
          google_rating: businessData.rating,
          google_user_ratings_total: businessData.user_ratings_total,
          google_photos: businessData.photos ? JSON.stringify(businessData.photos) : null,
          google_types: businessData.types ? JSON.stringify(businessData.types) : null,
          google_price_level: businessData.price_level,
          google_business_status: businessData.business_status,
          google_last_updated: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('snap_stores')
          .update(updateData)
          .eq('id', store.store_id);

        if (updateError) {
          console.error(`❌ Error updating store ${store.store_name}:`, updateError);
          
          await supabase.rpc('update_sync_queue_status', {
            queue_id: store.queue_id,
            new_status: 'failed',
            error_msg: `Update error: ${updateError.message}`
          });
          
          failed++;
          continue;
        }

        // Mark as completed in queue
        await supabase.rpc('update_sync_queue_status', {
          queue_id: store.queue_id,
          new_status: 'completed'
        });

        processed++;
        results.push({
          store_name: store.store_name,
          google_name: businessData.name,
          place_id: businessData.place_id,
          rating: businessData.rating,
          status: 'success',
          confidence: validation.confidence
        });

        console.log(`✅ Updated: ${store.store_name} → ${businessData.name} (${businessData.place_id})`);

        // Rate limiting - small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error processing ${store.store_name}:`, error);
        
        await supabase.rpc('update_sync_queue_status', {
          queue_id: store.queue_id,
          new_status: 'failed',
          error_msg: error.message
        });
        
        failed++;
      }
    }

    // Get remaining queue stats
    const { data: queueStats } = await supabase
      .from('google_places_sync_queue')
      .select('status')
      .in('status', ['pending', 'processing']);

    const remaining = queueStats?.length || 0;

    console.log(`📊 Batch complete: ${processed} processed, ${skippedMismatch} skipped (mismatch), ${failed} failed, ${remaining} remaining`);

    return new Response(JSON.stringify({
      success: true,
      processed,
      skipped_mismatch: skippedMismatch,
      failed,
      remaining,
      batch_size: batchStores.length,
      results: results.slice(0, 10) // Show first 10 results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Bulk sync error:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred during bulk sync. Please try again later.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});