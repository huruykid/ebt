import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment configuration
const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const PLACES_BUDGET_USD = parseFloat(Deno.env.get('PLACES_BUDGET_USD') || '250');

// TTL constants (in days)
const TTL_TEXT_SEARCH = parseInt(Deno.env.get('TTL_TEXT_SEARCH') || '7');
const TTL_PLACE_DETAILS = parseInt(Deno.env.get('TTL_PLACE_DETAILS') || '14');

// Pricing constants (USD per 1000 calls)
const PRICING = {
  PLACE_DETAILS_ESSENTIALS: { cost: 5.00, freeLimit: 10000 },
  TEXT_SEARCH_PRO: { cost: 32.00, freeLimit: 5000 },
};

// Per-user rate limiting configuration
const USER_RATE_LIMIT = parseInt(Deno.env.get('USER_RATE_LIMIT') || '50'); // Max requests per user per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// In-memory rate limit store (reset on function cold start)
const userRateLimits: Map<string, { count: number; windowStart: number }> = new Map();

// Service role client for database operations
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSignificantWords(name: string): string[] {
  return normalizeName(name)
    .split(' ')
    .filter(word => word.length > 1 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));
}

function isKnownChain(name: string): string | null {
  const normalized = normalizeName(name);
  for (const chain of KNOWN_CHAINS) {
    if (normalized.includes(chain) || normalized.startsWith(chain.split(' ')[0])) {
      return chain;
    }
  }
  return null;
}

function jaccardSimilarity(set1: string[], set2: string[]): number {
  const s1 = new Set(set1);
  const s2 = new Set(set2);
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s1[i - 1] === s2[j - 1] 
        ? dp[i - 1][j - 1] 
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function levenshteinSimilarity(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - levenshteinDistance(s1, s2) / maxLen;
}

interface NameValidationResult {
  isValid: boolean;
  confidence: number;
  reason: string;
}

function validateNameSimilarity(storeName: string, googleName: string): NameValidationResult {
  const normalizedStore = normalizeName(storeName);
  const normalizedGoogle = normalizeName(googleName);
  
  if (normalizedStore === normalizedGoogle) {
    return { isValid: true, confidence: 1.0, reason: 'exact_match' };
  }
  
  const storeChain = isKnownChain(storeName);
  const googleChain = isKnownChain(googleName);
  
  if (storeChain && googleChain && storeChain !== googleChain) {
    return { isValid: false, confidence: 0, reason: `chain_mismatch: "${storeChain}" vs "${googleChain}"` };
  }
  
  if (googleChain && !normalizedStore.includes(googleChain)) {
    return { isValid: false, confidence: 0, reason: `google_is_chain_not_in_store: "${googleChain}"` };
  }
  
  if (normalizedStore.includes(normalizedGoogle) || normalizedGoogle.includes(normalizedStore)) {
    return { isValid: true, confidence: 0.9, reason: 'name_contains' };
  }
  
  const storeWords = extractSignificantWords(storeName);
  const googleWords = extractSignificantWords(googleName);
  const jaccardScore = jaccardSimilarity(storeWords, googleWords);
  const levScore = levenshteinSimilarity(normalizedStore, normalizedGoogle);
  const combinedScore = (jaccardScore * 0.6) + (levScore * 0.4);
  
  const hasWordOverlap = storeWords.some(w => googleWords.includes(w));
  const isValid = combinedScore >= 0.4 || (hasWordOverlap && combinedScore >= 0.2);
  
  return {
    isValid,
    confidence: combinedScore,
    reason: isValid 
      ? `similarity_match: ${combinedScore.toFixed(2)}`
      : `low_similarity: ${combinedScore.toFixed(2)}`
  };
}

// ============= END NAME SIMILARITY VALIDATION =============

// Helper to validate authenticated user from request
async function validateAuth(req: Request): Promise<{ user: any; error: string | null }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return { user: null, error: 'Missing authorization header' };
  }
  
  // Create client with user's auth token to validate
  const supabaseAuth = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: authHeader } }
  });
  
  const { data: { user }, error } = await supabaseAuth.auth.getUser();
  
  if (error || !user) {
    console.log('Auth validation failed:', error?.message || 'No user found');
    return { user: null, error: 'Unauthorized' };
  }
  
  console.log('Authenticated request from user:', user.id);
  return { user, error: null };
}

