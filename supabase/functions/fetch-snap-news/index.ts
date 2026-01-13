import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reputable publishers for SNAP news
const REPUTABLE_SOURCES = [
  'usda.gov',
  'fns.usda.gov',
  'cbpp.org',
  'feedingamerica.org',
  'npr.org',
  'apnews.com',
  'reuters.com',
  'washingtonpost.com',
  'nytimes.com',
  'politico.com',
  'thehill.com',
  'govexec.com',
  'kff.org',
  'urban.org'
];

// Estimated cost per Perplexity API call (sonar model)
const PERPLEXITY_COST_PER_CALL = 0.005; // ~$0.005 per search

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check budget before proceeding
    const { data: budgetCheck, error: budgetError } = await supabase
      .rpc('check_snap_blog_budget', { estimated_cost: PERPLEXITY_COST_PER_CALL });

    if (budgetError) {
      console.error('Budget check error:', budgetError);
      throw new Error('Failed to check budget');
    }

    if (!budgetCheck) {
      console.log('Weekly budget limit reached, skipping news fetch');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Weekly budget limit of $2.00 reached',
          budgetExceeded: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for recent SNAP news using Perplexity with structured output
    const allArticles: Array<{
      title: string;
      publisher: string;
      publish_date: string | null;
      summary: string;
      source_url: string;
    }> = [];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: `You are a news research assistant specializing in SNAP (Supplemental Nutrition Assistance Program) news. Find recent news articles and extract structured information. Always provide descriptive, specific titles that summarize what the article is about.` 
          },
          { 
            role: 'user', 
            content: `Find the latest SNAP food stamps news from the past 7 days. Return up to 5 articles as a JSON array. Each article must have:
- title: A descriptive headline (e.g., "Minnesota SNAP Benefits Face 15% Reduction Starting March 2026")
- publisher: The news source name
- publish_date: Date in YYYY-MM-DD format or null if unknown
- summary: 2-3 sentence summary of what changed and why it matters
- source_url: The full URL to the article

Focus on: benefit changes, policy updates, state-level news, federal program changes, eligibility changes.
Return ONLY valid JSON array, no other text.` 
          }
        ],
        search_recency_filter: 'week',
        temperature: 0.1,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'snap_news_articles',
            schema: {
              type: 'object',
              properties: {
                articles: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      publisher: { type: 'string' },
                      publish_date: { type: 'string' },
                      summary: { type: 'string' },
                      source_url: { type: 'string' }
                    },
                    required: ['title', 'publisher', 'summary', 'source_url']
                  }
                }
              },
              required: ['articles']
            }
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    console.log('Perplexity response:', content.substring(0, 500));
    console.log('Citations:', citations);

    // Parse structured JSON response
    try {
      const parsed = JSON.parse(content);
      const articles = parsed.articles || parsed || [];
      
      for (const article of articles.slice(0, 5)) {
        if (article.title && article.source_url) {
          // Check if this URL already exists
          const { data: existing } = await supabase
            .from('snap_news_articles')
            .select('id')
            .eq('source_url', article.source_url)
            .single();

          if (!existing) {
            allArticles.push({
              title: article.title,
              publisher: article.publisher || new URL(article.source_url).hostname.replace('www.', ''),
              publish_date: article.publish_date || null,
              summary: article.summary || 'SNAP-related news update. See source for details.',
              source_url: article.source_url
            });
          }
        }
      }
    } catch (parseError) {
      console.error('Failed to parse structured response:', parseError);
      // Fallback: use citations with generic titles
      for (const citation of citations.slice(0, 5)) {
        try {
          const url = new URL(citation);
          const publisher = url.hostname.replace('www.', '');
          
          const { data: existing } = await supabase
            .from('snap_news_articles')
            .select('id')
            .eq('source_url', citation)
            .single();

          if (!existing) {
            allArticles.push({
              title: `SNAP Policy Update: ${publisher}`,
              publisher: publisher,
              publish_date: null,
              summary: `Recent SNAP-related news from ${publisher}. See source for full details.`,
              source_url: citation
            });
          }
        } catch (e) {
          console.log('Invalid citation URL:', citation);
        }
      }
    }

    // Insert new articles
    let insertedCount = 0;
    for (const article of allArticles) {
      const { error: insertError } = await supabase
        .from('snap_news_articles')
        .insert([article])
        .select();

      if (!insertError) {
        insertedCount++;
      } else if (!insertError.message?.includes('duplicate')) {
        console.error('Insert error:', insertError);
      }
    }

    // Update budget tracking
    await supabase.rpc('update_snap_blog_budget', {
      perplexity_cost: PERPLEXITY_COST_PER_CALL,
      ai_cost: 0,
      articles_count: insertedCount,
      posts_count: 0
    });

    // Get current budget status
    const { data: budgetStatus } = await supabase
      .rpc('get_current_week_budget');

    return new Response(
      JSON.stringify({
        success: true,
        articlesFound: allArticles.length,
        articlesInserted: insertedCount,
        citations: citations.length,
        budget: budgetStatus ? {
          weekStart: budgetStatus.week_start,
          spent: budgetStatus.total_cost_usd,
          limit: budgetStatus.weekly_limit_usd,
          remaining: budgetStatus.weekly_limit_usd - budgetStatus.total_cost_usd
        } : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('fetch-snap-news error:', error);
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
