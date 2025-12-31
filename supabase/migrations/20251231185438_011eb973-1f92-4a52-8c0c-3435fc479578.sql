-- Clear mismatched Google Places data where google_name is a known chain 
-- that doesn't match the Store_Name
-- This fixes data quality issues from incorrect Google Places matching

UPDATE snap_stores
SET 
  google_place_id = NULL,
  google_name = NULL,
  google_formatted_address = NULL,
  google_website = NULL,
  google_formatted_phone_number = NULL,
  google_opening_hours = NULL,
  google_rating = NULL,
  google_user_ratings_total = NULL,
  google_photos = NULL,
  google_types = NULL,
  google_price_level = NULL,
  google_geometry = NULL,
  google_business_status = NULL,
  google_vicinity = NULL,
  google_icon = NULL,
  google_icon_background_color = NULL,
  google_icon_mask_base_uri = NULL,
  google_plus_code = NULL,
  google_reviews = NULL,
  google_last_updated = NULL
WHERE google_name IS NOT NULL
  AND "Store_Name" IS NOT NULL
  -- Clear when google_name is a known chain that doesn't appear in Store_Name
  AND (
    (google_name = 'Taco Bell' AND "Store_Name" NOT ILIKE '%taco bell%')
    OR (google_name = 'Burger King' AND "Store_Name" NOT ILIKE '%burger king%')
    OR (google_name = '7-Eleven' AND "Store_Name" NOT ILIKE '%7-eleven%' AND "Store_Name" NOT ILIKE '%7 eleven%')
    OR (google_name = 'CVS' AND "Store_Name" NOT ILIKE '%cvs%')
    OR (google_name = 'Target' AND "Store_Name" NOT ILIKE '%target%')
    OR (google_name = 'Subway' AND "Store_Name" NOT ILIKE '%subway%')
    OR (google_name = 'Pizza Hut' AND "Store_Name" NOT ILIKE '%pizza hut%')
    OR (google_name = 'ARCO' AND "Store_Name" NOT ILIKE '%arco%')
    OR (google_name = 'Carl''s Jr.' AND "Store_Name" NOT ILIKE '%carl%')
    OR (google_name = 'Papa Murphy''s | Take ''N'' Bake Pizza' AND "Store_Name" NOT ILIKE '%papa murphy%')
    OR (google_name = 'Save Mart' AND "Store_Name" NOT ILIKE '%save mart%')
    OR (google_name = 'Quik Shop / Chevron Service Station' AND "Store_Name" NOT ILIKE '%quik shop%' AND "Store_Name" NOT ILIKE '%chevron%')
    OR (google_name = 'EZ trip gas station' AND "Store_Name" NOT ILIKE '%ez trip%')
    OR (google_name = 'Parkway Mini-Mart' AND "Store_Name" NOT ILIKE '%parkway%')
    OR (google_name = 'Kings Liquor & Wine LLC' AND "Store_Name" NOT ILIKE '%kings liquor%')
    OR (google_name = 'Fast N Esy #6' AND "Store_Name" NOT ILIKE '%fast n esy%')
    OR (google_name = 'Johnny Quik 205' AND "Store_Name" NOT ILIKE '%johnny quik%')
    OR (google_name = 'Sws Fuel Inc' AND "Store_Name" NOT ILIKE '%sws fuel%')
    OR (google_name = 'Fast N Esy 18' AND "Store_Name" NOT ILIKE '%fast n esy%')
    OR (google_name = 'Quick NE-Z' AND "Store_Name" NOT ILIKE '%quick ne-z%')
  );