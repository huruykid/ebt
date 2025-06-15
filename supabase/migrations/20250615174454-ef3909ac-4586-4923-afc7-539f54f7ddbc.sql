
-- Drop the old smart_store_search function without state parameter
DROP FUNCTION IF EXISTS public.smart_store_search(TEXT, TEXT, TEXT, REAL, INTEGER);

-- The newer function with state parameter will remain:
-- smart_store_search(search_text, search_city, search_state, search_zip, similarity_threshold, result_limit)
