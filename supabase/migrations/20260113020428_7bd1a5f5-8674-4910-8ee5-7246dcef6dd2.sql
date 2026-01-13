-- Create table for storing fetched SNAP news articles
CREATE TABLE public.snap_news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publish_date DATE,
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN NOT NULL DEFAULT false,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking weekly budget usage
CREATE TABLE public.snap_blog_budget (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  perplexity_cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0,
  ai_generation_cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC(10, 4) GENERATED ALWAYS AS (perplexity_cost_usd + ai_generation_cost_usd) STORED,
  weekly_limit_usd NUMERIC(10, 4) NOT NULL DEFAULT 2.00,
  articles_fetched INTEGER NOT NULL DEFAULT 0,
  posts_generated INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(week_start)
);

-- Create indexes for performance
CREATE INDEX idx_snap_news_articles_processed ON public.snap_news_articles(processed);
CREATE INDEX idx_snap_news_articles_fetched_at ON public.snap_news_articles(fetched_at DESC);
CREATE INDEX idx_snap_blog_budget_week_start ON public.snap_blog_budget(week_start DESC);

-- Enable RLS
ALTER TABLE public.snap_news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snap_blog_budget ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow public read access (for viewing news sources), admin write access
CREATE POLICY "Anyone can view news articles" 
ON public.snap_news_articles 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage news articles" 
ON public.snap_news_articles 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can view budget" 
ON public.snap_blog_budget 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage budget" 
ON public.snap_blog_budget 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Function to get or create current week's budget record
CREATE OR REPLACE FUNCTION public.get_current_week_budget()
RETURNS public.snap_blog_budget AS $$
DECLARE
  week_start_date DATE;
  budget_record public.snap_blog_budget;
BEGIN
  -- Get the start of the current week (Monday)
  week_start_date := date_trunc('week', CURRENT_DATE)::date;
  
  -- Try to get existing record
  SELECT * INTO budget_record 
  FROM public.snap_blog_budget 
  WHERE week_start = week_start_date;
  
  -- If not found, create one
  IF NOT FOUND THEN
    INSERT INTO public.snap_blog_budget (week_start, weekly_limit_usd)
    VALUES (week_start_date, 2.00)
    RETURNING * INTO budget_record;
  END IF;
  
  RETURN budget_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if budget is available
CREATE OR REPLACE FUNCTION public.check_snap_blog_budget(estimated_cost NUMERIC DEFAULT 0.05)
RETURNS BOOLEAN AS $$
DECLARE
  budget_record public.snap_blog_budget;
BEGIN
  budget_record := public.get_current_week_budget();
  RETURN (budget_record.total_cost_usd + estimated_cost) <= budget_record.weekly_limit_usd;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update budget after API call
CREATE OR REPLACE FUNCTION public.update_snap_blog_budget(
  perplexity_cost NUMERIC DEFAULT 0,
  ai_cost NUMERIC DEFAULT 0,
  articles_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0
)
RETURNS public.snap_blog_budget AS $$
DECLARE
  week_start_date DATE;
  budget_record public.snap_blog_budget;
BEGIN
  week_start_date := date_trunc('week', CURRENT_DATE)::date;
  
  UPDATE public.snap_blog_budget
  SET 
    perplexity_cost_usd = perplexity_cost_usd + perplexity_cost,
    ai_generation_cost_usd = ai_generation_cost_usd + ai_cost,
    articles_fetched = articles_fetched + articles_count,
    posts_generated = posts_generated + posts_count,
    updated_at = now()
  WHERE week_start = week_start_date
  RETURNING * INTO budget_record;
  
  IF NOT FOUND THEN
    INSERT INTO public.snap_blog_budget (
      week_start, 
      perplexity_cost_usd, 
      ai_generation_cost_usd, 
      articles_fetched, 
      posts_generated,
      weekly_limit_usd
    )
    VALUES (week_start_date, perplexity_cost, ai_cost, articles_count, posts_count, 2.00)
    RETURNING * INTO budget_record;
  END IF;
  
  RETURN budget_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;