// Check and update per-user rate limit
function checkUserRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const userLimit = userRateLimits.get(userId);
  
  // If no record exists or window expired, create new window
  if (!userLimit || (now - userLimit.windowStart) > RATE_LIMIT_WINDOW_MS) {
    userRateLimits.set(userId, { count: 1, windowStart: now });
    return { allowed: true, remaining: USER_RATE_LIMIT - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  // Check if user has exceeded limit
  if (userLimit.count >= USER_RATE_LIMIT) {
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - userLimit.windowStart);
    console.log(`Rate limit exceeded for user ${userId}. Requests: ${userLimit.count}/${USER_RATE_LIMIT}`);
    return { allowed: false, remaining: 0, resetIn };
  }
  
  // Increment count
  userLimit.count++;
  const remaining = USER_RATE_LIMIT - userLimit.count;
  const resetIn = RATE_LIMIT_WINDOW_MS - (now - userLimit.windowStart);
  
  return { allowed: true, remaining, resetIn };
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

async function normalizeParams(params: Record<string, any>): Promise<string> {
  const sorted = Object.keys(params).sort().reduce((obj: Record<string, any>, key) => {
    obj[key] = params[key];
    return obj;
  }, {});
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(sorted)));
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function generateFieldsHash(fields: string[]): Promise<string> {
  const sortedFields = [...fields].sort().join(',');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sortedFields));
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function checkCache(query: string | null, paramsHash: string, placeId: string | null, fieldsHash: string | null) {
  let cacheQuery;
  
  if (placeId && fieldsHash) {
    // Place Details cache lookup
    cacheQuery = supabaseAdmin
      .from('google_places_cache')
      .select('*')
      .eq('place_id', placeId)
      .eq('fields_hash', fieldsHash)
      .single();
  } else if (query) {
    // Text search cache lookup
    cacheQuery = supabaseAdmin
      .from('google_places_cache')
      .select('*')
      .eq('search_query', query)
      .eq('params_hash', paramsHash)
      .single();
  } else {
    return null;
  }

  const { data: cached } = await cacheQuery;
  
  // Check if cache is still fresh
  if (cached && cached.fresh_until && new Date(cached.fresh_until) > new Date()) {
    return cached;
  }
  
  // Return stale cache data (can be used as fallback)
  return cached;
}

async function checkBudget(sku: string): Promise<{ allowed: boolean; currentCost: number }> {
  const month = getCurrentMonth();
  
  // Get current usage
  const { data: usage } = await supabaseAdmin
    .from('api_usage_ledger')
    .select('estimated_cost_usd')
    .eq('month', month);

  const currentCost = usage?.reduce((sum, row) => sum + parseFloat(row.estimated_cost_usd || '0'), 0) || 0;
  
  // Calculate cost of this call
  const pricing = PRICING[sku as keyof typeof PRICING];
  const callCost = pricing.cost / 1000; // Cost per single call
  
  const allowed = (currentCost + callCost) <= PLACES_BUDGET_USD;
  
  if (!allowed) {
    // Log budget event
    await supabaseAdmin
      .from('budget_events')
      .insert({
        month,
        threshold: PLACES_BUDGET_USD,
        action: 'BLOCKED_CALL',
        meta: { sku, current_cost: currentCost, attempted_cost: callCost }
      });
  }
  
  return { allowed, currentCost };
}

async function updateUsageLedger(sku: string) {
  const month = getCurrentMonth();
  const pricing = PRICING[sku as keyof typeof PRICING];
  
  // Get current free remaining for this SKU
  const { data: currentUsage } = await supabaseAdmin
    .from('api_usage_ledger')
    .select('free_remaining')
    .eq('month', month)
    .eq('sku', sku)
    .single();
  
  const freeRemaining = currentUsage?.free_remaining ?? pricing.freeLimit;
  
  // Determine if this call is free or billable
  const isFree = freeRemaining > 0;
  const countInc = 1;
  const billableInc = isFree ? 0 : 1;
  const costInc = isFree ? 0 : pricing.cost / 1000;
  const freeDec = isFree ? 1 : 0;
  
  // Use atomic upsert function
  const { error } = await supabaseAdmin.rpc('upsert_usage_ledger', {
    p_month: month,
    p_sku: sku,
    p_count_inc: countInc,
    p_billable_inc: billableInc,
    p_cost_inc: costInc,
    p_free_dec: freeDec
  });
  
  if (error) {
    console.error('Failed to update usage ledger:', error);
  }
}

async function cacheResult(
  query: string | null, 
  paramsHash: string, 
  placeId: string | null, 
  fieldsHash: string | null, 
  payload: any, 
  ttlDays: number
) {
  const freshUntil = new Date();
  freshUntil.setDate(freshUntil.getDate() + ttlDays);
  
  const cacheData = {
    search_query: query,
    params_hash: paramsHash,
    place_id: placeId,
    fields_hash: fieldsHash,
    business_data: payload,
    fresh_until: freshUntil.toISOString(),
    last_updated: new Date().toISOString()
  };
  
  try {
    // Upsert to google_places_cache table
    const { error } = await supabaseAdmin
      .from('google_places_cache')
      .upsert(cacheData, { 
        onConflict: placeId ? 'place_id,fields_hash' : 'search_query,params_hash',
        ignoreDuplicates: false 
      });
      
    if (error) {
      console.error('Failed to cache result:', error);
    } else {
      console.log('Successfully cached result for:', query || placeId);
    }
  } catch (error) {
    console.error('Error caching result:', error);
  }
}

