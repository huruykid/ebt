-- Reset the current week's budget for testing the new high-quality generation
UPDATE public.snap_blog_budget 
SET 
  perplexity_cost_usd = 0,
  ai_generation_cost_usd = 0,
  articles_fetched = 0,
  posts_generated = 0,
  weekly_limit_usd = 0.15,
  updated_at = now()
WHERE week_start = date_trunc('week', CURRENT_DATE)::date;