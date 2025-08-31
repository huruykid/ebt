-- Transfer cached Google Places data to snap_stores table
-- First, create a temporary function to safely extract JSON data
CREATE OR REPLACE FUNCTION transfer_google_places_data()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  cache_record RECORD;
BEGIN
  -- Loop through each cache record and try to match with stores
  FOR cache_record IN 
    SELECT 
      search_query,
      place_id,
      business_data,
      last_updated
    FROM google_places_cache 
    WHERE business_data IS NOT NULL 
      AND business_data->>'place_id' IS NOT NULL
  LOOP
    -- Update matching stores
    UPDATE snap_stores 
    SET 
      google_place_id = cache_record.business_data->>'place_id',
      google_name = cache_record.business_data->>'name',
      google_formatted_address = cache_record.business_data->>'formatted_address',
      google_formatted_phone_number = cache_record.business_data->>'formatted_phone_number',
      google_website = cache_record.business_data->>'website',
      google_rating = CASE 
        WHEN cache_record.business_data->>'rating' ~ '^[0-9\.]+$'
        THEN (cache_record.business_data->>'rating')::numeric 
        ELSE NULL 
      END,
      google_user_ratings_total = CASE 
        WHEN cache_record.business_data->>'user_ratings_total' ~ '^[0-9]+$'
        THEN (cache_record.business_data->>'user_ratings_total')::integer 
        ELSE NULL 
      END,
      google_price_level = CASE 
        WHEN cache_record.business_data->>'price_level' ~ '^[0-9]+$'
        THEN (cache_record.business_data->>'price_level')::integer 
        ELSE NULL 
      END,
      google_opening_hours = cache_record.business_data->'opening_hours',
      google_business_status = cache_record.business_data->>'business_status',
      google_photos = cache_record.business_data->'photos',
      google_reviews = cache_record.business_data->'reviews',
      google_geometry = cache_record.business_data->'geometry',
      google_vicinity = cache_record.business_data->>'vicinity',
      google_types = cache_record.business_data->'types',
      google_icon = cache_record.business_data->>'icon',
      google_icon_background_color = cache_record.business_data->>'icon_background_color',
      google_icon_mask_base_uri = cache_record.business_data->>'icon_mask_base_uri',
      google_plus_code = cache_record.business_data->>'plus_code',
      google_last_updated = cache_record.last_updated
    WHERE 
      (
        -- Match by store name in search query (case insensitive)
        LOWER(TRIM("Store_Name")) = LOWER(TRIM(cache_record.search_query))
        OR 
        -- Match by store name contained in search query
        LOWER(TRIM(cache_record.search_query)) LIKE '%' || LOWER(TRIM("Store_Name")) || '%'
        OR
        -- Match by Google business name
        LOWER(TRIM("Store_Name")) = LOWER(TRIM(cache_record.business_data->>'name'))
      )
      AND "Store_Name" IS NOT NULL 
      AND TRIM("Store_Name") != ''
      AND google_place_id IS NULL; -- Only update records that don't already have Google data
      
    GET DIAGNOSTICS updated_count = updated_count + ROW_COUNT;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Execute the transfer
SELECT transfer_google_places_data() as stores_updated;

-- Drop the temporary function
DROP FUNCTION transfer_google_places_data();