import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Fetch the photo from Google Places API
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

    // Get the photo data
    const photoData = await photoResponse.arrayBuffer();
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';

    // Return the photo with appropriate headers
    return new Response(photoData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
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