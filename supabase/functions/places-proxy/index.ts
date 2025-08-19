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

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function normalizeParams(params: Record<string, any>): string {
  const sorted = Object.keys(params).sort().reduce((obj: Record<string, any>, key) => {
    obj[key] = params[key];
    return obj;
  }, {});
  return crypto.subtle.digestSync('SHA-256', new TextEncoder().encode(JSON.stringify(sorted)))
    .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

function generateFieldsHash(fields: string[]): string {
  const sortedFields = [...fields].sort().join(',');
  return crypto.subtle.digestSync('SHA-256', new TextEncoder().encode(sortedFields))
    .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

async function checkCache(query: string | null, paramsHash: string, placeId: string | null, fieldsHash: string | null) {
  let cacheQuery;
  
  if (placeId && fieldsHash) {
    // Place Details cache lookup
    cacheQuery = supabase
      .from('places_cache')
      .select('*')
      .eq('place_id', placeId)
      .eq('fields_hash', fieldsHash)
      .single();
  } else if (query) {
    // Text search cache lookup
    cacheQuery = supabase
      .from('places_cache')
      .select('*')
      .eq('query', query)
      .eq('params_hash', paramsHash)
      .single();
  } else {
    return null;
  }

  const { data: cached } = await cacheQuery;
  return cached;
}

async function checkBudget(sku: string): Promise<{ allowed: boolean; currentCost: number }> {
  const month = getCurrentMonth();
  
  // Get current usage
  const { data: usage } = await supabase
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
    await supabase
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
  const { data: currentUsage } = await supabase
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
  const { error } = await supabase.rpc('upsert_usage_ledger', {
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
    query,
    params_hash: paramsHash,
    place_id: placeId,
    fields_hash: fieldsHash,
    payload,
    fresh_until: freshUntil.toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Upsert based on whether it's a place details or text search
  if (placeId && fieldsHash) {
    // For place details, update or insert based on place_id + fields_hash
    await supabase
      .from('places_cache')
      .upsert(cacheData, { 
        onConflict: 'place_id,fields_hash',
        ignoreDuplicates: false 
      });
  } else if (query) {
    // For text search, update or insert based on query + params_hash
    await supabase
      .from('places_cache')
      .upsert(cacheData, { 
        onConflict: 'query,params_hash',
        ignoreDuplicates: false 
      });
  }
}

async function callGooglePlacesAPI(action: string, params: any) {
  const baseUrl = 'https://maps.googleapis.com/maps/api';
  
  if (action === 'search_text') {
    const { query, region, radius } = params;
    const url = new URL(`${baseUrl}/place/textsearch/json`);
    url.searchParams.set('query', query);
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY!);
    
    if (region) url.searchParams.set('region', region);
    if (radius) url.searchParams.set('radius', radius.toString());
    
    const response = await fetch(url.toString());
    return await response.json();
    
  } else if (action === 'place_details') {
    const { place_id, fields } = params;
    const url = new URL(`${baseUrl}/place/details/json`);
    url.searchParams.set('place_id', place_id);
    url.searchParams.set('fields', fields.join(','));
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY!);
    
    const response = await fetch(url.toString());
    return await response.json();
  }
  
  throw new Error(`Unknown action: ${action}`);
}

async function handleTextSearch(params: any) {
  const paramsHash = normalizeParams(params);
  const sku = 'TEXT_SEARCH_PRO';
  
  // 1. Check cache first
  const cached = await checkCache(params.query, paramsHash, null, null);
  if (cached && new Date(cached.fresh_until) > new Date()) {
    return { from: 'cache', budget_exceeded: false, data: cached.payload };
  }
  
  // 2. Check budget
  const { allowed, currentCost } = await checkBudget(sku);
  if (!allowed) {
    // Return stale cache if available
    if (cached) {
      return { from: 'cache', budget_exceeded: true, data: cached.payload };
    }
    return { from: 'cache', budget_exceeded: true, data: null, error: 'Budget exceeded and no cache available' };
  }
  
  // 3. Call Google API
  try {
    const googleResponse = await callGooglePlacesAPI('search_text', params);
    
    // 4. Update usage ledger
    await updateUsageLedger(sku);
    
    // 5. Cache the result
    await cacheResult(params.query, paramsHash, null, null, googleResponse, TTL_TEXT_SEARCH);
    
    return { from: 'google', budget_exceeded: false, data: googleResponse };
    
  } catch (error) {
    console.error('Google Places API error:', error);
    
    // Return stale cache if available
    if (cached) {
      return { from: 'cache', budget_exceeded: false, data: cached.payload };
    }
    
    throw error;
  }
}

async function handlePlaceDetails(params: any) {
  const { place_id, fields = [
    'place_id', 'name', 'formatted_address', 'geometry', 
    'opening_hours', 'website', 'formatted_phone_number', 
    'rating', 'user_ratings_total'
  ] } = params;
  
  const fieldsHash = generateFieldsHash(fields);
  const paramsHash = normalizeParams({ place_id, fields: fields.sort() });
  const sku = 'PLACE_DETAILS_ESSENTIALS';
  
  // 1. Check cache first
  const cached = await checkCache(null, paramsHash, place_id, fieldsHash);
  if (cached && new Date(cached.fresh_until) > new Date()) {
    return { from: 'cache', budget_exceeded: false, data: cached.payload };
  }
  
  // 2. Check budget
  const { allowed, currentCost } = await checkBudget(sku);
  if (!allowed) {
    // Return stale cache if available
    if (cached) {
      return { from: 'cache', budget_exceeded: true, data: cached.payload };
    }
    return { from: 'cache', budget_exceeded: true, data: null, error: 'Budget exceeded and no cache available' };
  }
  
  // 3. Call Google API
  try {
    const googleResponse = await callGooglePlacesAPI('place_details', { place_id, fields });
    
    // 4. Update usage ledger
    await updateUsageLedger(sku);
    
    // 5. Cache the result
    await cacheResult(null, paramsHash, place_id, fieldsHash, googleResponse, TTL_PLACE_DETAILS);
    
    return { from: 'google', budget_exceeded: false, data: googleResponse };
    
  } catch (error) {
    console.error('Google Places API error:', error);
    
    // Return stale cache if available
    if (cached) {
      return { from: 'cache', budget_exceeded: false, data: cached.payload };
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
      error: error.message,
      from: 'error',
      budget_exceeded: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});