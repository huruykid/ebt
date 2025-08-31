-- Pass 1: Match by store type/chain name (case insensitive)
UPDATE snap_stores 
SET 
  google_place_id = cache.business_data->>'place_id',
  google_name = cache.business_data->>'name',
  google_formatted_address = cache.business_data->>'formatted_address',
  google_formatted_phone_number = cache.business_data->>'formatted_phone_number',
  google_website = cache.business_data->>'website',
  google_rating = CASE 
    WHEN cache.business_data->>'rating' ~ '^[0-9\.]+$'
    THEN (cache.business_data->>'rating')::numeric 
    ELSE NULL 
  END,
  google_user_ratings_total = CASE 
    WHEN cache.business_data->>'user_ratings_total' ~ '^[0-9]+$'
    THEN (cache.business_data->>'user_ratings_total')::integer 
    ELSE NULL 
  END,
  google_opening_hours = cache.business_data->'opening_hours',
  google_business_status = cache.business_data->>'business_status',
  google_photos = cache.business_data->'photos',
  google_reviews = cache.business_data->'reviews',
  google_geometry = cache.business_data->'geometry',
  google_vicinity = cache.business_data->>'vicinity',
  google_types = cache.business_data->'types',
  google_last_updated = cache.last_updated
FROM google_places_cache cache
WHERE 
  snap_stores.google_place_id IS NULL 
  AND cache.business_data IS NOT NULL 
  AND cache.business_data->>'place_id' IS NOT NULL
  AND cache.business_data->>'name' IS NOT NULL
  AND snap_stores."Store_Name" IS NOT NULL 
  AND (
    -- Chain store matching (7-eleven, walmart, etc)
    (LOWER(snap_stores."Store_Name") LIKE '%7-eleven%' AND LOWER(cache.business_data->>'name') LIKE '%7-eleven%')
    OR (LOWER(snap_stores."Store_Name") LIKE '%walmart%' AND LOWER(cache.business_data->>'name') LIKE '%walmart%')
    OR (LOWER(snap_stores."Store_Name") LIKE '%dollar general%' AND LOWER(cache.business_data->>'name') LIKE '%dollar general%')
    OR (LOWER(snap_stores."Store_Name") LIKE '%dollar tree%' AND LOWER(cache.business_data->>'name') LIKE '%dollar tree%')
    OR (LOWER(snap_stores."Store_Name") LIKE '%circle k%' AND LOWER(cache.business_data->>'name') LIKE '%circle k%')
    OR (LOWER(snap_stores."Store_Name") LIKE '%casey%' AND LOWER(cache.business_data->>'name') LIKE '%casey%')
    OR (LOWER(snap_stores."Store_Name") LIKE '%winn-dixie%' AND LOWER(cache.business_data->>'name') LIKE '%winn-dixie%')
    OR (LOWER(snap_stores."Store_Name") LIKE '%food lion%' AND LOWER(cache.business_data->>'name') LIKE '%food lion%')
    OR (LOWER(snap_stores."Store_Name") LIKE '%kroger%' AND LOWER(cache.business_data->>'name') LIKE '%kroger%')
    OR (LOWER(snap_stores."Store_Name") LIKE '%safeway%' AND LOWER(cache.business_data->>'name') LIKE '%safeway%')
  );