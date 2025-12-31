import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers (Supabase sets these)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';

    console.log('IP Geolocation request for IP:', clientIP);

    // Use ip-api.com (free, no API key needed, 45 requests/minute limit)
    const response = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,message,lat,lon,city,regionName,country`);
    
    if (!response.ok) {
      throw new Error(`IP API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('IP API response:', data);

    if (data.status === 'fail') {
      // Fallback to a default US location (geographic center of US)
      console.log('IP lookup failed, using US center fallback');
      return new Response(JSON.stringify({
        latitude: 39.8283,
        longitude: -98.5795,
        city: 'United States',
        region: '',
        country: 'US',
        source: 'fallback'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      latitude: data.lat,
      longitude: data.lon,
      city: data.city || '',
      region: data.regionName || '',
      country: data.country || '',
      source: 'ip'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('IP Geolocation error:', error);
    
    // Return US center as ultimate fallback
    return new Response(JSON.stringify({
      latitude: 39.8283,
      longitude: -98.5795,
      city: 'United States',
      region: '',
      country: 'US',
      source: 'fallback',
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
