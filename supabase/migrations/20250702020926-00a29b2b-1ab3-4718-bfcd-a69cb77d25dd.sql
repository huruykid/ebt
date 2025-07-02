
-- Create a table for store comments/tips
CREATE TABLE public.store_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.store_comments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to view comments (public)
CREATE POLICY "Anyone can view store comments" 
  ON public.store_comments 
  FOR SELECT 
  USING (true);

-- Create policy that allows authenticated users to insert comments
CREATE POLICY "Authenticated users can create comments" 
  ON public.store_comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create index for better performance when querying by store_id
CREATE INDEX idx_store_comments_store_id ON public.store_comments(store_id);
CREATE INDEX idx_store_comments_created_at ON public.store_comments(created_at DESC);
