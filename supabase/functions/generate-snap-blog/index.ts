import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Estimated cost per Lovable AI call
const AI_COST_PER_CALL = 0.03; // ~$0.03 per blog generation

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    + '-' + Date.now().toString(36);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check budget before proceeding
    const { data: budgetCheck, error: budgetError } = await supabase
      .rpc('check_snap_blog_budget', { estimated_cost: AI_COST_PER_CALL });

    if (budgetError) {
      console.error('Budget check error:', budgetError);
      throw new Error('Failed to check budget');
    }

    if (!budgetCheck) {
      console.log('Weekly budget limit reached, skipping blog generation');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Weekly budget limit of $2.00 reached',
          budgetExceeded: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unprocessed news articles
    const { data: articles, error: fetchError } = await supabase
      .from('snap_news_articles')
      .select('*')
      .eq('processed', false)
      .order('fetched_at', { ascending: false })
      .limit(3); // Process up to 3 articles per run

    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No unprocessed articles to generate blogs from',
          postsCreated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create SNAP News category
    let categoryId: string | null = null;
    const { data: categories } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', 'snap-news')
      .single();

    if (categories) {
      categoryId = categories.id;
    } else {
      const { data: newCategory } = await supabase
        .from('blog_categories')
        .insert([{
          name: 'SNAP News',
          slug: 'snap-news',
          description: 'Latest SNAP and food assistance program news and updates'
        }])
        .select('id')
        .single();
      
      if (newCategory) {
        categoryId = newCategory.id;
      }
    }

    const postsCreated: string[] = [];
    let totalAiCost = 0;

    for (const article of articles) {
      // Check budget again before each generation
      const { data: canProceed } = await supabase
        .rpc('check_snap_blog_budget', { estimated_cost: AI_COST_PER_CALL });

      if (!canProceed) {
        console.log('Budget limit reached during processing');
        break;
      }

      try {
        // Generate blog post using Lovable AI
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              {
                role: 'system',
                content: `You are a helpful writer creating informative blog posts about SNAP (Supplemental Nutrition Assistance Program) news for SNAP users. 

Your tone should be:
- Helpful and supportive
- Neutral and factual
- Easy to understand (8th grade reading level)
- Empathetic to SNAP recipients

Structure each post with these sections (use ## for headers):
1. ## Summary - Plain language overview (2-3 sentences)
2. ## What Changed - Specific changes with dates when available
3. ## What This Means for SNAP Users - Practical impact on recipients
4. ## What To Do Next - Action steps if applicable
5. ## Sources - Link to original article(s)

Important rules:
- Do not make claims not supported by the source
- If details are unclear, say what is known and what is not confirmed
- Include relevant dates and locations when available
- Keep the post between 400-600 words
- Use bullet points where appropriate for clarity`
              },
              {
                role: 'user',
                content: `Write a blog post about this SNAP news:

Title: ${article.title}
Publisher: ${article.publisher}
Date: ${article.publish_date || 'Recent'}
Summary: ${article.summary}
Source: ${article.source_url}

Create an SEO-optimized blog post that helps SNAP users understand this news and what it means for them.`
              }
            ],
            temperature: 0.3,
          }),
        });

        if (!aiResponse.ok) {
          if (aiResponse.status === 429) {
            console.log('Rate limited, stopping generation');
            break;
          }
          if (aiResponse.status === 402) {
            console.log('Payment required, stopping generation');
            break;
          }
          const errorText = await aiResponse.text();
          console.error('AI generation error:', aiResponse.status, errorText);
          continue;
        }

        const aiData = await aiResponse.json();
        const blogContent = aiData.choices?.[0]?.message?.content || '';

        if (!blogContent) {
          console.error('Empty blog content generated');
          continue;
        }

        // Create blog post title
        const blogTitle = article.title.includes('SNAP') 
          ? article.title 
          : `SNAP Update: ${article.title}`;

        // Generate SEO meta fields
        const metaTitle = blogTitle.substring(0, 60);
        const metaDescription = `${article.summary.substring(0, 140)}...`;
        const excerpt = article.summary;

        // Insert blog post
        const { data: newPost, error: insertError } = await supabase
          .from('blog_posts')
          .insert([{
            title: blogTitle,
            slug: generateSlug(blogTitle),
            author: 'SNAP News Team',
            body: blogContent,
            category_id: categoryId,
            excerpt: excerpt,
            meta_title: metaTitle,
            meta_description: metaDescription,
            is_published: true,
            published_at: new Date().toISOString()
          }])
          .select('id')
          .single();

        if (insertError) {
          console.error('Failed to insert blog post:', insertError);
          continue;
        }

        // Mark article as processed and link to blog post
        await supabase
          .from('snap_news_articles')
          .update({ 
            processed: true, 
            blog_post_id: newPost?.id 
          })
          .eq('id', article.id);

        postsCreated.push(blogTitle);
        totalAiCost += AI_COST_PER_CALL;

      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError);
        // Mark as processed to avoid retry loops
        await supabase
          .from('snap_news_articles')
          .update({ processed: true })
          .eq('id', article.id);
      }
    }

    // Update budget tracking
    if (postsCreated.length > 0) {
      await supabase.rpc('update_snap_blog_budget', {
        perplexity_cost: 0,
        ai_cost: totalAiCost,
        articles_count: 0,
        posts_count: postsCreated.length
      });
    }

    // Get current budget status
    const { data: budgetStatus } = await supabase
      .rpc('get_current_week_budget');

    return new Response(
      JSON.stringify({
        success: true,
        postsCreated: postsCreated.length,
        postTitles: postsCreated,
        articlesProcessed: articles.length,
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
    console.error('generate-snap-blog error:', error);
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
