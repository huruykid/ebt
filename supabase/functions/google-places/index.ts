
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../sync-snap-stores/constants.ts'

console.log('Google Places function started')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, query, place_id, photo_reference, max_width } = await req.json()
    
    // Get the API key from environment variables
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    
    if (!apiKey) {
      console.error('Google Places API key not found in environment variables')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Places API key not configured' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Processing action:', action)

    switch (action) {
      case 'search': {
        if (!query) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Query parameter is required for search' 
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
        
        console.log('Making request to Google Places API for search')
        const response = await fetch(searchUrl)
        const data = await response.json()

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          console.error('Google Places API error:', data.status, data.error_message)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Places API error: ${data.status}` 
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            results: data.results || [] 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      case 'details': {
        if (!place_id) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Place ID is required for details' 
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,opening_hours,photos,rating,user_ratings_total,website,business_status&key=${apiKey}`
        
        console.log('Making request to Google Places API for details')
        const response = await fetch(detailsUrl)
        const data = await response.json()

        if (data.status !== 'OK') {
          console.error('Google Places API error:', data.status, data.error_message)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Places API error: ${data.status}` 
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            result: data.result 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      case 'photo': {
        if (!photo_reference) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Photo reference is required for photo' 
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${max_width || 400}&photo_reference=${photo_reference}&key=${apiKey}`
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            photo_url: photoUrl 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action. Supported actions: search, details, photo' 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
    }

  } catch (error) {
    console.error('Error in Google Places function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
