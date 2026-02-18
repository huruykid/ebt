import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory cache of blocked IPs for this instance
const blockedIPs = new Set<string>();
// Rate limit map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // photos/minute per IP
const RATE_WINDOW_MS = 60 * 1000;

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  if (record.count >= RATE_LIMIT) return true;
  record.count++;
  return false;
}

async function isUSTraffic(ip: string): Promise<boolean> {
  // Skip geo-check for private/local IPs (development)
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return true;
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return true; // Fail open
    const data = await res.json();
    return !data.countryCode || data.countryCode === 'US';
  } catch {
    return true; // Fail open on timeout/error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);

    // Fast-block previously identified non-US IPs
    if (blockedIPs.has(clientIP)) {
      return new Response(JSON.stringify({ error: 'Service not available in your region' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit check
    if (isRateLimited(clientIP)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Geo-block non-US traffic (runs async, ~10ms with 2s timeout, fail-open)
    const usOnly = await isUSTraffic(clientIP);
    if (!usOnly) {
      blockedIPs.add(clientIP);
      console.log(`Blocked non-US photo request from IP: ${clientIP}`);
      return new Response(JSON.stringify({ error: 'Service available in the US only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const photoReference = url.searchParams.get('photo_reference');
    const maxWidth = url.searchParams.get('maxwidth') || '800';
    const maxHeight = url.searchParams.get('maxheight') || '600';

    if (!photoReference) {
      return new Response(
        JSON.stringify({ error: 'Missing photo_reference parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!googleApiKey) {
      console.error('Google Places API key not found');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Construct Google Places Photo API URL
    const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&maxheight=${maxHeight}&photo_reference=${photoReference}&key=${googleApiKey}`;

    console.log('📸 Fetching photo from Google Places Photo API...');

    const photoResponse = await fetch(googlePhotoUrl);

    if (!photoResponse.ok) {
      console.error('Failed to fetch photo from Google Places API:', photoResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch photo' }),
        { 
          status: photoResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const photoData = await photoResponse.arrayBuffer();
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';

    return new Response(photoData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });

  } catch (error) {
    console.error('Error in google-places-photo function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
