import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function orchestrates the daily SNAP blog automation
// It should be called by a cron job or external scheduler

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const results = {
      fetchNews: null as any,
      generateBlog: null as any,
      timestamp: new Date().toISOString()
    };

    // Step 1: Fetch latest SNAP news
    console.log('Step 1: Fetching SNAP news...');
    try {
      const fetchResponse = await fetch(`${SUPABASE_URL}/functions/v1/fetch-snap-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      results.fetchNews = await fetchResponse.json();
      console.log('Fetch news result:', results.fetchNews);

      // Check if budget was exceeded
      if (results.fetchNews.budgetExceeded) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Weekly budget limit reached - no operations performed',
            results
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (fetchError) {
      console.error('Error fetching news:', fetchError);
      results.fetchNews = { error: fetchError instanceof Error ? fetchError.message : 'Unknown error' };
    }

    // Wait a moment before generating to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Generate blog posts from fetched news
    console.log('Step 2: Generating blog posts...');
    try {
      const generateResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-snap-blog`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      results.generateBlog = await generateResponse.json();
      console.log('Generate blog result:', results.generateBlog);
    } catch (generateError) {
      console.error('Error generating blogs:', generateError);
      results.generateBlog = { error: generateError instanceof Error ? generateError.message : 'Unknown error' };
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SNAP blog automation completed',
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('snap-blog-scheduler error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
