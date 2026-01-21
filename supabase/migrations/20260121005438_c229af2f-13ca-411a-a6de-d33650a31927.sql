-- Delete duplicate blog posts, keeping only the oldest one for each title
DELETE FROM blog_posts
WHERE id IN (
  SELECT id FROM (
    SELECT id, title, 
           ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at ASC) as rn
    FROM blog_posts
  ) duplicates
  WHERE rn > 1
);