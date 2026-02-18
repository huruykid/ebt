import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting by IP (per instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
// Aggressive rate limit for non-US IPs detected in this session
const blockedCountryMap = new Map<string, number>(); // IP -> timestamp of first block

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

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

// Return a non-US geo response so the client-side GeoBlockingOverlay fires,
// AND send 403 so GA doesn't record a meaningful session from bots.
function makeBlockedResponse(countryCode: string, countryName: string): Response {
  return new Response(JSON.stringify({
    latitude: null,
    longitude: null,
    city: '',
    region: '',
    country: countryName,
    countryCode: countryCode,
    source: 'blocked',
    blocked: true,
  }), {
    status: 403,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    console.log('IP Geolocation request for IP:', clientIP);

    // If this IP was already identified as non-US in this instance, fast-block it
    if (blockedCountryMap.has(clientIP)) {
      console.log(`Fast-blocking previously identified non-US IP: ${clientIP}`);
      return makeBlockedResponse('--', 'Blocked');
    }

    // Rate limiting by IP address
    if (isRateLimited(clientIP)) {
      console.log('IP Geolocation: Rate limited for IP', clientIP);
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        latitude: 39.8283,
        longitude: -98.5795,
        city: 'United States',
        region: '',
        country: 'US',
        countryCode: 'US',
        source: 'fallback'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Lookup the IP — we need full fields to serve the geo data AND check country
    const response = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,message,lat,lon,city,regionName,country,countryCode`);
    
    if (!response.ok) {
      throw new Error(`IP API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('IP API response:', data);

    if (data.status === 'fail') {
      // Lookup failed (local/private IP, etc.) — fail open with US center
      console.log('IP lookup failed, using US center fallback');
      return new Response(JSON.stringify({
        latitude: 39.8283,
        longitude: -98.5795,
        city: 'United States',
        region: '',
        country: 'US',
        countryCode: 'US',
        source: 'fallback'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const countryCode = data.countryCode || '';

    // --- Server-side geo-block for non-US traffic ---
    // We still return the country info so the client-side overlay can render
    // the correct country name, but we send 403 to signal this is a blocked session.
    if (countryCode && countryCode !== 'US') {
      console.log(`Blocking non-US request from ${countryCode} (${clientIP})`);
      // Cache this IP in memory so repeat calls are fast-blocked
      blockedCountryMap.set(clientIP, Date.now());
      return makeBlockedResponse(countryCode, data.country || countryCode);
    }

    return new Response(JSON.stringify({
      latitude: data.lat,
      longitude: data.lon,
      city: data.city || '',
      region: data.regionName || '',
      country: data.country || '',
      countryCode: countryCode,
      source: 'ip'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('IP Geolocation error:', error);
    
    // Fail open — return US center so legitimate users aren't blocked
    return new Response(JSON.stringify({
      latitude: 39.8283,
      longitude: -98.5795,
      city: 'United States',
      region: '',
      country: 'US',
      countryCode: 'US',
      source: 'fallback',
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
