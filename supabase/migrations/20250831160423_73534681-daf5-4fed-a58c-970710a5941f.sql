-- Fix security issue: Update functions to have proper search_path
ALTER FUNCTION public.smart_store_search(text, text, text, text, real, integer) SET search_path TO 'public';
ALTER FUNCTION public.get_nearby_stores(double precision, double precision, double precision, text[], integer) SET search_path TO 'public';
ALTER FUNCTION public.get_stores_with_fresh_google_data(integer) SET search_path TO 'public';
ALTER FUNCTION public.get_store_click_analytics(uuid, integer) SET search_path TO 'public';
ALTER FUNCTION public.truncate_coordinates(numeric, numeric) SET search_path TO 'public';