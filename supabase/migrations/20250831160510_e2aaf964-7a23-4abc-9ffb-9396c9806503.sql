-- Fix remaining function security issues
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.auto_award_badges() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.is_admin_user() SET search_path TO 'public';
ALTER FUNCTION public.update_store_with_google_data(uuid, text, text, text, text, text, jsonb, numeric, integer, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.check_and_award_badges(uuid) SET search_path TO 'public';
ALTER FUNCTION public.upsert_usage_ledger(text, text, integer, integer, numeric, integer) SET search_path TO 'public';
ALTER FUNCTION public.get_user_stats(uuid) SET search_path TO 'public';