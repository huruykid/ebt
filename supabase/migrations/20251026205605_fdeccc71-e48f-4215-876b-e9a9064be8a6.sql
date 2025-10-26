-- Publish the most recent blog post
UPDATE public.blog_posts
SET 
  is_published = true,
  published_at = now()
WHERE id = '42e80783-aef7-491d-96af-46de5f3f8314';