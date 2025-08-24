import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { photo_reference, max_width = 1200 } = await req.json()

    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured')
    }

    if (!photo_reference) {
      throw new Error('Photo reference is required')
    }

    console.log('📸 Fetching Google Places photo for reference:', photo_reference)

    // Google Places Photo API endpoint
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${photo_reference}&maxwidth=${max_width}&key=${GOOGLE_PLACES_API_KEY}`

    console.log('📸 Photo URL generated:', photoUrl)
    
    return new Response(
      JSON.stringify({ photo_url: photoUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in google-photos function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})