-- Unpublish the 3 older blog posts, keeping only the recent one from Oct 7
UPDATE blog_posts 
SET is_published = false 
WHERE id IN (
  '47666387-6185-4407-8947-c22556df5a35',
  'ba42add3-3ef7-4178-8804-026093dc1e09',
  '82b450f7-4b7f-4a14-9dbd-3ceeb598a415'
);