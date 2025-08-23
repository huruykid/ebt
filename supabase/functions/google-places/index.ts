import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GooglePlacesRequest {
  storeName: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface GooglePlacesBusiness {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  types?: string[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeName, address, latitude, longitude }: GooglePlacesRequest = await req.json();
    
    if (!storeName) {
      throw new Error('Store name is required');
    }

    console.log('🔍 Google Places lookup for:', { storeName, address });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create search query for cache lookup
    const searchQuery = `${storeName} ${address || ''}`.toLowerCase().trim();

    // Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('google_places_cache')
      .select('*')
      .eq('search_query', searchQuery)
      .gt('cache_expires_at', new Date().toISOString())
      .maybeSingle();

    if (cacheError) {
      console.warn('Cache lookup error:', cacheError);
    }

    if (cachedData) {
      console.log('📦 Using cached Google Places data for:', storeName);
      return new Response(
        JSON.stringify({ business: cachedData.business_data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🌐 Making Google Places API call for:', storeName);

    // Get Google Places API key
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!googleApiKey) {
      throw new Error('Google Places API key not configured');
    }

    let business: GooglePlacesBusiness | null = null;

    // Try Text Search first
    const textSearchQuery = `${storeName} ${address || ''}`;
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(textSearchQuery)}&key=${googleApiKey}`;
    
    if (latitude && longitude) {
      textSearchUrl + `&location=${latitude},${longitude}&radius=5000`;
    }

    console.log('📍 Text search query:', textSearchQuery);
    
    const textResponse = await fetch(textSearchUrl);
    const textData = await textResponse.json();

    if (textData.status === 'OK' && textData.results?.length > 0) {
      // Find best match based on name similarity
      const bestMatch = textData.results.find((place: any) => 
        place.name.toLowerCase().includes(storeName.toLowerCase()) ||
        storeName.toLowerCase().includes(place.name.toLowerCase())
      ) || textData.results[0];

      if (bestMatch) {
        // Get enhanced place information (excluding basic data we already have)
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${bestMatch.place_id}&fields=formatted_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,types,business_status,reviews&key=${googleApiKey}`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status === 'OK' && detailsData.result) {
          business = detailsData.result;
          console.log('✅ Found Google Places business:', business.name);
        }
      }
    }

    // If no results, try Nearby Search (if coordinates available)
    if (!business && latitude && longitude) {
      console.log('🔄 Trying nearby search...');
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&keyword=${encodeURIComponent(storeName)}&key=${googleApiKey}`;
      
      const nearbyResponse = await fetch(nearbyUrl);
      const nearbyData = await nearbyResponse.json();

      if (nearbyData.status === 'OK' && nearbyData.results?.length > 0) {
        const nearbyMatch = nearbyData.results.find((place: any) => 
          place.name.toLowerCase().includes(storeName.toLowerCase())
        ) || nearbyData.results[0];

        if (nearbyMatch) {
          // Get enhanced place information (excluding basic data we already have)
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${nearbyMatch.place_id}&fields=formatted_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,types,business_status,reviews&key=${googleApiKey}`;
          
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();

          if (detailsData.status === 'OK' && detailsData.result) {
            business = detailsData.result;
            console.log('✅ Found Google Places business via nearby:', business.name);
          }
        }
      }
    }

    // Convert photo references to actual URLs if business has photos
    if (business?.photos) {
      business.photos = business.photos.map((photo: any) => ({
        ...photo,
        photo_url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${googleApiKey}`
      }));
    }

    // Update the snap_stores table with comprehensive Google Places data if we found a business
    if (business && storeName) {
      // Find the store in snap_stores to update it
      const { data: storeData } = await supabase
        .from('snap_stores')
        .select('id')
        .ilike('Store_Name', `%${storeName.trim()}%`)
        .limit(1)
        .maybeSingle();

      if (storeData) {
        const { error: updateError } = await supabase
          .from('snap_stores')
          .update({
            google_place_id: business.place_id,
            google_formatted_phone_number: business.formatted_phone_number,
            google_website: business.website,
            google_opening_hours: business.opening_hours,
            google_rating: business.rating,
            google_user_ratings_total: business.user_ratings_total,
            google_photos: business.photos,
            google_reviews: business.reviews,
            google_types: business.types,
            google_price_level: business.price_level,
            google_business_status: business.business_status,
            google_last_updated: new Date().toISOString()
          })
          .eq('id', storeData.id);

        if (updateError) {
          console.error('Error updating snap_stores with Google Places data:', updateError);
        } else {
          console.log('✅ Updated snap_stores with enhanced Google Places data for:', storeName);
        }
      }
    }

    // Cache the result (even if null to avoid repeated API calls)
    const cacheExpiresAt = new Date();
    cacheExpiresAt.setDate(cacheExpiresAt.getDate() + 120); // 120 days

    const { error: insertError } = await supabase
      .from('google_places_cache')
      .insert({
        search_query: searchQuery,
        place_id: business?.place_id || null,
        business_data: business || {},
        cache_expires_at: cacheExpiresAt.toISOString()
      });

    if (insertError) {
      console.error('Cache insert error:', insertError);
      // Don't fail the request if cache insert fails
    } else {
      console.log('💾 Cached Google Places data for:', storeName);
    }

    return new Response(
      JSON.stringify({ business, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Google Places API error:', error);
    return new Response(
      JSON.stringify({ error: error.message, business: null }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});