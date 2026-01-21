-- Create store_photos table for user-uploaded store photos
CREATE TABLE public.store_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.snap_stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.store_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view store photos"
ON public.store_photos
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upload photos"
ON public.store_photos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
ON public.store_photos
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_store_photos_store_id ON public.store_photos(store_id);
CREATE INDEX idx_store_photos_user_id ON public.store_photos(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_store_photos_updated_at
BEFORE UPDATE ON public.store_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();