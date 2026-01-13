import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Estimated costs per Lovable AI call
const AI_COST_PER_CALL = 0.03; // ~$0.03 per blog generation
const IMAGE_COST_PER_CALL = 0.02; // ~$0.02 per image generation

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
          message: 'Weekly budget limit of $0.15 reached (3 posts/week max)',
          budgetExceeded: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unprocessed news articles - limit to 1 per run for quality focus
    const { data: articles, error: fetchError } = await supabase
      .from('snap_news_articles')
      .select('*')
      .eq('processed', false)
      .order('fetched_at', { ascending: false })
      .limit(1); // Process only 1 article per run for higher quality

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
        // Generate blog post using Lovable AI with tool calling for structured output
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
                content: `You are an expert content writer creating HIGH-QUALITY, in-depth blog posts about SNAP (Supplemental Nutrition Assistance Program) news for SNAP users.

Your goal is to create content that genuinely helps readers and ranks well in search engines.

Your tone should be:
- Helpful, warm, and supportive
- Authoritative yet accessible
- Easy to understand (8th grade reading level)
- Empathetic to SNAP recipients' real concerns

QUALITY STANDARDS:
- Write comprehensive, well-researched content (600-800 words)
- Start with a compelling hook that draws readers in
- Provide REAL VALUE - actionable information readers can use
- Include specific details: dates, dollar amounts, percentages when available
- Explain the "why" behind changes, not just the "what"
- Address common questions readers might have
- End with clear, practical next steps

FORMATTING RULES:
- Write in natural, flowing paragraphs
- Use markdown headers (##) sparingly - maximum 2 per article
- Use bullet points only for action items or key takeaways
- Include the source attribution naturally in the text
- NO templated structure - each article should feel unique

AVOID:
- Generic filler content
- Repetitive phrasing
- Overly formal or bureaucratic language
- Making claims not supported by the source`
              },
              {
                role: 'user',
                content: `Write a HIGH-QUALITY, in-depth blog post about this SNAP news:

Original Title: ${article.title}
Publisher: ${article.publisher}
Date: ${article.publish_date || 'Recent'}
Summary: ${article.summary}
Source: ${article.source_url}

Create an authoritative, SEO-optimized blog post (600-800 words) that:
1. Helps SNAP users truly understand this news
2. Explains what it means for their daily lives
3. Provides actionable next steps they can take
4. Answers questions they're likely to have`
              }
            ],
            temperature: 0.3,
            tools: [
              {
                type: 'function',
                function: {
                  name: 'create_blog_post',
                  description: 'Create a structured blog post with SEO-optimized title',
                  parameters: {
                    type: 'object',
                    properties: {
                      seo_title: {
                        type: 'string',
                        description: 'SEO-optimized title (50-60 chars) that is descriptive and includes key terms like SNAP, state names, or specific changes. Example: "Minnesota SNAP Benefits Cut 15% in March 2026: What to Know"'
                      },
                      meta_description: {
                        type: 'string',
                        description: 'Meta description (150-160 chars) summarizing the key points for search results'
                      },
                      excerpt: {
                        type: 'string',
                        description: 'Short excerpt (1-2 sentences) for blog listing pages'
                      },
                      body: {
                        type: 'string',
                        description: 'Full blog post content in markdown with the required sections'
                      }
                    },
                    required: ['seo_title', 'meta_description', 'excerpt', 'body']
                  }
                }
              }
            ],
            tool_choice: { type: 'function', function: { name: 'create_blog_post' } }
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
        
        // Extract structured output from tool call
        let blogTitle = article.title;
        let blogContent = '';
        let metaDescription = article.summary.substring(0, 160);
        let excerpt = article.summary;

        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            blogTitle = args.seo_title || blogTitle;
            blogContent = args.body || '';
            metaDescription = args.meta_description || metaDescription;
            excerpt = args.excerpt || excerpt;
          } catch (parseErr) {
            console.error('Failed to parse tool call arguments:', parseErr);
            // Fallback to regular content
            blogContent = aiData.choices?.[0]?.message?.content || '';
          }
        } else {
          // Fallback if no tool call
          blogContent = aiData.choices?.[0]?.message?.content || '';
        }

        if (!blogContent) {
          console.error('Empty blog content generated');
          continue;
        }

        // Generate featured image for the blog post
        let featuredImageUrl: string | null = null;
        try {
          console.log('Generating featured image for:', blogTitle);
          const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [
                {
                  role: 'user',
                  content: `Create a professional blog header image for an article about SNAP food assistance. The article topic is: "${blogTitle}". 
                  
Style requirements:
- Clean, modern illustration style (NOT photorealistic)
- Warm, hopeful colors (greens, oranges, soft blues)
- Related to food, grocery shopping, family meals, or community support
- 16:9 aspect ratio, suitable for a blog header
- No text or words in the image
- Friendly and welcoming feeling`
                }
              ],
              modalities: ['image', 'text']
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            
            if (base64Image && base64Image.startsWith('data:image')) {
              // Extract base64 data and upload to Supabase Storage
              const base64Data = base64Image.split(',')[1];
              const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              const fileName = `snap-blog-${Date.now()}.png`;
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(fileName, imageBuffer, {
                  contentType: 'image/png',
                  upsert: false
                });

              if (uploadError) {
                console.error('Failed to upload image:', uploadError);
              } else {
                // Get public URL
                const { data: urlData } = supabase.storage
                  .from('blog-images')
                  .getPublicUrl(fileName);
                featuredImageUrl = urlData?.publicUrl || null;
                console.log('Image uploaded:', featuredImageUrl);
                totalAiCost += IMAGE_COST_PER_CALL;
              }
            }
          } else {
            console.error('Image generation failed:', imageResponse.status);
          }
        } catch (imageError) {
          console.error('Error generating image:', imageError);
          // Continue without image - not a fatal error
        }

        // Generate SEO meta fields
        const metaTitle = blogTitle.substring(0, 60);

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
            featured_image: featuredImageUrl,
            is_published: false, // Draft for review
            published_at: null // Will be set when manually published
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
