
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
    const { business_id } = await req.json()

    const YELP_API_KEY = Deno.env.get('YELP_API_KEY')
    if (!YELP_API_KEY) {
      throw new Error('Yelp API key not configured')
    }

    if (!business_id) {
      throw new Error('Business ID is required')
    }

    console.log('📸 Fetching business details for:', business_id)

    const response = await fetch(
      `https://api.yelp.com/v3/businesses/${business_id}`,
      {
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Yelp Business Details API error:', response.status)
      return new Response(
        JSON.stringify({ error: 'Yelp Business Details API error', status: response.status }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log('📸 Business details response:', data)
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in yelp-business-details function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
