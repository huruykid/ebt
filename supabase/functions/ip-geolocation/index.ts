import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (per instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.log('IP Geolocation: No authorization header');
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the JWT token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('IP Geolocation: Invalid auth token', authError?.message);
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting by user ID
    if (isRateLimited(user.id)) {
      console.log('IP Geolocation: Rate limited for user', user.id);
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        latitude: 39.8283,
        longitude: -98.5795,
        city: 'United States',
        region: '',
        country: 'US',
        source: 'fallback'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get client IP from headers (Supabase sets these)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';

    console.log('IP Geolocation request for user:', user.id, 'IP:', clientIP);

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
