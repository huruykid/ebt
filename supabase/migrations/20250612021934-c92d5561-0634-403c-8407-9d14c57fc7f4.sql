
-- Create a storage bucket for CSV uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'csv-uploads',
  'csv-uploads',
  false,
  104857600, -- 100MB limit
  ARRAY['text/csv', 'application/csv', 'text/plain']::text[]
);

-- Create storage policies for the CSV uploads bucket
CREATE POLICY "Allow authenticated users to upload CSV files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'csv-uploads');

CREATE POLICY "Allow authenticated users to read their CSV files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'csv-uploads');

CREATE POLICY "Allow authenticated users to delete their CSV files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'csv-uploads');