async function callGooglePlacesAPI(action: string, params: any) {
  if (action === 'search_text') {
    // Use legacy API for text search (still works and cheaper)
    const { query, region, radius } = params;
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', query);
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY!);
    
    if (region) url.searchParams.set('region', region);
    if (radius) url.searchParams.set('radius', radius.toString());
    
    const response = await fetch(url.toString());
    return await response.json();
    
  } else if (action === 'place_details') {
    // Use new Places API (Field Mask) for place details
    const { place_id, fields } = params;
    const url = `https://places.googleapis.com/v1/places/${place_id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
        'X-Goog-FieldMask': fields.join(','),
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    return await response.json();
  }
  
  throw new Error(`Unknown action: ${action}`);
}

async function handleTextSearch(params: any) {
  const { query, region } = params;
  
  const fieldsHash = await generateFieldsHash(['id', 'displayName', 'formattedAddress']);
  const paramsHash = await normalizeParams({ query, region });
  const sku = 'TEXT_SEARCH_PRO';
  
  // 1. Check cache first
  const cached = await checkCache(query, paramsHash, null, null);
  if (cached && cached.fresh_until && new Date(cached.fresh_until) > new Date()) {
    return { from: 'cache', budget_exceeded: false, data: cached.business_data };
  }
  
  // 2. Check budget
  const { allowed, currentCost } = await checkBudget(sku);
  if (!allowed) {
    // Return stale cache if available
    if (cached) {
      return { from: 'cache', budget_exceeded: true, data: cached.business_data };
    }
    return { from: 'cache', budget_exceeded: true, data: null, error: 'Budget exceeded and no cache available' };
  }
  
  // 3. Call Google API
  try {
    const googleResponse = await callGooglePlacesAPI('search_text', params);
    
    // 4. Update usage ledger
    await updateUsageLedger(sku);
    
    // 5. Cache the result
    await cacheResult(query, paramsHash, null, null, googleResponse, TTL_TEXT_SEARCH);
    
    return { from: 'google', budget_exceeded: false, data: googleResponse };
    
  } catch (error) {
    console.error('Google Places API error:', error);
    
    // Return stale cache if available
    if (cached) {
      return { from: 'cache', budget_exceeded: false, data: cached.business_data };
    }
    
    throw error;
  }
}

async function updateStoreWithGoogleData(storeId: string, placeData: any): Promise<{ success: boolean; reason?: string }> {
  try {
    // Extract comprehensive fields from Google Places response
    const googleData = {
      place_id: placeData.id || placeData.place_id,
      name: placeData.displayName?.text || placeData.name,
      formatted_address: placeData.formattedAddress || placeData.formatted_address,
      website: placeData.websiteUri || placeData.website,
      phone: placeData.nationalPhoneNumber || placeData.internationalPhoneNumber || placeData.formatted_phone_number,
      opening_hours: placeData.regularOpeningHours || placeData.opening_hours,
      rating: placeData.rating,
      user_ratings_total: placeData.userRatingCount || placeData.user_ratings_total,
      photos: placeData.photos,
      types: placeData.types,
      price_level: placeData.priceLevel,
      geometry: placeData.location || placeData.viewport ? {
        location: placeData.location,
        viewport: placeData.viewport
      } : placeData.geometry,
      business_status: placeData.businessStatus,
      vicinity: placeData.shortFormattedAddress || placeData.vicinity,
      icon: placeData.icon,
      icon_background_color: placeData.iconBackgroundColor,
      icon_mask_base_uri: placeData.iconMaskBaseUri,
      plus_code: placeData.plusCode?.globalCode || placeData.plus_code,
      reviews: placeData.reviews
    };

    // Fetch the store's original name for validation
    const { data: store, error: fetchError } = await supabaseAdmin
      .from('snap_stores')
      .select('Store_Name')
      .eq('id', storeId)
      .single();

    if (fetchError || !store) {
      console.error('Failed to fetch store for validation:', fetchError);
      return { success: false, reason: 'store_not_found' };
    }

    // Validate name similarity before saving
    if (googleData.name && store.Store_Name) {
      const validation = validateNameSimilarity(store.Store_Name, googleData.name);
      
      if (!validation.isValid) {
        console.log(`⚠️ Name mismatch rejected for store ${storeId}: "${store.Store_Name}" vs Google "${googleData.name}" - ${validation.reason}`);
        return { success: false, reason: `name_mismatch: ${validation.reason}` };
      }
      
      console.log(`✅ Name validation passed: "${store.Store_Name}" ≈ "${googleData.name}" (confidence: ${validation.confidence.toFixed(2)})`);
    }

    // Update the store record using our expanded database function
    const { error } = await supabaseAdmin.rpc('update_store_with_google_data', {
      p_store_id: storeId,
      p_place_id: googleData.place_id,
      p_name: googleData.name,
      p_formatted_address: googleData.formatted_address,
      p_website: googleData.website,
      p_phone: googleData.phone,
      p_opening_hours: googleData.opening_hours,
      p_rating: googleData.rating,
      p_user_ratings_total: googleData.user_ratings_total,
      p_photos: googleData.photos,
      p_types: googleData.types,
      p_price_level: googleData.price_level,
      p_geometry: googleData.geometry,
      p_business_status: googleData.business_status,
      p_vicinity: googleData.vicinity,
      p_icon: googleData.icon,
      p_icon_background_color: googleData.icon_background_color,
      p_icon_mask_base_uri: googleData.icon_mask_base_uri,
      p_plus_code: googleData.plus_code,
      p_reviews: googleData.reviews
    });

    if (error) {
      console.error('Failed to update store with Google data:', error);
      return { success: false, reason: error.message };
    }
    
    console.log(`Successfully updated store ${storeId} with Google Places data`);
    return { success: true };
  } catch (error) {
    console.error('Error updating store with Google data:', error);
    return { success: false, reason: error.message };
  }
}

async function handlePlaceDetails(params: any) {
  const { 
    place_id, 
    store_id, // Optional: if provided, we'll update the store record
    fields = [
      // Comprehensive field list - maximizing data per API call
      'id', 'displayName', 'formattedAddress', 'location', 'viewport',
      'websiteUri', 'nationalPhoneNumber', 'internationalPhoneNumber',
      'regularOpeningHours', 'rating', 'userRatingCount', 'reviews',
      'priceLevel', 'types', 'businessStatus', 'photos',
      'iconMaskBaseUri', 'iconBackgroundColor', 'plusCode',
      'shortFormattedAddress', 'utcOffsetMinutes', 'accessibilityOptions',
      'allowsDogs', 'curbsidePickup', 'delivery', 'dineIn',
      'editorialSummary', 'outdoorSeating', 'reservable', 'servesBeer',
      'servesBreakfast', 'servesBrunch', 'servesDinner', 'servesLunch',
      'servesVegetarianFood', 'servesWine', 'takeout'
    ] 
  } = params;
  
  const fieldsHash = await generateFieldsHash(fields);
  const paramsHash = await normalizeParams({ place_id, fields: fields.sort() });
  const sku = 'PLACE_DETAILS_ESSENTIALS';
  
  // 1. Check cache first
  const cached = await checkCache(null, paramsHash, place_id, fieldsHash);
  if (cached && cached.fresh_until && new Date(cached.fresh_until) > new Date()) {
    return { from: 'cache', budget_exceeded: false, data: cached.business_data };
  }
  
  // 2. Check budget
  const { allowed, currentCost } = await checkBudget(sku);
  if (!allowed) {
    // Return stale cache if available
    if (cached) {
      return { from: 'cache', budget_exceeded: true, data: cached.business_data };
    }
    return { from: 'cache', budget_exceeded: true, data: null, error: 'Budget exceeded and no cache available' };
  }
  
  // 3. Call Google API
  try {
    const googleResponse = await callGooglePlacesAPI('place_details', { place_id, fields });
    
    // 4. Update usage ledger
    await updateUsageLedger(sku);
    
    // 5. Update store record if store_id provided
    if (store_id && googleResponse) {
      await updateStoreWithGoogleData(store_id, googleResponse);
    }
    
    // 6. Cache the result
    await cacheResult(null, paramsHash, place_id, fieldsHash, googleResponse, TTL_PLACE_DETAILS);
    
    return { from: 'google', budget_exceeded: false, data: googleResponse };
    
  } catch (error) {
    console.error('Google Places API error:', error);
    
    // Return stale cache if available
    if (cached) {
      return { from: 'cache', budget_exceeded: false, data: cached.business_data };
    }
    
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication first
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', from: 'error', budget_exceeded: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check per-user rate limit
    const rateLimit = checkUserRateLimit(user.id);
    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
      console.log(`User ${user.id} rate limited. Reset in ${resetMinutes} minutes.`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.', 
          from: 'error', 
          budget_exceeded: false,
          rate_limited: true,
          reset_in_minutes: resetMinutes
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000))
          } 
        }
      );
    }

    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY not configured');
    }

    const { action, payload } = await req.json();
    
    let result;
    
    switch (action) {
      case 'search_text':
        result = await handleTextSearch(payload);
        break;
        
      case 'place_details':
        result = await handlePlaceDetails(payload);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in places-proxy function:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred while fetching places data. Please try again later.',
      from: 'error',
      budget_exceeded: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});