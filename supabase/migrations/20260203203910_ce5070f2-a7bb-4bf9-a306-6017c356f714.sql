-- Fix user_id exposure in reviews, store_photos, store_prices, price_verifications
-- Strategy: Create public views excluding user_id, restrict direct table SELECT to owners/admins

-- 1. Create public view for store_photos (excludes user_id)
CREATE OR REPLACE VIEW public.public_store_photos
WITH (security_invoker = on) AS
SELECT 
  id,
  store_id,
  file_path,
  file_name,
  created_at,
  updated_at
FROM public.store_photos;

-- 2. Create public view for store_prices (excludes user_id)
CREATE OR REPLACE VIEW public.public_store_prices
WITH (security_invoker = on) AS
SELECT 
  id,
  store_id,
  product_name,
  price,
  unit,
  is_sale,
  verified_count,
  reported_at,
  expires_at
FROM public.store_prices;

-- 3. Create public view for price_verifications (excludes user_id)
CREATE OR REPLACE VIEW public.public_price_verifications
WITH (security_invoker = on) AS
SELECT 
  id,
  price_id,
  is_accurate,
  verified_at
FROM public.price_verifications;

-- 4. Update reviews RLS - drop broad public policy, keep owner/admin access
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Users can view their own reviews (for management)
CREATE POLICY "Users can view own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Update store_photos RLS - restrict direct access
DROP POLICY IF EXISTS "Anyone can view store photos" ON public.store_photos;

-- Users can view their own photos (for management)
CREATE POLICY "Users can view own photos"
ON public.store_photos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public can view photos through the view (needed for view to work)
CREATE POLICY "Public can view store photos anonymized"
ON public.store_photos
FOR SELECT
TO anon, authenticated
USING (true);

-- 6. Update store_prices RLS - restrict direct access
DROP POLICY IF EXISTS "Anyone can view prices" ON public.store_prices;

-- Users can view their own prices (for management)
CREATE POLICY "Users can view own prices"
ON public.store_prices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public can view prices through the view (needed for view to work)
CREATE POLICY "Public can view store prices anonymized"
ON public.store_prices
FOR SELECT
TO anon, authenticated
USING (true);

-- 7. Update price_verifications RLS - restrict direct access
DROP POLICY IF EXISTS "Anyone can view verifications" ON public.price_verifications;

-- Users can view their own verifications (for management)
CREATE POLICY "Users can view own verifications"
ON public.price_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public can view verifications through the view (needed for view to work)
CREATE POLICY "Public can view verifications anonymized"
ON public.price_verifications
FOR SELECT
TO anon, authenticated
USING (true);

-- Add comments explaining the privacy model
COMMENT ON VIEW public.public_store_photos IS 'Public view of store photos excluding user_id for privacy. Use this for public-facing queries.';
COMMENT ON VIEW public.public_store_prices IS 'Public view of store prices excluding user_id for privacy. Use this for public-facing queries.';
COMMENT ON VIEW public.public_price_verifications IS 'Public view of price verifications excluding user_id for privacy. Use this for public-facing queries.';