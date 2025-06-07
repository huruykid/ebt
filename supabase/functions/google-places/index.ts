
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      close: { day: number; time: string };
      open: { day: number; time: string };
    }>;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  website?: string;
  business_status?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, place_id, photo_reference, max_width = 400 } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    console.log(`Google Places API called with action: ${action}`);

    switch (action) {
      case 'search': {
        if (!query) {
          throw new Error('Query is required for search');
        }

        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
          console.error('Places search error:', searchData);
          throw new Error(`Places API error: ${searchData.status}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            results: searchData.results || [],
            status: searchData.status
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'details': {
        if (!place_id) {
          throw new Error('Place ID is required for details');
        }

        const fields = [
          'place_id',
          'name',
          'formatted_address',
          'formatted_phone_number',
          'international_phone_number',
          'opening_hours',
          'photos',
          'rating',
          'user_ratings_total',
          'price_level',
          'website',
          'business_status'
        ].join(',');

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status !== 'OK') {
          console.error('Places details error:', detailsData);
          throw new Error(`Places API error: ${detailsData.status}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            result: detailsData.result
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'photo': {
        if (!photo_reference) {
          throw new Error('Photo reference is required');
        }

        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo_reference}&maxwidth=${max_width}&key=${apiKey}`;
        
        return new Response(
          JSON.stringify({
            success: true,
            photo_url: photoUrl
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Google Places API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
