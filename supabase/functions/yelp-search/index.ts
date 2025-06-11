
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
    const { term, latitude, longitude, radius = '1000', limit = '1', sort_by = 'distance' } = await req.json()

    const YELP_API_KEY = Deno.env.get('YELP_API_KEY')
    if (!YELP_API_KEY) {
      throw new Error('Yelp API key not configured')
    }

    const searchParams = new URLSearchParams({
      term,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius,
      limit,
      sort_by
    })

    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Yelp API error:', response.status)
      return new Response(
        JSON.stringify({ error: 'Yelp API error', status: response.status }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in yelp-search function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
