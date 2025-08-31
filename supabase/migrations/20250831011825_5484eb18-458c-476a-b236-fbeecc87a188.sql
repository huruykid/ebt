-- Create missing tables for proper Google Places API caching and budget tracking

-- Create API usage ledger table for budget tracking
CREATE TABLE IF NOT EXISTS public.api_usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  sku TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  billable INTEGER DEFAULT 0,
  estimated_cost_usd DECIMAL(10,4) DEFAULT 0,
  free_remaining INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create budget events table for tracking budget limits
CREATE TABLE IF NOT EXISTS public.budget_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  threshold DECIMAL(10,2) NOT NULL,
  action TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create places_cache table (or rename existing google_places_cache)
-- Since google_places_cache already has data, let's add the missing columns instead
ALTER TABLE public.google_places_cache 
ADD COLUMN IF NOT EXISTS params_hash TEXT,
ADD COLUMN IF NOT EXISTS fields_hash TEXT,
ADD COLUMN IF NOT EXISTS fresh_until TIMESTAMP WITH TIME ZONE;

-- Create proper indexes for the caching system
CREATE UNIQUE INDEX IF NOT EXISTS idx_places_cache_place_details 
ON public.google_places_cache (place_id, fields_hash) 
WHERE place_id IS NOT NULL AND fields_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_places_cache_text_search 
ON public.google_places_cache (search_query, params_hash) 
WHERE search_query IS NOT NULL AND params_hash IS NOT NULL;

-- Create index for usage ledger
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_ledger_month_sku 
ON public.api_usage_ledger (month, sku);

-- Enable RLS on new tables
ALTER TABLE public.api_usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service role access
CREATE POLICY "Service role can manage usage ledger" 
ON public.api_usage_ledger 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Service role can manage budget events" 
ON public.budget_events 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create function to upsert usage data
CREATE OR REPLACE FUNCTION public.upsert_usage_ledger(
  p_month TEXT,
  p_sku TEXT,
  p_count_inc INTEGER DEFAULT 1,
  p_billable_inc INTEGER DEFAULT 1,
  p_cost_inc DECIMAL(10,4) DEFAULT 0,
  p_free_dec INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.api_usage_ledger (month, sku, count, billable, estimated_cost_usd, free_remaining)
  VALUES (p_month, p_sku, p_count_inc, p_billable_inc, p_cost_inc, 1000 - p_free_dec)
  ON CONFLICT (month, sku) 
  DO UPDATE SET
    count = api_usage_ledger.count + p_count_inc,
    billable = api_usage_ledger.billable + p_billable_inc,
    estimated_cost_usd = api_usage_ledger.estimated_cost_usd + p_cost_inc,
    free_remaining = GREATEST(0, api_usage_ledger.free_remaining - p_free_dec),
    updated_at = now();
END;
$$;