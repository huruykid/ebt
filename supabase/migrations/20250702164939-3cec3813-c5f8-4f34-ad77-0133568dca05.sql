-- Create a table for logging comment seeding runs
CREATE TABLE public.comment_seed_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  success BOOLEAN NOT NULL DEFAULT false,
  preset_used TEXT,
  stores_processed INTEGER DEFAULT 0,
  comments_inserted INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comment_seed_runs ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing logs (admin/authenticated users)
CREATE POLICY "Anyone can view seeding logs" 
ON public.comment_seed_runs 
FOR SELECT 
USING (true);