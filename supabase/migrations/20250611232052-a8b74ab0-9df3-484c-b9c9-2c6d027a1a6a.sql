
-- Create the storage bucket for store photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-photos', 'store-photos', true);

-- Create policy to allow authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload store photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'store-photos' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow public read access to store photos
CREATE POLICY "Allow public read access to store photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'store-photos');

-- Create policy to allow users to delete their own uploaded photos
CREATE POLICY "Allow users to delete their own store photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'store-photos' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);
